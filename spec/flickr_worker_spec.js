var fw = require('../src/flickr_worker');

describe("Flickr Worker", function(){
  var message = {
    cartodb_table_name: 'secret_table',
    cartodb_map_id: 33,
    cartodb_username: 'blat',
    cartodb_userid: 33,
    cartodb_auth_token: 'token auth',
    cartodb_auth_secret: 'token secret auth',
    source: 'flickr',
    keyword: '15m',
    latitude: 40.416691,
    longitude: -3.703611,
    radius: 3000,
    start_date: '2011-05-15+00:00:00',
    end_date: '2011-05-15+23:59:59'
  };
  
  var w = new fw.FlickrWorker(message);
  
  var flickrPhoto = { 
    id: '5742022581',
    owner: '48167889@N07',
    secret: 'c4ccb67f03',
    server: '5109',
    farm: 6,
    title: '15M Madrid',
    ispublic: 1,
    isfriend: 0,
    isfamily: 0,
    latitude: 40.416755,
    longitude: -3.703618,
    accuracy: '16',
    context: 0,
    place_id: 'XrSazRhTUrh4j1shyQ',
    woeid: '20219885',
    geo_is_family: 0,
    geo_is_friend: 0,
    geo_is_contact: 0,
    geo_is_public: 1,
    ownername: 'somabody',
    datetaken: '2011-05-15 20:21:05',
    datetakengranularity: '0',
    url_l: 'http://farm8.staticflickr.com/7143/6819277937_db03644248_b.jpg',
    height_l: '683',
    width_l: '1024'
  };
  
  var row = w._processPhotoToRow(flickrPhoto);
  
  describe("constructor method", function(){
    it("should set the attributes from the message", function() {
      var w = new fw.FlickrWorker(message);
      expect(w.lon).toEqual(-3.703611);
      expect(w.lat).toEqual(40.416691);
      expect(w.min_taken_date).toEqual('2011-05-15+00:00:00');
      expect(w.max_taken_date).toEqual('2011-05-15+23:59:59');
      expect(w.text).toEqual('15m');
      expect(w.radius).toEqual(3.0);
      expect(w.flickr).not.toBeUndefined();
    });
  });
  
  describe("#_processPhotoToRow", function(){
    it("should process a photo result from Flickr to a small object", function(){
      expect(row.source).toEqual('flickr');
      expect(row.source_id).toEqual('5742022581');
      expect(row.latitude).toEqual(40.416755);
      expect(row.longitude).toEqual(-3.703618);
      expect(row.map_id).toEqual(33);
      expect(row.avatar_url).toEqual("http://www.flickr.com/buddyicons/48167889@N07.jpg");
      expect(row.username).toEqual("somabody");
      expect(row.date).toEqual('2011-05-15T20:21:05');
      expect(row.permalink).toEqual("http://flickr.com/photos/48167889@N07/5742022581");
      expect(row.data).toEqual("http://farm8.staticflickr.com/7143/6819277937_db03644248_b.jpg");
    });
  });
  
  describe("#work", function(){
    it("should search for the photos",function(){
      spyOn(w.flickr.photos, 'search');
      w.work();
      expect(w.flickr.photos.search).toHaveBeenCalled();
    });
    
    it("should insert the photos in CartoDB", function(){
      var searchResults = [flickrPhoto];
      var callback = function(error, searchResults){
        return searchResults;
      };
      spyOn(w.flickr.photos, "search").andReturn(callback);
      spyOn(w.cartoDB, "insertRow");
      w.work();
      pending("expect(w.cartoDB.insertRow).toHaveBeenCalled();")
    });
  });
});