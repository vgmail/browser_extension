container.define("router", ["addon"], function (addon) {
    var obj = {
        _init: false,
        url: location.href,
        tids: {},
        rids: []
    };

    obj.getUrl = function () {
        return obj.url;
    };

    obj.setUrl = function (url) {
        obj.url = url;
    };

    obj.openUrl = function (url) {
        window.open(url);
    };

    obj.openTab = function (url, active, callback) {
        obj.initRouter();

        addon.tabs.create({ url: url, active: active }, callback);
    };

    obj.openOneTab = function (key, url, active, callback) {
        obj.initRouter();

        if (obj.tids.hasOwnProperty(key) && obj.rids.indexOf(obj.tids[key]) < 0) {
            addon.tabs.update(obj.tids[key], { url: url, active: active }, callback);
        }
        else {
            obj.openTab(url, active, function (tab) {
                if (tab) {
                    obj.tids[key] = tab.id;
                }
                callback && callback(tab);
            });
        }
    };

    obj.getUrlParam = function (name) {
        var param = obj.parseUrlParam(obj.getUrl());
        if (name) {
            return param.hasOwnProperty(name) ? param[name] : null;
        }
        else {
            return param;
        }
    };

    obj.parseUrlParam = function (url) {
        if (url.indexOf("?")) {
            url = url.split("?")[1];
        }
        var reg = /([^=&\s]+)[=\s]*([^=&\s]*)/g;
        var obj = {};
        while (reg.exec(url)) {
            obj[RegExp.$1] = RegExp.$2;
        }
        return obj;
    };

    obj.handleRemoved = function (tabId, removeInfo) {
        obj.rids.push(tabId);
    };

    obj.initRouter = function () {
        if (obj._init == false) {
            obj._init = true;
            addon.tabs.onRemoved.addListener(obj.handleRemoved);
        }
    };

    return obj;
});

container.define("badge", ["addon"], function (addon) {
    var obj = {};

    obj.setText = function (text, color) {
        addon.browserAction.setBadgeText({
            text: text
        });
        addon.browserAction.setBadgeBackgroundColor({
            color: color ? color : "#FF0000"
        });
    };

    obj.clearText = function () {
        obj.setText("");
    };

    return obj;
});

container.define("notify", ["addon", "manifest"], function (addon, manifest) {
    var obj = {
        _init: false,
        listeners: {}
    };

    obj.showNotify = function (text, title, image, listener) {
        obj.initNotify();

        var id = obj.randString(32);
        obj.listeners[id] = listener;
        title || (title = manifest.getName());
        image || (image = manifest.getLogo());
        addon.notifications.create(id, {
            "type": "basic",
            "iconUrl": image,
            "title": title,
            "message": text
        });
    };

    obj.handleNotify = function (notificationId) {
        addon.notifications.clear(notificationId);

        if (obj.listeners.hasOwnProperty(notificationId)) {
            var listener = obj.listeners[notificationId];
            listener && listener();
            delete obj.listeners[notificationId];
        }
    };

    obj.randString = function (length) {
        var possible = "abcdefghijklmnopqrstuvwxyz0123456789";
        var text = "";
        for (var i = 0; i < length; i++) {
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        }
        return text;
    };

    obj.initNotify = function () {
        if (obj._init == false) {
            obj._init = true;
            addon.notifications.onClicked.addListener(obj.handleNotify);
        }
    };

    return obj;
});

container.define("command", ["addon"], function (addon) {
    var obj = {
        _init: false,
        listeners: {}
    };

    obj.onCommand = function (name, listener) {
        obj.initCommand();

        obj.listeners[name] = listener;
    };

    obj.handleCommand = function (name) {
        if (obj.listeners.hasOwnProperty(name)) {
            var listener = obj.listeners[name];
            listener && listener();
        }
    };

    obj.initCommand = function () {
        if (obj._init == false && addon.commands) {
            obj._init = true;
            addon.commands.onCommand.addListener(obj.handleCommand);
        }
    };

    return obj;
});

container.define("config", ["factory"], function (factory) {
    var obj = {};

    obj.getConfig = function (name) {
        return obj.getDao().get(name);
    };

    obj.setConfig = function (name, value) {
        obj.getDao().set(name, value);
    };

    obj.getAll = function () {
        return obj.getDao().getAll();
    };

    obj.getDao = function () {
        return factory.getConfigDao();
    };

    return obj;
});

container.define("storage", ["factory"], function (factory) {
    var obj = {};

    obj.getValue = function (name) {
        return obj.getDao().get(name);
    };

    obj.setValue = function (name, value) {
        obj.getDao().set(name, value);
    };

    obj.getAll = function () {
        return obj.getDao().getAll();
    };

    obj.getDao = function () {
        return factory.getStorageDao();
    };

    return obj;
});

