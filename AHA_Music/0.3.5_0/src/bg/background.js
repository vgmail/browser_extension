(function(){function c(o){var e=o;var l=null;var p="audio/webm";if(typeof window.InstallTrigger!=="undefined"){p="audio/ogg"}var h=null;var f=!!window.opera||navigator.userAgent.indexOf(" OPR/")>=0;var k=!!window.chrome&&!f;var j=typeof window.InstallTrigger!=="undefined";var m=false;var g=null;var n=this;function i(){if(j){return true}if(!k){return false}var s=-1;var r=navigator.userAgent;console.log(r);if((s=r.indexOf("Chrome"))!==-1){r=r.substring(s+7)}if((s=r.indexOf(";"))!==-1){r=r.substring(0,s)}if((s=r.indexOf(" "))!==-1){r=r.substring(0,s)}var q=parseInt(""+r,10);if(isNaN(q)){q=parseInt(navigator.appVersion,10)}console.log(q);return q>=49}this.start=function(r){if(m){return true}m=true;var q=window.MediaStream;if(typeof q==="undefined"&&typeof webkitMediaStream!=="undefined"){q=webkitMediaStream}if(typeof q==="undefined"||!q){console.error("_MediaStream === 'undefined'");return false}if(e.getAudioTracks().length<=0){console.error("_user_media_stream.getAudioTracks().length <= 0");return false}if(!!navigator.mozGetUserMedia){l=new q();l.addTrack(e.getAudioTracks()[0])}else{l=new q(e.getAudioTracks())}var t={mimeType:p};if(!i()){t="video/vp8"}try{h=new MediaRecorder(l,t)}catch(s){h=new MediaRecorder(l)}if(!h||("canRecordMimeType" in h&&h.canRecordMimeType(p)===false)){console.warn("MediaRecorder API seems unable to record mimeType:",p);return false}h.ondataavailable=function(v){if(!m){console.log("MediaRecorderWrapper record have stopped.");return}var u={status:0,data:new Blob([v.data],{type:p})};if(!v.data||!v.data.size||v.data.size<26800){u={status:-1,data:"Your Browser Can Not Record Audio"}}n.ondataavailable(u)};h.onerror=function(u){console.error(u.name);n.ondataavailable({status:-1,data:"Your Browser Can Not Record Audio"});if(h){h.stop()}};try{h.start(3600000)}catch(s){console.error(s);return false}g=setInterval(function(){if(!m){return}if(!h){return}if(h.state==="recording"){h.requestData()}},r);return true};this.stop=function(){console.log("MediaRecorderWrapper stop");if(!m){return}m=false;if(g){clearInterval(g);g=null}if(h&&h.state==="recording"){h.stop();try{e.getAudioTracks()[0].stop()}catch(q){console.error(q)}}};this.ondataavailable=function(q){console.log("recorded-blob",q)}}function b(){var g=false;var h=8000;var i=null;var f=function(){return g};var j=function(k){console.log("AudioRecorder start");if(g){console.log("_is_recording="+g);return}g=true;chrome.tabCapture.capture({audio:true,video:false},function(l){try{var p=window.AudioContext||window.webkitAudioContext;var n=new p();var o=n.createMediaStreamSource(l);o.connect(n.destination);i=new c(l);i.ondataavailable=function(q){k.record_callback(q)};if(!i.start(h)){k.record_callback({status:-1,data:"Your Browser Can Not Record Audio"})}}catch(m){console.log(m);k.record_callback({status:-1,data:"Your Browser Can Not Record Audio, Please Try the Old Version Chrome, This May Be The Chrome Bug."})}})};var e=function(){console.log("AudioRecorder stop");if(i!=null){i.stop()}g=false};return{start:j,stop:e,is_recording:f}}function a(){var k=false;var g=[];var h="";chrome.runtime.onInstalled.addListener(function(l){chrome.storage.sync.get("history_datas",function(n){var m=n.history_datas;if(m&&(m.length>0)){chrome.storage.local.set({history_datas:m})}chrome.storage.sync.set({history_datas:[]})})});chrome.storage.local.get("history_datas",function(l){g=l.history_datas;if(!g){g=[]}k=true});chrome.storage.sync.get("device_id",function(l){var m=l.device_id;if(m){h=m}else{h=Math.random()+""+new Date().getTime();chrome.storage.sync.set({device_id:h},function(){console.log("storage set")})}});var i=function(){return g};var f=function(){return h};var j=function(l){g.unshift(l);chrome.storage.local.set({history_datas:g},function(){console.log(chrome.runtime.lastError)})};var e=function(){chrome.storage.local.set({history_datas:[]},function(){g=[]})};return{get:i,set:j,clear:e,get_device_id:f}}var d=(function(){this._server_url="https://api.acrcloud.com/v1/aha-music/identify";this._params={};this._audio_recorder=b();this._storage_helper=a();this._is_recognizing=false;var f=this;function e(p,j){var h=chrome.i18n.getUILanguage();if(!h){h=navigator.language}var l=this._server_url;var o=navigator.userAgent;var k=this._storage_helper.get_device_id();var m=new FormData();for(var q in f._params){m.append(q,f._params[q])}var i=chrome.runtime.getManifest();var n=chrome.runtime.id;console.log(n);m.append("token",j);m.append("sample_bytes",p.size);m.append("sample",p);m.append("timestamp",new Date().getTime());m.append("local_lan",h);m.append("browser_version",o);m.append("device_id",k);m.append("version",i.version);m.append("app_id",n);$.ajax({type:"POST",url:l,data:m,timeout:15000,dataType:"json",processData:false,contentType:false,success:function(r){console.log(r);if(r.status==0){var s=r.data[0];s.timestamp=new Date().getTime();s.tab_url=f._params.tab_url;chrome.runtime.sendMessage({cmd:"popup_parse_result",result:{status:0,msg:"",data:s}});f._storage_helper.set(s);f.reload()}else{if(r.status==-2){g(p)}else{if(r.status==-3){chrome.runtime.sendMessage({cmd:"popup_update_version",result:{status:-1,msg:r.msg}})}else{chrome.runtime.sendMessage({cmd:"popup_error",result:{status:-1,msg:r.msg}})}}}},error:function(r,t){console.log(r);var s="HTTP Error (Code = "+t+")";if(t=="timeout"){s="Network Timeout"}chrome.runtime.sendMessage({cmd:"popup_error",result:{status:-1,msg:s}})}})}function g(h){chrome.identity.getAuthToken({interactive:true},function(i){if(chrome.runtime.lastError){console.log(chrome.runtime.lastError.message);chrome.runtime.sendMessage({cmd:"popup_login"})}else{e(h,i)}})}this.record_callback=function(h){f.stop();if(h.status!=0){chrome.runtime.sendMessage({cmd:"popup_error",result:{status:-1,msg:h.data}});return}e(h.data,"no_login")};this.start=function(h){if(f._is_recognizing){return}f._is_recognizing=true;if(h){f._params=h}_audio_recorder.start(f)};this.stop=function(){if(!f._is_recognizing){return}if(f._audio_recorder){f._audio_recorder.stop()}f._is_recognizing=false};this.reload=function(){chrome.runtime.sendMessage({cmd:"popup_reload",result:{status:0,msg:"",recognize_status:f._is_recognizing,data:f._storage_helper.get()}})};this.init=function(){chrome.runtime.sendMessage({cmd:"popup_init",result:{status:0,msg:"",recognize_status:f._is_recognizing,data:f._storage_helper.get()}})};this.clear_history=function(){f._storage_helper.clear();chrome.runtime.sendMessage({cmd:"popup_reload",result:{status:0,msg:"",recognize_status:f._is_recognizing,data:[]}})};this.export_history=function(){chrome.runtime.sendMessage({cmd:"popup_export",result:{status:0,msg:"",recognize_status:f._is_recognizing,data:f._storage_helper.get()}})};return f})();chrome.windows.onRemoved.addListener(function(e){chrome.notifications.clear("clear_history")});chrome.runtime.onMessage.addListener(function(g,f,e){switch(g.cmd){case"background_start":chrome.tabs.query({active:true,currentWindow:true},function(j){if(j.length<1){console.error("no select tab");chrome.runtime.sendMessage({cmd:"popup_error",result:{status:-1,msg:"Please Select One Tab."}});return}var i=j[0];var h=i.url;var k=i.title;if(!i.audible){chrome.runtime.sendMessage({cmd:"popup_error",result:{status:-1,msg:"No Sound Playing in Current Tab"}});return}chrome.identity.getProfileUserInfo(function(l){var m="";var n="";if(chrome.runtime.lastError){console.log(chrome.runtime.lastError.message)}else{m=l.email;n=l.id}d.start({tab_url:h,email:m,google_id:n,tab_title:k})})});break;case"background_cancel":if(d){d.stop()}break;case"background_reload":if(d){d.reload()}break;case"background_init":if(d){d.init()}break;case"background_export_history":console.log("background_export_history");if(d){d.export_history()}break;case"background_clear_history":console.log("background_clear_history");if(d){d.clear_history()}break}})})();

