var ajax = require('ajax');

var ZWay = function (settings) {
  this.settings = settings;
  //console.log('ZWay Settings: ' + JSON.stringify(this.settings));
};

ZWay.prototype.talkToZWay = function (opts, done) {
  var url = 'http://' + this.settings.host + ':8083' + opts.url;
  var auth = 'Basic ' + btoa(this.settings.username + ':' + this.settings.password);
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