var iw = require('../src/instagram_worker');

describe("Instagram Worker", function(){
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

  var w = new iw.InstagramWorker(message);

  var instagramPhoto = {
    tags: [],
    location: { latitude: 40.42533, longitude: -3.703962 },
    comments: { count: 0, data: [] },
    filter: 'Nashville',
    created_time: '1305500047',
    link: 'http://instagr.am/p/ETKyS/',
    likes: { count: 4, data: [ [Object], [Object], [Object], [Object] ] },
    images:
     { low_resolution:
        { url: 'http://distillery.s3.amazonaws.com/media/2011/05/15/b6aec805431a43538bb9fc0a61404600_6.jpg',
          width: 306,
          height: 306 },
       thumbnail:
        { url: 'http://distillery.s3.amazonaws.com/media/2011/05/15/b6aec805431a43538bb9fc0a61404600_5.jpg',
          width: 150,
          height: 150 },
       standard_resolution:
        { url: 'http://distillery.s3.amazonaws.com/media/2011/05/15/b6aec805431a43538bb9fc0a61404600_7.jpg',
          width: 612,
          height: 612 } },
    caption: null,
    type: 'image',
    id: '72133778_2175025',
    user:
     { username: 'nachoquintero',
       website: 'http://www.facebook.com/quinterocrespo',
       bio: '',
       profile_picture: 'http://images.instagram.com/profiles/profile_2175025_75sq_1316909039.jpg',
       full_name: 'Nacho Quintero',
       id: '2175025' }
  };

  describe("constructor method", function(){
    it("should set the attributes from the message", function() {
      var w = new iw.InstagramWorker(message);
      expect(w.lng).toEqual(-3.703611);
      expect(w.lat).toEqual(40.416691);
      expect(w.min_timestamp).toEqual(1305417600);
      expect(w.max_timestamp).toEqual(1305503999);
      expect(w.distance).toEqual(3000);
      expect(w.instagram).not.toBeUndefined();
    });
  });

  describe("#_processPhotoToRow", function(){
    it("should process a photo result from Instagram to a small object", function(){
      var row = w._processPhotoToRow(instagramPhoto);

      expect(row.source).toEqual('instagram');
      expect(row.source_id).toEqual('72133778_2175025');
      expect(row.map_id).toEqual(33);
      expect(row.avatar_url).toEqual('http://images.instagram.com/profiles/profile_2175025_75sq_1316909039.jpg');
      expect(row.username).toEqual('nachoquintero');
      expect(row.date).toEqual('2011-5-15T22:54:7');
      expect(row.permalink).toEqual('http://instagr.am/p/ETKyS/');
      expect(row.data).toEqual('http://distillery.s3.amazonaws.com/media/2011/05/15/b6aec805431a43538bb9fc0a61404600_7.jpg');
      expect(row.latitude).toEqual(40.42533);
      expect(row.longitude).toEqual(-3.703962);
    });
  });

  describe("#work", function(){
    it("should search for the photos",function(){
      spyOn(w.instagram.media, 'search');
      w.work();
      expect(w.instagram.media.search).toHaveBeenCalled();
    });

    it("should insert the photos in CartoDB", function(){
      var searchResults = [instagramPhoto];
      var callback = function(error, searchResults){
        return searchResults;
      };
      spyOn(w.instagram.media, "search").andReturn(callback);
      spyOn(w.cartoDB, "insertRow");
      w.work();
      pending("expect(w.cartoDB.insertRow).toHaveBeenCalled();")
    });
  });
});