!function(t){var e={};function n(r){if(e[r])return e[r].exports;var o=e[r]={i:r,l:!1,exports:{}};return t[r].call(o.exports,o,o.exports,n),o.l=!0,o.exports}n.m=t,n.c=e,n.d=function(t,e,r){n.o(t,e)||Object.defineProperty(t,e,{enumerable:!0,get:r})},n.r=function(t){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(t,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(t,"__esModule",{value:!0})},n.t=function(t,e){if(1&e&&(t=n(t)),8&e)return t;if(4&e&&"object"==typeof t&&t&&t.__esModule)return t;var r=Object.create(null);if(n.r(r),Object.defineProperty(r,"default",{enumerable:!0,value:t}),2&e&&"string"!=typeof t)for(var o in t)n.d(r,o,function(e){return t[e]}.bind(null,o));return r},n.n=function(t){var e=t&&t.__esModule?function(){return t.default}:function(){return t};return n.d(e,"a",e),e},n.o=function(t,e){return Object.prototype.hasOwnProperty.call(t,e)},n.p="",n(n.s=73)}({1:function(t,e,n){"use strict";n.d(e,"d",(function(){return c})),n.d(e,"j",(function(){return u})),n.d(e,"h",(function(){return s})),n.d(e,"q",(function(){return f})),n.d(e,"e",(function(){return p})),n.d(e,"l",(function(){return a})),n.d(e,"a",(function(){return l})),n.d(e,"k",(function(){return E})),n.d(e,"b",(function(){return d})),n.d(e,"u",(function(){return S})),n.d(e,"t",(function(){return A})),n.d(e,"v",(function(){return N})),n.d(e,"g",(function(){return _})),n.d(e,"r",(function(){return L})),n.d(e,"m",(function(){return O})),n.d(e,"n",(function(){return I})),n.d(e,"o",(function(){return T})),n.d(e,"i",(function(){return m})),n.d(e,"p",(function(){return h})),n.d(e,"f",(function(){return C})),n.d(e,"s",(function(){return R})),n.d(e,"c",(function(){return g}));var r=n(13),o=n.n(r),i=n(15),a={WELCOME_URL:"https://similarsites.com/welcome",UNINSTALL_URL:"https://similarsites.com/uninstall"},c={IFRAME_HEIGHT:"98%",IFRAME_WIDTH:"470px",OUTER_IFRAME_ID:"similarsites-outer-content",IFRAME_CONTENT_ID:"iframe-content",INNER_IFRAME_ID:"similarsites-inner-content",MAX_Z_INDEX:"2147483647",BODY_INTERVAL:100,STYLE_DATA_ID:"data-id",STYLE_DATA_ID_VALUE:"ss-animations",STYLE_DATA_PANEL:"data-panel",STYLE_DATA_PANEL_INSIDE:"ss-in",STYLE_DATA_PANEL_OUTSIDE:"ss-out",EVENTS:{SIMILARSITES_TOGGLE_PANEL:"similarweb-toggle-panel"},SOURCES:{SIMILARSITES_TOGGLE_PANEL:"SIMILARSITES_TOGGLE_PANEL",SIMILARSITES_CLICK_OUTSIDE:"SIMILARSITES_CLICK_OUTSIDE"}},u={TOGGLE_POPUP:"togglePopup",GA_EVENT:"gaEvent",FETCH_DATA:"fetchData",OPEN_URL_IN_NEW_TAB:"openUrlInNewTab",UPDATE_KEY:"updateKey",UPDATE_ALL_PAGES:"updateAllPages",UPDATE_STORE:"updateStore",CLEAR_KEY:"clearKey",IS_INSTALLED:"isInstalled",TOGGLE_POPUP_FROM_IFRAME:"togglePopupFromIframe",UPDATE_CONTEXT_MENU:"updateContextMenu"},s={CATEGORIES:{MAIN_KPIS:"Main KPIs",API:"API",PANEL:"Panel",POPUP:"Popup",HEADER:"Header",FOOTER:"Footer",SHARE_MODAL:"Share Modal",RATE_MODAL:"Rate Modal",ONBOARDING:"Onboarding",SORT:"Sort",SIMILAR_SITE_CARD:"Similar Site Card",BROWSER_MENU:"Browser menu",ERROR_VIEW:"Error view"},ACTIONS:{INSTALL:"Install",UPDATE:"Update",EXTENSION_ICON_CLICK:"Extension Icon Click",PAST_TIME_ON_PAGE:"Past Time On Page",TIME_TO_FETCH:"Time To Fetch",REQUEST:"Request",RESPONSE:"Response",TIME_OPEN:"Time Open",POPUP_SHOWN:"Popup Shown",POPUP_CLOSED:"Popup Closed",ERROR_VIEW_SHOWN:"Error View Shown",GLOBAL_RANK_BUCKET:"Global Rank Bucket",MONTHLY_VISITS_BUCKET:"Monthly Visits Bucket",SHOW_PANEL:"Show Panel",HIDE_PANEL:"Hide Panel",OVERLAY_SHOWN:"Overlay Shown",OVERLAY_CLOSED:"Overlay Closed",MENU_CLICKED:"Menu Clicked",MENU_ITEM_CLICKED:"Menu Item Clicked",SHARE_BUTTON_CLICKED:"Share Button Clicked",RATE_BUTTON_CLICKED:"Rate Button Clicked",DATA_VIEW_SHOWN:"Data View Shown",TAB_CLICK:"Tab Click",CLICK_ON_CONTENT:"Click On Content",NO_DATA_VIEW_SHOWN:"No Data View Shown",SHOWN:"Shown",CLICK_NEXT_SCREEN:"Click Next Screen ",CLICK_GET_STARTED:"Click Get Started",CLICK_CLOSE_BUTTON:"Click Close Button",CLICK_SKIP_BUTTON:"Click Skip Button ",CLICK_LOGO:"Click On Logo",CLICK_CONNECT_TO_SIMILARWEB:"Click connect to SimilarWeb",OPEN_URL:"Open URL",CLICK_SIMILARITY:"Click Similarity",SCREENSHOT_ERROR:"Screenshot Error",FAVICON_ERROR:"Favicon Error",OPT_IN_CLICK:"Opt in clicked",OPT_OUT_CLICK:"Opt out clicked",TIME_TO_CLICK:"Time to click since page load",TIME_TO_LOAD_PANEL:"Time to load panel since click on browserAction",TIME_TO_SHOW_DATA_IN_PANEL:"Time to show data in panel since click on browserAction",DOMAIN_PARSE_ERROR:"Domain parse error",CLICK:"Click"},LABELS:{MILLISECONDS:"Milliseconds",DURATION:"Duration",FAIL:"Fail",DATA_VIEW:"Data",ERROR_VIEW:"Error",OPEN:"Open",CLOSE:"Close",FEEDBACK:"Feedback",RATE:"Rate",SHARE:"Share",EMAIL:"Email",FACEBOOK:"Facebook",TWITTER:"Twitter",COPY_LINK:"Copy Link",VALID_DATA:"Valid data",INVALID_DATA:"Invalid data",NO_SIMILAR_SITES_FOUND:"No similar sites found",RESPONSE_ERROR:"Response error",MONTHLY_VISITS:"Monthly visits",CATEGORY_RANK:"Category rank",COUNTRY_RANK:"Country rank",SHOW_MORE_SIMILARSITES:"ShowMoreSimilarsites"},UTM_SOURCE:{EXTENSION:"extension"},UTM_MEDIUM:{CARD:"card"},UTM_CONTENT:{NEW_URL_LINK:"newurllink",SHOW_MORE_LINK:"showmorelink"},CUSTOM_DIMENSIONS:{TRUE:"TRUE",FALSE:"FALSE"}},l={PATH:"https://serving-api.similarsites.com",ENDPOINT:"/data"},E="popup/popup.html",d=["chrome://","chrome-extension://","https://chrome.google.com/webstore/","about:","https://addons.mozilla.org","moz-extension://"],f={GA:{OVERRIDE_SAMPLING:"overrideSampling",INSTALLED_AT:"installedAt",AGE:"age",LAST_AGE:"lastAge",D1:"D1",D7:"D7",D14:"D14",D28:"D28",D90:"D90",USER_TYPE:"userType"},OPTEDOUT:"optedout",DID_ONBOARD:"didOnboard"},p=o()({},f.OPTEDOUT,!1),S={LOADING:"LoadingView",DATA:"DataView",ERROR:"ErrorView",NO_DATA:"NoDataView"},h={MONTHLY_VISITS:"TotalVisits",CATEGORY_RANK:"CategoryRank",COUNTRY_RANK:"TopCountryRank"},_=["https://forms.gle/mpgkMTK96Ymvp1sw7","https://docs.google.com/forms/d/e/1FAIpQLSeI-ciZD-Lm2_pLK9bIcIsXXW68tUPuDS0EVju1bBLqjrzOtA/viewform"],A={NEW:"New",OLD:"Old"},L=[f.DID_ONBOARD,f.OPTEDOUT],O="https://www.similarsites.com",I="https://www.similarsites.com/site",T="https://www.similarweb.com/ga/connect",m="https://www.google.com/s2/favicons",C={SIMILARWEB:"hoklmmgfnpapgjgcpechhaamimifchmp"},R={FIRST:1,SECOND:2},g={CHROME:"chrome",FIREFOX:"firefox"},N=Object(i.a)()===g.FIREFOX?"https://addons.mozilla.org/firefox/addon/similarsites/":"https://chrome.google.com/webstore/detail/similar-sites-discover-re/necpbmbhhdiplmfhmjicabdeighkndkn"},11:function(t,e){function n(t,e,n,r,o,i,a){try{var c=t[i](a),u=c.value}catch(t){return void n(t)}c.done?e(u):Promise.resolve(u).then(r,o)}t.exports=function(t){return function(){var e=this,r=arguments;return new Promise((function(o,i){var a=t.apply(e,r);function c(t){n(a,o,i,c,u,"next",t)}function u(t){n(a,o,i,c,u,"throw",t)}c(void 0)}))}}},12:function(t,e,n){"use strict";n.d(e,"a",(function(){return r}));var r={SELECTORS:{SEARCH_RESULTS:"#search .g .rc .yuRUbf"},CLASSES:{LINK:{BASE:"ss_serp_link",RTL:"ss_serp_link_rtl",LTR:"ss_serp_link_ltr"},OVERLAY:{BASE:"ss_serp_overlay"}},ELEMENTS:{OVERLAY:"serp_overlay"},LINK_WIDTH:120,OVERLAY:{WIDTH:384,HEIGHT:265,MARGIN:12,ARROW_OFFSET_FROM_TOP:25,ID:"ss_inner_overlay"},GA:{CATEGORY:"Serp",ACTIONS:{FOUND:"Found on page",APPENDED:"Appended to page",LINK_CLICKED:"View Similar Sites clicked",CLOSED:"Clicked outside the overlay for closing it",SS_LOGO_CLICK:"SimilarSites logo clicked",VIEW_MORE_CLICKED:"View more clicked",SIMILAR_SITE_CLICKED:"Similar Site clicked"},SAMPLE:10},SIMILARSITES_COM:{SITE_PREFIX:"https://www.similarsites.com/site/"}}},13:function(t,e){t.exports=function(t,e,n){return e in t?Object.defineProperty(t,e,{value:n,enumerable:!0,configurable:!0,writable:!0}):t[e]=n,t}},15:function(t,e,n){"use strict";n.d(e,"a",(function(){return r}));var r=function(){return void 0!==window.InstallTrigger?"firefox":"chrome"}},16:function(t,e,n){"use strict";n.d(e,"a",(function(){return u}));var r=n(4),o=n.n(r),i=n(6),a=n.n(i),c=n(1),u=function(){function t(){o()(this,t)}return a()(t,null,[{key:"sendEvent",value:function(t){chrome.runtime.sendMessage(Object.assign({},{action:c.j.GA_EVENT},t),(function(){if(chrome.runtime.lastError)return!1}))}}]),t}()},28:function(t,e,n){var r=function(t){"use strict";var e=Object.prototype,n=e.hasOwnProperty,r="function"==typeof Symbol?Symbol:{},o=r.iterator||"@@iterator",i=r.asyncIterator||"@@asyncIterator",a=r.toStringTag||"@@toStringTag";function c(t,e,n,r){var o=e&&e.prototype instanceof l?e:l,i=Object.create(o.prototype),a=new T(r||[]);return i._invoke=function(t,e,n){var r="suspendedStart";return function(o,i){if("executing"===r)throw new Error("Generator is already running");if("completed"===r){if("throw"===o)throw i;return C()}for(n.method=o,n.arg=i;;){var a=n.delegate;if(a){var c=L(a,n);if(c){if(c===s)continue;return c}}if("next"===n.method)n.sent=n._sent=n.arg;else if("throw"===n.method){if("suspendedStart"===r)throw r="completed",n.arg;n.dispatchException(n.arg)}else"return"===n.method&&n.abrupt("return",n.arg);r="executing";var l=u(t,e,n);if("normal"===l.type){if(r=n.done?"completed":"suspendedYield",l.arg===s)continue;return{value:l.arg,done:n.done}}"throw"===l.type&&(r="completed",n.method="throw",n.arg=l.arg)}}}(t,n,a),i}function u(t,e,n){try{return{type:"normal",arg:t.call(e,n)}}catch(t){return{type:"throw",arg:t}}}t.wrap=c;var s={};function l(){}function E(){}function d(){}var f={};f[o]=function(){return this};var p=Object.getPrototypeOf,S=p&&p(p(m([])));S&&S!==e&&n.call(S,o)&&(f=S);var h=d.prototype=l.prototype=Object.create(f);function _(t){["next","throw","return"].forEach((function(e){t[e]=function(t){return this._invoke(e,t)}}))}function A(t){var e;this._invoke=function(r,o){function i(){return new Promise((function(e,i){!function e(r,o,i,a){var c=u(t[r],t,o);if("throw"!==c.type){var s=c.arg,l=s.value;return l&&"object"==typeof l&&n.call(l,"__await")?Promise.resolve(l.__await).then((function(t){e("next",t,i,a)}),(function(t){e("throw",t,i,a)})):Promise.resolve(l).then((function(t){s.value=t,i(s)}),(function(t){return e("throw",t,i,a)}))}a(c.arg)}(r,o,e,i)}))}return e=e?e.then(i,i):i()}}function L(t,e){var n=t.iterator[e.method];if(void 0===n){if(e.delegate=null,"throw"===e.method){if(t.iterator.return&&(e.method="return",e.arg=void 0,L(t,e),"throw"===e.method))return s;e.method="throw",e.arg=new TypeError("The iterator does not provide a 'throw' method")}return s}var r=u(n,t.iterator,e.arg);if("throw"===r.type)return e.method="throw",e.arg=r.arg,e.delegate=null,s;var o=r.arg;return o?o.done?(e[t.resultName]=o.value,e.next=t.nextLoc,"return"!==e.method&&(e.method="next",e.arg=void 0),e.delegate=null,s):o:(e.method="throw",e.arg=new TypeError("iterator result is not an object"),e.delegate=null,s)}function O(t){var e={tryLoc:t[0]};1 in t&&(e.catchLoc=t[1]),2 in t&&(e.finallyLoc=t[2],e.afterLoc=t[3]),this.tryEntries.push(e)}function I(t){var e=t.completion||{};e.type="normal",delete e.arg,t.completion=e}function T(t){this.tryEntries=[{tryLoc:"root"}],t.forEach(O,this),this.reset(!0)}function m(t){if(t){var e=t[o];if(e)return e.call(t);if("function"==typeof t.next)return t;if(!isNaN(t.length)){var r=-1,i=function e(){for(;++r<t.length;)if(n.call(t,r))return e.value=t[r],e.done=!1,e;return e.value=void 0,e.done=!0,e};return i.next=i}}return{next:C}}function C(){return{value:void 0,done:!0}}return E.prototype=h.constructor=d,d.constructor=E,d[a]=E.displayName="GeneratorFunction",t.isGeneratorFunction=function(t){var e="function"==typeof t&&t.constructor;return!!e&&(e===E||"GeneratorFunction"===(e.displayName||e.name))},t.mark=function(t){return Object.setPrototypeOf?Object.setPrototypeOf(t,d):(t.__proto__=d,a in t||(t[a]="GeneratorFunction")),t.prototype=Object.create(h),t},t.awrap=function(t){return{__await:t}},_(A.prototype),A.prototype[i]=function(){return this},t.AsyncIterator=A,t.async=function(e,n,r,o){var i=new A(c(e,n,r,o));return t.isGeneratorFunction(n)?i:i.next().then((function(t){return t.done?t.value:i.next()}))},_(h),h[a]="Generator",h[o]=function(){return this},h.toString=function(){return"[object Generator]"},t.keys=function(t){var e=[];for(var n in t)e.push(n);return e.reverse(),function n(){for(;e.length;){var r=e.pop();if(r in t)return n.value=r,n.done=!1,n}return n.done=!0,n}},t.values=m,T.prototype={constructor:T,reset:function(t){if(this.prev=0,this.next=0,this.sent=this._sent=void 0,this.done=!1,this.delegate=null,this.method="next",this.arg=void 0,this.tryEntries.forEach(I),!t)for(var e in this)"t"===e.charAt(0)&&n.call(this,e)&&!isNaN(+e.slice(1))&&(this[e]=void 0)},stop:function(){this.done=!0;var t=this.tryEntries[0].completion;if("throw"===t.type)throw t.arg;return this.rval},dispatchException:function(t){if(this.done)throw t;var e=this;function r(n,r){return a.type="throw",a.arg=t,e.next=n,r&&(e.method="next",e.arg=void 0),!!r}for(var o=this.tryEntries.length-1;o>=0;--o){var i=this.tryEntries[o],a=i.completion;if("root"===i.tryLoc)return r("end");if(i.tryLoc<=this.prev){var c=n.call(i,"catchLoc"),u=n.call(i,"finallyLoc");if(c&&u){if(this.prev<i.catchLoc)return r(i.catchLoc,!0);if(this.prev<i.finallyLoc)return r(i.finallyLoc)}else if(c){if(this.prev<i.catchLoc)return r(i.catchLoc,!0)}else{if(!u)throw new Error("try statement without catch or finally");if(this.prev<i.finallyLoc)return r(i.finallyLoc)}}}},abrupt:function(t,e){for(var r=this.tryEntries.length-1;r>=0;--r){var o=this.tryEntries[r];if(o.tryLoc<=this.prev&&n.call(o,"finallyLoc")&&this.prev<o.finallyLoc){var i=o;break}}i&&("break"===t||"continue"===t)&&i.tryLoc<=e&&e<=i.finallyLoc&&(i=null);var a=i?i.completion:{};return a.type=t,a.arg=e,i?(this.method="next",this.next=i.finallyLoc,s):this.complete(a)},complete:function(t,e){if("throw"===t.type)throw t.arg;return"break"===t.type||"continue"===t.type?this.next=t.arg:"return"===t.type?(this.rval=this.arg=t.arg,this.method="return",this.next="end"):"normal"===t.type&&e&&(this.next=e),s},finish:function(t){for(var e=this.tryEntries.length-1;e>=0;--e){var n=this.tryEntries[e];if(n.finallyLoc===t)return this.complete(n.completion,n.afterLoc),I(n),s}},catch:function(t){for(var e=this.tryEntries.length-1;e>=0;--e){var n=this.tryEntries[e];if(n.tryLoc===t){var r=n.completion;if("throw"===r.type){var o=r.arg;I(n)}return o}}throw new Error("illegal catch attempt")},delegateYield:function(t,e,n){return this.delegate={iterator:m(t),resultName:e,nextLoc:n},"next"===this.method&&(this.arg=void 0),s}},t}(t.exports);try{regeneratorRuntime=r}catch(t){Function("r","regeneratorRuntime = r")(r)}},4:function(t,e){t.exports=function(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}},5:function(t,e,n){t.exports=n(28)},6:function(t,e){function n(t,e){for(var n=0;n<e.length;n++){var r=e[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(t,r.key,r)}}t.exports=function(t,e,r){return e&&n(t.prototype,e),r&&n(t,r),t}},73:function(t,e,n){"use strict";n.r(e),n.d(e,"onPageCss",(function(){return d})),n.d(e,"appendCSSToPage",(function(){return f})),n.d(e,"appendSerpView",(function(){return p})),n.d(e,"positionOverlay",(function(){return S})),n.d(e,"serpLinkClick",(function(){return h})),n.d(e,"createLink",(function(){return _})),n.d(e,"getOnPageSearchResults",(function(){return A})),n.d(e,"isUrlInSerpResults",(function(){return L})),n.d(e,"shouldCreateInNewLine",(function(){return O})),n.d(e,"setClickOutsideEventForClosing",(function(){return I})),n.d(e,"startFlow",(function(){return T}));var r=n(5),o=n.n(r),i=n(11),a=n.n(i),c=n(1),u=n(12),s=n(16),l="rtl"===document.dir,E=l?u.a.CLASSES.LINK.RTL:u.a.CLASSES.LINK.LTR,d="\n                           .".concat(u.a.CLASSES.LINK.BASE,"\n                           {\n                                cursor:pointer;\n                                user-select:none;\n                                color:#5d5656;\n                                opacity:0.8;\n                            }\n                           .").concat(u.a.CLASSES.LINK.BASE,":hover\n                           {\n                                opacity:0.6;\n                           }\n                           .").concat(u.a.CLASSES.LINK.BASE,":active\n                           {\n                                opacity:1;\n                           }\n                           .").concat(u.a.CLASSES.LINK.LTR,"\n                           {\n                            margin-left: 3px;\n                           }\n                           .").concat(u.a.CLASSES.LINK.RTL,"\n                           {\n                           margin-right: 3px;\n                           }\n                           .").concat(u.a.CLASSES.OVERLAY.BASE,"\n                           {\n                               border:none;\n                               overflow:unset;\n                               display:none;\n                               position:absolute;\n                               width:").concat(u.a.OVERLAY.WIDTH,"px;\n                               height:").concat(u.a.OVERLAY.HEIGHT,"px;\n                               z-index:").concat(c.d.MAX_Z_INDEX,";\n                           }\n                       "),f=function(){var t=document.createElement("style");t.innerHTML=d,document.head.appendChild(t)},p=function(t){return new Promise((function(e){var n=document.getElementById(u.a.ELEMENTS.OVERLAY);n&&n.parentElement.removeChild(n);var r=document.createElement("iframe");r.id=u.a.ELEMENTS.OVERLAY,r.className=u.a.CLASSES.OVERLAY.BASE,r.src=chrome.runtime.getURL("serp_overlay/serp_overlay.html?pageDirection=".concat(document.dir||"ltr","&data=").concat(encodeURIComponent(JSON.stringify(t)))),r.onload=function(){e(r)},document.body.appendChild(r)}))},S=function(t,e){var n=t.getBoundingClientRect();e.style.left="".concat(l?n.x+window.scrollX-u.a.OVERLAY.WIDTH-u.a.OVERLAY.MARGIN:n.x+window.scrollX+n.width+u.a.OVERLAY.MARGIN,"px"),e.style.top="".concat(n.y+window.scrollY-u.a.OVERLAY.ARROW_OFFSET_FROM_TOP,"px")},h=function(){var t=a()(o.a.mark((function t(e){var n,r,i;return o.a.wrap((function(t){for(;;)switch(t.prev=t.next){case 0:if(n=e.target.getAttribute("url")){t.next=3;break}return t.abrupt("return");case 3:if(r=window.serp_data.find((function(t){return n===t.url}))){t.next=6;break}return t.abrupt("return");case 6:return t.next=8,p(r);case 8:i=t.sent,S(e.target,i),i.style.display="block",s.a.sendEvent({gaCategory:u.a.GA.CATEGORY,gaAction:u.a.GA.ACTIONS.LINK_CLICKED,gaLabel:n,gaSampleOverride:u.a.GA.SAMPLE});case 12:case"end":return t.stop()}}),t)})));return function(e){return t.apply(this,arguments)}}(),_=function(t){var e=document.createElement("span");return e.innerText=chrome.i18n.getMessage("getSimilarSite"),e.classList.add(u.a.CLASSES.LINK.BASE),e.setAttribute("url",t),e.classList.add(E),e.onclick=h,e},A=function(){return document.querySelectorAll(u.a.SELECTORS.SEARCH_RESULTS)},L=function(t){return window.serp_data.some((function(e){return e.url===t&&e.sites.length>0}))},O=function(t){return t.querySelector("a").offsetWidth+u.a.LINK_WIDTH>t.offsetWidth},I=function(){document.body.addEventListener("click",(function(t){var e=document.getElementById(u.a.ELEMENTS.OVERLAY);e&&(t.target.className.includes(u.a.CLASSES.LINK.BASE)||(s.a.sendEvent({gaCategory:u.a.GA.CATEGORY,gaAction:u.a.GA.ACTIONS.CLOSED,gaSampleOverride:u.a.GA.SAMPLE}),e.parentElement.removeChild(e)))}))},T=function(){if(window.serp_data&&window.serp_data.length>0){s.a.sendEvent({gaCategory:u.a.GA.CATEGORY,gaAction:u.a.GA.ACTIONS.FOUND,gaLabel:window.serp_data.length,gaSampleOverride:u.a.GA.SAMPLE}),f(),I();var t=A(),e=0;t.forEach((function(t){var n=t.childNodes&&t.childNodes[0]&&t.childNodes[0].href;if(n&&L(n)){t.querySelectorAll(".".concat(u.a.CLASSES.LINK.BASE)).forEach((function(t){t.parentElement.removeChild(t)}));var r=_(n);O(t)&&t.appendChild(document.createElement("br")),t.appendChild(r),e++}})),s.a.sendEvent({gaCategory:u.a.GA.CATEGORY,gaAction:u.a.GA.ACTIONS.APPENDED,gaLabel:e,gaSampleOverride:u.a.GA.SAMPLE})}};T()}});