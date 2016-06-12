/**
 *  JQuery Idle.
 *  A dead simple jQuery plugin that executes a callback function if the user is idle.
 *  About: Author
 *  Henrique Boaventura (hboaventura@gmail.com).
 *  About: Version
 *  1.2.1
 **/
!function(a){"use strict";a.fn.idle=function(b){var g,h,c={idle:6e4,events:"mousemove keypress mousedown",onIdle:function(){},onActive:function(){},onHide:function(){},onShow:function(){},keepTracking:!1},d=!1,e=!0,f=a.extend({},c,b);return g=function(a,b){return d&&(b.onActive.call(),d=!1),(b.keepTracking?clearInterval:clearTimeout)(a),h(b)},h=function(a){var c,b=a.keepTracking?setInterval:setTimeout;return c=b(function(){d=!0,a.onIdle.call()},a.idle)},this.each(function(){var c=h(f);a(this).on(f.events,function(){c=g(c,f)}),(b.onShow||b.onHide)&&a(document).on("visibilitychange webkitvisibilitychange mozvisibilitychange msvisibilitychange",function(){document.hidden||document.webkitHidden||document.mozHidden||document.msHidden?e&&(e=!1,f.onHide.call()):e||(e=!0,f.onShow.call())})})}}(jQuery);