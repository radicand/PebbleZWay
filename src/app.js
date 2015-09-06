/**
 * Welcome to Pebble.js!
 *
 * This is where you write your app.
 */

var UI = require('ui');
var ZWayLib = require('zway');
var Settings = require('settings');

Settings.config({
  url: 'http://dev.radicand.org/pebble-zway-settings.html',
  autoSave: true
  },
  function(e) {
    console.log('opened config');
  },
  function(e) {
    console.log('Recieved settings!');
    // Show the parsed response
    console.log(JSON.stringify(e.options));

    // Show the raw response if parsing failed
    if (e.failed) {
      console.log(e.response);
    }
  }
);

console.log('Loading settings: ' + JSON.stringify(Settings.option()));
var ZWay = new ZWayLib(Settings.option());

var main = new UI.Card({
  title: 'ZWay',
  icon: 'images/menu_icon.png',
  subtitle: 'Loading...'
});

main.show();

ZWay.listDevices({}, function (err, data) {
  if (err || !data || !data.devices) {
    console.log(JSON.stringify(err));
    console.log(JSON.stringify(data));
    return main.subtitle('Error talking to ZWay!');
  }
  
  main.subtitle('Setting up...');
  
  var devices = [];
  for (var k in data.devices) {
    if (data.devices[k].instances[0].commandClasses[37] &&
    data.devices[k].instances[0].commandClasses[37].data.level.value !== null) {
      devices.push({
        id: k,
        name: data.devices[k].data.givenName.value,
        isOn: data.devices[k].instances[0].commandClasses[37].data.level.value,
        type: 'switch'
      });
    }
    if (data.devices[k].data.basicType === 4) {
      // switch
      devices.push(data.devices[k].data);
    }
  }

  var menu = new UI.Menu({
    sections: [{
      items: devices.map(function (device) {
        return {
          id: device.id,
          title: device.name,
          subtitle: (device.isOn ? 'On' : 'Off')
        };
      })
    }]
  });
  menu.on('select', function(e) {
    var newDirection = (e.item.subtitle === 'On' ? 'Off' : 'On');
    e.item.subtitle = 'Changing to ' + newDirection + '...';
    ZWay.toggleSwitch({
      deviceId: e.item.id,
      direction: newDirection
    }, function (err, data) {
      if (err) {
        var error = new UI.Card({
          title: 'ZWay',
          subtitle: 'Error toggling switch!',
          body: err
        });
        
        return error.show();
      }
      
      e.item.subtitle = newDirection;
      
      return menu.item(e.sectionIndex, e.itemIndex, e.item);
    });
  });
  menu.show();
  main.hide();
  main.remove();
});