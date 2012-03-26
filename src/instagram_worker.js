var     util = require('util'),
   instagram = require('instagram'),
         cdb = require('./cartodb_client');

var InstagramWorker = function(message) {
  this.mapId = message.cartodb_map_id;
  this.lng = message.longitude;
  this.lat = message.latitude;
  this.min_timestamp = this._dateToUnixTimestamp(message.start_date);
  this.max_timestamp = this._dateToUnixTimestamp(message.end_date);
  this.distance = parseFloat(message.radius);
  this.instagram = instagram.createClient(process.env.instagram_client_id, process.env.instagram_client_secret);
  this.tableName = message.cartodb_table_name;
  this.previewToken = message.preview_token;
  this.inPreviewMode = this.previewToken == null ? false : (this.previewToken.trim() != "");
  this.cartoDB = new cdb.CartoDB({
    username: message.cartodb_username,
    auth_token: message.cartodb_auth_token,
    auth_secret: message.cartodb_auth_secret,
    consumer_key: process.env.cartodb_mapismo_consumer_key,
    consumer_secret: process.env.cartodb_mapismo_consumer_secret
  });
}

InstagramWorker.prototype = {
  work: function(){
    var that = this;
    this.instagram.media.search({
      lat: this.lat,
      lng: this.lng,
      distance: this.distance,
      min_timestamp: this.min_timestamp,
      max_timestamp: this.max_timestamp
    }, function(images, error){
      if(error != null){
        console.log("[ERROR on instagram.media.search] " + err.code + " -  " + err.message);
      } else {
        if(that.inPreviewMode) {
          var queries = [];
          images.forEach(function(photo){
            queries.push(that.cartoDB._convertDataToInsertQuery(that.tableName, that._processPhotoToRow(photo)));
          });
          that.cartoDB.runQuery(queries.join(";"), function(error, responseBody, response){
            if(error != null){
              console.log("[ERROR on cartoDB.insertRow] " + util.inspect(error));
            }
          });
        } else {
          images.forEach(function(photo){
            var row = that._processPhotoToRow(photo);
            that.cartoDB.insertRow(that.tableName, row, function(error, responseBody, response){
              if(error != null){
                console.log("[ERROR on cartoDB.insertRow] " + util.inspect(error));
              }
            });
          });
        }
      }
    });
  },
  // (photoObj:Object photo from Instagram) → Object
  // Converts a photo object from instagram into a more
  // compact object with the required attributes to insert in CartoDB
  _processPhotoToRow: function(photoObj){
    var auxDate = new Date(parseInt(photoObj.created_time)*1000);
    return {
      source: 'instagram',
      source_id: photoObj.id,
      map_id: this.mapId,
      avatar_url: photoObj.user.profile_picture,
      username: photoObj.user.username,
      date: auxDate.getUTCFullYear() + '-' + parseInt(auxDate.getUTCMonth()+1) + '-' + auxDate.getUTCDate() + 'T' +
            auxDate.getUTCHours() + ':' + auxDate.getUTCMinutes() + ':' + auxDate.getUTCSeconds(),
      permalink: photoObj.link,
      data: photoObj.images.standard_resolution.url,
      latitude: photoObj.location.latitude,
      longitude: photoObj.location.longitude,
      preview_token: this.previewToken
    };
  },
  // (date:String) → Number
  // Converts a date as a string into a Unix timestamp in UTC
  _dateToUnixTimestamp: function(date){
    var timestamp = new Date(date.replace('+',' ') + " UTC");
    return (timestamp.getTime() / 1000);
  }
}

exports.InstagramWorker = InstagramWorker;