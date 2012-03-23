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

  describe("#_apiSQLEndPoint", function(){
    it("should return the url of the endpoint", function(){
      expect(cartoDB._apiSQLEndPoint()).toEqual('https://blat.cartodb.com/api/v1/sql');
    });
  });

  describe("#_convertDataToInsertQuery", function() {
    it("should convert a object into a URL with the insert query", function(){
      var row = {
        source: 'flickr',
        source_id: '123123',
        title: '15M in Madrid',
        latitude: '40.41',
        longitude: '-3.70',
        preview_token: '123abc'
      };
      expect(cartoDB._convertDataToInsertQuery('secret_table_name', row)).toEqual("INSERT INTO secret_table_name (source,source_id,title,preview_token,the_geom) VALUES ('flickr','123123','15M in Madrid','123abc',GEOMETRYFROMTEXT('POINT(-3.70 40.41)',4326))");
    });
  });

  describe("#runQuery", function(){
    it("should perform a request CartoDB with an INSERT query", function(){
      spyOn(cartoDB.oa, 'post');
      cartoDB.runQuery('query', function(){});
      expect(cartoDB.oa.post).toHaveBeenCalledWith("https://blat.cartodb.com/api/v1/sql", 'auth_token', 'auth_secret', {q: 'query'}, "application/x-www-form-urlencoded", jasmine.any(Function));
    });
  });
});