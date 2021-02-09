container.define("factory", ["addonDao", "cacheDao", "ScopeDao", "Resource"], function (addonDao, cacheDao, ScopeDao, Resource) {
    var obj = {
        daos: {},
        resources: {}
    };

    /** addon **/

    obj.getConfigDao = function () {
        return obj.getDao("config", function () {
            return ScopeDao(addonDao, "$config");
        });
    };

    obj.getStorageDao = function () {
        return obj.getDao("storage", function () {
            return ScopeDao(addonDao, "$storage");
        });
    };

    /** store **/

    obj.getStoreDao = function () {
        return obj.getDao("store", function () {
            return ScopeDao(addonDao, "$store");
        });
    };

    obj.getStoreAppsDao = function () {
        return obj.getDao("store:apps", function () {
            return ScopeDao(obj.getStoreDao(), "apps");
        });
    };

    obj.getStoreSettingsDao = function () {
        return obj.getDao("store:settings", function () {
            return ScopeDao(obj.getStoreDao(), "settings");
        });
    };

    /** store app **/

    obj.getAppDao = function (name) {
        return obj.getDao("store:app:" + name, function () {
            return ScopeDao(obj.getStoreSettingsDao(), name);
        });
    };

    obj.getAppResource = function (name) {
        return obj.getResource("resource:" + name, function () {
            return Resource(obj.getResourceDao(name), "resource:" + name);
        });
    };

    /** proxy **/

    obj.getProxyDao = function () {
        return obj.getDao("proxy", function () {
            return ScopeDao(addonDao, "$proxy");
        });
    };

    obj.getProxySettingsDao = function () {
        return obj.getDao("proxy:settings", function () {
            return ScopeDao(obj.getProxyDao(), "settings");
        });
    };

    /** menu **/

    obj.getMenuDao = function () {
        return obj.getDao("menu", function () {
            return ScopeDao(addonDao, "$menu");
        });
    };

    /** dao **/

    obj.getCacheDao = function () {
        return obj.getDao("cache", function () {
            return ScopeDao(cacheDao, "cache");
        });
    };

    obj.getResourceDao = function (name) {
        return obj.getDao("resource:" + name, function () {
            return ScopeDao(addonDao, "resource:" + name);
        });
    };

    obj.getDao = function (key, createFunc) {
        if (!obj.daos.hasOwnProperty(key)) {
            obj.daos[key] = createFunc();
        }
        return obj.daos[key];
    };

    /** resource **/

    obj.getCacheResource = function () {
        return obj.getResource("resource", function () {
            return Resource(obj.getCacheDao(), "resource");
        });
    };

    obj.getResource = function (key, createFunc) {
        if (!obj.resources.hasOwnProperty(key)) {
            obj.resources[key] = createFunc();
        }
        return obj.resources[key];
    };

    return obj;
});

