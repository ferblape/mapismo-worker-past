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
  var row = w._processPhotoToRow({
    id: '123123',
    title: '15M in Madrid',
    latitude: '40.41',
    longitude: '-3.70'
  });
  
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
      expect(row.source_id).toEqual('123123');
      expect(row.title).toEqual('15M in Madrid');
      expect(row.latitude).toEqual('40.41');
      expect(row.longitude).toEqual('-3.70');
    });
  });
  
  describe("#work", function(){
    it("should search for the photos",function(){
      spyOn(w.flickr.photos, 'search');
      w.work();
      expect(w.flickr.photos.search).toHaveBeenCalled();
    });
    
    it("should insert the photos in CartoDB", function(){
      var searchResults = [
        {
          id: 1,
          title: "Title #1",
          latitude: "40.41",
          longitude: "-3.71"
        },
        {
          id: 2,
          title: "Title #2",
          latitude: "40.42",
          longitude: "-3.72"
        }
      ];
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