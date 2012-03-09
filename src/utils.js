var fw = require('./flickr_worker'),
    iw = require('./instagram_worker');

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

var processMessage = function(message){
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
}

var isString = function(s) {
  return Object.prototype.toString.call(s) === '[object String]'; 
}

var isNumber = function(n) {
  return Object.prototype.toString.call(n) === '[object Number]'; 
}

exports.validMessage = validMessage;
exports.processMessage = processMessage;
exports.isString = isString;
exports.isNumber = isNumber;