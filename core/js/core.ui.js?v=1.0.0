
/* CORE UI */

// (c) 2012 Ernesto Mendez
// All Rights Reserved.

(function($, Core) {

Core.once(':ready', function() {
  setCoreVars();
  setMobileBehaviors();
  generateUIComponents();
  initializeSliders();
});

Core.once('ready', function() {
  initializeUIComponents();
});


Core.ui = {
  
  resizeEvent: function(context, evt, onStartup) {
    var w, cw = context.width(),
        emitter = (this.trigger === Backbone.Events.trigger) ? this : Core;
    Core.vars.window.resize(function() {
      w = context.width();
      if (cw !== w) { cw = w; emitter.emit(evt, cw); }
    });
    if (onStartup) emitter.emit(evt, cw, context);
  },
  
  selectNav: function(nav, attrs) {
    
    var android = /android/i.test(window.navigator.userAgent + '');
    
    // Add Mobile navigation
    var html, 
        select = $('<select></select>'),
        navItems = nav.find('> li'),
        menuItems = [];

    if (Core.vars.modernBrowser && !android) {
      html = nav.html()
      .replace(/(alt|title|class|id)(\s+)?\=(\s+)?(\'|\")(.*?)(\'|\")/g, '')
      .replace(/href/g, 'value')
      .replace(/<(\/)?ul>/g,'<$1optgroup>')
      .replace(/<li(\s)?>(\s+)?<a|<a/g, '<option')
      .replace(/(<\/a\>)?<\/li>/g, '</option>')
      .replace(/<\/a>/g,'')
      .replace(/[ ]+/g,' ');
    } else {
      // Don't add support for <optgroup> on old browsers
      var link, links = nav.find('a');
      links.each(function(i) {
        link = $(links[i]);
        html += Core.util.format('<option value="%s">%s</option>', link.attr('href'), link.html());
      });
    }

    select.html(html).change(function() { window.location = $(this).attr('value'); });

    var active = nav.find('> li.current-menu-item > a, > li.current_page_item > a').attr('href');

    var optgroups = select.find('optgroup');

    nav.find('ul').each(function(i, elem) {
      var anchor = $(elem).prev();
      optgroups.eq(i).attr('label', '    ↳ ' + anchor.text() + ' ⌄');
    });

    select.find('option').each(function() {
      var self = $(this);
      if ( self.attr('value') == active ) {
        self.attr('selected', 'true');
        return false;
      }
    });

    if (attrs) select.attr(attrs);

    return select;
  }
}


/* Private Functions */

function initializeSliders() {
  initUniqueSliders();
  initRefineSliders();
  initNivoSliders();
}

function initRefineSliders() {
  
  var sliders = $('.refineslide');
  
  if (sliders.length > 0) {
    
    // Set backface visibility on webkit based browsers
    // This is to avoid text rendering issues, since chrome switches to
    // antialiased font smoothing when rendering hardware accelerated graphics.
    Core.getVar('body').css({
      '-webkit-backface-visibility': 'hidden'
    });
    
    var script = document.root + '/core/js/jquery.refineslide.min.js';
    
    head.js(script + '?v=' + document.vsn).ready(function() {
      
      sliders.each(function(i, elem) {

        var self = $.getWrappedObject(elem);
        
        var previousMeta, currentIndex = 0;
        
        var options = Core.util.getConfig(self.find('ul.rs-slider'), 'options');
        
        options.fallback3d = 'sliceV';
        options.keyNav = false;
          
        options.onInit = function () {

          var s = this.slider;
          var controls = [];
          
          for (var i=0; i < s.totalSlides; i++) {
            controls.push('<li data-index="'+ i +'"></li>');
          }
          
          controls = $('<ul class="controls hfloat">' + controls.join('\n') + '</ul><!-- .controls -->');
          
          for (i=0; i < s.totalSlides; i++) {
            var clone = controls.clone();
            clone.find('> li:eq('+ i +')').addClass('active');
            slider.find('.slider-meta:eq('+ i +')').append(clone);
          }
          
          slider.find('.slider-meta ul.controls li').click(function() {
            var self = $.getWrappedObject(this);
            var index = self.data('index');
            var forward = (index > currentIndex);
            s.transition(index, forward);
            currentIndex = index;
          });
          
          // Listen for keyboard events
          var body = Core.getVar('body');
          
          var keyUpCallback = function(e) {
            if (e.keyCode == 37) s.prev()
            else if (e.keyCode == 39) s.next();
          }

          self.hover(function(e) {
            switch (e.type) {
              case 'mouseenter':
                body.bind('keyup', keyUpCallback);
                break;
              case 'mouseleave':
                body.unbind('keyup', keyUpCallback);
                break;
            }
          });
          
          // Listen for swipe events
          self.touchwipe({
            wipeLeft: function() { s.next(); },
            wipeRight: function() { s.prev(); },
            min_move_x: 50,
            preventDefaultEvents: false
          });
          
        }
          
        options.onChange = function () {
          
          var s = this.slider;
          var cs = s.$currentSlide;
          var meta = cs.__meta || (cs.__meta = cs.find('.slider-meta'));
          currentIndex = parseInt(cs.attr('class').split('-')[2]);
          (previousMeta = meta).fadeOut(s.settings.transitionDuration);
          
        }
        
        options.afterChange = function () {
          previousMeta.show();
        }
          
        // Force defaults
        options.controls = 'arrows';
        options.keyNav = false;
        
        // Get slider
        var slider = self.find('> ul.rs-slider');

        // Add refine slide
        slider.refineSlide(options);

      });
      
    });
  }
  
}

function getNivoConfig(options) {
  
  // Documentation on NivoSlider can be found on:
  // http://nivo.dev7studios.com/support/jquery-plugin-usage/
  
  return _.extend({
    effect: 'fade', // Specify sets like: 'fold,fade,sliceDown'
    slices: 8, // For slice animations
    boxCols: 8, // For box animations
    boxRows: 4, // For box animations
    animSpeed: 500, // Slide transition speed
    pauseTime: 3000, // How long each slide will show
    startSlide: 0, // Set starting Slide (0 index)
    directionNav: true, // Next & Prev navigation
    directionNavHide: true, // Only show on hover
    controlNav: true, // 1,2,3... navigation
    controlNavThumbs: false, // Use thumbnails for Control Nav
    pauseOnHover: true, // Stop animation while hovering
    manualAdvance: true, // Force manual transitions
  }, options || {});
}

function initNivoSliders() {
  var sliders = Core.getVar('body').find('.slider .images');
  var load = []
  var addSliders = [];
  
  // Only add slider for 
  sliders.each(function(i, elem) {
    var self = $.getWrappedObject(elem);
    if (self.find('img').length > 1) load.push(i);
  });
  
  if (load.length > 0) {
    var nivo = document.root + 'core/js/jquery.nivo-slider.min.js';
    head.js(nivo + '?v=' + document.vsn).ready(function() {
      
      sliders.each(function(i, elem) {
        if (load.indexOf(i) >= 0) {
          
          var images = $.getWrappedObject(elem);
          var slides = images.find('> img.slide');
          var meta = images.siblings('.slider-meta');
          var metaControls = meta.find('ul.controls');
          var config = Core.util.getConfig(images, 'nivo-options');
          var nivoConfig = getNivoConfig(config);
          
          nivoConfig.beforeChange = function() {
            
            // Get current index
            var i = (nivoData.currentSlide + 1);
            
            // Handle boundaries
            if (i < 0) i = len-1;
            else if (i == len) i = 0;
            
            // Set current metadata
            var o = data[i]; // data is set in the next few lines
            
            // Add info class
            (o.description) ? info.removeClass('no-desc') : info.addClass('no-desc');
            
            // Update objects
            title.text(o.title);
            desc.text(o.description);
            title.attr('href', o.url);
            desc.attr('href', o.url);
            
            // Set active item.
            controlItems.eq(i).addClass('active').siblings('.active').removeClass('active'); // controlItems are set in the next few lines
            
          }
          
          images.nivoSlider(nivoConfig);
          
          // Add links to images.
          // Using images wrapped in links in nivoSlider doesn't work as expected.
          images.find('.nivo-slice, .nivo-main-image').live('hover', function(e) {
            var o = data[nivoData.currentSlide];
            var self = $.getWrappedObject(this);
            if ( self.data('done') || !o.url ) return;
            else if (self.is('.nivo-slice')) {
              self.find('> img').wrap('<a href="'+ o.url +'"></a>');
            } else {
              self.wrap('<a href="'+ o.url +'"></a>');
            }
            self.data('done', true);
          });
          
          var body = Core.getVar('body');
          var next = images.find('a.nivo-nextNav');
          var prev = images.find('a.nivo-prevNav');
          
          if (next.length > 0 && prev.length > 0) {
            
            // Listen for swipe events
            images.touchwipe({
              wipeLeft: function() { next.trigger('click'); },
              wipeRight: function() { prev.trigger('click'); },
              min_move_x: 50,
              preventDefaultEvents: false
            });
            
            // Listen for keyboard events
            var keyUpCallback = function(e) {
              if (e.keyCode == 37) prev.trigger('click');
              else if (e.keyCode == 39) next.trigger('click');
            }

            images.parent().hover(function(e) {
              switch (e.type) {
                case 'mouseenter':
                  body.bind('keyup', keyUpCallback);
                  break;
                case 'mouseleave':
                  body.unbind('keyup', keyUpCallback);
                  break;
              }
            });
            
          }
          
          var controls = images.siblings('.nivo-controlNav').find('a.nivo-control');
          
          var data = [];

          images.find('img').each(function(i, elem) {
            var img = $.getWrappedObject(elem);
            data.push({
              url: img.data('permalink'),
              title: img.data('title'),
              description: img.data('description'),
            });
          });
          
          for (var active,len=controls.length,i=0; i < len; i++) {
            active = (i===0) ? ' class="active"' : '';
            metaControls.append('<li'+ active +' data-index="'+ i +'"></li>');
          }
          
          var controlItems = metaControls.find('> li');
          
          var nivoData = images.data('nivo:vars');
          
          var info = meta.find('> .info');
          var title = info.find('> h3 > a');
          var desc = info.find('> small > a');
          
          metaControls.find('li').click(function() {
            if (!nivoData.running) {
              // Only forward click. Leave metadata changing to beforeChange method
              controls.eq($.getWrappedObject(this).data('index')).trigger('click');
            }
          });
          
          meta.fadeIn(1500);
        }
      });
      
    });
  }
}

function initUniqueSliders() {
  var dependencies = [], load = [];
  
  // Get dependencies
  var uniqueSliders = $('.unique-slider').each(function(i, elem) {
    var slider = (elem.__self = $(elem));
    var manager = slider.data('slider-manager');
    if (dependencies.indexOf(manager) === -1) {
      dependencies.push(manager);
      load.push( (document.root || '') + Core.util.format('core/js/core.slider.%s.js?v=%s', manager, document.vsn) );
    }
  });
  
  if (load.length === 0) return;

  // Load dependencies
  head.js(load).ready(function() {
    uniqueSliders.each(function(i, elem) {
      var slider = elem.__self; // Previously set
      var manager = slider.data('slider-manager');
      var klass = Core.util.camelize(manager + '-slider');
      var Ctor = Core.classes[klass];
      new Ctor(slider);
    });
  });
}

function setCoreVars() {
  var header = $('#header');
  Core.setVar('html', $('html'));
  Core.setVar('body', $('body'));
  Core.setVar('topbar', $('#topbar'));
  Core.setVar('header', header);
  Core.setVar('footer', $('footer[role=contentinfo]'));
  Core.setVar('social', header.find('ul.social-icons'));
  Core.setVar('navigation', header.find('ul.navigation'));
  Core.setVar('oldBrowser', Core.vars.html.hasClass('ie8'));
  Core.setVar('modernBrowser', ! Core.vars.oldBrowser);
}

function initializeUIComponents() {
  dropdownMenus();
  inputPlaceholders();
  searchForm();
  latestPostsScroller();
  visualEffects();
  scrollTop();
  initializeToggles();
  initializeIBoxes();
  initializeTabs();
}

function setMobileBehaviors() {
  var body = Core.getVar('body');
  body.find('section.block > .mobile-behavior').each(function(i, elem) {
    var self = $.getWrappedObject(this);

    if (self.find('article.one-third.column').length > 0) {
      self.removeClass('.mobile-behavior').removeAttr('data-mobile-behavior');
      return;
    }
    
    var behavior = self.data('mobile-behavior');
    switch (behavior) {
      case 'mobile-dual':
        self.parents('section.block.container').attr('data-mobile-dual', "true");
        break;
      case 'mobile-landscape-dual':
        self.parents('section.block.container').addClass('mobile-landscape-dual');
        break;
    } 
  });
}

function generateUIComponents() {
  // Generate mobile navigation
  var mobileNav = Core.ui.selectNav(Core.vars.navigation, {id: 'mobile-nav'});
  Core.vars.header.find('#mobile-nav').replaceWith(mobileNav);

  // Create search form
  var searchForm = '\
<form id="search-box" class="clearfix" action="%s" method="get">\n\
<p class="clearfix hfloat">\n\
<input type="text" name="s" placeholder="%s" value="" autocomplete="off" />\n\
<input class="hoverable" type="submit" value="" />\n\
<span class="close hoverable"></span>\n\
</p>\n\
</form><!-- search-form -->';

  $('#header').append(Core.util.format(searchForm, document.root, document.i18n.enterSearchCriteria));

  // Insert full-width separators
  var hr = '<hr class="section-sep" />';
  $('section.block + section.block').before(hr);
  $('section.sep-after').after(hr);
  
  // Prepare mobile-dual layout
  $('.container[data-mobile-dual=true]').each(function(idx, elem) {
    // self.removeClass('mobile-behavior').removeAttr('data-mobile-behavior');
    var self = $.getWrappedObject(elem).removeAttr('data-mobile-dual');
    var container = self.find('> div[data-mobile-behavior=mobile-dual]');
    container.addClass('mobile-dual');
    container.wrapEach(2, '.columns, .column', '<div class="mobile-dual-container"></div>');
    container.removeAttr('data-mobile-behavior');
  });
  
  // Prepare mobile-landscape-split layout
  $('.container.mobile-landscape-dual').each(function(idx, elem) {
    var self = $.getWrappedObject(elem);
    var container = self.find('> div[data-mobile-behavior=mobile-landscape-dual]');
    container.wrapEach(2, '.columns, .column', '<div class="mobile-dual-container"></div>');
  });
  
}

function dropdownMenus() {
  
  var nav = Core.vars.header.find('ul.navigation');
  var isIpad = Core.vars.html.hasClass('ipad');

  // Add "submenu" class to menu items
  nav.find('ul').each(function(i, elem) {
    var ul = $.getWrappedObject(elem);
    ul.before().parent().addClass('submenu');
  });
  
  // Dropdown expand animation
  
  var timeout;
  
  nav.find('> li > ul').addClass('first-ul');
  
  nav.find('li').hover(function(e) {
    var self = $.getWrappedObject(this);
    var ul = self.find('ul:first');
    // Note: using .stop() before .slideDown has some layout issues
    self.__show || (self.__show = function() { ul.fadeIn(300, 'easeOutQuad'); });
    switch (e.type) {
      case 'mouseenter':
        if (ul.hasClass('first-ul')) timeout = setTimeout(self.__show, isIpad ? 0 : 150);
        else self.__show();
        break;
      case 'mouseleave':
        clearTimeout(timeout);
        ul.hide();
        break;
    }
  });
}

function inputPlaceholders() {
  $('form input.placeholder').each(function(i, elem) {
    var self = $.getWrappedObject(elem);
    self.data('text', self.val());
  }).focus(function() {
    var self = $.getWrappedObject(this);
    if (self.val().trim() === self.data('text')) self.val('');
  }).blur(function() {
    var self = $.getWrappedObject(this);
    if (self.val().trim().length === 0) self.val(self.data('text'));
  });
}

function searchForm() {
  var body = Core.vars.body,
      header = Core.vars.header,
      navigation = header.find('ul.navigation'),
      socialIcons = header.find('ul.social-icons'),
      searchBox = header.find('#search-box'),
      searchInputs = searchBox.find('input'),
      textInput = searchBox.find('input:text'),
      spanClose = searchBox.find('span.close'),
      logo = header.find('div.logo'),
      icon = navigation.find('li.search');

  logo.addClass('hover');
  
  var t = Core.vars.oldBrowser ? 0 : 410,
      busy = false,
      logoCenter = header.hasClass('logo-center'),
      logoLeft = header.hasClass('logo-left') || logoCenter,
      easing = 'easeInOutQuad';
  
  var keyupCallback = function(e) {
    if (e.keyCode === 27) { // Escape
      spanClose.click();
    }
  }
  
  var showClose = logoLeft ? {left: 0} : {right: 0};
  var hideClose = logoLeft ? {left: 30} : {right: 30};
  
  var searchBoxTop, socialIconsTop;
  
  var searchBoxShowCallback;
  
  // Show animation
  icon.click(function(e) {
    if (busy) { return; } else { busy = true; }
    if (logoCenter) logo.removeClass('hover');
    searchBoxTop = searchBox.css('top');
    socialIconsTop = socialIcons.css('top');
    
    if (!searchBoxShowCallback) searchBoxShowCallback = function() {
      searchBox.stop();
      if (logoCenter) {
        var r = (header.width() - navigation.width())*0.5;
        searchBox.css({right: r});
      }
      
      searchBox.animate({top: '50%'}, t*0.3, easing, function() {
        searchInputs.stop().animate(showClose, t*0.3, easing, function() {
          busy = false;
          body.keyup(keyupCallback);
          // textInput.focus();
        });
      });
    }
    
    if (logoCenter) {
      logo.stop().animate({opacity: 0.2}, t, easing);
      socialIcons.stop().animate({top: '-50px'}, t*0.8, easing);
      navigation.stop().animate({top: -1*header.height()}, t*0.6, easing, searchBoxShowCallback);
    } else {
      socialIcons.stop().animate({top: '-100%'}, t*0.8, easing);
      navigation.stop().animate({bottom: '100%'}, t*0.6, easing, searchBoxShowCallback);
    }
  });
  
  var unlock = function() { busy = false; }
  
  // Hide animation
  spanClose.click(function() {
    if (busy) { return; } else { busy = true; }
    body.unbind('keyup', keyupCallback);
    searchInputs.stop().animate(hideClose, t*0.3, easing, function() {
      searchBox.stop().animate({top: searchBoxTop}, t*0.5, easing, function() {
        socialIcons.stop().animate({top: socialIconsTop}, t*0.8, easing);
        if (logoCenter) {
          navigation.stop().animate({top: 0}, t*0.6, easing, unlock); 
          logo.stop().animate({opacity: 1}, t*0.6, easing);
          logo.addClass('hover');
        }
        else navigation.stop().animate({bottom: 0}, t*0.6, easing, unlock);
      });
    });
  });
}

function latestPostsScroller() {
  $('.blocked-latest-posts').each(function(i, elem) {
    var busy = false,
        emitter = Core.eventEmitter(),
        self = $.getWrappedObject(elem),
        container = self,
        scroller = self.find('> .scroller'),
        items = scroller.children();
    
    items.each(function(i, elem) {
      $(elem).attr('data-index', i);
    });
    
    // Do nothing if there are no entries
    if (items.length === 0) return;
    
    container.append('<div class="controls clearfix">\n\
    <span class="next hoverable"></span>\n\
    <span class="prev hoverable"></span>\n\
</div><!-- .controls -->');

    var frame = scroller.find('a.frame:first'),
        controls = self.find('.controls'),
        next = controls.find('span.next'),
        prev = controls.find('span.prev');

    controls.addClass(self.data('controls'));

    var cycle = Core.util.createCycle(items);
    
    emitter.on('layout:resize', function(w) {
      cycle.reset();
      scroller.css('marginLeft', 0);
    });
    
    Core.ui.resizeEvent.call(emitter, container, 'layout:resize', true);
    
    var incr, index, m, unlock = function() { busy = false; }
    
    next.add(prev).click(function() {
      if (busy) { return; } else { busy = true; }
      incr = $.getWrappedObject(this).hasClass('next') ? 1 : -1;
      index = cycle.get(incr).data('index');
      m = -1*index*(frame.width()+20);
      scroller.stop().animate({marginLeft: m}, 400, 'easeInOutQuart', unlock);
    });
    
    container.touchwipe({
      wipeLeft: function() { next.click(); },
      wipeRight: function() { prev.click(); },
      min_move_x: 50,
      preventDefaultEvents: false
    });
    
    var body = Core.getVar('body');
    
    // Add keyup events
    
    var keyUp = function(e) {
      if (e.keyCode == 37) prev.trigger('click');
      else if (e.keyCode == 39) next.trigger('click');
    }
    
    container.hover(function(e) {
      switch (e.type) {
        case 'mouseenter':
          body.keyup(keyUp);
          break;
        case 'mouseleave':
          body.unbind('keyup', keyUp);
          break;
      }
    });
    
  });
}

function visualEffects() {

  var oldBrowser = Core.vars.oldBrowser,
      brandColor = Core.colors.brandColor;
      
  var t = 240;

  // Fade in image frame overlay
  $('article a.frame, li a.frame').live('hover', function(e) {
    var self = $.getWrappedObject(this);
    var overlay = self.__overlay || (self.__overlay = self.append('<span class="overlay"></span>').find('> span.overlay'));
    var format = self.__format || (self.__format = self.find('span.format'));
    var borderColor = self.__borderColor || (self.__borderColor = self.css('border-bottom-color'));
    switch (e.type) {
      case 'mouseenter':
        format.stop().animate({bottom: 0, right: 0}, t, 'easeOutQuad');
        if (oldBrowser) {
          overlay.css('opacity', 1).show();
          self.css('borderBottomColor', brandColor);
        } else {
          overlay.stop().animate({opacity: 1}, 200);
          // if (link) link.trigger('mouseenter');
          self.stop().animate({borderBottomColor: Core.colors.brandColor}, 200);
        }
        break;
      case 'mouseleave':
        format.stop().animate({bottom: -26, right: -26}, t, 'easeInOutQuad');
        if (oldBrowser) {
          overlay.hide();
          self.css('borderBottomColor', borderColor);
        } else {
          overlay.stop().animate({opacity: 0}, 300);
          self.stop().animate({borderBottomColor: borderColor}, 300);
        }
        break;
    }
  });
  
  // Add hover enabled to latest posts widget
  $('.latest-posts-component').each(function(i, elem) {
    var self = $(this);
    if (self.parents('footer').length === 0) self.addClass('hover-enabled');
  });
  
}

function scrollTop() {
	var t = 600;
  var easing = 'easeInOutSine';
  var body = Core.vars.body;
  var html = ($.browser.opera || $.browser.msie) ? $('html') : $('html, body');
  
  Core.vars.footer.find('> .copyright a.back-to-top').click(function() {
    html.stop().animate({scrollTop: 0}, t, easing);
    return false;
  });
}

function initializeToggles() {
  // Accordion Boxes
  var t = 300;
  var easing = 'easeOutQuad';
  var busy = false;
  var unlock = function() { busy = false; }
  
  // Note: Accordions & Toggles share the same lock
  
  $('ul.accordion-boxes').each(function(i, elem) {
    var accordion = $.getWrappedObject(elem);
    var activate = (accordion.find('> li.unit.active').length === 0);
    
    accordion.find('> li.unit').each(function(i, elem) {
      var self = $.getWrappedObject(elem);
      if (i === 0 && activate) self.addClass('active');
      var content = self.find('> .content');
      self.data('content', content);
      if (!self.hasClass('active')) content.hide();
    });

    accordion.find('> li.unit > h3.title').click(function() {
      if (busy) return;
      var self = $.getWrappedObject(this);
      self.__unit = self.__unit || (self.__unit = self.parent());
      if (! self.__unit.hasClass('active')) {
        busy = true;
        accordion.find('> li.unit.active').removeClass('active').data('content').slideToggle(t, easing);
        self.__unit.addClass('active').data('content').slideToggle(t, easing, unlock);
      }
    });
  });
  
  // Toggle Boxes
  $('.toggle-box').each(function(i, elem) {
    var toggleBox = $.getWrappedObject(elem);
    var content = toggleBox.find('> .content');
    var title = toggleBox.find('> h3.title');
    title.data('content', content);
    if (! toggleBox.hasClass('active')) content.hide();
    title.click(function() {
      if (busy) return; else busy = true;
      if (toggleBox.hasClass('active')) toggleBox.removeClass('active');
      else toggleBox.addClass('active');
      content.slideToggle(t, easing, unlock);
    });
  });
}

function initializeIBoxes() {
  var t = 200;
  var $win = Core.vars.window;
  $('.ibox.collapse')
  .append('<span class="close">&times;</span>')
  .find('> span.close')
  .click(function() {
    var parent = this.__parent || (this.__parent = $(this).parent());
    parent.stop().animate({opacity: 0}, t, function() {
      parent.slideToggle(t, function() {
        parent.remove();
        $win.trigger('resize');
      });
    });
  });
}

function initializeTabs() {
  $('ul.tabs').each(function(i, elem) {

    var titlesHtml = '';
    var self = $.getWrappedObject(elem).addClass('enabled');
    var tabs = self.children('.tab');

    tabs.each(function(i, elem) {
      var tab = $.getWrappedObject(elem);
      var title = tab.find('> h3.title');
      var isActive = tab.hasClass('active');
      titlesHtml += Core.util.format('<span class="tab-title %s">%s</span>', (isActive ? ' active' : ''), title.html());
      title.remove();
    });
    
    self.prepend(Core.util.format('<li class="tabs-head clearfix">%s</li>', titlesHtml));
    
    self.find('> li.tabs-head span.tab-title').each(function(i, elem) {
      $.getWrappedObject(elem).data('index', i);
    }).click(function() {
      var self = $.getWrappedObject(this);
      if (self.hasClass('active')) return;
      self.addClass('active').siblings('span.tab-title').removeClass('active');
      var index = self.data('index');
      tabs.eq(index).addClass('active').siblings('.tab').removeClass('active');
    });

  });
}

})(jQuery, window.Core);