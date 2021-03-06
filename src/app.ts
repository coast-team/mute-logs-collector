import { Mongo } from './mongo'
import { Rabbit } from './rabbit'

class App {
  private rabbit: Rabbit
  private mongo: Mongo

  constructor () {
    let mongoURL = 'mongodb://'
    let rabbitURL = 'amqp://guest:guest@'

    if (process.env.MONGO_ADDR && process.env.RABBIT_ADDR) {
      mongoURL += process.env.MONGO_ADDR
      rabbitURL += process.env.RABBIT_ADDR
    } else if (process.argv.length === 5) {
      mongoURL += process.argv[3]
      rabbitURL += process.argv[4]
    } else {
      mongoURL += 'localhost'
      rabbitURL += 'localhost'
    }

    console.log('[NODE]', mongoURL, rabbitURL)

    this.mongo = new Mongo(mongoURL)
    this.rabbit = new Rabbit(rabbitURL)

    this.mongo.start()
    this.rabbit.start()

    this.mongo.subscribe(this.rabbit.onMessage)
  }
}

const app = new App()
