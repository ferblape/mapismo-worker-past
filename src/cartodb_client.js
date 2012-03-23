var util = require("util")
 , OAuth = require("oauth").OAuth
 , querystring = require("querystring")
 , utils = require("./utils.js");

var CartoDB = function(config) {
  var cartodb_request_url = "https://" + config.username + ".cartodb.com/oauth/request_token"
    , cartodb_access_url  = "https://" + config.username + ".cartodb.com/oauth/access_token"

  this.username    = config.username;
  this.auth_token  = config.auth_token;
  this.auth_secret = config.auth_secret;
  this.oa          = new OAuth(cartodb_request_url, cartodb_access_url,
                               config.consumer_key, config.consumer_secret,
                               "1.0",  null, "HMAC-SHA1");
}

CartoDB.prototype = {
  // (tableName:String, row:Ibject, callback:Function) → Callback function
  // Insert the row object in the table with name tableName
  insertRow: function(tableName, row, callback){
    this.runQuery(this._convertDataToInsertQuery(tableName, row), function(error, responseBody, response){
      callback(error, responseBody, response);
    })
  },

  // (query:String, callback:Function) → Callback function
  // Runs the given query
  runQuery: function(query, callback){
    this.oa.post(this._apiSQLEndPoint(), this.auth_token,
                 this.auth_secret, {q: query}, "application/x-www-form-urlencoded",
                 function(error, responseBody, response) {
      return callback(error, responseBody, response);
    });
  },

  // (tableName:String, row:Object) → String
  // - Private function -
  // Converts a table name and a row object into a valid URI
  // with the insert query as a parameter
  _convertDataToInsertQuery: function(tableName, row){
    var i, latitude, longitude, value, query
        keysString = "",
        valuesString = "",
        keys = Object.keys(row);

    // Iterate over the fields of the row and its values
    // and separate them in keysString and valuesString variables
    for(i = 0; i < keys.length; i++){
      value = row[keys[i]];

      // Latitude and longitude are processed apart
      // in the composed field `the_geom`
      if(keys[i] == "latitude"){
        latitude = value;
        continue;
      }
      if(keys[i] == "longitude"){
        longitude = value;
        continue;
      }

      // Add to the list of names of fields
      (keysString != "") ? keysString += "," + keys[i] : keysString += keys[i];

      // Add to the list of values of fields
      if(utils.isString(value)){
        // TODO: escape quotes
        value = "'" + value + "'";
      }
      (valuesString != "") ? valuesString += "," + value : valuesString += value;
    };

    // Add the_geom and its value
    keysString += ",the_geom";
    valuesString += ",GEOMETRYFROMTEXT('POINT(" + longitude + " " + latitude + ")',4326)";

    // Create the INSERT query
    return "INSERT INTO " + tableName + " (" + keysString + ") VALUES (" + valuesString + ")";
  },

  // () → String
  // - Private function -
  // Returns the endpoint of the SQL API
  _apiSQLEndPoint: function(){
    return "https://" + this.username + ".cartodb.com/api/v1/sql";
  }
};

exports.CartoDB = CartoDB;