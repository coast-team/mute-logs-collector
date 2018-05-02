var amqp = require('amqplib/callback_api');
var MongoClient = require('mongodb').MongoClient;

var amqpConn = null;
var channel = null;




function start () {
  // RabbitMQ
  amqp.connect('amqp://guest:guest@172.17.0.5' + "?heartbeat=60", function (err, conn) {
    if (err) {
      console.error("[AMQP]", err.message);
      return setTimeout(start, 1000);
    }
    conn.on("error", function (err) {
      if (err.message !== "Connection closing") {
        console.error("[AMQP] conn error", err.message);
      }
    });
    conn.on("close", function () {
      console.error("[AMQP] reconnecting");
      return setTimeout(start, 1000);
    });
    console.log("[AMQP] connected");
    amqpConn = conn;
    whenConnected();
  });

  // MongoDB
  MongoClient.connect('mongodb://172.17.0.3/muteLogs', function (err, db) {
    if (err) return console.log(error);

    var obj = { name: 'Robert', age: 22 }
    const col = db.db('muteLogs').collection('personnes');
    col.insert(obj, null, function (err, res) {
      if (err) throw err;

      console.log('le document a été inséré');
    });

    console.log('Connecté à la base de données "muteLogs"', db);
  });
}

function whenConnected () {
  startWorker();
}

// A worker that acks messages only if processed successfully
function startWorker () {
  const qName = 'demo';
  amqpConn.createChannel(function (err, ch) {
    if (closeOnErr(err)) return;
    ch.on("error", function (err) {
      console.error("[AMQP] channel error", err.message);
    });
    ch.on("close", function () {
      console.log("[AMQP] channel closed");
    });

    ch.prefetch(10);
    ch.assertQueue(qName, { durable: true }, function (err, _ok) {
      if (closeOnErr(err)) return;
      channel = ch;
      ch.consume(qName, processMsg, { noAck: false });
      console.log("Worker is started");
    });
  });
}

function processMsg (msg) {
  work(msg, function (ok) {
    try {
      if (ok)
        channel.ack(msg);
      else
        channel.reject(msg, true);
    } catch (e) {
      closeOnErr(e);
    }
  });
}

function work (msg, cb) {
  console.log("PDF processing of ", msg.content.toString());
  // Store data into the BDD


  cb(true);
}

function closeOnErr (err) {
  if (!err) return false;
  console.error("[AMQP] error", err);
  amqpConn.close();
  return true;
}

start();