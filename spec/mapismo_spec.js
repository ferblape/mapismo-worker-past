var mapismo = require('../src/mapismo.js');

describe("Utils module", function(){

  describe("#validMessage method", function(){

    it("should return false when the message is invalid", function(){
      expect(mapismo.validMessage({a:1})).toBeFalsy();
    });

    it("should return true when the message as all the fields and they are valid", function(){
      expect(mapismo.validMessage({cartodb_table_name:"secret_table",cartodb_map_id:33,cartodb_username:"blat",cartodb_userid:33,cartodb_auth_token:"token auth",cartodb_auth_secret:"token secret auth",source:"instagram",keyword:"15m",latitude:40.416691,longitude:-3.123213,radius:3000,start_date:"2011-05-15 00:00:00",end_date:"2011-05-15 23:59:59"})).toBeTruthy();
    });

    it("should return false when the message as all the fields but source is not valid", function(){
      expect(mapismo.validMessage({cartodb_table_name:"secret_table",cartodb_map_id:33,cartodb_username:"blat",cartodb_userid:33,cartodb_auth_token:"token auth",cartodb_auth_secret:"token secret auth",source:"kkgram",keyword:"15m",latitude:40.416691,longitude:-3.123213,radius:3000,start_date:"2011-05-15 00:00:00",end_date:"2011-05-15 23:59:59"})).toBeFalsy();
    });

  });

});