container.define("bridge", ["addonMessager", "manifest", "env", "config", "storage", "runtime", "oneMigration", "oneGm", "oneStore", "oneProxy", "oneCookie", "oneMenu", "oneCdn"], function (addonMessager, manifest, env, config, storage, runtime, oneMigration, oneGm, oneStore, oneProxy, oneCookie, oneMenu, oneCdn) {
    var obj = {};

    obj.onMessage = function (name, callback) {
        addonMessager.onMessage(name, callback);
    };

    obj.initOne = function () {
        obj.onMessage("one_get_info", function (data, sender, callback) {
            callback(env.getInfo());
        });
        obj.onMessage("one_get_config", function (data, sender, callback) {
            callback(config.getConfig(data.name));
        });
        obj.onMessage("one_set_config", function (data, sender, callback) {
            config.setConfig(data.name, data.value);
            callback();
        });
        obj.onMessage("one_get_value", function (data, sender, callback) {
            callback(storage.getValue(data.name));
        });
        obj.onMessage("one_set_value", function (data, sender, callback) {
            storage.setValue(data.name, data.value);
            callback();
        });
        obj.onMessage("one_get_updater", function (data, sender, callback) {
            callback(runtime.getUpdater());
        });
        obj.onMessage("one_get_updater", function (data, sender, callback) {
            callback(runtime.getUpdater());
        });
        obj.onMessage("one_get_manifest", function (data, sender, callback) {
            callback(manifest.getManifest());
        });
        obj.onMessage("one_build_backup", function (data, sender, callback) {
            callback(oneMigration.buildBackup(data.scopes));
        });
        obj.onMessage("one_apply_backup", function (data, sender, callback) {
            oneMigration.applyBackup(data.scopes, data.backup, callback);
            callback();
        });
        obj.onMessage("one_apply_reset", function (data, sender, callback) {
            oneMigration.applyReset(data.scopes);
            callback();
        });
        obj.onMessage("one_get_cdn_mode", function (data, sender, callback) {
            callback(oneCdn.getCdnMode());
        });
        obj.onMessage("one_set_cdn_mode", function (data, sender, callback) {
            oneCdn.setCdnMode(data.cdn_mode);
            callback();
        });
    };

    obj.initGm = function () {
        obj.onMessage("gm_get_data", function (data, sender, callback) {
            oneGm.getData(data.scope).then(callback);
        });
        obj.onMessage("gm_set_value", function (data, sender, callback) {
            oneGm.setValue(data.scope, data.name, data.value);
            callback();
        });
        obj.onMessage("gm_delete_value", function (data, sender, callback) {
            oneGm.deleteValue(data.scope, data.name);
            callback();
        });
        obj.onMessage("gm_open_in_tab", function (data, sender, callback) {
            oneGm.openInTab(data.url, data.active).then(callback);
        });
        obj.onMessage("gm_notification", function (data, sender, callback) {
            oneGm.notification(data.text, data.title, data.image, callback);
        });
        obj.onMessage("gm_xmlhttp_request", function (data, sender, callback) {
            oneGm.xmlHttpRequest(data).then(callback);
        });
    };

    obj.initStore = function () {
        obj.onMessage("store_get_auto_update", function (data, sender, callback) {
            callback(oneStore.getAutoUpdate());
        });
        obj.onMessage("store_set_auto_update", function (data, sender, callback) {
            oneStore.setAutoUpdate(data.value);
            callback();
        });
        obj.onMessage("store_get_store_url", function (data, sender, callback) {
            callback(oneStore.getStoreUrl());
        });
        obj.onMessage("store_set_store_url", function (data, sender, callback) {
            oneStore.setStoreUrl(data.url);
            callback();
        });
        obj.onMessage("store_install_app", function (data, sender, callback) {
            oneStore.installAppWithAppUrl(data.url).then(callback);
        });
        obj.onMessage("store_upgrade_app", function (data, sender, callback) {
            oneStore.upgradeApp(data.name).then(callback);
        });
        obj.onMessage("store_uninstall_app", function (data, sender, callback) {
            oneStore.uninstallApp(data.name).then(callback);
        });
        obj.onMessage("store_get_store_applist", function (data, sender, callback) {
            oneStore.getStoreAppList().then(callback);
        });
        obj.onMessage("store_get_installed_applist", function (data, sender, callback) {
            oneStore.getInstalledAppList().then(callback);
        });
        obj.onMessage("store_get_store_and_installed_applist", function (data, sender, callback) {
            oneStore.getStoreAndInstalledAppList().then(callback);
        });
        obj.onMessage("store_set_installed_app_status", function (data, sender, callback) {
            oneStore.setInstalledAppStatus(data.name, data.status).then(callback);
        });
        obj.onMessage("store_run_installed_applist", function (data, sender, callback) {
            oneStore.runInstalledAppList(data.url, data.event, sender).then(callback);
        });
    };

    obj.initProxy = function () {
        obj.onMessage("proxy_get_proxy_status", function (data, sender, callback) {
            callback(oneProxy.getProxyStatus());
        });
        obj.onMessage("proxy_set_proxy_status", function (data, sender, callback) {
            oneProxy.setProxyStatus(data.status);
            callback();
        });
        obj.onMessage("proxy_get_auth_url", function (data, sender, callback) {
            callback(oneProxy.getAuthUrl());
        });
        obj.onMessage("proxy_set_auth_url", function (data, sender, callback) {
            oneProxy.setAuthUrl(data.url);
            callback();
        });
        obj.onMessage("proxy_get_proxy_setting", function (data, sender, callback) {
            callback(oneProxy.getModeProxySetting(data.mode));
        });
        obj.onMessage("proxy_test_proxy_setting", function (data, sender, callback) {
            oneProxy.testProxyWithSetting(data.setting, data.interval).then(callback);
        });
        obj.onMessage("proxy_set_proxy_setting", function (data, sender, callback) {
            oneProxy.applyProxyWithSetting(data).then(callback);
        });
    };

    obj.initCookie = function () {
        obj.onMessage("cookie_set_cookie", function (data, sender, callback) {
            oneCookie.setCookie(data.url, data.detail, callback);
        });
        obj.onMessage("cookie_remove_cookie", function (data, sender, callback) {
            oneCookie.removeCookie(data.url, data.name, callback);
        });
        obj.onMessage("cookie_import_cookie_list", function (data, sender, callback) {
            oneCookie.importCookieList(data.url, data.list, callback);
        });
        obj.onMessage("cookie_clear_all_cookie", function (data, sender, callback) {
            oneCookie.clearAllCookie(data.url, callback);
        });
        obj.onMessage("cookie_get_cookie_list", function (data, sender, callback) {
            oneCookie.getCookieList(data.url, callback);
        });
    };

    obj.initMenu = function () {
        obj.onMessage("menu_add_menu", function (data, sender, callback) {
            oneMenu.addMenu(data.detail);
            callback();
        });
        obj.onMessage("menu_update_menu", function (data, sender, callback) {
            oneMenu.updateMenu(data.id, data.detail);
            callback();
        });
        obj.onMessage("menu_move_menu", function (data, sender, callback) {
            oneMenu.moveMenu(data.current, data.target, data.position);
            callback();
        });
        obj.onMessage("menu_delete_menu", function (data, sender, callback) {
            oneMenu.deleteMenu(data.id);
            callback();
        });
        obj.onMessage("menu_import_menu_list", function (data, sender, callback) {
            oneMenu.importMenuList(data.list);
            callback();
        });
        obj.onMessage("menu_clear_all_menu", function (data, sender, callback) {
            oneMenu.clearAllMenu();
            callback();
        });
        obj.onMessage("menu_get_menu_list", function (data, sender, callback) {
            callback(oneMenu.getMenuList());
        });
    };

    obj.initBridge = function () {
        return new Promise(function (resolve) {
            obj.initOne();
            obj.initGm();
            obj.initStore();
            obj.initProxy();
            obj.initCookie();
            obj.initMenu();
            resolve();
        });
    };

    return obj;
});

