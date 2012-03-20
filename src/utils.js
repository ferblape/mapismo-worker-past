var isString = function(s) {
  return Object.prototype.toString.call(s) === '[object String]';
}

exports.isString = isString;