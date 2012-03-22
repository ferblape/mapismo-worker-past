var mapismo = require('../src/mapismo.js');
var      fw = require('../src/flickr_worker.js'),
         iw = require('../src/instagram_worker.js');

describe("Mapismo module", function(){

  describe("#validMessage method", function(){

    it("should return false when the message is invalid", function(){
      expect(mapismo.validMessage({a:1})).toBeFalsy();
    });

    it("should return true when the message as all the fields and they are valid", function(){
      expect(mapismo.validMessage({cartodb_table_name:"secret_table",cartodb_map_id:33,cartodb_username:"blat",cartodb_userid:33,cartodb_auth_token:"token auth",cartodb_auth_secret:"token secret auth",source:"instagram",keyword:"15m",latitude:40.416691,longitude:-3.123213,radius:3000,start_date:"2011-05-15 00:00:00",end_date:"2011-05-15 23:59:59",preview_token:"123abc"})).toBeTruthy();
    });

    it("should return false when the message as all the fields but source is not valid", function(){
      expect(mapismo.validMessage({cartodb_table_name:"secret_table",cartodb_map_id:33,cartodb_username:"blat",cartodb_userid:33,cartodb_auth_token:"token auth",cartodb_auth_secret:"token secret auth",source:"kkgram",keyword:"15m",latitude:40.416691,longitude:-3.123213,radius:3000,start_date:"2011-05-15 00:00:00",end_date:"2011-05-15 23:59:59",preview_token:"123abc"})).toBeFalsy();
    });

  });

  describe("#processMessage method", function(){

    it("should run flickr worker if a message with source flickr is received", function(){
      spyOn(mapismo, "decryptMessage").andReturn("{\"source\":\"flickr\"}");
      spyOn(mapismo, "validMessage").andReturn(true);

      var flickrWorker = new fw.FlickrWorker({source: 'flickr'});
      spyOn(flickrWorker, 'work');
      spyOn(fw, 'FlickrWorker').andReturn(flickrWorker);

      mapismo.processMessage("a message");

      expect(fw.FlickrWorker).toHaveBeenCalled();
      expect(flickrWorker.work).toHaveBeenCalled();
    });

    it("should run instagram worker if a message with source instagram is received", function(){
      spyOn(mapismo, "decryptMessage").andReturn("{\"source\":\"instagram\"}");
      spyOn(mapismo, "validMessage").andReturn(true);

      var instagramWorker = new iw.InstagramWorker({
        source: 'instagram', start_date: '2011-05-11+00:00:00',
        end_date: '2011-05-11+00:00:00'
      });
      spyOn(instagramWorker, 'work').andReturn(true);
      spyOn(iw, 'InstagramWorker').andReturn(instagramWorker);

      mapismo.processMessage("a message");

      expect(iw.InstagramWorker).toHaveBeenCalled();
      expect(instagramWorker.work).toHaveBeenCalled();
    });

    it("should return if message is not JSON valid", function(){
      spyOn(mapismo, "decryptMessage").andReturn("message decrypted");
      expect(mapismo.processMessage("message encrypted")).toBeFalsy();
    });

  });

});