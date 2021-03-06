var    util = require('util'),
  FlickrAPI = require('./vendor/flickr').FlickrAPI,
        cdb = require('./cartodb_client'),
      utils = require('../src/utils.js');

var FlickrWorker = function(message) {
  this.lon = message.longitude;
  this.lat = message.latitude;
  this.min_taken_date = message.start_date;
  this.max_taken_date = message.end_date;
  this.text = escape(message.keyword);
  this.mapId = message.cartodb_map_id;
  this.radius = parseFloat(message.radius/1000);
  this.flickr = new FlickrAPI(process.env.flickr_api_key);
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

FlickrWorker.prototype = {
  work: function(){
    this._flickrSearchAndInsert(1);
  },
  _flickrSearchAndInsert: function(currentPage){
    var that = this;
    var searchOptions = {
      min_taken_date: this.min_taken_date,
      max_taken_date: this.max_taken_date,
      has_geo: 1,
      lat: this.lat,
      lon: this.lon,
      radius: this.radius,
      extras: "geo,owner_name,date_taken,url_m",
      per_page: 500,
      format: "rest",
      page: currentPage,
    };
    if(!utils.isBlankString(this.text)){
      searchOptions.text = this.text;
    }
    if(this.inPreviewMode){
      searchOptions.per_page = 100;
    }
    this.flickr.photos.search(searchOptions, function(err, result){
      if(err != null){
        console.log("[ERROR on flickr.photos.search] " + err.code + " -  " + err.message);
      } else {
        if(parseInt(result.pages) > 1 && currentPage == 1 && !that.inPreviewMode){
          for(var page = 2; page <= result.pages; page++){
            that._flickrSearchAndInsert(page);
          }
        }
        if(that.inPreviewMode) {
          var queries = [];
          result.photo.forEach(function(photo){
            queries.push(that.cartoDB._convertDataToInsertQuery(that.tableName, that._processPhotoToRow(photo)));
          });
          that.cartoDB.runQuery(queries.join(";"), function(error, responseBody, response){
            if(error != null){
              console.log("[ERROR on cartoDB.insertRow] " + util.inspect(error));
            }
          });
        } else {
          result.photo.forEach(function(photo){
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
  // (photoObj:Object photo from Flickr) → Object
  // Converts a photo object from flickr into a more
  // compact object with the required attributes to insert in CartoDB
  _processPhotoToRow: function(photoObj){
    return {
      source: 'flickr',
      source_id: photoObj.id,
      map_id: this.mapId,
      avatar_url: "http://www.flickr.com/buddyicons/" + photoObj.owner + ".jpg",
      username: photoObj.ownername,
      date: photoObj.datetaken.replace(' ','T'),
      permalink: "http://flickr.com/photos/" + photoObj.owner + "/" + photoObj.id,
      data: photoObj.url_m,
      latitude: photoObj.latitude,
      longitude: photoObj.longitude,
      preview_token: this.previewToken
    };
  }
}

exports.FlickrWorker = FlickrWorker;