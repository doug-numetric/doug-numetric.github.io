
/* CORE API */

// (c) 2012 Ernesto Mendez
// All Rights Reserved.

// http://documentcloud.github.com/backbone/
// http://documentcloud.github.com/underscore/
// https://github.com/d0ugal/locache
// https://github.com/mishoo/UglifyJS
// http://headjs.com/

(function($, window) {

  // Set debug mode
  var debugMode = /#debug$/.test(window.location + '') && console && console.log instanceof Function;

  Backbone.Events.emit = Backbone.Events.trigger; // `emit` alias of `trigger`

  var events = _.extend({}, Backbone.Events);
  var data = {};
  
  window.Core = {

    vars: {
      window: $(window)
    },
    
    colors: {
      
    },
    
    classes: {
      
    },
    
    on: function(evt, callback, context) {
      return events.on(evt, callback, context);
    },

    once: function(evt, callback, context) {
      var cb = function() {
        callback.apply(this, arguments);
        events.off(evt, cb);
      }
      return events.on(evt, cb, context);
    },

    emit: function() {
      return events.emit.apply(events, arguments);
    },
    
    debug: function() {
      if (debugMode) console.log(this.util.format.apply(null, arguments));
    },
    
    setVar: function(key, value) {
      this.vars[key] = value;
    },
    
    getVar: function(key) {
      return this.vars[key];
    },
    
    eventEmitter: function() {
      return _.extend({}, Backbone.Events);
    },
    
    mobile: {
      isIphone: function() { return isDevice('iphone'); },
      isIpad: function() { return isDevice('ipad'); },
      isAndroid: function() { return isDevice('android'); }
    },
    
    initialize: function() {
      this.emit(':ready'); // pre init
      this.emit('ready');  // init
      this.emit('ready:'); // post init
    }
    
  }
  
  function isDevice(device) {
    return Core.vars.html.hasClass(device);
  }
  
})(jQuery, window);