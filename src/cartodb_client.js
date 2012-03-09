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
  insertRow: function(tableName, row, callback){
    var requestUrl = this._convertDataToInsertURI(tableName, row);
    this.oa.getProtectedResource(requestUrl, "POST", this.auth_token, 
                                 this.auth_secret, function(error, responseBody, response) {
      return callback(error, responseBody, response);
    });
  },
  // (tableName:String, row:Object) → String
  // Converts a table name and a row object into a valid URI
  // with the insert query as a parameter
  _convertDataToInsertURI: function(tableName, row){
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
    query = "INSERT INTO " + tableName + " (" + keysString + ") VALUES (" + valuesString + ")";
    
    // Build the URL with the query
    return "https://" + this.username + ".cartodb.com/api/v1/sql?q=" + querystring.escape(query);
  }
};

exports.CartoDB = CartoDB;