container.define("core", ["manifest", "http", "addonDao"], function (manifest, http, addonDao) {
    var obj = {};

    obj.ready = function (callback) {
        var promiseList = [
            manifest.initManifest(),
            http.initHttp(),
            addonDao.initDao()
        ];
        Promise.all(promiseList).then(callback);
    };

    return obj;
});

container.define("app", ["command", "bridge", "oneCdn", "oneProxy", "oneStore", "oneMenu", "runtime"], function (command, bridge, oneCdn, oneProxy, oneStore, oneMenu, runtime) {
    var obj = {};

    obj.initCommand = function () {
        command.onCommand("toggle-proxy-status", oneProxy.toggleProxyStatus);
        command.onCommand("toggle-auto-update", oneStore.toggleAutoUpdate);
        command.onCommand("command-auto-update", oneStore.commandAutoUpdate);
        command.onCommand("command-update-all", oneStore.commandUpdateAll);
        command.onCommand("command-install-all", oneStore.commandInstallAll);
    };

    obj.run = function () {
        oneCdn.initCdn();

        oneProxy.initProxy();

        oneMenu.initMenu();

        oneStore.initStore().then(function () {
            obj.initCommand();

            bridge.initBridge();

            runtime.initRuntime();
        });
    };

    return obj;
});

/** lib **/
container.define("$", [], function () {
    return window.$;
});
container.define("Snap", [], function () {
    if (typeof Snap != "undefined") {
        return Snap;
    } else {
        return window.Snap;
    }
});
container.define("CryptoJS", [], function () {
    return CryptoJS;
});
container.define("QrcodeDecoder", [], function () {
    return window.QrcodeDecoder;
});

/** run **/
container.use(["core", "app"], function (core, app) {
    core.ready(app.run);
});