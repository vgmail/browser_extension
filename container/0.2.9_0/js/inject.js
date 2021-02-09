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

    container.define("unsafeWindow", [], function () {
        return window;
    });

    container.define("SafeWindow", ["unsafeWindow"], function (unsafeWindow) {
        return function (ignoreList) {
            var safeWindow = {};
            var propList = "#one#safe_prop#one#";
            ignoreList || (ignoreList = []);
            propList.forEach(function (name) {
                if (name in unsafeWindow && ignoreList.indexOf(name) < 0) {
                    var property = unsafeWindow[name];
                    if (property instanceof Function) {
                        safeWindow[name] = Function.prototype.bind.call(property, unsafeWindow);
                    }
                    else if (property == unsafeWindow) {
                        safeWindow[name] = safeWindow;
                    }
                    else {
                        safeWindow[name] = property;
                    }
                }
            });
            return safeWindow;
        };
    });

    container.define("GmBridge", ["factory"], function (factory) {
        return function (scope) {
            var obj = {
                info: {},
                values: {},
                grants: []
            };

            obj.hasGrant = function (name) {
                if (obj.grants.indexOf(name) >= 0) {
                    return true;
                }
                else {
                    return false;
                }
            };

            obj.getValue = function (name, defaultValue) {
                if (obj.values.hasOwnProperty(name)) {
                    return obj.values[name];
                }
                else {
                    return defaultValue;
                }
            };

            obj.setValue = function (name, value) {
                obj.values[name] = value;

                var data = {
                    scope: obj.getScope(),
                    name: name,
                    value: value
                };
                obj.postMessage("gm_set_value", data);
            };

            obj.deleteValue = function (name) {
                delete obj.values[name];

                var data = {
                    scope: gm.getScope(),
                    name: name,
                    value: value
                };
                obj.postMessage("gm_delete_value", data);
            };

            obj.listValues = function () {
                return Object.keys(obj.values);
            };

            obj.openInTab = function (url, active) {
                var data = {
                    url: url,
                    active: active
                };
                obj.postMessage("gm_open_in_tab", data);
            };

            obj.notification = function (text, title, image, onclick) {
                var data = {
                    text: text,
                    title: title,
                    image: image
                };
                obj.postMessage("gm_notification", data, onclick);
            };

            obj.xmlhttpRequest = function (details) {
                var i, item, data = {};
                for (i in details) {
                    item = details[i];

                    if (item instanceof Function) {
                        continue;
                    }

                    if (item instanceof FormData) {
                        data[i] = obj.formDataToObject(item);
                    }
                    else {
                        data[i] = item;
                    }
                }
                obj.postMessage("gm_xmlhttp_request", data, function (result) {
                    if (result.code == 1) {
                        details.onload && details.onload(result);
                    }
                    else {
                        details.onerror && details.onerror(result);
                    }
                });
            };

            obj.formDataToObject = function (formData) {
                var data = {};
                for (var key of formData.keys()) {
                    data[key] = formData.get(key);
                }
                return data;
            };

            obj.init = function () {
                return new Promise(function (resolve) {
                    var data = {
                        scope: obj.getScope()
                    };
                    obj.postMessage("gm_get_data", data, function (response) {
                        obj.info = response.info;
                        obj.values = response.values;
                        obj.grants = response.grants;
                        resolve();
                    });
                });
            };

            obj.getScope = function () {
                return scope;
            };

            obj.postMessage = function (name, data, callback) {
                factory.getMessager().postMessage(name, data, callback);
            };

            return obj;
        };
    });

    container.define("menuBridge", ["factory"], function (factory) {
        var obj = {};

        obj.addMenu = function (detail, callback) {
            obj.postMessage("menu_add_menu", { detail: detail }, callback);
        };

        obj.updateMenu = function (id, detail, callback) {
            obj.postMessage("menu_update_menu", { id: id, detail: detail }, callback);
        };

        obj.moveMenu = function (currentId, targetId, position, callback) {
            obj.postMessage("menu_move_menu", { current: currentId, target: targetId, position: position }, callback);
        };

        obj.deleteMenu = function (id, callback) {
            obj.postMessage("menu_delete_menu", { id: id }, callback);
        };

        obj.importMenuList = function (menuList, callback) {
            obj.postMessage("menu_import_menu_list", { list: menuList }, callback);
        };

        obj.clearAllMenu = function (callback) {
            obj.postMessage("menu_clear_all_menu", {}, callback);
        };

        obj.getMenuList = function (callback) {
            obj.postMessage("menu_get_menu_list", {}, callback);
        };

        obj.postMessage = function (name, data, callback) {
            factory.getMessager().postMessage(name, data, callback);
        };

        return obj;
    });

    container.define("bridge", ["unsafeWindow", "GmBridge", "menuBridge"], function (unsafeWindow, GmBridge, menuBridge) {
        var obj = {
            gms: {}
        };

        obj.getBridge = function (scope) {
            return new Promise(function (resolve) {
                obj.getGmBridge(scope).then(function (gmBridge) {
                    resolve(obj.buildBridge(gmBridge));
                });
            });
        };

        obj.getGmBridge = function (scope) {
            return new Promise(function (resolve) {
                if (obj.gms.hasOwnProperty(scope)) {
                    resolve(obj.gms[scope]);
                }
                else {
                    var gm = GmBridge(scope);
                    gm.init().then(function () {
                        obj.gms[scope] = gm;
                        resolve(obj.gms[scope]);
                    });
                }
            });
        };

        obj.buildBridge = function (gmBridge) {
            var bridge = {
                module: {
                    unsafeWindow: unsafeWindow,
                    GM_info: gmBridge.info,
                    GM_getValue: gmBridge.getValue,
                    GM_setValue: gmBridge.setValue,
                    GM_deleteValue: gmBridge.deleteValue,
                    GM_listValues: gmBridge.listValues,
                    GM_openInTab: gmBridge.openInTab,
                    GM_notification: gmBridge.notification,
                    GM_xmlhttpRequest: gmBridge.xmlhttpRequest,
                    ONE_addMenu: menuBridge.addMenu,
                    ONE_updateMenu: menuBridge.updateMenu,
                    ONE_deleteMenu: menuBridge.deleteMenu,
                    ONE_getMenuList: menuBridge.getMenuList,
                    ONE_importMenuList: menuBridge.importMenuList,
                    ONE_clearAllMenu: menuBridge.clearAllMenu
                },
                context: {}
            };
            for (var name in bridge.module) {
                if (gmBridge.hasGrant(name)) {
                    bridge.context[name] = bridge.module[name];
                }
            }
            return bridge;
        };

        return obj;
    });

    container.define("runner", ["bridge", "factory"], function (bridge, factory) {
        var obj = {};

        obj.runScope = function (scope) {
            bridge.getBridge(scope).then(function (bridge) {
                obj.runBridge(factory.getSafeWindow(), bridge.context);
            });
        };

        obj.runBridge = function (window, context) {
            // assign safe window
            Object.assign(window, context);

            // run user scrip
            (function (
                container, obj, bridge, context, factory,
                define, module, exports,
                self, top, parent,
                unsafeWindow, GM_info,
                GM_getValue, GM_setValue, GM_deleteValue, GM_listValues,
                GM_openInTab, GM_notification, GM_xmlhttpRequest,
                ONE_addMenu, ONE_updateMenu, ONE_deleteMenu, ONE_getMenuList, ONE_importMenuList, ONE_clearAllMenu
            ) {

                "#one#third_library#one#";

                "#one#user_script#one#";

            }).apply(window, [
                // container, obj, bridge, context, factory
                undefined,
                undefined,
                undefined,
                undefined,
                undefined,
                // define, module, exports
                undefined,
                undefined,
                undefined,
                // self, top, parent
                window,
                window,
                window,
                // unsafeWindow, GM_info,
                context.unsafeWindow,
                context.GM_info,
                // GM_getValue, GM_setValue, GM_deleteValue, GM_listValues,
                context.GM_getValue,
                context.GM_setValue,
                context.GM_deleteValue,
                context.GM_listValues,
                // GM_openInTab, GM_notification, GM_xmlhttpRequest
                context.GM_openInTab,
                context.GM_notification,
                context.GM_xmlhttpRequest,
                // ONE_addMenu, ONE_updateMenu, ONE_deleteMenu, ONE_getMenuList
                context.ONE_addMenu,
                context.ONE_updateMenu,
                context.ONE_deleteMenu,
                context.ONE_getMenuList,
                context.ONE_importMenuList,
                context.ONE_clearAllMenu
            ]);
        };

        return obj;
    });

    container.define("factory", ["webMessager", "SafeWindow"], function (webMessager, SafeWindow) {
        var obj = {
            window: null
        };

        obj.getSafeWindow = function () {
            if (!obj.window) {
                obj.window = SafeWindow([]);
            }
            return obj.window;
        };

        obj.getMessager = function () {
            webMessager.setEventName("#one#web_event#one#");
            return webMessager;
        };

        return obj;
    });

    container.define("app", ["runner"], function (runner) {
        var obj = {};

        obj.run = function () {
            runner.runScope("#one#gm_scope#one#");
        };

        return obj;
    });

    container.use(["app"], function (app) {
        app.run();
    });
})();