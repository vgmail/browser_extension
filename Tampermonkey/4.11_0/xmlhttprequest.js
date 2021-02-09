'use strict';Registry.require(["helper","convert"],()=>{const x=Registry.get("helper"),y=Registry.get("convert");let z;const H=a=>a&&"http"==a.substr(0,4),M="internal user-agent accept-charset accept-encoding access-control-request-headers access-control-request-method connection content-length cookie cookie2 date dnt expect host keep-alive origin referer te trailer transfer-encoding upgrade via".split(" "),N={"cache-control":"no-cache",pragma:"no-cache"},I={"cache-control":"max-age=0, must-revalidate"},
J=a=>{if(a){const h={};Object.keys(a).forEach(l=>{let e=l,f=a[l];if(z.prefix){var m=l.toLowerCase();if(M.includes(m)||0===m.indexOf("proxy-")||0===m.indexOf("sec-"))e=z.prefix+l,f=null===f?"":y.encodeS(f)}else if(null===f)return;h[e]=f});return h}},A=a=>({responseXML:"",responseText:"",response:null,readyState:4,responseHeaders:"",status:0,statusText:"",error:a||"Forbidden"}),C=a=>{if("Blob"===a.type)return new Blob([y.str2arrbuf(a.value)]);if("File"===a.type)return new File([y.str2arrbuf(a.value)],
a.name,{type:a.meta,lastModified:a.lastModified||Date.now()});if("FormData"==a.type){const h=new FormData;Object.keys(a.value).forEach(l=>{const e="Array"===a.value[l].type,f=C(a.value[l]),m=e?f:[f];m.forEach((u,t)=>{h.append(l,m[t])})});return h}if("Array"===a.type||"Object"===a.type){let h,l,e;"Object"===a?(e=Object.keys(a.value),l=f=>f<e.length?e[f]:null,h={}):(l=f=>f<a.value.length?f:null,h=[]);for(let f,m=0;null!==(f=l(m));m++)h[f]=C(a.value[f]);return h}return a.value},B=a=>{const h={};a&&a.split("\n").forEach(l=>
{if(l=l.match(/^([^:]+): ?(.*)/)){const e=l[1].toLowerCase();h[e]=(void 0!==h[e]?", ":"")+(l[2]||"").replace(/,/g,"%2C")}});return h},O=a=>{a=a.split(";").filter(f=>"string"===typeof f&&!!f.trim());var h=a.shift().split("=");const l=h.shift();h=h.join("=");const e={name:l,value:decodeURIComponent(h)};a.forEach(function(f){var m=f.split("=");f=m.shift().trimLeft().toLowerCase();m=m.join("=");"expires"===f?(f=new Date(decodeURIComponent(m)),isNaN(f.getTime())||(e.expires=f)):"max-age"===f?e.maxAge=
parseInt(m,10):"secure"===f?e.secure=!0:"httponly"===f?e.httpOnly=!0:"samesite"===f?e.sameSite=m:e[f]=m});return e},P=(a,h,l)=>{void 0===l&&(l={});const e=x.assign({},h||{}),f=(g,q)=>{if(e[g])e[g]("function"==typeof q?q():q)};h=(g,q)=>{e[g]&&(f(g,q),e[g]=null)};if(l.internal||H(a.url)){var m=window.fetch&&a.url&&"http"==a.url.substr(0,4),u=!z.mozAnon&&a.anonymous,t=a.fetch;return m&&(u||t)?K(a,e,l,h,f):E(a,e,l,h,f)}console.warn("xhr: invalid scheme of url:",a.url);a=A("Invalid scheme");h("onerror",
a);h("ondone",a)},F="tm-finalurl"+rea.runtime.short_id.toLowerCase(),L="tm-setcookie"+rea.runtime.short_id.toLowerCase();var K=(a,h,l,e,f)=>{const m=c=>{const k=[];let n,r;c.headers&&(n=c.headers.get(F)||c.url,c.headers.forEach((p,v)=>{v=v.toLowerCase();[F,L].includes(v)||k.push(v+":"+p)}),(r=c.headers.get(L))&&k.push("set-cookie:"+r));return{readyState:4,responseHeaders:k.join("\n"),finalUrl:n,status:c.status,statusText:c.statusText}},u=c=>{x.splitSlice(c,parseInt(a.partialSize)).forEach(k=>{f("onpartial",
{partial:k})})};let t,g,q;const D=c=>{c&&(q=!0);d?d.abort():q?w():w({name:"AbortError",message:"Aborted by user"})},w=c=>{g||(q?(c=m({status:408,statusText:"Request Timeout"}),e("ontimeout")):"AbortError"==c.name?(c=A("aborted"),e("onabort")):(c=m({status:408,statusText:c.message||"Request Timeout"}),e("onerror",c)),g=!0,e("ondone",c))};try{var b={};b.method=a.method||"GET";b.redirect="follow";let c=J(a.headers);a.nocache?b.cache="reload":a.revalidate&&(b.cache="default",c=c||{},x.assign(c,I));b.credentials=
a.anonymous?"omit":"include";c&&(b.headers=new window.Headers(c));void 0!==a.data&&(b.body="typified"===a.data_type?C(a.data):"string"===typeof a.data?a.data:JSON.stringify(a.data));var d=window.AbortController?new window.AbortController:null;d&&(b.signal=d.signal);window.fetch(a.url,b).then(k=>{t&&(window.clearTimeout(t),t=null);if(!g){var n=m(k);(0!==n.status||200>n.status||300<=n.status)&&0<a.retries?(a.retries--,K(a,h,l,e,f)):(()=>{let r;if(k.ok)void 0!==a.responseType?(()=>{let p;const v=a.responseType?
a.responseType.toLowerCase():"";if(a.convertBinary)return"document"==v?(p=B(n.responseHeaders)["content-type"]||"text/html",new window.Promise(G=>k.text().then(Q=>{G({document:Q,contentType:p})}))):"arraybuffer"==v||"blob"==v?k.arrayBuffer().then(G=>y.arrbuf2str(G)):k.text();if("arraybuffer"==a.responseType)return k.arrayBuffer();if("blob"==a.responseType)return k.blob();if("document"==a.responseType)return p=(B(n.responseHeaders)["content-type"]||"text/xml").split(";")[0],(new window.DOMParser).parseFromString(k.text(),
p);if("json"==a.responseType)return JSON.parse(k.text());console.warn("xhr: responseType",a.responseType," is not implemented!");return k.text()})().then(p=>{n.response=p;r()}):void 0!==a.overrideMimeType&&window.TextDecoder?k.arrayBuffer().then(p=>{const v=a.overrideMimeType.toLowerCase().match(/charset=([^;]+)/)[1];n.response=(new window.TextDecoder(v)).decode(p);r()}):k.text().then(p=>{n.response=p;r()});else return n.responseXML=null,n.responseText="",n.response=null,{done:function(p){p()}};return{done:function(p){r=
p}}})().done(()=>{if(a.partialSize&&h.onpartial){const r=a.convertBinary&&n.response?n.response:n.responseText;["response","responseText","responseXML"].forEach(p=>{delete n[p]});r&&(r.length>a.partialSize?u(r):n.response_data=r)}e("onload",n);e("ondone",n)})}}).catch(w);void 0!==a.timeout&&(t=setTimeout(()=>{t=null;D(!0)},a.timeout))}catch(c){console.error(c.stack),b=A(c.message),e("onerror",b),e("ondone",b)}return{abort:()=>D()}},E=(a,h,l,e,f)=>{var m;a.anonymous&&(m=z.mozAnon?{mozAnon:!0}:{anonymous:!0});
let u,t;const g=new XMLHttpRequest(m),q=b=>{var d="";let c=a.url;if(2<=g.readyState){if(d=g.getAllResponseHeaders())d=d.replace(/tm-finalurl[0-9a-zA-Z]*: .*[\r\n]{1,2}/i,""),d=d.replace(/tm-setcookie[0-9a-zA-Z]*:/i,"set-cookie:");let k;if(k=g.getResponseHeader(F)||g.responseURL)c=k}d={readyState:g.readyState,responseHeaders:d,finalUrl:c,status:2<=g.readyState?g.status:0,statusText:2<=g.readyState?g.statusText:""};b&&4==g.readyState?(g.responseType?(d.responseXML=null,d.responseText=null,d.responseType=
g.responseType):(d.responseXML=g.responseXML,d.responseText=g.responseText),d.response=g.response):(d.responseXML=null,d.responseText="",d.response=null);return d},D=b=>{x.splitSlice(b,parseInt(a.partialSize)).forEach(d=>{f("onpartial",{partial:d})})},w={onload:function(){const b=q(!0);(0!==b.status||200>b.status||300<=b.status)&&0<a.retries?(a.retries--,E(a,h,l,e,f)):(()=>{if(a.convertBinary&&b.response){var d=b.responseType?b.responseType.toLowerCase():"";u&&d!==u&&console.warn("xhr: requested responseType "+
u+" differs from received "+d);if("document"==d||"document"==u)if("string"==typeof b.response)d=B(b.responseHeaders)["content-type"]||"text/html",b.response={document:b.response,contentType:d};else{d=b.response;const c=d.contentType||"text/html";try{b.response={document:(new XMLSerializer).serializeToString(d.documentElement),contentType:c}}catch(k){const n="unable to serialize content type "+c;console.warn("xhr: ",n,d);b.response={error:n,contentType:c}}}else if("json"==d)b.response=JSON.stringify(b.response);
else{if("blob"==d){let c;const k=new FileReader;k.onload=()=>{b.response=y.arrbuf2str(k.result);c()};k.readAsArrayBuffer(b.response);return{done:function(n){c=n}}}"arraybuffer"==d&&(b.response=y.arrbuf2str(b.response))}}return{done:function(c){c()}}})().done(()=>{if(a.partialSize&&h.onpartial){const d=a.convertBinary&&b.response?b.response:b.responseText;["response","responseText","responseXML"].forEach(c=>{delete b[c]});d&&(d.length>a.partialSize?D(d):b.response_data=d)}e("onload",b);4==b.readyState&&
e("ondone",b)})},onerror:function(){const b=q();4==b.readyState&&200!=b.status&&0!=b.status&&0<a.retries?(a.retries--,E(a,h,l,e,f)):(e("onerror",b),e("ondone",b))},onloadstart:function(){f("onloadstart",()=>q())},onreadystatechange:function(){f("onreadystatechange",()=>q())},onprogress:function(b){f("onprogress",()=>{const d=q();var c=d;void 0===c&&(c={});try{let k=null,n=null;if(b.lengthComputable||0<b.total)k=b.loaded,n=b.total;else{const r=!g.responseType||["","text"].includes(g.responseType)?
g.responseText:null;let p=Number(B(d.responseHeaders)["content-length"]||"");const v=2<d.readyState&&r?r.length:0;0==p&&(p=-1);k=b.loaded||v;n=b.total||p}c.lengthComputable=b.lengthComputable;c.loaded=k;c.done=k;c.position=k;c.total=n;c.totalSize=n}catch(k){}return c})},ontimeout:function(){const b=q();e("ontimeout");e("ondone",b)},onabort:function(){const b=A("aborted");e("onabort");e("ondone",b)}};if(m=0==Object.keys(w).concat(["ondone"]).filter(b=>!!h[b]).length)throw Error("Synchronous XHR is not supported anymore");
Object.keys(w).forEach(b=>{if(h[b]||["ontimeout","onload","onerror","onabort"].includes(b))g[b]=w[b]});try{if(!l.internal&&!H(a.url))throw Error("Invalid scheme of url: "+a.url);g.open(a.method||"GET",a.url,!m,a.user,a.password);let b=J(a.headers);if(a.nocache||a.revalidate)b=b||{},a.nocache?x.assign(b,N):a.revalidate&&x.assign(b,I);b&&Object.keys(b).forEach(d=>{try{g.setRequestHeader(d,b[d])}catch(c){console.warn("xhr: rejected header",d,b[d])}});void 0!==a.overrideMimeType&&g.overrideMimeType(a.overrideMimeType);
void 0!==a.responseType&&(u=a.responseType.toLowerCase(),["document","json"].includes(u)||(g.responseType=u));void 0!==a.timeout&&(g.timeout=a.timeout);void 0!==a.data?("typified"===a.data_type?g.send(C(a.data)):"string"===typeof a.data?g.send(a.data):g.send(JSON.stringify(a.data)),h.onprogress&&g.upload&&(g.upload.onprogress=w.onprogress)):g.send()}catch(b){console.error(b.stack),m=A(b.message),e("onerror",m),e("ondone",m)}t=t||{};return x.copy({abort:function(){g.abort()}},t)};Registry.register("xmlhttprequest",
"e1582c36",()=>({run:P,setConfig:function(a){z=a},getConfig:function(){return z},makeErrorResponse:A,parseCookie:O,parseHeaders:B}))});