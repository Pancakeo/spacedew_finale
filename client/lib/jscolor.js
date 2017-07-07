"use strict";window.jscolor||(window.jscolor=function(){var e={register:function(){e.attachDOMReadyEvent(e.init),e.attachEvent(document,"mousedown",e.onDocumentMouseDown),e.attachEvent(document,"touchstart",e.onDocumentTouchStart),e.attachEvent(window,"resize",e.onWindowResize)},init:function(){e.jscolor.lookupClass&&e.jscolor.installByClassName(e.jscolor.lookupClass)},tryInstallOnElements:function(t,n){for(var r=new RegExp("(^|\\s)("+n+")(\\s*(\\{[^}]*\\})|\\s|$)","i"),o=0;o<t.length;o+=1)if(void 0===t[o].type||"color"!=t[o].type.toLowerCase()||!e.isColorAttrSupported){var i;if(!t[o].jscolor&&t[o].className&&(i=t[o].className.match(r))){var s=t[o],l=null,a=e.getDataAttr(s,"jscolor");null!==a?l=a:i[4]&&(l=i[4]);var d={};if(l)try{d=new Function("return ("+l+")")()}catch(t){e.warn("Error parsing jscolor options: "+t+":\n"+l)}s.jscolor=new e.jscolor(s,d)}}},isColorAttrSupported:function(){var e=document.createElement("input");return!(!e.setAttribute||(e.setAttribute("type","color"),"color"!=e.type.toLowerCase()))}(),isCanvasSupported:function(){var e=document.createElement("canvas");return!(!e.getContext||!e.getContext("2d"))}(),fetchElement:function(e){return"string"==typeof e?document.getElementById(e):e},isElementType:function(e,t){return e.nodeName.toLowerCase()===t.toLowerCase()},getDataAttr:function(e,t){var n="data-"+t,r=e.getAttribute(n);return null!==r?r:null},attachEvent:function(e,t,n){e.addEventListener?e.addEventListener(t,n,!1):e.attachEvent&&e.attachEvent("on"+t,n)},detachEvent:function(e,t,n){e.removeEventListener?e.removeEventListener(t,n,!1):e.detachEvent&&e.detachEvent("on"+t,n)},_attachedGroupEvents:{},attachGroupEvent:function(t,n,r,o){e._attachedGroupEvents.hasOwnProperty(t)||(e._attachedGroupEvents[t]=[]),e._attachedGroupEvents[t].push([n,r,o]),e.attachEvent(n,r,o)},detachGroupEvents:function(t){if(e._attachedGroupEvents.hasOwnProperty(t)){for(var n=0;n<e._attachedGroupEvents[t].length;n+=1){var r=e._attachedGroupEvents[t][n];e.detachEvent(r[0],r[1],r[2])}delete e._attachedGroupEvents[t]}},attachDOMReadyEvent:function(e){var t=!1,n=function(){t||(t=!0,e())};if("complete"!==document.readyState){if(document.addEventListener)document.addEventListener("DOMContentLoaded",n,!1),window.addEventListener("load",n,!1);else if(document.attachEvent&&(document.attachEvent("onreadystatechange",function(){"complete"===document.readyState&&(document.detachEvent("onreadystatechange",arguments.callee),n())}),window.attachEvent("onload",n),document.documentElement.doScroll&&window==window.top)){var r=function(){if(document.body)try{document.documentElement.doScroll("left"),n()}catch(e){setTimeout(r,1)}};r()}}else setTimeout(n,1)},warn:function(e){window.console&&window.console.warn&&window.console.warn(e)},preventDefault:function(e){e.preventDefault&&e.preventDefault(),e.returnValue=!1},captureTarget:function(t){t.setCapture&&(e._capturedTarget=t,e._capturedTarget.setCapture())},releaseTarget:function(){e._capturedTarget&&(e._capturedTarget.releaseCapture(),e._capturedTarget=null)},fireEvent:function(e,t){if(e)if(document.createEvent)(n=document.createEvent("HTMLEvents")).initEvent(t,!0,!0),e.dispatchEvent(n);else if(document.createEventObject){var n=document.createEventObject();e.fireEvent("on"+t,n)}else e["on"+t]&&e["on"+t]()},classNameToList:function(e){return e.replace(/^\s+|\s+$/g,"").split(/\s+/)},hasClass:function(e,t){return!!t&&-1!=(" "+e.className.replace(/\s+/g," ")+" ").indexOf(" "+t+" ")},setClass:function(t,n){for(var r=e.classNameToList(n),o=0;o<r.length;o+=1)e.hasClass(t,r[o])||(t.className+=(t.className?" ":"")+r[o])},unsetClass:function(t,n){for(var r=e.classNameToList(n),o=0;o<r.length;o+=1){var i=new RegExp("^\\s*"+r[o]+"\\s*|\\s*"+r[o]+"\\s*$|\\s+"+r[o]+"(\\s+)","g");t.className=t.className.replace(i,"$1")}},getStyle:function(e){return window.getComputedStyle?window.getComputedStyle(e):e.currentStyle},setStyle:function(){var e=document.createElement("div"),t=function(t){for(var n=0;n<t.length;n+=1)if(t[n]in e.style)return t[n]},n={borderRadius:t(["borderRadius","MozBorderRadius","webkitBorderRadius"]),boxShadow:t(["boxShadow","MozBoxShadow","webkitBoxShadow"])};return function(e,t,r){switch(t.toLowerCase()){case"opacity":var o=Math.round(100*parseFloat(r));e.style.opacity=r,e.style.filter="alpha(opacity="+o+")";break;default:e.style[n[t]]=r}}}(),setBorderRadius:function(t,n){e.setStyle(t,"borderRadius",n||"0")},setBoxShadow:function(t,n){e.setStyle(t,"boxShadow",n||"none")},getElementPos:function(t,n){var r=0,o=0,i=t.getBoundingClientRect();if(r=i.left,o=i.top,!n){var s=e.getViewPos();r+=s[0],o+=s[1]}return[r,o]},getElementSize:function(e){return[e.offsetWidth,e.offsetHeight]},getAbsPointerPos:function(e){e||(e=window.event);var t=0,n=0;return void 0!==e.changedTouches&&e.changedTouches.length?(t=e.changedTouches[0].clientX,n=e.changedTouches[0].clientY):"number"==typeof e.clientX&&(t=e.clientX,n=e.clientY),{x:t,y:n}},getRelPointerPos:function(e){e||(e=window.event);var t=(e.target||e.srcElement).getBoundingClientRect(),n=0,r=0,o=0,i=0;return void 0!==e.changedTouches&&e.changedTouches.length?(o=e.changedTouches[0].clientX,i=e.changedTouches[0].clientY):"number"==typeof e.clientX&&(o=e.clientX,i=e.clientY),n=o-t.left,r=i-t.top,{x:n,y:r}},getViewPos:function(){var e=document.documentElement;return[(window.pageXOffset||e.scrollLeft)-(e.clientLeft||0),(window.pageYOffset||e.scrollTop)-(e.clientTop||0)]},getViewSize:function(){var e=document.documentElement;return[window.innerWidth||e.clientWidth,window.innerHeight||e.clientHeight]},redrawPosition:function(){if(e.picker&&e.picker.owner){var t,n,r=e.picker.owner;r.fixed?(t=e.getElementPos(r.targetElement,!0),n=[0,0]):(t=e.getElementPos(r.targetElement),n=e.getViewPos());var o,i,s,l=e.getElementSize(r.targetElement),a=e.getViewSize(),d=e.getPickerOuterDims(r);switch(r.position.toLowerCase()){case"left":o=1,i=0,s=-1;break;case"right":o=1,i=0,s=1;break;case"top":o=0,i=1,s=-1;break;default:o=0,i=1,s=1}var c=(l[i]+d[i])/2;if(r.smartPosition)h=[-n[o]+t[o]+d[o]>a[o]&&-n[o]+t[o]+l[o]/2>a[o]/2&&t[o]+l[o]-d[o]>=0?t[o]+l[o]-d[o]:t[o],-n[i]+t[i]+l[i]+d[i]-c+c*s>a[i]?-n[i]+t[i]+l[i]/2>a[i]/2&&t[i]+l[i]-c-c*s>=0?t[i]+l[i]-c-c*s:t[i]+l[i]-c+c*s:t[i]+l[i]-c+c*s>=0?t[i]+l[i]-c+c*s:t[i]+l[i]-c-c*s];else var h=[t[o],t[i]+l[i]-c+c*s];var p=h[o],u=h[i],m=r.fixed?"fixed":"absolute",v=(h[0]+d[0]>t[0]||h[0]<t[0]+l[0])&&h[1]+d[1]<t[1]+l[1];e._drawPosition(r,p,u,m,v)}},_drawPosition:function(t,n,r,o,i){var s=i?0:t.shadowBlur;e.picker.wrap.style.position=o,e.picker.wrap.style.left=n+"px",e.picker.wrap.style.top=r+"px",e.setBoxShadow(e.picker.boxS,t.shadow?new e.BoxShadow(0,s,t.shadowBlur,0,t.shadowColor):null)},getPickerDims:function(t){var n=!!e.getSliderComponent(t);return[2*t.insetWidth+2*t.padding+t.width+(n?2*t.insetWidth+e.getPadToSliderPadding(t)+t.sliderSize:0),2*t.insetWidth+2*t.padding+t.height+(t.closable?2*t.insetWidth+t.padding+t.buttonHeight:0)]},getPickerOuterDims:function(t){var n=e.getPickerDims(t);return[n[0]+2*t.borderWidth,n[1]+2*t.borderWidth]},getPadToSliderPadding:function(e){return Math.max(e.padding,1.5*(2*e.pointerBorderWidth+e.pointerThickness))},getPadYComponent:function(e){switch(e.mode.charAt(1).toLowerCase()){case"v":return"v"}return"s"},getSliderComponent:function(e){if(e.mode.length>2)switch(e.mode.charAt(2).toLowerCase()){case"s":return"s";case"v":return"v"}return null},onDocumentMouseDown:function(t){t||(t=window.event);var n=t.target||t.srcElement;n._jscLinkedInstance?n._jscLinkedInstance.showOnClick&&n._jscLinkedInstance.show():n._jscControlName?e.onControlPointerStart(t,n,n._jscControlName,"mouse"):e.picker&&e.picker.owner&&e.picker.owner.hide()},onDocumentTouchStart:function(t){t||(t=window.event);var n=t.target||t.srcElement;n._jscLinkedInstance?n._jscLinkedInstance.showOnClick&&n._jscLinkedInstance.show():n._jscControlName?e.onControlPointerStart(t,n,n._jscControlName,"touch"):e.picker&&e.picker.owner&&e.picker.owner.hide()},onWindowResize:function(t){e.redrawPosition()},onParentScroll:function(t){e.picker&&e.picker.owner&&e.picker.owner.hide()},_pointerMoveEvent:{mouse:"mousemove",touch:"touchmove"},_pointerEndEvent:{mouse:"mouseup",touch:"touchend"},_pointerOrigin:null,_capturedTarget:null,onControlPointerStart:function(t,n,r,o){var i=n._jscInstance;e.preventDefault(t),e.captureTarget(n);var s=function(i,s){e.attachGroupEvent("drag",i,e._pointerMoveEvent[o],e.onDocumentPointerMove(t,n,r,o,s)),e.attachGroupEvent("drag",i,e._pointerEndEvent[o],e.onDocumentPointerEnd(t,n,r,o))};if(s(document,[0,0]),window.parent&&window.frameElement){var l=window.frameElement.getBoundingClientRect(),a=[-l.left,-l.top];s(window.parent.window.document,a)}var d=e.getAbsPointerPos(t),c=e.getRelPointerPos(t);switch(e._pointerOrigin={x:d.x-c.x,y:d.y-c.y},r){case"pad":switch(e.getSliderComponent(i)){case"s":0===i.hsv[1]&&i.fromHSV(null,100,null);break;case"v":0===i.hsv[2]&&i.fromHSV(null,null,100)}e.setPad(i,t,0,0);break;case"sld":e.setSld(i,t,0)}e.dispatchFineChange(i)},onDocumentPointerMove:function(t,n,r,o,i){return function(t){var o=n._jscInstance;switch(r){case"pad":t||(t=window.event),e.setPad(o,t,i[0],i[1]),e.dispatchFineChange(o);break;case"sld":t||(t=window.event),e.setSld(o,t,i[1]),e.dispatchFineChange(o)}}},onDocumentPointerEnd:function(t,n,r,o){return function(t){var r=n._jscInstance;e.detachGroupEvents("drag"),e.releaseTarget(),e.dispatchChange(r)}},dispatchChange:function(t){t.valueElement&&e.isElementType(t.valueElement,"input")&&e.fireEvent(t.valueElement,"change")},dispatchFineChange:function(e){if(e.onFineChange){("string"==typeof e.onFineChange?new Function(e.onFineChange):e.onFineChange).call(e)}},setPad:function(t,n,r,o){var i=e.getAbsPointerPos(n),s=r+i.x-e._pointerOrigin.x-t.padding-t.insetWidth,l=o+i.y-e._pointerOrigin.y-t.padding-t.insetWidth,a=s*(360/(t.width-1)),d=100-l*(100/(t.height-1));switch(e.getPadYComponent(t)){case"s":t.fromHSV(a,d,null,e.leaveSld);break;case"v":t.fromHSV(a,null,d,e.leaveSld)}},setSld:function(t,n,r){var o=100-(r+e.getAbsPointerPos(n).y-e._pointerOrigin.y-t.padding-t.insetWidth)*(100/(t.height-1));switch(e.getSliderComponent(t)){case"s":t.fromHSV(null,o,null,e.leavePad);break;case"v":t.fromHSV(null,null,o,e.leavePad)}},_vmlNS:"jsc_vml_",_vmlCSS:"jsc_vml_css_",_vmlReady:!1,initVML:function(){if(!e._vmlReady){var t=document;if(t.namespaces[e._vmlNS]||t.namespaces.add(e._vmlNS,"urn:schemas-microsoft-com:vml"),!t.styleSheets[e._vmlCSS]){var n=["shape","shapetype","group","background","path","formulas","handles","fill","stroke","shadow","textbox","textpath","imagedata","line","polyline","curve","rect","roundrect","oval","arc","image"],r=t.createStyleSheet();r.owningElement.id=e._vmlCSS;for(var o=0;o<n.length;o+=1)r.addRule(e._vmlNS+"\\:"+n[o],"behavior:url(#default#VML);")}e._vmlReady=!0}},createPalette:function(){var t={elm:null,draw:null};if(e.isCanvasSupported){var n=document.createElement("canvas"),r=n.getContext("2d"),o=function(e,t,o){n.width=e,n.height=t,r.clearRect(0,0,n.width,n.height);var i=r.createLinearGradient(0,0,n.width,0);i.addColorStop(0,"#F00"),i.addColorStop(1/6,"#FF0"),i.addColorStop(2/6,"#0F0"),i.addColorStop(.5,"#0FF"),i.addColorStop(4/6,"#00F"),i.addColorStop(5/6,"#F0F"),i.addColorStop(1,"#F00"),r.fillStyle=i,r.fillRect(0,0,n.width,n.height);var s=r.createLinearGradient(0,0,0,n.height);switch(o.toLowerCase()){case"s":s.addColorStop(0,"rgba(255,255,255,0)"),s.addColorStop(1,"rgba(255,255,255,1)");break;case"v":s.addColorStop(0,"rgba(0,0,0,0)"),s.addColorStop(1,"rgba(0,0,0,1)")}r.fillStyle=s,r.fillRect(0,0,n.width,n.height)};t.elm=n,t.draw=o}else{e.initVML();var i=document.createElement("div");i.style.position="relative",i.style.overflow="hidden";var s=document.createElement(e._vmlNS+":fill");s.type="gradient",s.method="linear",s.angle="90",s.colors="16.67% #F0F, 33.33% #00F, 50% #0FF, 66.67% #0F0, 83.33% #FF0";var l=document.createElement(e._vmlNS+":rect");l.style.position="absolute",l.style.left="-1px",l.style.top="-1px",l.stroked=!1,l.appendChild(s),i.appendChild(l);var a=document.createElement(e._vmlNS+":fill");a.type="gradient",a.method="linear",a.angle="180",a.opacity="0";var d=document.createElement(e._vmlNS+":rect");d.style.position="absolute",d.style.left="-1px",d.style.top="-1px",d.stroked=!1,d.appendChild(a),i.appendChild(d);o=function(e,t,n){switch(i.style.width=e+"px",i.style.height=t+"px",l.style.width=d.style.width=e+1+"px",l.style.height=d.style.height=t+1+"px",s.color="#F00",s.color2="#F00",n.toLowerCase()){case"s":a.color=a.color2="#FFF";break;case"v":a.color=a.color2="#000"}};t.elm=i,t.draw=o}return t},createSliderGradient:function(){var t={elm:null,draw:null};if(e.isCanvasSupported){var n=document.createElement("canvas"),r=n.getContext("2d"),o=function(e,t,o,i){n.width=e,n.height=t,r.clearRect(0,0,n.width,n.height);var s=r.createLinearGradient(0,0,0,n.height);s.addColorStop(0,o),s.addColorStop(1,i),r.fillStyle=s,r.fillRect(0,0,n.width,n.height)};t.elm=n,t.draw=o}else{e.initVML();var i=document.createElement("div");i.style.position="relative",i.style.overflow="hidden";var s=document.createElement(e._vmlNS+":fill");s.type="gradient",s.method="linear",s.angle="180";var l=document.createElement(e._vmlNS+":rect");l.style.position="absolute",l.style.left="-1px",l.style.top="-1px",l.stroked=!1,l.appendChild(s),i.appendChild(l);o=function(e,t,n,r){i.style.width=e+"px",i.style.height=t+"px",l.style.width=e+1+"px",l.style.height=t+1+"px",s.color=n,s.color2=r};t.elm=i,t.draw=o}return t},leaveValue:1,leaveStyle:2,leavePad:4,leaveSld:8,BoxShadow:function(){var e=function(e,t,n,r,o,i){this.hShadow=e,this.vShadow=t,this.blur=n,this.spread=r,this.color=o,this.inset=!!i};return e.prototype.toString=function(){var e=[Math.round(this.hShadow)+"px",Math.round(this.vShadow)+"px",Math.round(this.blur)+"px",Math.round(this.spread)+"px",this.color];return this.inset&&e.push("inset"),e.join(" ")},e}(),jscolor:function(t,n){function r(e,t,n){e/=255,t/=255,n/=255;var r=Math.min(Math.min(e,t),n),o=Math.max(Math.max(e,t),n),i=o-r;if(0===i)return[null,0,100*o];var s=e===r?3+(n-t)/i:t===r?5+(e-n)/i:1+(t-e)/i;return[60*(6===s?0:s),i/o*100,100*o]}function o(e,t,n){var r=n/100*255;if(null===e)return[r,r,r];e/=60,t/=100;var o=Math.floor(e),i=r*(1-t),s=r*(1-t*(o%2?e-o:1-(e-o)));switch(o){case 6:case 0:return[r,s,i];case 1:return[s,r,i];case 2:return[i,r,s];case 3:return[i,s,r];case 4:return[s,i,r];case 5:return[r,i,s]}}function i(){e.unsetClass(m.targetElement,m.activeClass),e.picker.wrap.parentNode.removeChild(e.picker.wrap),delete e.picker.owner}function s(){m._processParentElementsInDOM(),e.picker||(e.picker={owner:null,wrap:document.createElement("div"),box:document.createElement("div"),boxS:document.createElement("div"),boxB:document.createElement("div"),pad:document.createElement("div"),padB:document.createElement("div"),padM:document.createElement("div"),padPal:e.createPalette(),cross:document.createElement("div"),crossBY:document.createElement("div"),crossBX:document.createElement("div"),crossLY:document.createElement("div"),crossLX:document.createElement("div"),sld:document.createElement("div"),sldB:document.createElement("div"),sldM:document.createElement("div"),sldGrad:e.createSliderGradient(),sldPtrS:document.createElement("div"),sldPtrIB:document.createElement("div"),sldPtrMB:document.createElement("div"),sldPtrOB:document.createElement("div"),btn:document.createElement("div"),btnT:document.createElement("span")},e.picker.pad.appendChild(e.picker.padPal.elm),e.picker.padB.appendChild(e.picker.pad),e.picker.cross.appendChild(e.picker.crossBY),e.picker.cross.appendChild(e.picker.crossBX),e.picker.cross.appendChild(e.picker.crossLY),e.picker.cross.appendChild(e.picker.crossLX),e.picker.padB.appendChild(e.picker.cross),e.picker.box.appendChild(e.picker.padB),e.picker.box.appendChild(e.picker.padM),e.picker.sld.appendChild(e.picker.sldGrad.elm),e.picker.sldB.appendChild(e.picker.sld),e.picker.sldB.appendChild(e.picker.sldPtrOB),e.picker.sldPtrOB.appendChild(e.picker.sldPtrMB),e.picker.sldPtrMB.appendChild(e.picker.sldPtrIB),e.picker.sldPtrIB.appendChild(e.picker.sldPtrS),e.picker.box.appendChild(e.picker.sldB),e.picker.box.appendChild(e.picker.sldM),e.picker.btn.appendChild(e.picker.btnT),e.picker.box.appendChild(e.picker.btn),e.picker.boxB.appendChild(e.picker.box),e.picker.wrap.appendChild(e.picker.boxS),e.picker.wrap.appendChild(e.picker.boxB));var t=e.picker,n=!!e.getSliderComponent(m),r=e.getPickerDims(m),o=2*m.pointerBorderWidth+m.pointerThickness+2*m.crossSize,i=e.getPadToSliderPadding(m),s=Math.min(m.borderRadius,Math.round(m.padding*Math.PI));t.wrap.style.clear="both",t.wrap.style.width=r[0]+2*m.borderWidth+"px",t.wrap.style.height=r[1]+2*m.borderWidth+"px",t.wrap.style.zIndex=m.zIndex,t.box.style.width=r[0]+"px",t.box.style.height=r[1]+"px",t.boxS.style.position="absolute",t.boxS.style.left="0",t.boxS.style.top="0",t.boxS.style.width="100%",t.boxS.style.height="100%",e.setBorderRadius(t.boxS,s+"px"),t.boxB.style.position="relative",t.boxB.style.border=m.borderWidth+"px solid",t.boxB.style.borderColor=m.borderColor,t.boxB.style.background=m.backgroundColor,e.setBorderRadius(t.boxB,s+"px"),t.padM.style.background=t.sldM.style.background="#FFF",e.setStyle(t.padM,"opacity","0"),e.setStyle(t.sldM,"opacity","0"),t.pad.style.position="relative",t.pad.style.width=m.width+"px",t.pad.style.height=m.height+"px",t.padPal.draw(m.width,m.height,e.getPadYComponent(m)),t.padB.style.position="absolute",t.padB.style.left=m.padding+"px",t.padB.style.top=m.padding+"px",t.padB.style.border=m.insetWidth+"px solid",t.padB.style.borderColor=m.insetColor,t.padM._jscInstance=m,t.padM._jscControlName="pad",t.padM.style.position="absolute",t.padM.style.left="0",t.padM.style.top="0",t.padM.style.width=m.padding+2*m.insetWidth+m.width+i/2+"px",t.padM.style.height=r[1]+"px",t.padM.style.cursor="crosshair",t.cross.style.position="absolute",t.cross.style.left=t.cross.style.top="0",t.cross.style.width=t.cross.style.height=o+"px",t.crossBY.style.position=t.crossBX.style.position="absolute",t.crossBY.style.background=t.crossBX.style.background=m.pointerBorderColor,t.crossBY.style.width=t.crossBX.style.height=2*m.pointerBorderWidth+m.pointerThickness+"px",t.crossBY.style.height=t.crossBX.style.width=o+"px",t.crossBY.style.left=t.crossBX.style.top=Math.floor(o/2)-Math.floor(m.pointerThickness/2)-m.pointerBorderWidth+"px",t.crossBY.style.top=t.crossBX.style.left="0",t.crossLY.style.position=t.crossLX.style.position="absolute",t.crossLY.style.background=t.crossLX.style.background=m.pointerColor,t.crossLY.style.height=t.crossLX.style.width=o-2*m.pointerBorderWidth+"px",t.crossLY.style.width=t.crossLX.style.height=m.pointerThickness+"px",t.crossLY.style.left=t.crossLX.style.top=Math.floor(o/2)-Math.floor(m.pointerThickness/2)+"px",t.crossLY.style.top=t.crossLX.style.left=m.pointerBorderWidth+"px",t.sld.style.overflow="hidden",t.sld.style.width=m.sliderSize+"px",t.sld.style.height=m.height+"px",t.sldGrad.draw(m.sliderSize,m.height,"#000","#000"),t.sldB.style.display=n?"block":"none",t.sldB.style.position="absolute",t.sldB.style.right=m.padding+"px",t.sldB.style.top=m.padding+"px",t.sldB.style.border=m.insetWidth+"px solid",t.sldB.style.borderColor=m.insetColor,t.sldM._jscInstance=m,t.sldM._jscControlName="sld",t.sldM.style.display=n?"block":"none",t.sldM.style.position="absolute",t.sldM.style.right="0",t.sldM.style.top="0",t.sldM.style.width=m.sliderSize+i/2+m.padding+2*m.insetWidth+"px",t.sldM.style.height=r[1]+"px",t.sldM.style.cursor="default",t.sldPtrIB.style.border=t.sldPtrOB.style.border=m.pointerBorderWidth+"px solid "+m.pointerBorderColor,t.sldPtrOB.style.position="absolute",t.sldPtrOB.style.left=-(2*m.pointerBorderWidth+m.pointerThickness)+"px",t.sldPtrOB.style.top="0",t.sldPtrMB.style.border=m.pointerThickness+"px solid "+m.pointerColor,t.sldPtrS.style.width=m.sliderSize+"px",t.sldPtrS.style.height=g+"px",t.btn.style.display=m.closable?"block":"none",t.btn.style.position="absolute",t.btn.style.left=m.padding+"px",t.btn.style.bottom=m.padding+"px",t.btn.style.padding="0 15px",t.btn.style.height=m.buttonHeight+"px",t.btn.style.border=m.insetWidth+"px solid",function(){var e=m.insetColor.split(/\s+/),n=e.length<2?e[0]:e[1]+" "+e[0]+" "+e[0]+" "+e[1];t.btn.style.borderColor=n}(),t.btn.style.color=m.buttonColor,t.btn.style.font="12px sans-serif",t.btn.style.textAlign="center";try{t.btn.style.cursor="pointer"}catch(e){t.btn.style.cursor="hand"}t.btn.onmousedown=function(){m.hide()},t.btnT.style.lineHeight=m.buttonHeight+"px",t.btnT.innerHTML="",t.btnT.appendChild(document.createTextNode(m.closeText)),l(),a(),e.picker.owner&&e.picker.owner!==m&&e.unsetClass(e.picker.owner.targetElement,m.activeClass),e.picker.owner=m,e.isElementType(v,"body")?e.redrawPosition():e._drawPosition(m,0,0,"relative",!1),t.wrap.parentNode!=v&&v.appendChild(t.wrap),e.setClass(m.targetElement,m.activeClass)}function l(){switch(e.getPadYComponent(m)){case"s":t=1;break;case"v":var t=2}var n=Math.round(m.hsv[0]/360*(m.width-1)),r=Math.round((1-m.hsv[t]/100)*(m.height-1)),i=2*m.pointerBorderWidth+m.pointerThickness+2*m.crossSize,s=-Math.floor(i/2);switch(e.picker.cross.style.left=n+s+"px",e.picker.cross.style.top=r+s+"px",e.getSliderComponent(m)){case"s":var l=o(m.hsv[0],100,m.hsv[2]),a=o(m.hsv[0],0,m.hsv[2]),d="rgb("+Math.round(l[0])+","+Math.round(l[1])+","+Math.round(l[2])+")",c="rgb("+Math.round(a[0])+","+Math.round(a[1])+","+Math.round(a[2])+")";e.picker.sldGrad.draw(m.sliderSize,m.height,d,c);break;case"v":var h=o(m.hsv[0],m.hsv[1],100),d="rgb("+Math.round(h[0])+","+Math.round(h[1])+","+Math.round(h[2])+")",c="#000";e.picker.sldGrad.draw(m.sliderSize,m.height,d,c)}}function a(){var t=e.getSliderComponent(m);if(t){switch(t){case"s":n=1;break;case"v":var n=2}var r=Math.round((1-m.hsv[n]/100)*(m.height-1));e.picker.sldPtrOB.style.top=r-(2*m.pointerBorderWidth+m.pointerThickness)-Math.floor(g/2)+"px"}}function d(){return e.picker&&e.picker.owner===m}function c(){m.importColor()}this.value=null,this.valueElement=t,this.styleElement=t,this.required=!0,this.refine=!0,this.hash=!1,this.uppercase=!0,this.onFineChange=null,this.activeClass="jscolor-active",this.minS=0,this.maxS=100,this.minV=0,this.maxV=100,this.hsv=[0,0,100],this.rgb=[255,255,255],this.width=181,this.height=101,this.showOnClick=!0,this.mode="HSV",this.position="bottom",this.smartPosition=!0,this.sliderSize=16,this.crossSize=8,this.closable=!1,this.closeText="Close",this.buttonColor="#000000",this.buttonHeight=18,this.padding=12,this.backgroundColor="#FFFFFF",this.borderWidth=1,this.borderColor="#BBBBBB",this.borderRadius=8,this.insetWidth=1,this.insetColor="#BBBBBB",this.shadow=!0,this.shadowBlur=15,this.shadowColor="rgba(0,0,0,0.2)",this.pointerColor="#4C4C4C",this.pointerBorderColor="#FFFFFF",this.pointerBorderWidth=1,this.pointerThickness=2,this.zIndex=1e3,this.container=null;for(var h in n)n.hasOwnProperty(h)&&(this[h]=n[h]);if(this.hide=function(){d()&&i()},this.show=function(){s()},this.redraw=function(){d()&&s()},this.importColor=function(){this.valueElement&&e.isElementType(this.valueElement,"input")?this.refine?!this.required&&/^\s*$/.test(this.valueElement.value)?(this.valueElement.value="",this.styleElement&&(this.styleElement.style.backgroundImage=this.styleElement._jscOrigStyle.backgroundImage,this.styleElement.style.backgroundColor=this.styleElement._jscOrigStyle.backgroundColor,this.styleElement.style.color=this.styleElement._jscOrigStyle.color),this.exportColor(e.leaveValue|e.leaveStyle)):this.fromString(this.valueElement.value)||this.exportColor():this.fromString(this.valueElement.value,e.leaveValue)||(this.styleElement&&(this.styleElement.style.backgroundImage=this.styleElement._jscOrigStyle.backgroundImage,this.styleElement.style.backgroundColor=this.styleElement._jscOrigStyle.backgroundColor,this.styleElement.style.color=this.styleElement._jscOrigStyle.color),this.exportColor(e.leaveValue|e.leaveStyle)):this.exportColor()},this.exportColor=function(t){if(!(t&e.leaveValue)&&this.valueElement){var n=this.toString();this.uppercase&&(n=n.toUpperCase()),this.hash&&(n="#"+n),e.isElementType(this.valueElement,"input")?this.valueElement.value=n:this.valueElement.innerHTML=n}t&e.leaveStyle||this.styleElement&&(this.styleElement.style.backgroundImage="none",this.styleElement.style.backgroundColor="#"+this.toString(),this.styleElement.style.color=this.isLight()?"#000":"#FFF"),t&e.leavePad||!d()||l(),t&e.leaveSld||!d()||a()},this.fromHSV=function(e,t,n,r){if(null!==e){if(isNaN(e))return!1;e=Math.max(0,Math.min(360,e))}if(null!==t){if(isNaN(t))return!1;t=Math.max(0,Math.min(100,this.maxS,t),this.minS)}if(null!==n){if(isNaN(n))return!1;n=Math.max(0,Math.min(100,this.maxV,n),this.minV)}this.rgb=o(null===e?this.hsv[0]:this.hsv[0]=e,null===t?this.hsv[1]:this.hsv[1]=t,null===n?this.hsv[2]:this.hsv[2]=n),this.exportColor(r)},this.fromRGB=function(e,t,n,i){if(null!==e){if(isNaN(e))return!1;e=Math.max(0,Math.min(255,e))}if(null!==t){if(isNaN(t))return!1;t=Math.max(0,Math.min(255,t))}if(null!==n){if(isNaN(n))return!1;n=Math.max(0,Math.min(255,n))}var s=r(null===e?this.rgb[0]:e,null===t?this.rgb[1]:t,null===n?this.rgb[2]:n);null!==s[0]&&(this.hsv[0]=Math.max(0,Math.min(360,s[0]))),0!==s[2]&&(this.hsv[1]=null===s[1]?null:Math.max(0,this.minS,Math.min(100,this.maxS,s[1]))),this.hsv[2]=null===s[2]?null:Math.max(0,this.minV,Math.min(100,this.maxV,s[2]));var l=o(this.hsv[0],this.hsv[1],this.hsv[2]);this.rgb[0]=l[0],this.rgb[1]=l[1],this.rgb[2]=l[2],this.exportColor(i)},this.fromString=function(e,t){var n;if(n=e.match(/^\W*([0-9A-F]{3}([0-9A-F]{3})?)\W*$/i))return 6===n[1].length?this.fromRGB(parseInt(n[1].substr(0,2),16),parseInt(n[1].substr(2,2),16),parseInt(n[1].substr(4,2),16),t):this.fromRGB(parseInt(n[1].charAt(0)+n[1].charAt(0),16),parseInt(n[1].charAt(1)+n[1].charAt(1),16),parseInt(n[1].charAt(2)+n[1].charAt(2),16),t),!0;if(n=e.match(/^\W*rgba?\(([^)]*)\)\W*$/i)){var r,o,i,s=n[1].split(","),l=/^\s*(\d*)(\.\d+)?\s*$/;if(s.length>=3&&(r=s[0].match(l))&&(o=s[1].match(l))&&(i=s[2].match(l))){var a=parseFloat((r[1]||"0")+(r[2]||"")),d=parseFloat((o[1]||"0")+(o[2]||"")),c=parseFloat((i[1]||"0")+(i[2]||""));return this.fromRGB(a,d,c,t),!0}}return!1},this.toString=function(){return(256|Math.round(this.rgb[0])).toString(16).substr(1)+(256|Math.round(this.rgb[1])).toString(16).substr(1)+(256|Math.round(this.rgb[2])).toString(16).substr(1)},this.toHEXString=function(){return"#"+this.toString().toUpperCase()},this.toRGBString=function(){return"rgb("+Math.round(this.rgb[0])+","+Math.round(this.rgb[1])+","+Math.round(this.rgb[2])+")"},this.isLight=function(){return.213*this.rgb[0]+.715*this.rgb[1]+.072*this.rgb[2]>127.5},this._processParentElementsInDOM=function(){if(!this._linkedElementsProcessed){this._linkedElementsProcessed=!0;var t=this.targetElement;do{var n=e.getStyle(t);n&&"fixed"===n.position.toLowerCase()&&(this.fixed=!0),t!==this.targetElement&&(t._jscEventsAttached||(e.attachEvent(t,"scroll",e.onParentScroll),t._jscEventsAttached=!0))}while((t=t.parentNode)&&!e.isElementType(t,"body"))}},"string"==typeof t){var p=t,u=document.getElementById(p);u?this.targetElement=u:e.warn("Could not find target element with ID '"+p+"'")}else t?this.targetElement=t:e.warn("Invalid target element: '"+t+"'");if(this.targetElement._jscLinkedInstance)e.warn("Cannot link jscolor twice to the same element. Skipping.");else{this.targetElement._jscLinkedInstance=this,this.valueElement=e.fetchElement(this.valueElement),this.styleElement=e.fetchElement(this.styleElement);var m=this,v=this.container?e.fetchElement(this.container):document.getElementsByTagName("body")[0],g=3;if(e.isElementType(this.targetElement,"button"))if(this.targetElement.onclick){var y=this.targetElement.onclick;this.targetElement.onclick=function(e){return y.call(this,e),!1}}else this.targetElement.onclick=function(){return!1};if(this.valueElement&&e.isElementType(this.valueElement,"input")){var f=function(){m.fromString(m.valueElement.value,e.leaveValue),e.dispatchFineChange(m)};e.attachEvent(this.valueElement,"keyup",f),e.attachEvent(this.valueElement,"input",f),e.attachEvent(this.valueElement,"blur",c),this.valueElement.setAttribute("autocomplete","off")}this.styleElement&&(this.styleElement._jscOrigStyle={backgroundImage:this.styleElement.style.backgroundImage,backgroundColor:this.styleElement.style.backgroundColor,color:this.styleElement.style.color}),this.value?this.fromString(this.value)||this.exportColor():this.importColor()}}};return e.jscolor.lookupClass="jscolor",e.jscolor.installByClassName=function(t){var n=document.getElementsByTagName("input"),r=document.getElementsByTagName("button");e.tryInstallOnElements(n,t),e.tryInstallOnElements(r,t)},e.register(),e.jscolor}());