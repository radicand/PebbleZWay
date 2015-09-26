var ajax = require('ajax');

// START INCLUDE SOURCE
// Source: http://code.google.com/p/gflot/source/browse/trunk/flot/base64.js?r=153

/* Copyright (C) 1999 Masanao Izumo <iz@onicos.co.jp>
 * Version: 1.0
 * LastModified: Dec 25 1999
 * This library is free.  You can redistribute it and/or modify it.
 */

/*
 * Interfaces:
 * b64 = base64encode(data);
 * data = base64decode(b64);
 */

(function() {

var base64EncodeChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
var base64DecodeChars = new Array(
    -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
    -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
    -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 62, -1, -1, -1, 63,
    52, 53, 54, 55, 56, 57, 58, 59, 60, 61, -1, -1, -1, -1, -1, -1,
    -1,  0,  1,  2,  3,  4,  5,  6,  7,  8,  9, 10, 11, 12, 13, 14,
    15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, -1, -1, -1, -1, -1,
    -1, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40,
    41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, -1, -1, -1, -1, -1);

function base64encode(str) {
    var out, i, len;
    var c1, c2, c3;

    len = str.length;
    i = 0;
    out = "";
    while(i < len) {
  c1 = str.charCodeAt(i++) & 0xff;
  if(i == len)
  {
      out += base64EncodeChars.charAt(c1 >> 2);
      out += base64EncodeChars.charAt((c1 & 0x3) << 4);
      out += "==";
      break;
  }
  c2 = str.charCodeAt(i++);
  if(i == len)
  {
      out += base64EncodeChars.charAt(c1 >> 2);
      out += base64EncodeChars.charAt(((c1 & 0x3)<< 4) | ((c2 & 0xF0) >> 4));
      out += base64EncodeChars.charAt((c2 & 0xF) << 2);
      out += "=";
      break;
  }
  c3 = str.charCodeAt(i++);
  out += base64EncodeChars.charAt(c1 >> 2);
  out += base64EncodeChars.charAt(((c1 & 0x3)<< 4) | ((c2 & 0xF0) >> 4));
  out += base64EncodeChars.charAt(((c2 & 0xF) << 2) | ((c3 & 0xC0) >>6));
  out += base64EncodeChars.charAt(c3 & 0x3F);
    }
    return out;
}

function base64decode(str) {
    var c1, c2, c3, c4;
    var i, len, out;

    len = str.length;
    i = 0;
    out = "";
    while(i < len) {
  /* c1 */
  do {
      c1 = base64DecodeChars[str.charCodeAt(i++) & 0xff];
  } while(i < len && c1 == -1);
  if(c1 == -1)
      break;

  /* c2 */
  do {
      c2 = base64DecodeChars[str.charCodeAt(i++) & 0xff];
  } while(i < len && c2 == -1);
  if(c2 == -1)
      break;

  out += String.fromCharCode((c1 << 2) | ((c2 & 0x30) >> 4));

  /* c3 */
  do {
      c3 = str.charCodeAt(i++) & 0xff;
      if(c3 == 61)
    return out;
      c3 = base64DecodeChars[c3];
  } while(i < len && c3 == -1);
  if(c3 == -1)
      break;

  out += String.fromCharCode(((c2 & 0XF) << 4) | ((c3 & 0x3C) >> 2));

  /* c4 */
  do {
      c4 = str.charCodeAt(i++) & 0xff;
      if(c4 == 61)
    return out;
      c4 = base64DecodeChars[c4];
  } while(i < len && c4 == -1);
  if(c4 == -1)
      break;
  out += String.fromCharCode(((c3 & 0x03) << 6) | c4);
    }
    return out;
}

if (!window.btoa) window.btoa = base64encode;
if (!window.atob) window.atob = base64decode;

})();
// END INCLUDE SOURCE

var ZWay = function (settings) {
  this.settings = settings;
  //console.log('ZWay Settings: ' + JSON.stringify(this.settings));
};

ZWay.prototype.talkToZWay = function (opts, done) {
  var url = 'http://' + this.settings.host + ':8083' + opts.url;
  var auth = 'Basic ' + window.btoa(this.settings.username + ':' + this.settings.password);
  //console.log('ajax calling: ' + url);
  //console.log('using auth: ' + auth);
  return ajax(
    {
      url: url,
      type: 'json',
      method: 'post',
      data: {},
      headers: {
        'Authorization': auth
      }
    },
    function(data, status, request) {
      // success
      //console.log('ajax data in: (' + status + ') ' + JSON.stringify(data));
      return done (null, data);
    },
    function(error, status, request) {
      // error
      //console.log('ajax error: (' + status + ') ' + JSON.stringify(error));
      return done (error);
    }
  );
};

ZWay.prototype.listDevices = function (opts, done) {
  return this.talkToZWay({
    url: '/ZWaveAPI/Data/0'
  }, function (err, data) {
    if (err) return done(err);
    
    var devices = [];
    for (var k in data.devices) {
      if (k === '1') continue; // don't do the controller
      
      if (data.devices[k].instances[0].commandClasses[37] &&
      data.devices[k].instances[0].commandClasses[37].data.level.value !== null) {
        devices.push({
          id: k,
          name: data.devices[k].data.givenName.value,
          isOn: data.devices[k].instances[0].commandClasses[37].data.level.value,
          type: 'switch'
        });
      }
    }
    
    if (devices.length === 0) {
      return done('No switches found on the network');
    }
    return done(null, devices);
  });
};

ZWay.prototype.toggleSwitch = function (opts, done) {
  if (typeof opts !== 'object') {
    return done ('no options specified');
  }
  
  if (!opts.deviceId) {
    return done ('no device specified');
  }
  
  if (['On','Off'].indexOf(opts.direction) === -1) {
    return done ('invalid switch direction specified: ' + opts.direction);
  } else {
    opts.direction = (opts.direction === 'On' ? 255 : 0);
  }
  
  return this.talkToZWay({
    url: '/ZWaveAPI/Run/devices[' + opts.deviceId + '].instances[0].Basic.Set(' + opts.direction + ')'
  }, done);
};

module.exports = ZWay;
