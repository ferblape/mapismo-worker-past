var mapismo = require('./src/mapismo.js'),
    redisChannel = process.env.channel,
    pubsub;

if(process.env.node_env == "production") {
  pubsub = require('redis-url').connect(process.env.REDISTOGO_URL);
} else {
  pubsub = require("redis").createClient("6379", "127.0.0.1");
}

pubsub.setMaxListeners(0);

process.on('SIGUSR1', function() {
  console.log('Got SIGUSR1. Exiting...');
  return 1;
});

process.on('uncaughtException', function(err) {
  return console.error("Uncaught Exception: " + (err));
});

pubsub.on("message", function(channel, encryptedMessage) {
  mapismo.processMessage(encryptedMessage);
});

pubsub.subscribe(redisChannel);

console.log("Running Mapismo Worker from the Past™ in " + process.env.node_env + " environment");
console.log("Waiting for messages...");