container.define("env", ["addon", "config"], function (addon, config) {
    var obj = {
        modes: {
            ADDON: "addon",
            SCRIPT: "script"
        },
        browsers: {
            FIREFOX: "firefox",
            EDG: "edg",
            EDGE: "edge",
            BAIDU: "baidu",
            LIEBAO: "liebao",
            UC: "uc",
            QQ: "qq",
            SOGOU: "sogou",
            OPERA: "opera",
            MAXTHON: "maxthon",
            IE2345: "2345",
            SE360: "360",
            CHROME: "chrome",
            SAFIRI: "safari",
            OTHER: "other"
        }
    };

    obj.getMode = function () {
        return obj.modes.ADDON;
    };

    obj.getAid = function () {
        return addon.runtime.id;
    };

    obj.getUid = function () {
        var uid = config.getConfig("uid");
        if (!uid) {
            uid = obj.randString(32);
            config.setConfig("uid", uid);
        }
        return uid;
    };

    obj.getVersion = function () {
        var manifest = addon.runtime.getManifest();
        return manifest.version;
    };

    obj.getBrowser = function () {
        if (!obj._browser) {
            obj._browser = obj.matchBrowserType(navigator.userAgent);
        }
        return obj._browser;
    };

    obj.getEdition = function () {
        return obj.getVersion();
    };

    obj.getInfo = function () {
        return {
            mode: obj.getMode(),
            aid: obj.getAid(),
            uid: obj.getUid(),
            version: obj.getVersion(),
            browser: obj.getBrowser(),
            edition: obj.getEdition()
        };
    };

    obj.matchBrowserType = function (userAgent) {
        var browser = obj.browsers.OTHER;
        userAgent = userAgent.toLowerCase();
        if (userAgent.match(/firefox/) != null) {
            browser = obj.browsers.FIREFOX;
        } else if (userAgent.match(/edge/) != null) {
            browser = obj.browsers.EDGE;
        } else if (userAgent.match(/edg/) != null) {
            browser = obj.browsers.EDG;
        } else if (userAgent.match(/bidubrowser/) != null) {
            browser = obj.browsers.BAIDU;
        } else if (userAgent.match(/lbbrowser/) != null) {
            browser = obj.browsers.LIEBAO;
        } else if (userAgent.match(/ubrowser/) != null) {
            browser = obj.browsers.UC;
        } else if (userAgent.match(/qqbrowse/) != null) {
            browser = obj.browsers.QQ;
        } else if (userAgent.match(/metasr/) != null) {
            browser = obj.browsers.SOGOU;
        } else if (userAgent.match(/opr/) != null) {
            browser = obj.browsers.OPERA;
        } else if (userAgent.match(/maxthon/) != null) {
            browser = obj.browsers.MAXTHON;
        } else if (userAgent.match(/2345explorer/) != null) {
            browser = obj.browsers.IE2345;
        } else if (userAgent.match(/chrome/) != null) {
            if (navigator.mimeTypes.length > 10) {
                browser = obj.browsers.SE360;
            } else {
                browser = obj.browsers.CHROME;
            }
        } else if (userAgent.match(/safari/) != null) {
            browser = obj.browsers.SAFIRI;
        }
        return browser;
    };

    obj.randString = function (length) {
        var possible = "abcdefghijklmnopqrstuvwxyz0123456789";
        var text = "";
        for (var i = 0; i < length; i++) {
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        }
        return text;
    };

    return obj;
});

container.define("runtime", ["addon", "manifest", "calendar", "router", "badge", "storage", "env", "oneData"], function (addon, manifest, calendar, router, badge, storage, env, oneData) {
    var obj = {};

    obj.getUpdater = function () {
        var updater = {
            version_current: env.getVersion(),
            version_latest: storage.getValue("version_latest")
        };
        updater.need_update = updater.version_latest > updater.version_current ? 1 : 0;

        var versionPayload = storage.getValue("version_payload");
        if (versionPayload instanceof Object && versionPayload.url) {
            updater.upgrade_url = versionPayload.url;
        }
        else {
            updater.upgrade_url = manifest.getUrl("upgrade");
        }

        return updater;
    };

    obj.initBadge = function () {
        var updater = obj.getUpdater();
        if (updater.need_update) {
            badge.setText("#");
        }
        else {
            badge.clearText();
        }
    };

    obj.initVersion = function () {
        var versionDate = parseInt(storage.getValue("version_date"));
        var currentDate = calendar.formatTime("Ymd");
        if (!versionDate || versionDate < currentDate) {
            oneData.requestOneApi(manifest.getApi("version"), {}, function (response) {
                storage.setValue("version_date", currentDate);

                if (response && response.code == 1 && response.data instanceof Object) {
                    var versionPayload = response.data;
                    storage.setValue("version_payload", versionPayload);
                    storage.setValue("version_latest", versionPayload.version);
                }

                obj.initBadge();
            });
        }
        else {
            obj.initBadge();
        }
    };

    obj.initInstall = function () {
        var optionDate = storage.getValue("option_date");
        var targetDate = manifest.getItem("option_date");
        if (!optionDate || optionDate < targetDate) {
            storage.setValue("option_date", targetDate);
            router.openTab(manifest.getOptionsPage(), true);
        }
    };

    obj.initUninstall = function () {
        addon.runtime.setUninstallURL(manifest.getUrl("uninstall") + "?aid=" + env.getAid() + "&version=" + env.getVersion() + "&browser=" + env.getBrowser());
    };

    obj.initRuntime = function () {
        obj.initVersion();
        obj.initInstall();
        obj.initUninstall();
    };

    return obj;
});