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

        return {
            define: obj.define,
            use: obj.use,
            register: obj.register,
            modules: obj.modules
        };
    })();

    container.define("addon", [], function () {
        var addon;

        if (typeof browser == "undefined") {
            addon = chrome;
            addon.isChrome = 0;
        } else {
            addon = browser;
            addon.isChrome = 1;
        }

        if (addon.permissions) {
            addon.isBackground = 1;
        }
        else {
            addon.isBackground = 0;
        }

        return addon;
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

    container.define("unsafeWindow", [], function () {
        return window;
    });

    container.define("SafeWindow", ["unsafeWindow"], function (unsafeWindow) {
        return function (ignoreList) {
            var safeWindow = {};
            var propList = "#one#safe_prop#one#";
            ignoreList || (ignoreList = []);

            if (propList instanceof Array) {
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
            }
            else {
                safeWindow = unsafeWindow;
            }

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

    container.define("oneBridge", ["factory"], function (factory) {
        var obj = {};

        obj.getInfo = function (callback) {
            obj.postMessage("one_get_info", {}, callback);
        };

        obj.getConfig = function (name, callback) {
            obj.postMessage("one_get_config", { name: name }, callback);
        };

        obj.setConfig = function (name, value, callback) {
            obj.postMessage("one_set_config", { name: name, value: value }, callback);
        };

        obj.getValue = function (name, callback) {
            obj.postMessage("one_get_value", { name: name }, callback);
        };

        obj.setValue = function (name, value, callback) {
            obj.postMessage("one_set_value", { name: name, value: value }, callback);
        };

        obj.getUpdater = function (callback) {
            obj.postMessage("one_get_updater", {}, callback);
        };

        obj.getManifest = function (callback) {
            obj.postMessage("one_get_manifest", {}, callback);
        };

        obj.buildBackup = function (scopes, callback) {
            obj.postMessage("one_build_backup", { scopes: scopes }, callback);
        };

        obj.applyBackup = function (scopes, backup, callback) {
            obj.postMessage("one_apply_backup", { scopes: scopes, backup: backup }, callback);
        };

        obj.applyReset = function (scopes, callback) {
            obj.postMessage("one_apply_reset", { scopes: scopes }, callback);
        };

        obj.getCdnMode = function (callback) {
            obj.postMessage("one_get_cdn_mode", {}, callback);
        };

        obj.setCdnMode = function (cdnMode, callback) {
            obj.postMessage("one_set_cdn_mode", { cdn_mode: cdnMode }, callback);
        };

        obj.postMessage = function (name, data, callback) {
            factory.getMessager().postMessage(name, data, callback);
        };

        return obj;
    });

    container.define("proxyBridge", ["factory"], function (factory) {
        var obj = {};

        obj.getProxyStatus = function (callback) {
            obj.postMessage("proxy_get_proxy_status", {}, callback);
        };

        obj.setProxyStatus = function (status, callback) {
            obj.postMessage("proxy_set_proxy_status", { status: status }, callback);
        };

        obj.getAuthUrl = function (callback) {
            obj.postMessage("proxy_get_auth_url", {}, callback);
        };

        obj.setAuthUrl = function (authUrl, callback) {
            obj.postMessage("proxy_set_auth_url", { url: authUrl }, callback);
        };

        obj.getProxySetting = function (mode, callback) {
            obj.postMessage("proxy_get_proxy_setting", { mode: mode }, callback);
        };

        obj.setProxySetting = function (setting, callback) {
            obj.postMessage("proxy_set_proxy_setting", setting, callback);
        };

        obj.testProxySetting = function (setting, interval, callback) {
            obj.postMessage("proxy_test_proxy_setting", { setting: setting, interval: interval }, callback);
        };

        obj.postMessage = function (name, data, callback) {
            factory.getMessager().postMessage(name, data, callback);
        };

        return obj;
    });

    container.define("storeBridge", ["factory"], function (factory) {
        var obj = {};

        obj.getAutoUpdate = function (callback) {
            obj.postMessage("store_get_auto_update", {}, callback);
        };

        obj.setAutoUpdate = function (value, callback) {
            obj.postMessage("store_set_auto_update", { value: value }, callback);
        };

        obj.getStoreUrl = function (callback) {
            obj.postMessage("store_get_store_url", {}, callback);
        };

        obj.setStoreUrl = function (url, callback) {
            obj.postMessage("store_set_store_url", { url: url }, callback);
        };

        obj.installApp = function (url, callback) {
            obj.postMessage("store_install_app", { url: url }, callback);
        };

        obj.upgradeApp = function (name, callback) {
            obj.postMessage("store_upgrade_app", { name: name }, callback);
        };

        obj.uninstallApp = function (name, callback) {
            obj.postMessage("store_uninstall_app", { name: name }, callback);
        };

        obj.getStoreAppList = function (callback) {
            obj.postMessage("store_get_store_applist", {}, callback);
        };

        obj.getInstalledAppList = function (callback) {
            obj.postMessage("store_get_installed_applist", {}, callback);
        };

        obj.getStoreAndInstalledAppList = function (callback) {
            obj.postMessage("store_get_store_and_installed_applist", {}, callback);
        };

        obj.setInstalledAppStatus = function (name, status, callback) {
            obj.postMessage("store_set_installed_app_status", { name: name, status: status }, callback);
        };

        obj.postMessage = function (name, data, callback) {
            factory.getMessager().postMessage(name, data, callback);
        };

        return obj;
    });

    container.define("cookieBridge", ["factory"], function (factory) {
        var obj = {};

        obj.setCookie = function (url, detail, callback) {
            obj.postMessage("cookie_set_cookie", { url: url, detail: detail }, callback);
        };

        obj.removeCookie = function (url, name, callback) {
            obj.postMessage("cookie_remove_cookie", { url: url, name: name }, callback);
        };

        obj.importCookieList = function (url, cookieList, callback) {
            obj.postMessage("cookie_import_cookie_list", { url: url, list: cookieList }, callback);
        };

        obj.clearAllCookie = function (url, callback) {
            obj.postMessage("cookie_clear_all_cookie", { url: url }, callback);
        };

        obj.getCookieList = function (url, callback) {
            obj.postMessage("cookie_get_cookie_list", { url: url }, callback);
        };

        obj.postMessage = function (name, data, callback) {
            factory.getMessager().postMessage(name, data, callback);
        };

        return obj;
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

    container.define("bridge", ["unsafeWindow", "GmBridge", "proxyBridge", "menuBridge"], function (unsafeWindow, GmBridge, proxyBridge, menuBridge) {
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
                    ONE_getProxyStatus: proxyBridge.getProxyStatus,
                    ONE_setProxyStatus: proxyBridge.setProxyStatus,
                    ONE_getProxyAuthUrl: proxyBridge.getAuthUrl,
                    ONE_setProxyAuthUrl: proxyBridge.setAuthUrl,
                    ONE_getProxySetting: proxyBridge.getProxySetting,
                    ONE_setProxySetting: proxyBridge.setProxySetting,
                    ONE_testProxySetting: proxyBridge.testProxySetting,
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
                ONE_getProxyStatus, ONE_setProxyStatus, ONE_getProxyAuthUrl, ONE_setProxyAuthUrl,
                ONE_getProxySetting, ONE_setProxySetting, ONE_testProxySetting,
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
                // ONE_getProxyStatus, ONE_setProxyStatus, ONE_getProxyAuthUrl, ONE_setProxyAuthUrl
                context.ONE_getProxyStatus,
                context.ONE_setProxyStatus,
                context.ONE_getProxyAuthUrl,
                context.ONE_setProxyAuthUrl,
                // ONE_getProxySetting, ONE_setProxySetting, ONE_testProxySetting
                context.ONE_getProxySetting,
                context.ONE_setProxySetting,
                context.ONE_testProxySetting,
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

    container.define("factory", ["addonMessager", "SafeWindow"], function (addonMessager, SafeWindow) {
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
            return addonMessager;
        };

        return obj;
    });

    container.define("app", ["addon", "runner"], function (addon, runner) {
        var obj = {};

        obj.run = function () {
            if (addon.isBackground) {
                window.OneContainer = container;
            }
            else {
                runner.runScope("#one#gm_scope#one#");
            }
        };

        return obj;
    });

    container.use(["app"], function (app) {
        app.run();
    });
})();