import { Mongo } from './mongo'
import { Rabbit } from './rabbit'

class App {

  private rabbit: Rabbit
  private mongo: Mongo

  constructor () {
    if (process.argv.length === 5) {
      this.mongo = new Mongo(process.argv[3])
      this.rabbit = new Rabbit(process.argv[4])

      this.mongo.start()
      this.rabbit.start()

      this.mongo.subscribe(this.rabbit.onMessage)
    } else {
      console.error('Arguments error : uses "node dist/app.js -- $mongo_url $rabbit_url"')
    }
  }

}

const app = new App()
