(e=>{function t(t){for(var n,o,r=t[0],l=t[1],c=t[2],d=0,u=[];d<r.length;d++)o=r[d],Object.prototype.hasOwnProperty.call(a,o)&&a[o]&&u.push(a[o][0]),a[o]=0;for(n in l)Object.prototype.hasOwnProperty.call(l,n)&&(e[n]=l[n]);for(p&&p(t);u.length;)u.shift()();return i.push.apply(i,c||[]),s()}function s(){for(var e,t=0;t<i.length;t++){for(var s=i[t],n=!0,r=1;r<s.length;r++){var l=s[r];0!==a[l]&&(n=!1)}n&&(i.splice(t--,1),e=o(o.s=s[0]))}return e}var n={},a={8:0},i=[];function o(t){if(n[t])return n[t].exports;var s=n[t]={i:t,l:!1,exports:{}};return e[t].call(s.exports,s,s.exports,o),s.l=!0,s.exports}o.m=e,o.c=n,o.d=(e,t,s)=>{o.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:s})},o.r=e=>{"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},o.t=(e,t)=>{if(1&t&&(e=o(e)),8&t)return e;if(4&t&&"object"==typeof e&&e&&e.__esModule)return e;var s=Object.create(null);if(o.r(s),Object.defineProperty(s,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var n in e)o.d(s,n,(t=>e[t]).bind(null,n));return s},o.n=e=>{var t=e&&e.__esModule?()=>e.default:()=>e;return o.d(t,"a",t),t},o.o=(e,t)=>Object.prototype.hasOwnProperty.call(e,t),o.p="";var r=window.webpackJsonp=window.webpackJsonp||[],l=r.push.bind(r);r.push=t,r=r.slice();for(var c=0;c<r.length;c++)t(r[c]);var p=l;i.push([133,1,3,0]),s()})({130:(e,t,s)=>{"use strict";var n=s(39);s.n(n).a},133:function(e,t,s){"use strict";s.r(t);var n=s(15),a=s(0),i=s(4),o=s(21),r=s(1),l=s(20),c=(s(45),s(5)),p=s.n(c),d=s(17),u=s.n(d),m=s(2),b=s(11);const f={scripts:[],frameScripts:[],commands:[],domain:"",injectable:!0,blacklisted:!1},g={isApplied:m.a.get("isApplied"),filtersPopup:m.a.get("filtersPopup")||{}};m.a.hook(e=>{"isApplied"in e&&(g.isApplied=e.isApplied),"filtersPopup"in e&&(g.filtersPopup=p()({},g.filtersPopup,{},e.filtersPopup))});var h={components:{Icon:b.a,Tooltip:u.a},data:()=>({store:f,options:g,activeMenu:"scripts",message:null}),computed:{injectionScopes(){const{sort:e,enabledFirst:t,hideDisabled:s}=this.options.filtersPopup,n="alpha"===e||t;return[["scripts",Object(a.n)("menuMatchedScripts")],["frameScripts",Object(a.n)("menuMatchedFrameScripts")]].map(([i,o])=>{let r=this.store[i];const l=r.length,c=r.reduce((e,t)=>e+t.config.enabled,0);return s&&(r=r.filter(e=>e.config.enabled)),r=r.map((s,i)=>{const o=s.custom.name||Object(a.k)(s.meta,"name");return{name:o,data:s,key:n&&`${t&&+!s.config.enabled}${"alpha"===e?o.toLowerCase():`${1e6+i}`.slice(1)}`}}),n&&r.sort((e,t)=>e.key<t.key?-1:e.key>t.key),l&&{name:i,title:o,list:r,totals:c<l?`${c} / ${l}`:`${l}`}}).filter(Boolean)},failureReason:()=>[!f.injectable&&"noninjectable",f.blacklisted&&"blacklisted",!1===g.isApplied&&"scripts-disabled"].filter(Boolean).join(" "),failureReasonText:()=>!f.injectable&&Object(a.n)("failureReasonNoninjectable")||f.blacklisted&&Object(a.n)("failureReasonBlacklisted")||!1===g.isApplied&&Object(a.n)("menuScriptDisabled")||""},methods:{toggleMenu(e){this.activeMenu=this.activeMenu===e?null:e},getSymbolCheck:e=>`toggle-${e?"on":"off"}`,scriptIconUrl(e){const{icon:t}=e.data.meta;return(e.data.custom.pathMap||{})[t]||t||null},scriptIconError(e){e.target.removeAttribute("src")},onToggle(){m.a.set("isApplied",!this.options.isApplied),this.checkReload()},onManage(){browser.runtime.openOptionsPage(),window.close()},onVisitWebsite(){Object(a.w)("TabOpen",{url:"https://violentmonkey.github.io/"}),window.close()},onEditScript(e){Object(a.w)("TabOpen",{url:`/options/index.html#scripts/${e.data.props.id}`}),window.close()},onFindSameDomainScripts(){Object(a.w)("TabOpen",{url:`https://greasyfork.org/scripts/by-site/${encodeURIComponent(this.store.domain)}`}),window.close()},onCommand(e,t){Object(a.x)(f.currentTab.id,"Command",`${e}:${t}`)},onToggleScript(e){const{data:t}=e,s=!t.config.enabled;Object(a.w)("UpdateScriptInfo",{id:t.props.id,config:{enabled:s}}).then(()=>{t.config.enabled=s,this.checkReload()})},checkReload(){m.a.get("autoReload")&&browser.tabs.reload(this.store.currentTab.id)},async onCreateScript(){const{currentTab:e,domain:t}=this.store,s=t&&await Object(a.w)("CacheNewScript",{url:e.url.split(/[#?]/)[0],name:`- ${t}`});Object(a.w)("TabOpen",{url:`/options/index.html#scripts/_new${s?`/${s}`:""}`}),window.close()}}},v=(s(130),s(3)),y=Object(v.a)(h,(function(){var e=this,t=e.$createElement,s=e._self._c||t;return s("div",{staticClass:"page-popup",attrs:{"data-failure-reason":e.failureReason}},[s("div",{staticClass:"flex menu-buttons"},[s("div",{staticClass:"logo",class:{disabled:!e.options.isApplied}},[s("img",{attrs:{src:"/public/images/icon128.png"}})]),s("div",{staticClass:"flex-1 ext-name",class:{disabled:!e.options.isApplied},domProps:{textContent:e._s(e.i18n("extName"))}}),s("tooltip",{staticClass:"menu-area",class:{disabled:!e.options.isApplied},attrs:{content:e.options.isApplied?e.i18n("menuScriptEnabled"):e.i18n("menuScriptDisabled"),placement:"bottom",align:"end"},nativeOn:{click:t=>e.onToggle(t)}},[s("icon",{attrs:{name:e.getSymbolCheck(e.options.isApplied)}})],1),s("tooltip",{staticClass:"menu-area",attrs:{content:e.i18n("menuDashboard"),placement:"bottom",align:"end"},nativeOn:{click:t=>e.onManage(t)}},[s("icon",{attrs:{name:"cog"}})],1),s("tooltip",{staticClass:"menu-area",attrs:{content:e.i18n("menuNewScript"),placement:"bottom",align:"end"},nativeOn:{click:t=>e.onCreateScript(t)}},[s("icon",{attrs:{name:"plus"}})],1)],1),e.store.injectable?s("div",{directives:[{name:"show",rawName:"v-show",value:e.store.domain,expression:"store.domain"}],staticClass:"menu"},[s("div",{staticClass:"menu-item menu-area menu-find",on:{click:e.onFindSameDomainScripts}},[s("icon",{attrs:{name:"search"}}),s("div",{staticClass:"flex-1",domProps:{textContent:e._s(e.i18n("menuFindScripts"))}})],1)]):e._e(),e.failureReasonText?s("div",{staticClass:"failure-reason"},[s("span",{domProps:{textContent:e._s(e.failureReasonText)}}),e.store.blacklisted?s("code",{staticClass:"ellipsis inline-block",domProps:{textContent:e._s(e.store.blacklisted)}}):e._e()]):e._e(),e._l(e.store.injectable&&e.injectionScopes,t=>s("div",{key:t.name,staticClass:"menu menu-scripts",class:{expand:e.activeMenu===t.name},attrs:{"data-type":t.name}},[s("div",{staticClass:"menu-item menu-area menu-group",on:{click:s=>e.toggleMenu(t.name)}},[s("div",{staticClass:"flex-auto",attrs:{"data-totals":t.totals},domProps:{textContent:e._s(t.title)}}),s("icon",{staticClass:"icon-collapse",attrs:{name:"arrow"}})],1),s("div",{staticClass:"submenu"},e._l(t.list,(t,n)=>s("div",{key:n,class:{disabled:!t.data.config.enabled},on:{mouseenter:s=>{e.message=t.name},mouseleave:t=>{e.message=""}}},[s("div",{staticClass:"menu-item menu-area",on:{click:s=>e.onToggleScript(t)}},[s("img",{staticClass:"script-icon",attrs:{src:e.scriptIconUrl(t)},on:{error:e.scriptIconError}}),s("icon",{attrs:{name:e.getSymbolCheck(t.data.config.enabled)}}),s("div",{staticClass:"flex-auto ellipsis",domProps:{textContent:e._s(t.name)},on:{click:s=>s.ctrlKey?s.shiftKey||s.altKey||s.metaKey?null:(s.stopPropagation(),e.onEditScript(t)):null,contextmenu:s=>s.ctrlKey||s.shiftKey||s.altKey||s.metaKey?null:(s.stopPropagation(),e.onEditScript(t)),mousedown:s=>"button"in s&&1!==s.button?null:s.ctrlKey||s.shiftKey||s.altKey||s.metaKey?null:(s.stopPropagation(),e.onEditScript(t))}})],1),s("div",{staticClass:"submenu-buttons"},[s("div",{staticClass:"submenu-button",on:{click:s=>e.onEditScript(t)}},[s("icon",{attrs:{name:"code"}})],1)]),s("div",{staticClass:"submenu-commands"},e._l(e.store.commands[t.data.props.id],(n,a)=>s("div",{key:a,staticClass:"menu-item menu-area",on:{click:s=>e.onCommand(t.data.props.id,n),mouseenter:t=>{e.message=n},mouseleave:s=>{e.message=t.name}}},[s("icon",{attrs:{name:"command"}}),s("div",{staticClass:"flex-auto ellipsis",domProps:{textContent:e._s(n)}})],1)),0)])),0)])),s("footer",[s("span",{domProps:{textContent:e._s(e.i18n("visitWebsite"))},on:{click:e.onVisitWebsite}})]),e.message?s("div",{staticClass:"message"},[s("div",{domProps:{textContent:e._s(e.message)}})]):e._e()],2)}),[],!1,null,null,null).exports;l.c(),n.default.prototype.i18n=a.n;const C=new n.default({render:e=>e(y)}).$mount();document.body.append(C.$el);const w=[],k={};k.ready=new Promise(e=>{k.resolve=e,setTimeout(e,100)}),Object.assign(o.a,{async SetPopup(e,t){if(f.currentTab.id!==t.tab.id)return;const s=0===t.frameId;s||await k.ready;const n=e.ids.filter(e=>!w.includes(e));var i;w.push(...n),s&&(k.resolve(),f.commands=(i=e.menus,r.d).call(i,([,e])=>Object.keys(e).sort())),n.length&&f[s?"scripts":"frameScripts"].push(...await Object(a.w)("GetMetas",n))}}),Object(a.i)().then(async({id:e,url:t})=>{if(f.currentTab={id:e,url:t},browser.runtime.connect({name:`${e}`}),/^https?:\/\//i.test(t)){const e=t.match(/:\/\/([^/]*)/)[1];f.domain=l.a(e)||e}i.c.test(t)?f.blacklisted=await Object(a.w)("TestBlacklist",t):f.injectable=!1})},39:(e,t,s)=>{}});