
/* CORE MAPS */

// (c) 2012 Ernesto Mendez
// All Rights Reserved.

(function($, Core) {

// https://developers.google.com/maps/documentation/javascript/examples/
// view-source:https://google-developers.appspot.com/maps/documentation/javascript/examples/infowindow-simple
// https://developers.google.com/maps/documentation/javascript/reference#MapOptions
// https://developers.google.com/maps/documentation/javascript/reference#MapTypeId

Core.on('ready', function() {
  var counter = 1;
  $('.google-map').each(function(i, elem) {
    var self = $.getWrappedObject(elem);
    self.addClass('google-map-' + counter);
    self.data('index', counter);
    var json = self.find('span.map-data').html().trim();
    json = json.slice(0, json.lastIndexOf('}') + 1);
    var options = JSON.parse(json);
    var content = self.find('.infobox-content');
    if (content.length > 0) options.contentString = content.html();
    counter++;
    Core.maps.create(self, options);
  });
});

var body;

Core.maps = {
  
  create: function(target, opts) {
    
    var isIphone = Core.mobile.isIphone();
    
    body = body || Core.vars.body || $('body');
    
    // Extend options
    opts = _.extend({
      latLong: '48.858391,2.294083',
      mapType: 'ROADMAP',
      zoom: 16,
      contentTitle: '',
      contentTitleLink: '',
      contentTooltip: '',
      contentString: '',
      contentWidth: 250,
      allowFullScreen: true,
      extraOptions: { }
    }, opts || {});
    
    var myLatlng = getLatLong(opts.latLong);
    
    var myOptions = _.extend({
      zoom: opts.zoom,
      scrollwheel: false,
      center: myLatlng,
      mapTypeId: google.maps.MapTypeId[opts.mapType]
    }, opts.extraOptions);
    
    var map = new google.maps.Map(target.get(0), myOptions);

    // Show marker only if title & content are set

    if (opts.contentTitle && opts.contentString) {
      
      var content = (opts.contentTitleLink) 
      ? Core.util.format('<h3><a class="title" href="%s">%s</a></h3>\n%s', opts.contentTitleLink, opts.contentTitle, opts.contentString)
      : Core.util.format('<h3>%s</h3>\n%s', opts.contentTitle, opts.contentString);
      
      var infowindow = new google.maps.InfoWindow({
          maxWidth: opts.contentWidth,
          content: content
      });

      var marker = new google.maps.Marker({
        title: opts.contentTooltip || opts.contentTitle,
        position: myLatlng,
        map: map
      });

      google.maps.event.addListener(marker, 'click', function() {
        infowindow.open(map,marker);
      });

    }
    
    // Recenter map on window resize
    
    var emitter = Core.eventEmitter();

    Core.ui.resizeEvent.call(emitter, target, 'resize');

    emitter.on('resize', function(w) {
      google.maps.event.trigger(map, 'resize');
      map.setCenter(myLatlng);
    });
    
    

    // Fullscreen map
    
    if (opts.allowFullScreen && ! isIphone ) {
      
      var btn = $('<span class="fw-button">Full Screen</span>');
      
      btn.data('parent', target);
      
      var coords = {top: 60, right: 5};

      btn.css(coords).css({
        display: 'block',
        padding: '0 8px',
        position: 'absolute',
        height: '20px',
        lineHeight: '20px',
        background: 'white',
        border: 'solid 1px #707a84',
        boxShadow: '0 2px 4px rgba(0,0,0,0.39)',
        zIndex: 999999999,
        fontFamily: 'Arial, sans-serif',
        textRendering: 'none',
        fontSize: '12px',
        userSelect: 'none',
        webkitUserSelect: 'none',
        mozUserSelect: 'none'
      });
      
      // Relocate fullscreen button on streetview

      var sv = map.getStreetView();
      
      google.maps.event.addListener(sv, 'visible_changed', function() {
        if (sv.getVisible()) btn.css({top: 2, right: 34});
        else btn.css(coords);
      });
      
      if (Core.vars.modernBrowser) {
        btn.hover(function(e) {
          var self = $.getWrappedObject(this);
          switch (e.type) {
            case 'mouseenter':
              self.css({cursor: 'pointer', background: Core.util.vendorPrefix('linear-gradient(top, white, #e6e6e6)'), color: 'black'});
              break;
            case 'mouseleave':
              self.css({cursor: 'default', background: 'white', color: '#323232'});
              break;
          }
        });
      } else {
        btn.hover(function(e) {
          var self = $.getWrappedObject(this);
          switch (e.type) {
            case 'mouseenter': self.css({cursor: 'pointer'}); break;
            case 'mouseleave': self.css({cursor: 'default'}); break;
          }
        });
      }
      
      btn.click(function(e) {
        var self = $.getWrappedObject(this);
        var parent = self.data('parent');
        var index = parent.data('index');
        if (target.hasClass('full-screen')) {
          // Minimize
          self.html('Full Screen');
          target.removeClass('full-screen');
          body.unbind('keyup', keyupCallback);
          
          // Show others
          $('section.google-map.full-width').not('.google-map' + index).show();
          
        } else {
          // Maximize
          self.html('Normal');
          target.addClass('full-screen');
          target.css('width: 100% !important;')
          body.keyup(keyupCallback);
          
          // Hide others
          $('section.google-map.full-width').not('.google-map-' + index).hide();
          
        }
        emitter.emit('resize');
      });
      
      var keyupCallback = function(e) {
        if (e.keyCode === 27) { // Escape
          btn.click();
        }
      }
      
      target.append(btn);

    }
    
    target.data('map', map);
    
    return target;
    
  }
  
}

function getLatLong(str) {
  if (str) {
    str = str.split(',');
    return new google.maps.LatLng(parseFloat(str[0]), parseFloat(str[1]));
  } else {
    return null;
  }
}

})(jQuery, window.Core);