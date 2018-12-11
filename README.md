# Mute-logs-collector

## Use with Docker

`docker-compose up` to start all elements

### Rabbitmq container

You can use this message queue with websocket. The address is `ws://localhost:15674/ws`.

You can use the web monitoring at `http://localhost:15672`, user:mdp = guest:guest

### Mongodb and Mongodb-express container

You will be able to monitor de mongodb database with th emongodb-express container. Go to the webpage `http://localhost:8081`.

### Node container

This container have the node app. This app will pull messages from the _muteLogs_ queue, and will store them into the mongodb database.

The message format is `{collection: my-collection, data: my-data}`.
Then _my-data_ will be stored into the collection _my-collection_

## Standalone usage

You can set _MONGO_ADDR_ and _RABBIT_ADDR_ environment variables or you can use the node app alone with the command `node dist/app.js -- $my-mongodb-addr $my-rabbitmq-addr`. By default mongodb and rabbitmq address will be `localhost`
