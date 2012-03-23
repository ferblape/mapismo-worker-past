var isString = function(s) {
  return Object.prototype.toString.call(s) === '[object String]';
}

var isBlankString = function(s) {
  if(isString(s)){
    return (s.trim() == "");
  } else {
    return false;
  }
}
exports.isString = isString;
exports.isBlankString = isBlankString;