var      fw = require('./flickr_worker'),
         iw = require('./instagram_worker'),
     crypto = require('crypto');

var decryptMessage = function(encryptedMessage){
  var password = process.env.secret,
      ivb64    = encryptedMessage.split("|||")[0], 
      message  = encryptedMessage.split("|||")[1];
  return decode(keyToBinHash(password), ivBase64ToBin(ivb64), base64DataToBin(message));
}

var validMessage = function(message){
  var requiredFields = [
    'cartodb_table_name', 'cartodb_map_id', 'cartodb_username', 'cartodb_userid',
    'cartodb_auth_token', 'cartodb_auth_secret', 'source', 'keyword', 
    'latitude', 'longitude', 'radius', 'start_date', 'end_date'
  ],  
  validSources = ['instagram', 'flickr'],
  i;
  
  var messageKeys = Object.keys(message);
  for(i = 0; i < requiredFields.length; i++){
    if(messageKeys.indexOf(requiredFields[i]) == -1){
      console.log(requiredFields[i]  + " is missing!");
      return false;
    }
  }
  if(validSources.indexOf(message.source) == -1){
    console.log(message.source  + " is an invalid source!");
    return false;
  }
  return true;
}

var processMessage = function(encryptedMessage){
  var message = JSON.parse(this.decryptMessage(encryptedMessage));
  
  if(this.validMessage(message)){
    console.log("Processing message:");
    console.log(message);
    switch(message.source){
      case 'flickr':
        var flickrWorker = new fw.FlickrWorker(message);
        flickrWorker.work();
        break;
      case 'instagram':
        var instagramWorker = new iw.InstagramWorker(message);
        instagramWorker.work();
        break;
      // Add more cases with new workers
    }
  } else {
    console.log("[ERROR] Invalid message! ")
  }
}

var isString = function(s) {
  return Object.prototype.toString.call(s) === '[object String]'; 
}

exports.validMessage = validMessage;
exports.processMessage = processMessage;
exports.isString = isString;
exports.decryptMessage = decryptMessage;

// Private functions

function decode(cryptkey, iv, secretdata) {
    var decipher = crypto.createDecipheriv('aes-256-cbc', cryptkey, iv);
    var decoded  = decipher.update(secretdata);
    decoded += decipher.final();
    return decoded;
}

function ivBase64ToBin(ivb64) {
  var iv = new Buffer(ivb64,"base64");
  return iv.toString('binary');
}

function keyToBinHash(pwd) {
  var key = crypto.createHash('sha256').update(pwd).digest();
  return key;
}

function base64DataToBin(dat64) {
  var data = new Buffer(dat64, "base64");
  return data;
}