var cdb = require('../src/cartodb_client');

describe("CartoDB client", function() {
  var cartoDB = new cdb.CartoDB({
    username: 'blat',
    auth_token: 'auth_token',
    auth_secret: 'auth_secret'
  });
  
  it("should store the username of CartoDB user", function(){
    expect(cartoDB.username).toEqual('blat');
  });

  it("should store the authorized token", function(){
    expect(cartoDB.auth_token).toEqual('auth_token');
  });

  it("should store the authorized token secret", function(){
    expect(cartoDB.auth_secret).toEqual('auth_secret');
  });

  it("should have an OAuth connection", function(){
    expect(cartoDB.oa).not.toBeUndefined();
  });
  
  describe("#_convertDataToInsertURI", function() {
    it("should convert a object into a URL with the insert query", function(){
      var row = {
        source: 'flickr',
        source_id: '123123',
        title: '15M in Madrid',
        latitude: '40.41',
        longitude: '-3.70'
      };
      var query = "https://blat.cartodb.com/api/v1/sql?q=INSERT%20INTO%20secret_table_name%20(source%2Csource_id%2Ctitle%2Cthe_geom)%20VALUES%20('flickr'%2C'123123'%2C'15M%20in%20Madrid'%2CGEOMETRYFROMTEXT('POINT(-3.70%2040.41)'%2C4326))";
      expect(cartoDB._convertDataToInsertURI('secret_table_name', row)).toEqual(query);
    });
  });
  
  describe("#insertRow", function(){
    it("should perform a request CartoDB with an INSERT query", function(){
      spyOn(cartoDB, "_convertDataToInsertURI").andReturn('cartodb_api_call_url');
      spyOn(cartoDB.oa, 'getProtectedResource');
      cartoDB.insertRow('tableName', {}, function(){});
      expect(cartoDB.oa.getProtectedResource).toHaveBeenCalledWith("cartodb_api_call_url", 'POST', 'auth_token', 'auth_secret', jasmine.any(Function));
    });
  });
});