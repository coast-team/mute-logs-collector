import { Channel, connect, Connection } from 'amqplib/callback_api'
import { Observable, Subject } from 'rxjs'

export class Rabbit {

  private amqpConn: Connection
  private url: string
  private queue: string

  private message: Subject<string>

  constructor (url: string) {
    this.url = url
    this.message = new Subject<string>()
    this.queue = 'muteLogs'
  }

  start (): void {
    connect(this.url, (err, conn) => {
      let ok: boolean = true

      if (err) {
        console.error('[AMQP]', err.message)
        ok = false
        setTimeout(this.start, 1000)
      }
      conn.on('error', (err) => {
        if (err.message !== 'Connection closing') {
          console.error('[AMQP] conn error', err.message)
        }
      })
      conn.on('close', () => {
        console.error('[AMQP] reconnecting')
        return setTimeout(this.start, 1000)
      })

      if (ok) {
        console.log('[AMQP] connected')
        this.amqpConn = conn
        this.listen()
      }
    })
  }

  private listen (): void {
    this.amqpConn.createChannel((err, ch) => {
      if (this.closeOnErr(err)) { return }

      ch.on('error', (err) => {
        console.error('[AMQP] channel error', err.message)
      })

      ch.on('close', () => {
        console.log('[AMQP] channel closed')
      })

      ch.prefetch(10)

      ch.assertQueue(this.queue, { durable: true }, (err, ok) => {
        if (this.closeOnErr(err)) { return }
        ch.consume(this.queue, (msg) => {
          try {
            this.message.next(msg.content.toString())
            ch.ack(msg)
          } catch (e) {
            console.log('[AMQP] ERROR: ', e)
          }
        }, { noAck: false })
      })
    })
  }

  private closeOnErr (err): boolean {
    if (!err) { return false }
    console.error('[AMQP] error', err)
    this.amqpConn.close()
    return true
  }

  get onMessage (): Observable<string> {
    return this.message.asObservable()
  }

}
