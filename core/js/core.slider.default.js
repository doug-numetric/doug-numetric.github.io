/* CORE SLIDER | DEFAULT */

// (c) 2012 Ernesto Mendez
// All Rights Reserved.

Core.classes.DefaultSlider = (function($, Core) {

function DefaultSlider(theSlider) {
  
  ///////////////////////////////////////////////////////
  // CLOSURE VARIABLES
  ///////////////////////////////////////////////////////

  // Slider Configuration
  var config = {
    initialTransitionSpeed: 850,      // Speed to use when animating the slides on startup
    adjustTransitionSpeed: 300,       // Speed to use when changing slides due to resize events
    transitionSpeed: 630,             // Speed to use for transitions
    easing: 'easeInOutQuart',         // Easing equation to use
    links: true,                      // If set to true, will enable links
    autoplay: true,                   // Sets the slider autoplay
    pauseOnHover: true,               // Stops the slider autoplay on hover
    pauseTimeout: 3000                // Amount of miliseconds to wait before changing slides
  }

  var firstTime = true,
      busy = false,
      currentSlide = 0,
      slidesArr = [];

  // Closure variables
  var slider, $window, data, workarea, sliderMeta, controls, navLeft, navRight, sampleImage, isEven, 
      sliderWidth, sliderHeight, currentOffset, totalSlides, leftOffset, centerSlide, leftArr;

  // Determines the current instance
  var instance = this;

  // Autoplay variables
  var autoplayInterval;

  // Local events
  var events = Core.eventEmitter();
  
  // Override slider configuration
  _.extend(config, Core.util.getConfig(theSlider));

  // Instance events
  this.events = events;

  // Outer vars
  slider = theSlider;
  $window = Core.vars.window;
  
  ///////////////////////////////////////////////////////
  // METHODS
  ///////////////////////////////////////////////////////

  /** Moves to the previous slide */

  instance.prev = function() {
    if (busy) return;
    this.setSlide(currentSlide - 1);
  }

  /** Moves to the next slide */

  instance.next = function() {
    if (busy) return;
    this.setSlide(currentSlide + 1);
  }

  /** Starts the slider autoplay */

  instance.start = function() {
    Core.debug('Autoplay enabled');
    var self = this;
    autoplayInterval = setInterval(function() {
      self.next();
    }, config.pauseTimeout);
  }

  /** Stops the slider autoplay */

  instance.stop = function() {
    Core.debug('Autoplay disabled');
    clearInterval(autoplayInterval);
  }

  /** Changes to a specific slide */

  instance.setSlide = function(index, elem) {
    index = (index % data.length);
    if (!elem) elem = controls.children().eq(index);
    if (busy || elem.hasClass('active')) return;
    Core.debug('Setting slide %d', index);
    currentSlide = index;
    elem.addClass('active').siblings('.active').removeClass('active');
    this.events.emit('slider:change', elem.data('index'));
    this.arrange(index, config.transitionSpeed);
  }

  instance.arrange = function(offset, speed) {

    lock();

    // Use a smoother animation when the slider loads
    if (firstTime) { 
      speed = config.initialTransitionSpeed;
    }
    
    // Get center element:  Ce = (Ts - 1)/2
    var Ts = totalSlides + (isEven ? 1 : 0);
    var Ce = (Ts - 1)/2;

    centerSlide = Ce;

    // Get total width:   Tw = Ts * 940
    var Tw = Ts * 940;

    // Get offset to center:  Of = -1*(Tw - Ww)/2
    var Of = ($.browser.safari) 
      ? -1*Math.ceil((Tw - $window.width())/2.0)  // Round up pixel values on Webkit
      : -1*(Tw - $window.width())/2.0;            // Other browsers work just fine

    currentOffset = Of;

    // Adjust offset position
    if (typeof offset == 'number') Of -= 940*offset;

    // Account for a pair number of slides
    if ( (data.length % 2) === 0 ) Of += (940/2.0);

    // Animate offset
    workarea.stop().animate({
      marginLeft: Of
    }, speed || config.adjustTransitionSpeed, config.easing, unlock);

  }

  /** Initializes the user interface */

  function initUserInterface() {
    var self = this,
        directionNav = navLeft.add(navRight);

    // Add click events to nav
    navLeft.click(function(e) { self.prev(e, this); });
    navRight.click(function(e) { self.next(e, this); });

    // Adjust nav vertical position
    var navHeight = navLeft.height();
    var origHeight = slider.data('height');

    // Listen for changes in the (center) slider's width
    this.events.on('slider:resize', function(w) {

      // Update slider width on resize events
      sliderWidth = w;

      // Position nav buttons
      var h = slider.data('height');
      var pos = Math.ceil((h - navHeight - sliderMeta.height())/2.0);
      directionNav.css({top: pos});
      if (firstTime) directionNav.fadeIn(config.initialTransitionSpeed);
    });

    Core.ui.resizeEvent.call(this.events, sliderMeta, 'slider:resize', true);

    // Show slider controls
    var html = [];
    for (var i=0, len=data.length; i < len; i++) {
      html.push(Core.util.format('<li%s data-index="%d"></li>', (i===0 ? ' class="active"' : ''), i));
    }

    // Add controls
    controls.html(html.join('\n')).fadeIn(config.initialTransitionSpeed);

    // Controls click event
    controls.children('li').click(function() {
      if (busy) return;
      var elem = $.getWrappedObject(this);
      if (elem.hasClass('active')) return;
      self.setSlide(elem.data('index'), elem);
    });

    // Listen for keyup events on hover
    var body = Core.vars.body;
    slider.hover(function(e) {
      instance = self;
      switch (e.type) {
        case 'mouseenter':
          body.keyup(keyupHandler);
          break;
        case 'mouseleave':
          body.unbind('keyup', keyupHandler);
          break;
      }
    });

    var centerBox = slider.find('.center-box');

    // Listen for swipe events
    centerBox.touchwipe({
      wipeLeft: function() { self.next(); },
      wipeRight: function() { self.prev(); },
      min_move_x: 50,
      preventDefaultEvents: false
    });

    // Setup pause on hover
    if (config.autoplay && config.pauseOnHover) {
      centerBox.hover(function(e) {
        switch (e.type) {
          case 'mouseenter':
            self.stop();
            break;
          case 'mouseleave':
            self.start();
            break;
        }
      });
    }

  }

  // Listens for left/right arrow keys for slider navigation (on hover)
  function keyupHandler(e) {
    if (e.keyCode == 37) instance.prev();
    else if (e.keyCode == 39) instance.next();
  }

  // User interface lock/unlock

  function lock() { busy = true; }
  function unlock() { 
    if (firstTime) firstTime = false;
    busy = false; 
  }
  
  ///////////////////////////////////////////////////////
  // INITIALIZATION
  ///////////////////////////////////////////////////////
  
  // Inner vars
  data = this.data = [];
  sliderHeight = slider.data('height');
  workarea = slider.find('.workarea');
  sliderMeta = slider.find('.slider-meta');
  controls = sliderMeta.find('ul.controls');
  navLeft = slider.find('span.direction-nav.left');
  navRight = slider.find('span.direction-nav.right');
  
  // Extract data from HTML elements
  workarea.children('img').each(function(i, elem) {
    var obj = {},
        self = $.getWrappedObject(elem);
    slidesArr.push(i);
    if (i===0) sampleImage = self;
    obj.permalink = self.data('permalink');
    obj.title = self.data('title');
    obj.description = self.data('description');
    obj.image = self.attr('src');
    instance.data.push(obj);
  });

  // Left-side array. Used to calculate negative indexes
  leftArr = slidesArr.concat();

  // Slides array, contains the mirrored keys
  slidesArr = slidesArr.concat().slice(1).concat(slidesArr);

  // Add images in reverse order
  var tpl = '<img alt="" width="940" height="%d" data-index="%d" data-permalink="%s" data-title="%s" data-description="%s" src="%s" />';
  for (var image,item,images=[], len=data.length,i=len-1; i > 0; i--) {
    item = data[i];
    image = Core.util.format(tpl, sliderHeight, i, item.permalink, item.title, item.description, item.image);
    images.unshift(image);
  }

  // Update left offset
  leftOffset = 940*images.length;

  // Preprend images and immediately move with offset (makes sure it's unnoticeable)
  workarea.prepend(images.join('\n')).css('marginLeft', -1*leftOffset);

  // Add images offset (3 x 940), greater than 2560 pixels wide

  for (i=0; i < data.length; i++) {
    image = Core.util.format('<img alt="" width="940" height="%d" src="%s" />', sliderHeight, data[i].image);
    workarea.prepend(image).append(image);
    slidesArr.push(null);
    slidesArr.unshift(null);
  }

  // Update left offset
  leftOffset += i*940;

  // Move with offset
  workarea.css('marginLeft', -1*leftOffset);

  // Total number of slides
  totalSlides = slidesArr.length;

  // Determines if there's an even # of slides (boolean)
  isEven = ((this.data.length % 2) === 0);

  // Initialize user interface & events
  initUserInterface.call(this);

  // Arrange slides
  $window.resize(function(e) {
    instance.arrange(currentSlide);
  }).trigger('resize');

  // Change content on slide change
  var info = sliderMeta.find('.info'),
      title = info.find('h3 a'),
      desc = info.find('small a');

  this.events.on('slider:change', function(index) {
    var item = data[index];
    title.text(item.title)
    if (config.links) title.attr('href', item.permalink);
    if (item.description) {
      info.removeClass('no-desc');
      desc.text(item.description).attr('href', item.permalink);
    } else {
      info.addClass('no-desc');
      desc.text('');
    }
  });

  // Setup autoplay
  if (config.autoplay) this.start();
  
}

// Return to outer closure
return DefaultSlider;
    
})(jQuery, window.Core);

