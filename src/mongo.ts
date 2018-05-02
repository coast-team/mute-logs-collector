import { Db, MongoClient } from 'mongodb'
import { Observable } from 'rxjs'

export class Mongo {
  private connected: boolean
  private url: string
  private db: Db

  constructor (url: string) {
    this.url = url
    this.connected = false
  }

  start (): void {
    MongoClient.connect(this.url, (err, client) => {
      if (err) {
        console.log('[MONGO] Error: Cannot connect to mongodb')
        // setTimeout(this.start, 1000)
      }
      this.db = client.db('muteLogs')
      this.connected = true
      console.log('[MONGO] Connected to "muteLogs" database')
    })
  }

  subscribe (sub: Observable<string>): void {
    sub.subscribe((msg) => {
      const obj = JSON.parse(msg)
      if (!obj.collection || !obj.data) {
        console.log('[MONGO] Error: wrong message format {collection, data}', obj)
        return
      } else {
        this.store(obj.collection, obj.data)
      }
    })
  }

  store (collection: string, obj: object): void {
    if (this.isConnected) {
      this.db.collection(collection).insert(obj, null, (err, res) => {
        if (err) { throw err }

        console.log('[MONGO] Document succesfully stored')
      })
    } else {
      console.log('[MONGO] Error: Not Connected to the database')
    }
  }

  get isConnected (): boolean {
    return this.connected
  }
}
