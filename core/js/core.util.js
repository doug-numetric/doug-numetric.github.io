
/* CORE UTIL */

// (c) 2012 Ernesto Mendez
// All Rights Reserved.

(function($, Core) {

var regex = {
  commaSplit: /(\s+)?,(\s+)?/g,
  dash: /(-)+/g,
  booleanVal: /^(true|false)$/i,
  numberVal: /^[0-9]+$/,
  nullVal: /^null$/i
}

var camelize;

Core.util = {
  
  format: _.string.sprintf,
  
  camelize: function(str) {
    return (camelize || (camelize = _.string.camelize)).call(null, '-' + str);
  },
  
  typecast: function(value) {
    if (typeof value == 'string') {
      value = value.trim();
      if (regex.booleanVal.test(value)) return value.toLowerCase() == 'true';
      else if (regex.numberVal.test(value)) return parseInt(value, 10);
      else if (regex.nullVal.test(value)) return null;
      else if (value == 'undefined') return undefined;
      else return value;
    } else {
      return value;
    }
  },
  
  getConfig: function(selector, dataAttr) {
    var out = {};
    var config = (typeof selector == 'string' ? $(selector) : selector).data(dataAttr || 'config');
    if (config) {
      config = config.split(regex.commaSplit);
      for (var item, i=0, len=config.length; i < len; i++) {
        item = config[i];
        if (item && (item = item.trim()) && (item = item.split(':'))) {
          out[item[0]] = Core.util.typecast(item[1]);
        }
      }
      return out;
    } else {
      return out;
    }
  },
  
  createCycle: function(context) {
    return new Cycle(context);
  },
  
  vendorPrefix: function(style) {
    var prefix = '';
    if ($.browser.webkit) prefix = '-webkit-';
    else if ($.browser.mozilla) prefix = '-moz-';
    else if ($.browser.msie) prefix = '-ms-';
    else if ($.browser.opera) prefix ='-o-';
    return prefix + style;
  }
  
}

function Cycle(context) {
  var current = 0,
      total = context.length;
  this.data = context;
  this.reset = function() { current = 0; }
  this.get = function(incr) {
    current = (current + incr) % total;
    if (current < 0) current = (total + current) % total;
    return (context.eq === $.fn.eq) ? context.eq(current) : context[current];
  }
}

})(jQuery, window.Core);
