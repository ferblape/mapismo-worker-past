var utils = require('../src/utils.js');

describe("Utils module", function(){

  describe("#isString method", function(){

    it("should return true when is a String", function(){
      expect(utils.isString("string")).toBeTruthy();
    });

    it("should return false when is not a String", function(){
      expect(utils.isString(5)).toBeFalsy();
    });

  });

});