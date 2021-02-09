'use strict';(function(k){"object"==typeof exports&&"object"==typeof module?k(require("../lib/codemirror")):"function"==typeof define&&define.amd?define(["../lib/codemirror"],k):k(CodeMirror)})(function(k){function B(a,b){return a.line==b.line&&a.ch==b.ch}function C(a){l.push(a);50<l.length&&l.shift()}function I(a){return l[l.length-(a?Math.min(a,1):1)]||""}function Q(){1<l.length&&l.pop();return I()}function t(a,b,c,d,e){null==e&&(e=a.getRange(b,c));"grow"==d&&v&&v.cm==a&&B(b,v.pos)&&a.isClean(v.gen)?
l.length?l[l.length-1]+=e:C(e):!1!==d&&C(e);a.replaceRange("",b,c,"+delete");v="grow"==d?{cm:a,pos:b,gen:a.changeGeneration()}:null}function r(a,b,c){return a.findPosH(b,c,"char",!0)}function w(a,b,c){return a.findPosH(b,c,"word",!0)}function x(a,b,c){return a.findPosV(b,c,"line",a.doc.sel.goalColumn)}function y(a,b,c){return a.findPosV(b,c,"page",a.doc.sel.goalColumn)}function J(a,b,c){var d=b.line,e=a.getLine(d);b=/\S/.test(0>c?e.slice(0,b.ch):e.slice(b.ch));for(var f=a.firstLine(),n=a.lastLine();;){d+=
c;if(d<f||d>n)return a.clipPos(m(d-c,0>c?0:null));e=a.getLine(d);if(/\S/.test(e))b=!0;else if(b)return m(d,0)}}function z(a,b,c){var d=b.line,e=b.ch;b=a.getLine(b.line);for(var f=!1;;){var n=b.charAt(e+(0>c?-1:0));if(n){if(f&&/[!?.]/.test(n))return m(d,e+(0<c?1:0));f||(f=/\w/.test(n));e+=c}else{if(d==(0>c?a.firstLine():a.lastLine()))return m(d,e);b=a.getLine(d+c);if(!/\S/.test(b))return m(d,e);d+=c;e=0>c?b.length:0}}}function p(a,b,c){var d;if(a.findMatchingBracket&&(d=a.findMatchingBracket(b,{strict:!0}))&&
d.match&&(d.forward?1:-1)==c)return 0<c?m(d.to.line,d.to.ch+1):d.to;for(var e=!0;;e=!1){var f=a.getTokenAt(b);d=m(b.line,0>c?f.start:f.end);if(e&&0<c&&f.end==b.ch||!/\w/.test(f.string)){e=a.findPosH(d,c,"char");if(B(d,e))return b;b=e}else return d}}function u(a,b){var c=a.state.emacsPrefix;if(!c)return b?null:1;D(a);return"-"==c?-1:Number(c)}function h(a){var b="string"==typeof a?function(c){c.execCommand(a)}:a;return function(c){var d=u(c);b(c);for(var e=1;e<d;++e)b(c)}}function E(a,b,c,d){var e=
u(a);0>e&&(d=-d,e=-e);for(var f=0;f<e;++f){var n=c(a,b,d);if(B(n,b))break;b=n}return b}function g(a,b){var c=function(d){d.extendSelection(E(d,d.getCursor(),a,b))};c.motion=!0;return c}function q(a,b,c,d){for(var e=a.listSelections(),f,n=e.length;n--;)f=e[n].head,t(a,f,E(a,f,b,c),d)}function F(a,b){if(a.somethingSelected()){for(var c=a.listSelections(),d,e=c.length;e--;)d=c[e],t(a,d.anchor,d.head,b);return!0}}function K(a,b){a.state.emacsPrefix?"-"!=b&&(a.state.emacsPrefix+=b):(a.state.emacsPrefix=
b,a.on("keyHandled",L),a.on("inputRead",M))}function L(a,b){a.state.emacsPrefixMap||N.hasOwnProperty(b)||D(a)}function D(a){a.state.emacsPrefix=null;a.off("keyHandled",L);a.off("inputRead",M)}function M(a,b){var c=u(a);if(1<c&&"+input"==b.origin){b=b.text.join("\n");for(var d="",e=1;e<c;++e)d+=b;a.replaceSelection(d)}}function A(a,b){if("string"!=typeof b||!/^\d$/.test(b)&&"Ctrl-U"!=b)a.removeKeyMap(G),a.state.emacsPrefixMap=!1,a.off("keyHandled",A),a.off("inputRead",A)}function O(a){a.setCursor(a.getCursor());
a.setExtending(!a.getExtending());a.on("change",function(){a.setExtending(!1)})}function R(a,b,c){a.openDialog?a.openDialog(b+': <input type="text" style="width: 10em"/>',c,{bottom:!0}):c(prompt(b,""))}function H(a,b){var c=a.getCursor(),d=a.findPosH(c,1,"word");a.replaceRange(b(a.getRange(c,d)),c,d);a.setCursor(d)}function P(a){G[a]=function(b){K(b,a)};S["Ctrl-"+a]=function(b){K(b,a)};N["Ctrl-"+a]=!0}var m=k.Pos,l=[],v=null,N={"Alt-G":!0,"Ctrl-X":!0,"Ctrl-Q":!0,"Ctrl-U":!0};k.emacs={kill:t,killRegion:F,
repeated:h};var S=k.keyMap.emacs=k.normalizeKeyMap({"Ctrl-W":function(a){t(a,a.getCursor("start"),a.getCursor("end"),!0)},"Ctrl-K":h(function(a){var b=a.getCursor(),c=a.clipPos(m(b.line)),d=a.getRange(b,c);/\S/.test(d)||(d+="\n",c=m(b.line+1,0));t(a,b,c,"grow",d)}),"Alt-W":function(a){C(a.getSelection());a.setExtending(!1);a.setCursor(a.getCursor())},"Ctrl-Y":function(a){var b=a.getCursor();a.replaceRange(I(u(a)),b,b,"paste");a.setSelection(b,a.getCursor())},"Alt-Y":function(a){a.replaceSelection(Q(),
"around","paste")},"Ctrl-Space":O,"Ctrl-Shift-2":O,"Ctrl-F":g(r,1),"Ctrl-B":g(r,-1),Right:g(r,1),Left:g(r,-1),"Ctrl-D":function(a){q(a,r,1,!1)},Delete:function(a){F(a,!1)||q(a,r,1,!1)},"Ctrl-H":function(a){q(a,r,-1,!1)},Backspace:function(a){F(a,!1)||q(a,r,-1,!1)},"Alt-F":g(w,1),"Alt-B":g(w,-1),"Alt-D":function(a){q(a,w,1,"grow")},"Alt-Backspace":function(a){q(a,w,-1,"grow")},"Ctrl-N":g(x,1),"Ctrl-P":g(x,-1),Down:g(x,1),Up:g(x,-1),"Ctrl-A":"goLineStart","Ctrl-E":"goLineEnd",End:"goLineEnd",Home:"goLineStart",
"Alt-V":g(y,-1),"Ctrl-V":g(y,1),PageUp:g(y,-1),PageDown:g(y,1),"Ctrl-Up":g(J,-1),"Ctrl-Down":g(J,1),"Alt-A":g(z,-1),"Alt-E":g(z,1),"Alt-K":function(a){q(a,z,1,"grow")},"Ctrl-Alt-K":function(a){q(a,p,1,"grow")},"Ctrl-Alt-Backspace":function(a){q(a,p,-1,"grow")},"Ctrl-Alt-F":g(p,1),"Ctrl-Alt-B":g(p,-1,"grow"),"Shift-Ctrl-Alt-2":function(a){var b=a.getCursor();a.setSelection(E(a,b,p,1),b)},"Ctrl-Alt-T":function(a){var b=p(a,a.getCursor(),-1),c=p(a,b,1),d=p(a,c,1),e=p(a,d,-1);a.replaceRange(a.getRange(e,
d)+a.getRange(c,e)+a.getRange(b,c),b,d)},"Ctrl-Alt-U":h(function(a){var b=a.getCursor(),c=b.line;b=b.ch;for(var d=[];c>=a.firstLine();){for(var e=a.getLine(c),f=null==b?e.length:b;0<f;)if(b=e.charAt(--f),")"==b)d.push("(");else if("]"==b)d.push("[");else if("}"==b)d.push("{");else if(/[\(\{\[]/.test(b)&&(!d.length||d.pop()!=b))return a.extendSelection(m(c,f));--c;b=null}}),"Alt-Space":function(a){for(var b=a.getCursor(),c=b.ch,d=b.ch,e=a.getLine(b.line);c&&/\s/.test(e.charAt(c-1));)--c;for(;d<e.length&&
/\s/.test(e.charAt(d));)++d;a.replaceRange(" ",m(b.line,c),m(b.line,d))},"Ctrl-O":h(function(a){a.replaceSelection("\n","start")}),"Ctrl-T":h(function(a){a.execCommand("transposeChars")}),"Alt-C":h(function(a){H(a,function(b){var c=b.search(/\w/);return-1==c?b:b.slice(0,c)+b.charAt(c).toUpperCase()+b.slice(c+1).toLowerCase()})}),"Alt-U":h(function(a){H(a,function(b){return b.toUpperCase()})}),"Alt-L":h(function(a){H(a,function(b){return b.toLowerCase()})}),"Alt-;":"toggleComment","Ctrl-/":h("undo"),
"Shift-Ctrl--":h("undo"),"Ctrl-Z":h("undo"),"Cmd-Z":h("undo"),"Shift-Alt-,":"goDocStart","Shift-Alt-.":"goDocEnd","Ctrl-S":"findPersistentNext","Ctrl-R":"findPersistentPrev","Ctrl-G":function(a){a.execCommand("clearSearch");a.setExtending(!1);a.setCursor(a.getCursor())},"Shift-Alt-5":"replace","Alt-/":"autocomplete",Enter:"newlineAndIndent","Ctrl-J":h(function(a){a.replaceSelection("\n","end")}),Tab:"indentAuto","Alt-G G":function(a){var b=u(a,!0);if(null!=b&&0<b)return a.setCursor(b-1);R(a,"Goto line",
function(c){var d;c&&!isNaN(d=Number(c))&&d==(d|0)&&0<d&&a.setCursor(d-1)})},"Ctrl-X Tab":function(a){a.indentSelection(u(a,!0)||a.getOption("indentUnit"))},"Ctrl-X Ctrl-X":function(a){a.setSelection(a.getCursor("head"),a.getCursor("anchor"))},"Ctrl-X Ctrl-S":"save","Ctrl-X Ctrl-W":"save","Ctrl-X S":"saveAll","Ctrl-X F":"open","Ctrl-X U":h("undo"),"Ctrl-X K":"close","Ctrl-X Delete":function(a){t(a,a.getCursor(),z(a,a.getCursor(),1),"grow")},"Ctrl-X H":"selectAll","Ctrl-Q Tab":h("insertTab"),"Ctrl-U":function(a){a.state.emacsPrefixMap=
!0;a.addKeyMap(G);a.on("keyHandled",A);a.on("inputRead",A)}}),G={"Ctrl-G":D};for(k=0;10>k;++k)P(String(k));P("-")});