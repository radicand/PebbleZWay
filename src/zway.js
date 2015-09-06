var ajax = require('ajax');

var ZWay = function (settings) {
  this.settings = settings;
  console.log('ZWay Settings: ' + JSON.stringify(this.settings));
};

ZWay.prototype.talkToZWay = function (opts, done) {
  var url = 'http://' + this.settings.host + ':8083' + opts.url;
  console.log('ajax calling: ' + url);
  var auth = 'Basic ' + btoa(this.settings.username + ':' + this.settings.password);
  console.log('using auth: ' + auth);
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
      console.log('ajax data in: (' + status + ') ' + JSON.stringify(data));
      return done (null, data);
    },
    function(error, status, request) {
      // error
      console.log('ajax error: (' + status + ') ' + JSON.stringify(error));
      return done (error);
    }
  );
};

ZWay.prototype.listDevices = function (opts, done) {
  return this.talkToZWay({
    url: '/ZWaveAPI/Data/0'
  }, done);
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