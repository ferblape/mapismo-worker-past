var util = require('util')
 ,  FlickrAPI = require('../vendor/flickr/lib/flickr').FlickrAPI
 ,  cdb = require('../src/cartodb_client');

var FlickrWorker = function(message) {
  console.log("New flickr worker");
  
  this.lon = message.longitude;
  this.lat = message.latitude;
  this.min_taken_date = message.start_date;
  this.max_taken_date = message.end_date;
  this.text = message.keyword;
  this.radius = parseFloat(message.radius/1000);
  this.flickr = new FlickrAPI(process.env.flickr_api_key);
  this.tableName = message.cartodb_table_name;
  this.cartoDB = new cdb.CartoDB({
    username: message.cartodb_username,
    auth_token: message.cartodb_auth_token,
    auth_secret: message.cartodb_auth_secret,
    consumer_key: process.env.cartodb_mapismo_consumer_key,
    consumer_secret: process.env.cartodb_mapismo_consumer_secret
  });
}

FlickrWorker.prototype = {
  work: function(){
    var that = this;
    this.flickr.photos.search({
      min_taken_date: this.min_taken_date,
      max_taken_date: this.max_taken_date,
      text: this.text,
      has_geo: 1,
      lat: this.lat,
      lon: this.lon,
      radius: this.radius,
      extras: "geo,owner_name",
      per_page: "3",
      format: "rest"
    }, function(err, result){
      if(err != null){
        console.log("ERR: " + err.code + " -  " + err.message);
      } else {
        // console.log("results: " + util.inspect(result));
        result.photo.forEach(function(photo){
          // console.log(photo.id + " " + photo.ownername);
          var row = that._processPhotoToRow(photo);
          that.cartoDB.insertRow(that.tableName, row, function(error, responseBody, response){
            if(error != null){
              console.log("[ERROR] " + util.inspect(error));
            } else {
              console.log("[Response] " + util.inspect(responseBody));
            }
          });
        });
      }
    });
  },
  // (photoObj:Object photo from Flickr) → Object
  // Converts a photo object from flickr into a more
  // compact object with the required attributes to insert in CartoDB
  _processPhotoToRow: function(photoObj){
    return {
      source: 'flickr',
      source_id: photoObj.id,
      title: photoObj.title,
      latitude: photoObj.latitude,
      longitude: photoObj.longitude
    };
  }
}

exports.FlickrWorker = FlickrWorker;