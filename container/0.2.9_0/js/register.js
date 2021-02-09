(function () {
	var container = (function () {
		var obj = {
			defines: {},
			modules: {}
		};

		obj.define = function (name, requires, callback) {
			name = obj.processName(name);
			obj.defines[name] = {
				requires: requires,
				callback: callback
			};
		};

		obj.require = function (name, cache) {
			if (typeof cache == "undefined") {
				cache = true;
			}

			name = obj.processName(name);
			if (cache && obj.modules.hasOwnProperty(name)) {
				return obj.modules[name];
			} else if (obj.defines.hasOwnProperty(name)) {
				var requires = obj.defines[name].requires;
				var callback = obj.defines[name].callback;

				var module = obj.use(requires, callback);
				cache && obj.register(name, module);
				return module;
			}
		};

		obj.use = function (requires, callback) {
			var module = {
				exports: undefined
			};
			var params = obj.buildParams(requires, module);
			var result = callback.apply(this, params);
			if (typeof result != "undefined") {
				return result;
			} else {
				return module.exports;
			}
		};

		obj.register = function (name, module) {
			name = obj.processName(name);
			obj.modules[name] = module;
		};

		obj.buildParams = function (requires, module) {
			var params = [];
			requires.forEach(function (name) {
				params.push(obj.require(name));
			});
			params.push(obj.require);
			params.push(module.exports);
			params.push(module);
			return params;
		};

		obj.processName = function (name) {
			return name.toLowerCase();
		};

		return obj;
	})();

	container.define("addon", [], function () {
		if (typeof browser == "undefined") {
			chrome.isChrome = 1;
			return chrome;
		} else {
			browser.isChrome = 0;
			return browser;
		}
	});

	container.define("addonMessager", ["addon"], function (addon) {
        var obj = {
            _init: false,
            channel: null,
            callbacks: {},
            listeners: {}
        };

        obj.onMessage = function (name, listener) {
            obj.init();

            obj.listeners[name] = listener;
        };

        obj.postMessage = function (name, data, callback) {
            obj.init();

            var messageId = obj.generateUuid();
            obj.callbacks[messageId] = callback;
            obj._postMessage(messageId, name, data);
        };

        obj.postTabMessage = function (tabId, name, data, callback) {
            var messageId = obj.generateUuid();
            obj.callbacks[messageId] = callback;
            obj._postTabMessage(tabId, messageId, name, data);
        };

        obj._postMessage = function (messageId, name, data) {
            addon.runtime.sendMessage({
                channel: obj.channel,
                id: messageId,
                name: name,
                data: data
            });
        };

        obj._postTabMessage = function (tabId, messageId, name, data) {
            addon.tabs.sendMessage(tabId, {
                channel: obj.channel,
                id: messageId,
                name: name,
                data: data
            });
        };

        obj.handleMessage = function (message, sender) {
            if (message instanceof Object) {
                if (obj.channel != message.channel && obj.callbacks.hasOwnProperty(message.id)) {
                    var callback = obj.callbacks[message.id];
                    callback && callback(message.data);
                    delete (obj.callbacks[message.id]);
                }
                else if (obj.listeners.hasOwnProperty(message.name)) {
                    var listener = obj.listeners[message.name];
                    listener && listener(message.data, sender, function (response) {
                        if (sender.tab) {
                            obj._postTabMessage(sender.tab.id, message.id, null, response);
                        }
                        else {
                            obj._postMessage(message.id, null, response);
                        }
                    });
                }
            }
        };

        obj.generateUuid = function () {
            var time = new Date().getTime();
            return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (char) {
                var value = (time + Math.random() * 16) % 16 | 0;
                time = Math.floor(time / 16);
                return (char == "x" ? value : (value & 3 | 8)).toString(16);
            });
        };

        obj.init = function () {
            if (obj._init == false) {
                obj._init = true;
                obj.channel = obj.generateUuid();
                addon.runtime.onMessage.addListener(obj.handleMessage);
            }
        };

        return obj;
    });

	container.define("webMessager", [], function () {
		var obj = {
			_init: false,
			_event: null,
			listeners: {},
			callbacks: {},
			names: {
				EVENT: "one_web_message_event",
				CALLBACK: "one_web_message_callback"
			}
		};

		obj.onMessage = function (name, listener) {
			obj.init();

			obj.listeners[name] = listener;
		};

		obj.postMessage = function (name, data, callback) {
			obj.init();

			var requestId = obj.generateUuid();
			obj.callbacks[requestId] = callback;
			obj._postMessage(requestId, name, data);
		};

		obj._postMessage = function (requestId, name, data) {
			var event = new CustomEvent(obj.getEventName(), {
				detail: JSON.stringify({
					id: requestId,
					name: name,
					data: data
				})
			});
			window.dispatchEvent(event);
		};

		obj.handleMessage = function (event) {
			try {
				var message = JSON.parse(event.detail);
				if (message.name == obj.names.CALLBACK) {
					obj.handleMessageCallback(message);
				} else {
					obj.handleMessageListener(message, event.target);
				}
			}
			catch (err) { }
		};

		obj.handleMessageCallback = function (message) {
			var requestId = message.id;
			if (obj.callbacks.hasOwnProperty(requestId)) {
				var callback = obj.callbacks[requestId];
				callback && callback(message.data);
				delete obj.callbacks[requestId];
			}
		};

		obj.handleMessageListener = function (message, source) {
			if (obj.listeners.hasOwnProperty(message.name)) {
				var listener = obj.listeners[message.name];
				var callback = function (response) {
					obj._postMessage(message.id, obj.names.CALLBACK, response);
				};
				listener && listener(message.data, source, callback);
			}
		};

		obj.generateUuid = function () {
			var time = new Date().getTime();
			return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (char) {
				var value = (time + Math.random() * 16) % 16 | 0;
				time = Math.floor(time / 16);
				return (char == "x" ? value : (value & 3 | 8)).toString(16);
			});
		};

		obj.getEventName = function () {
			return obj._event ? obj._event : obj.names.EVENT;
		};

		obj.setEventName = function (eventName) {
			if (obj._init) {
				window.removeEventListener(obj.getEventName(), obj.handleMessage);
			}

			obj._event = eventName ? eventName : obj.generateUuid();

			if (obj._init) {
				obj._init = false;
				obj.init();
			}
		};

		obj.init = function () {
			if (obj._init == false) {
				obj._init = true;
				window.addEventListener(obj.getEventName(), obj.handleMessage);
			}
		};

		return obj;
	});

	container.define("messagerProxy", ["addonMessager", "webMessager"], function (addonMessager, webMessager) {
		var obj = {};

		obj.proxyMessage = function (name) {
			webMessager.onMessage(name, function (data, sender, callback) {
				addonMessager.postMessage(name, data, callback);
			});
		};

		obj.proxyMessageBatch = function (nameList) {
			nameList.forEach(function (name) {
				obj.proxyMessage(name);
			});
		};

		return obj;
	});

	container.define("core", ["webMessager"], function (webMessager) {
		var obj = {};

		obj.initDomContent = function () {
			return new Promise(function (resolve) {
				window.addEventListener("DOMContentLoaded", resolve);
			});
		};

		obj.initWebMessager = function () {
			return new Promise(function (resolve) {
				webMessager.setEventName(null);
				resolve();
			});
		};

		obj.ready = function (callback) {
			var promiseList = [
				obj.initDomContent(),
				obj.initWebMessager()
			];
			Promise.all(promiseList).then(callback);
		};

		return obj;
	});

	container.define("app", ["addonMessager", "webMessager", "messagerProxy"], function (addonMessager, webMessager, messagerProxy) {
		var obj = {};

		obj.run = function () {
			messagerProxy.proxyMessageBatch([
				"gm_get_data",
				"gm_set_value",
				"gm_delete_value",
				"gm_open_in_tab",
				"gm_notification",
				"gm_xmlhttp_request"
			]);

			addonMessager.onMessage("store_app_response", function (response) {
				if (response && response.script) {
					obj.runCode(response.script);
				}

				if (response && response.refresh) {
					setTimeout(location.reload, response.refresh);
				}
			});

			addonMessager.postMessage("store_run_installed_applist", {
				url: location.href,
				event: webMessager.getEventName()
			});
		};

		obj.runCode = function (script) {
			var node = document.createElementNS("http://www.w3.org/1999/xhtml", "script");
			node.textContent = script;
			(document.head || document.body || document.documentElement || document).appendChild(node);
			node.parentNode.removeChild(node);
		};

		return obj;
	});

	container.use(["core", "app"], function (core, app) {
		core.ready(app.run);
	});
})();
