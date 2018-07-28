
/* CORE CLIENT */

// (c) 2012 Ernesto Mendez
// All Rights Reserved.

(function($, Core) {

Core.once(':ready', function() {
  detectMobileBrowser();
  makeFooterSplit();
  prepareFormValidation();
  prepareMediaElements();
  setupLightboxFrames();
  Core.colors = Core.util.getConfig('body', 'branding');
});

Core.once('ready', function() {
  initClosureVars();
  initLightbox();
  initFlickrWidgets();
  initTwitterFeed();
  extraAdjustments();
});

var $win, $html, body, footer;

function initClosureVars() {
  body = Core.vars.body;
  footer = Core.vars.footer;
  $win = Core.vars.window;
  $html = Core.vars.html;
}

function detectMobileBrowser() {
  var html, klass, ua = window.navigator.userAgent + '';
  if (ua) {
    html = Core.vars.html;
    if (/iphone/i.test(ua)) klass = 'iphone';
    else if (/ipad/i.test(ua)) klass = 'ipad';
    else if (/android/i.test(ua)) klass = 'android';
    html.addClass(klass);
  }
}

function initLightbox() {
  
  if (!document.DISABLE_AUTO_LIGHTBOX) {
    
    // Set minimum dimension for lightbox
    var minVal = document.LIGHTBOX_MINIMUM_DIMENSION || 100;
    var imgRegex = /\.(jpg|jpeg|gif|png|tiff|bmp)$/i;

    // Add lightbox to post content
    $('article.post .content a > img').each(function(i, img) {
      var self = $(img),
          link = self.parent(),
          href = $.trim(link.attr('href'));
      if (imgRegex.test(href)) {
        var w = self.width() || self.attr('width') || 0;
        var h = self.height() || self.attr('height') || 0;
        if (w >= minVal || h >= minVal) self.parent().attr('rel', 'lightbox');
      }
    });

    // Add gallery to posts lightbox
    $('article.post').each(function(i, elem) {
      var self = $.getWrappedObject(elem);
      var rel = 'lightbox[gallery-' + Math.floor(Math.random()*1e4) + ']';
      self.find('> a.frame[rel^=lightbox]').attr('rel', rel);
      self.find('> .content a[rel^=lightbox]').each(function(j, link) {
        link = $.getWrappedObject(link);
        if (link.attr('rel') === 'lightbox') link.attr('rel', rel);
      });
    });

  }
  
  // Setup lightbox
  $('a[rel^=lightbox]').prettyPhoto({
    social_tools: null,
    theme: 'light_rounded',
    opacity: 0,
    slideshow: 4000,
    deeplinking: false,
    overlay_gallery: false
  });
}

var hqRegex = /_s\.jpg$/;

function initFlickrWidgets() {
  $('.flickr-gallery').each(function(i, elem) {
    var self = $(elem);
    var query = self.data('query');
    var timeout = self.data('cache-timeout');
    var md5 = calcMD5(query);
    var cached = locache.get(md5);
    
    if (cached) {
      self.replaceWith(cached);
    } else {
      $.getJSON(query, function(res) {
        // console.log(res);
        var html = [];
        for (var data,img,len=res.length,i=0; i < len; i++) {
          data = res[i];
          html.push('<li><a class="frame" href="'+ data.url +'"><img width="200" height="200" alt="" src="'+ data.image +'" /></a></li>');
        }
        html.unshift('<ul class="resp-gallery three-cols hover-effect clearfix">');
        html.push('</ul>');
        html = '<div class="ovh">\n' + html.join('\n') + '</div><!-- .ovh -->';
        locache.set(md5, html, timeout*60);
        self.replaceWith(html);
      });
    }
    
  });
}

function initTwitterFeed() {
  
  var regexes = {
    link: /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig,
    mention: /@([a-zA-Z0-9_]+)/g,
    hash: /#([a-zA-Z0-9_]+)/g
  }
  
  var repls = {
    link: '<a target="_blank" href="$&">$&</a> ',
    mention: '<a target="_blank" href="http://twitter.com/$1">@$1</a>',
    hash: '<a target="_blank" href="http://twitter.com/search/$1">#$1</a>'
  }
  
  // Make code scalable by using each
  $('#twitter-feed .tweet').each(function(i, elem) {
    var self = $(elem);
    var parent = self.parent();
    var username = self.data('username');
    var count = self.data('count');
    var interval = self.data('interval') || 5000;
    
    if (username && count) {
      
      var animateTweets = function(tweets) {
        
        var prevNav = $('<span class="nav prev hoverable" data-incr="-1"></span>');
        var nextNav = $('<span class="nav next hoverable" data-incr="1"></span>')
        
        parent.before(prevNav);
        parent.after(nextNav);
        
        var intID, loopCallback, busy = false, hovering = false;
        
        prevNav.add(nextNav).click(function() {
          if (busy) { return; } else { busy = true; }
          var self = $.getWrappedObject(this);
          clearInterval(intID);
          loopCallback(self.data('incr'));
          // Note: intID is restored on [mouseleave].
        });
        
        // Add touchwipe
        parent.touchwipe({
          wipeLeft: function() { nextNav.trigger('click'); },
          wipeRight: function() { prevNav.trigger('click'); },
          min_move_x: 50,
          preventDefaultEvents: false
        });
        
        // Keyup events
        
        var body = Core.getVar('body');
        
        var keyUp = function(e) {
          if (e.keyCode == 37) prevNav.trigger('click');
          else if (e.keyCode == 39) nextNav.trigger('click');
        }
        
        // Pause on hover
        parent.add(prevNav).add(nextNav).hover(function(e) {
          switch (e.type) {
            case 'mouseenter':
              clearInterval(intID);
              body.keyup(keyUp);
              break;
            case 'mouseleave':
              intID = setInterval(loopCallback, interval);
              body.unbind('keyup', keyUp);
              break;
          }
        });
        
        var cycle = Core.util.createCycle(tweets);
        var p = self.find('p');
        p.css({opacity: 0}).html(cycle.get(1)).animate({opacity: 1}, 400);
        if (tweets.length === 1) return;
        
        intID = setInterval(loopCallback = function(incr) {
          p.animate({opacity: 0}, 400, function() {
            p.html(cycle.get(incr || 1)).animate({opacity: 1}, 300);
            busy = false;
          });
          
        }, interval);

      }
      
      var tweets = locache.get(username + '_twitter_cache');
      
      if (tweets) {
        
        animateTweets(tweets);
        
      } else {
        
        var url = 'http://api.twitter.com/1/statuses/user_timeline/'+ username +'.json?count='+ count +'&include_rts=true&callback=?';
        
        $.getJSON(url, function(tweets) {
          for (var len=tweets.length,i=0; i < len; i++) {
            tweets[i] = tweets[i].text.replace(regexes.link, repls.link).replace(regexes.mention, repls.mention).replace(regexes.hash, repls.hash);
          }
          locache.set(username + '_twitter_cache', tweets, 5*60); // Cache for 5 minutes
          animateTweets(tweets);
        });

      }
    }
  });

}

function prepareFormValidation() {
  
  var forms = $('.blocked-form');
  var errRegex = /^ERR: /;
  
  if (forms.length > 0) {
    var script = document.root + 'core/js/jquery.form.js';
    head.js(script + '?v=' + document.vsn).ready(function() {
      
      forms.each(function(i, elem) {
        
        var form = $(elem);
        
        // Enhance ui

        var required = form.find('.required').each(function(j, input) {
          var self = $(input);
          var context = self.data('validation');
          var ph = self.attr('placeholder');
          self.attr('placeholder', ph + ' *');
          self.removeAttr('data-validation');
          if (context) self.addClass(context);
        });
        
        // Prepare basic validate options
        
        var validateOptions = {
          errorPlacement: function() {},
          highlight: function(elem) { 
            $.getWrappedObject(elem).addClass('invalid'); 
          },
          unhighlight: function(elem) {
            var self = $.getWrappedObject(elem);
            $.getWrappedObject(elem).removeClass('invalid');
          }
        }
        
        // Don't add a submit handler if ajax is not required
        
        if (!form.hasClass('no-ajax')) {
          
          validateOptions.submitHandler = function() {
            if (form.hasClass('no-ajax')) {
              form.submit();
            } else {
              if (form.data('sent-message')) {
                alert(form.find('.ibox').html());
              } else {
                form.ajaxSubmit({
                  success: function(res) {
                    form.find('.ibox').remove();
                    if (errRegex.test(res)) {
                      res = res.replace(errRegex, '');
                      form.find('input:submit').before('<div class="ibox warning">' + res + '</div>');
                    } else {
                      form.find('input:submit').before('<div class="ibox success">' + res + '</div>');
                      form.data('sent-message', true);
                    }
                  }
                })
              }
            }
          }

        }
        
        form.validate(validateOptions);
        
      });
      
    });
  }
  
}

function prepareMediaElements() {
  
  var audioItems = $('.multimedia.media-type-audio');
  if (audioItems.length) {
    var script = document.root + 'core/js/mejs/mediaelement-and-player.min.js';
    head.js(script + '?v=' + document.vsn).ready(function() {
      var options = {audioWidth: '100%'}; // mediaelementplayer(options)
      audioItems.find('> audio').each(function(i, elem) {
        var self = $(elem);
        var parent = self.parent().prev().css('marginBottom', 0);
        self.mediaelementplayer(options);
      });
      audioItems.addClass('loaded');
    });
  }

}

function setupLightboxFrames() {
  
  var imageFile = /\.(jpg|jpeg|png|gif|tiff|tga|pic|ico)$/i;
  
  $('a.frame.lightbox').each(function(i, elem) {
    var self = $.getWrappedObject(elem);
    var img = self.data('img');
    var gallery = self.data('gallery');
    var title = self.siblings('h3:first');
    if (img) {
      img = img.replace(/(\?|&|&amp;)a=[a-z]{1,2}$/, '');
      var format = (imageFile.test($.trim(img))) ? 'image' : 'video';
      self.removeClass('lightbox').attr('href', img);
      self.append('<span class="format '+ format +'"></span>');
      gallery ? self.attr('rel', 'lightbox[gallery-' + gallery + ']') : self.attr('rel', 'lightbox');
      // if (title.length === 1) self.attr('title', title.text());
    }
  });
  
}

function makeFooterSplit() {
  var widgetColumns = $('body > footer[role=contentinfo] .widget-column');
  var columns = widgetColumns.length;
  if ( (columns % 2) == 0) {
    var parent = widgetColumns.parent().addClass('mobile-landscape-dual');
    switch (columns) {
      case 4:
        var container1 = $('<div class="mobile-dual-container"></div>');
        var container2 = container1.clone();
        container1.appendTo(parent);
        container2.appendTo(parent);
        widgetColumns.eq(0).appendTo(container1);
        widgetColumns.eq(1).appendTo(container1);
        widgetColumns.eq(2).appendTo(container2);
        widgetColumns.eq(3).appendTo(container2);
        break;
      case 2:
        var container1 = $('<div class="mobile-dual-container"></div>');
        container1.appendTo(parent);
        widgetColumns.eq(0).appendTo(container1);
        widgetColumns.eq(1).appendTo(container1);
        break;
    } 
  }
}

function extraAdjustments() {
  // Set tags list to full width if comments disabled
  $('.blog-posts.singular article.post ul.tags-list').each(function(i, elem) {
    var self = $.getWrappedObject(elem);
    if (self.siblings().length === 0) self.css('max-width', 'none');
  });
  
  // Initialize slogans
  $('p.slogan.cta').each(function(i, slogan) {
   var self = $(slogan);
   var button = self.find('a');
   if (button.length === 1) { 
    var w = button.width() + parseInt(button.css('paddingRight'), 10)*2;
    var h = button.height() + parseInt(button.css('paddingTop'), 10)*2;
    var pr = parseInt(self.css('paddingRight'), 10);
    button.detach().css({position: 'absolute', top: '50%', marginTop: -(h/2.0), right: pr});
    var span = $('<span>' + self.html() + '</span>');
    self.css('paddingRight', pr + w + 10);
    self.html(span).append(button);
   }
  });
}

})(jQuery, window.Core);
