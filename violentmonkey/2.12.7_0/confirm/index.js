(t=>{function e(e){for(var n,o,i=e[0],l=e[1],c=e[2],u=0,d=[];u<i.length;u++)o=i[u],Object.prototype.hasOwnProperty.call(r,o)&&r[o]&&d.push(r[o][0]),r[o]=0;for(n in l)Object.prototype.hasOwnProperty.call(l,n)&&(t[n]=l[n]);for(h&&h(e);d.length;)d.shift()();return a.push.apply(a,c||[]),s()}function s(){for(var t,e=0;e<a.length;e++){for(var s=a[e],n=!0,i=1;i<s.length;i++){var l=s[i];0!==r[l]&&(n=!1)}n&&(a.splice(e--,1),t=o(o.s=s[0]))}return t}var n={},r={6:0},a=[];function o(e){if(n[e])return n[e].exports;var s=n[e]={i:e,l:!1,exports:{}};return t[e].call(s.exports,s,s.exports,o),s.l=!0,s.exports}o.m=t,o.c=n,o.d=(t,e,s)=>{o.o(t,e)||Object.defineProperty(t,e,{enumerable:!0,get:s})},o.r=t=>{"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(t,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(t,"__esModule",{value:!0})},o.t=(t,e)=>{if(1&e&&(t=o(t)),8&e)return t;if(4&e&&"object"==typeof t&&t&&t.__esModule)return t;var s=Object.create(null);if(o.r(s),Object.defineProperty(s,"default",{enumerable:!0,value:t}),2&e&&"string"!=typeof t)for(var n in t)o.d(s,n,(e=>t[e]).bind(null,n));return s},o.n=t=>{var e=t&&t.__esModule?()=>t.default:()=>t;return o.d(e,"a",e),e},o.o=(t,e)=>Object.prototype.hasOwnProperty.call(t,e),o.p="";var i=window.webpackJsonp=window.webpackJsonp||[],l=i.push.bind(i);i.push=e,i=i.slice();for(var c=0;c<i.length;c++)e(i[c]);var h=l;a.push([134,1,2,0]),s()})({128:(t,e,s)=>{"use strict";var n=s(38);s.n(n).a},129:(t,e,s)=>{},134:function(t,e,s){"use strict";s.r(e);var n=s(15),r=s(0),a=(s(21),s(2)),o=(s(45),s(42)),i=s.n(o),l=s(40),c=s(43),h=s(14),u=s(13);const d=Object(l.a)({});var p={components:{Dropdown:i.a,VmCode:c.default,SettingCheck:h.a},data(){return{installable:!1,dependencyOK:!1,closeAfterInstall:a.a.get("closeAfterInstall"),message:"",code:"",commands:{close:this.close},info:{}}},computed:{isLocal(){return!Object(r.q)(this.info.url)}},mounted(){this.message=this.i18n("msgLoadingData"),this.loadInfo().then(()=>{const t=u.b.paths[0];this.guard=setInterval(()=>{Object(r.w)("CacheHit",{key:`confirm-${t}`})},5e3)},()=>(this.close(),Promise.reject())).then(this.loadData).then(this.parseMeta)},beforeDestroy(){this.guard&&(clearInterval(this.guard),this.guard=null)},methods:{loadInfo(){const t=u.b.paths[0];return Object(r.w)("CacheLoad",`confirm-${t}`).then(t=>{if(!t)return Promise.reject();this.info=t})},loadData(t){this.installable=!1;const{code:e}=this;return this.getScript(this.info.url).then(s=>{if(t&&e===s)return Promise.reject();this.code=s})},parseMeta(){return Object(r.w)("ParseMeta",this.code).then(t=>{const e=Object.keys(t.resources).map(e=>t.resources[e]),s=t.require.length+e.length;if(!s)return;let n=0;const a=[],o=()=>{this.message=this.i18n("msgLoadingDependency",[n,s])};o(),this.require={},this.resources={};const i=t.require.map(t=>{const e=Object(r.j)(t,this.info.url);return this.getFile(e,{useCache:!0}).then(t=>{this.require[e]=t})}).concat(e.map(t=>{const e=Object(r.j)(t,this.info.url);return this.getFile(e,{isBlob:!0,useCache:!0}).then(t=>{this.resources[e]=t})})).map(t=>t.then(()=>{n+=1,o()},t=>{a.push(t)}));return Promise.all(i).then(()=>{if(a.length)return Promise.reject(a.join("\n"));this.dependencyOK=!0})}).then(()=>{this.message=this.i18n("msgLoadedData"),this.installable=!0},t=>(this.message=this.i18n("msgErrorLoadingDependency",[t]),Promise.reject()))},close(){Object(r.w)("TabClose")},getFile(t,{isBlob:e,useCache:s}={}){const n=e?`blob+${t}`:`text+${t}`;return s&&d.has(n)?Promise.resolve(d.get(n)):Object(r.v)(t,{responseType:e?"arraybuffer":null}).then(({data:t})=>e?window.btoa(Object(r.a)(t)):t).then(t=>(s&&d.put(n,t),t))},getScript(t){return Object(r.w)("CacheLoad",t).then(t=>t||Promise.reject()).catch(()=>this.getFile(t)).catch(()=>{throw this.message=this.i18n("msgErrorLoadingData"),t})},getTimeString(){const t=new Date;return`${Object(r.r)(t.getHours(),2)}:${Object(r.r)(t.getMinutes(),2)}:${Object(r.r)(t.getSeconds(),2)}`},installScript(){this.installable=!1,Object(r.w)("ParseScript",{code:this.code,url:this.info.url,from:this.info.from,require:this.require,resources:this.resources}).then(t=>{this.message=`${t.update.message}[${this.getTimeString()}]`,this.closeAfterInstall?this.close():this.isLocal&&a.a.get("trackLocalFile")&&this.trackLocalFile()},t=>{this.message=`${t}`,this.installable=!0})},trackLocalFile(){Object(r.s)(2e3).then(()=>this.loadData(!0)).then(this.parseMeta).then(()=>{a.a.get("trackLocalFile")&&this.installScript()},()=>{this.trackLocalFile()})},checkClose(t){this.closeAfterInstall=t,t&&a.a.set("trackLocalFile",!1)}}},m=(s(128),s(3)),f=Object(m.a)(p,(function(){var t=this,e=t.$createElement,s=t._self._c||e;return s("div",{staticClass:"page-confirm frame flex flex-col h-100"},[s("div",{staticClass:"frame-block"},[s("div",{staticClass:"flex"},[s("h1",{staticClass:"hidden-sm"},[s("span",{domProps:{textContent:t._s(t.i18n("labelInstall"))}}),t._v(" - "),s("span",{domProps:{textContent:t._s(t.i18n("extName"))}})]),s("div",{staticClass:"flex-auto"}),s("div",[s("dropdown",{staticClass:"confirm-options",attrs:{align:"right"}},[s("button",{attrs:{slot:"toggle"},domProps:{textContent:t._s(t.i18n("buttonInstallOptions"))},slot:"toggle"}),s("label",[s("setting-check",{attrs:{name:"closeAfterInstall"},on:{change:t.checkClose}}),s("span",{staticClass:"ml-1",domProps:{textContent:t._s(t.i18n("installOptionClose"))}})],1),s("label",[s("setting-check",{attrs:{name:"trackLocalFile",disabled:t.closeAfterInstall}}),s("span",{staticClass:"ml-1",domProps:{textContent:t._s(t.i18n("installOptionTrack"))}})],1)]),s("button",{attrs:{disabled:!t.installable},domProps:{textContent:t._s(t.i18n("buttonConfirmInstallation"))},on:{click:t.installScript}}),s("button",{domProps:{textContent:t._s(t.i18n("buttonClose"))},on:{click:t.close}})],1)]),s("div",{staticClass:"flex"},[s("div",{staticClass:"ellipsis flex-auto mr-2",attrs:{title:t.info.url},domProps:{textContent:t._s(t.info.url)}}),s("div",{domProps:{textContent:t._s(t.message)}})])]),s("div",{staticClass:"frame-block flex-auto pos-rel"},[s("vm-code",{staticClass:"abs-full",attrs:{readonly:"",value:t.code,commands:t.commands}})],1)])}),[],!1,null,null,null).exports;s(129),n.default.prototype.i18n=r.n,document.title=`${Object(r.n)("labelInstall")} - ${Object(r.n)("extName")}`,a.a.ready.then(()=>{const t=document.createElement("div");document.body.appendChild(t),new n.default({render:t=>t(f)}).$mount(t)})},38:(t,e,s)=>{}});