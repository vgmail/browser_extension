container.define("oneCdn", ["manifest", "calendar", "storage", "$"], function (manifest, calendar, storage, $) {
    var obj = {};

    obj.getCdnList = function () {
        return manifest.getItem("store_cdn_list");
    };

    obj.getCdnNameList = function () {
        var cdnNameList = [];
        var cdnList = obj.getCdnList();
        for (var i in cdnList) {
            cdnNameList.push(cdnList[i].cdn_name);
        }
        return cdnNameList;
    };

    obj.getCdnName = function () {
        var cdnMode = obj.getCdnMode();
        if (cdnMode == "auto") {
            var cdnName = storage.getValue("cdn_name");
            return cdnName ? cdnName : "staticfile";
        }
        else {
            return cdnMode;
        }
    };

    obj.getCdnMode = function () {
        var cdnMode = storage.getValue("cdn_mode");
        if (cdnMode && obj.getCdnNameList().indexOf(cdnMode) >= 0) {
            return cdnMode;
        }
        else {
            return "staticfile";
        }
    };

    obj.setCdnMode = function (cdnMode) {
        storage.setValue("cdn_mode", cdnMode);
    };

    obj.testCdn = function (name, url) {
        return new Promise(function (resolve) {
            var startTime = calendar.getTime();
            $.ajax({
                url: url,
                dataType: "text",
                timeout: 8000,
                success: function () {
                    resolve({
                        error: 0,
                        name: name,
                        duration: (calendar.getTime() - startTime) / 1000
                    });
                },
                error: function () {
                    resolve({
                        error: 1
                    });
                }
            });
        });
    };

    obj.matchCdn = function () {
        return new Promise(function (resolve) {
            var promiseList = [];
            var cdnList = obj.getCdnList();
            for (var i in cdnList) {
                promiseList.push(obj.testCdn(cdnList[i].cdn_name, cdnList[i].test_file));
            }
            Promise.all(promiseList).then(function (result) {
                var cdnName = null, cdnDuration = null;
                result.forEach(function (item) {
                    if (item.error == 0 && (!cdnDuration || cdnDuration > item.duration)) {
                        cdnName = item.name;
                        cdnDuration = item.duration;
                    }
                });
                resolve({
                    name: cdnName,
                    duration: cdnDuration
                });
            });
        });
    };

    obj.initCdn = function () {
        var cdnMode = obj.getCdnMode();
        if (cdnMode == "auto") {
            var nowDate = calendar.formatTime("Ymd"), cdnDate = storage.getValue("cdn_date");
            if (!cdnDate || nowDate > cdnDate) {
                obj.matchCdn().then(function (result) {
                    if (result.name) {
                        storage.setValue("cdn_date", nowDate);
                        storage.setValue("cdn_name", result.name);
                        storage.setValue("cdn_duration", result.duration);
                    }
                });
            }
        }
    };

    return obj;
});

container.define("oneData", ["svgCrypt", "crypto", "env", "http", "oneCdn"], function (svgCrypt, crypto, env, http, oneCdn) {
    var obj = {};

    obj.requestOneApi = function (url, data, callback) {
        http.ajax({
            type: "post",
            url: url,
            dataType: "json",
            data: Object.assign({ cdn: oneCdn.getCdnName() }, env.getInfo(), data),
            success: function (response) {
                callback && callback(response);
            },
            error: function () {
                callback && callback("");
            }
        });
    };

    obj.requestOneContent = function (url) {
        return new Promise(function (resolve) {
            http.ajax({
                url: obj.appendReqData(url),
                dataType: "text",
                timeout: 10000,
                success: function (content) {
                    resolve(content);
                },
                error: function () {
                    resolve("");
                }
            });
        });
    };

    obj.requestOneJson = function (url) {
        return new Promise(function (resolve) {
            http.ajax({
                url: obj.appendReqData(url),
                type: "post",
                dataType: "json",
                data: Object.assign({ cdn: oneCdn.getCdnName() }, env.getInfo()),
                timeout: 5000,
                success: function (response) {
                    resolve(obj.parseOneJson(response));
                },
                error: function () {
                    resolve(null);
                }
            });
        });
    };

    obj.parseOneJson = function (response) {
        var result = null;
        try {
            if (response instanceof Object) {
                if (response.hasOwnProperty("code") && response.hasOwnProperty("data")) {
                    if (response.code == 1) {
                        result = obj.parseOneData(response.data);
                    }
                }
                else {
                    result = obj.parseOneData(response);
                }
            }
            else if (response.data instanceof Array) {
                result = obj.parseOneData(response);
            }
        } catch (e) { }
        if (result instanceof Object || result instanceof Array) {
            return result;
        }
        else {
            return null;
        }
    };

    obj.parseOneData = function (data) {
        var result = null;
        if (data instanceof Object) {
            if (data.hasOwnProperty("crypt_type") && data.hasOwnProperty("crypt_data")) {
                var cryptType = data.crypt_type.toLowerCase();
                if (cryptType == "one_aes") {
                    result = JSON.parse(crypto.oneAesDecode(data.crypt_data, data.crypt_option.password));
                } else if (cryptType == "base64") {
                    result = JSON.parse(crypto.base64Decode(data.crypt_data));
                }
            }
            else {
                result = data;
            }
        }
        else if (data instanceof Array) {
            result = data;
        }
        return result;
    };

    obj.appendReqData = function (url) {
        var reqData = svgCrypt.getReqData();
        for (var i in reqData) {
            if (url.indexOf("?") < 0) {
                url += "?";
            } else {
                url += "&";
            }
            url += i + "=" + reqData[i];
        }
        url += "&cdn=" + oneCdn.getCdnName();
        return url;
    };

    return obj;
});

container.define("oneCookie", ["addon"], function (addon) {
    var obj = {
        keys: ["url", "name", "path", "value", "httpOnly", "storeId", "domain", "expirationDate", "secure", "sameSite"]
    };

    obj.setCookie = function (url, detail, callback) {
        detail.url = url;

        if (detail.session) {
            delete detail["expirationDate"];
        }

        if (detail.hostOnly) {
            delete detail["domain"];
        }

        addon.cookies.set(_.pick(detail, obj.keys), callback);
    };

    obj.removeCookie = function (url, name, callback) {
        var detail = {
            url: url,
            name: name
        };
        addon.cookies.remove(detail, callback);
    };

    obj.importCookieList = function (url, cookieList, callback) {
        var promiseList = [];
        cookieList.forEach(function (cookie) {
            promiseList.push(new Promise(function (resolve) {
                obj.setCookie(url, cookie, resolve);
            }));
        });
        Promise.all(promiseList).then(callback);
    };

    obj.clearAllCookie = function (url, callback) {
        obj.matchCookieList(url, function (cookieList) {
            var promiseList = [];
            cookieList.forEach(function (cookie) {
                promiseList.push(new Promise(function (resolve) {
                    obj.removeCookie(url, cookie.name, resolve);
                }));
            });
            Promise.all(promiseList).then(callback);
        });
    };

    obj.getCookieStr = function (url, callback) {
        obj.getCookieList(url, function (data) {
            var str = "";
            for (var i in data) {
                str += data[i].name + "=" + decodeURIComponent(data[i].value) + "; ";
            }
            callback && callback(str);
        });
    };

    obj.getCookieList = function (url, callback) {
        obj.matchCookieList(url, function (response) {
            var data = [];
            if (response instanceof Array) {
                response.forEach(function (item) {
                    data.push({
                        url: url,
                        name: item.name,
                        path: item.path,
                        value: item.value,
                        httpOnly: item.httpOnly,
                        storeId: item.storeId,
                        hostOnly: item.domain.substring(0, 1) == "." ? false : true,
                        domain: item.domain,
                        session: item.expirationDate ? false : true,
                        expirationDate: parseInt(item.expirationDate),
                        secure: item.secure,
                        sameSite: item.sameSite
                    });
                });
            }
            callback && callback(data);
        });
    };

    obj.matchCookieList = function (url, callback) {
        try {
            addon.cookies.getAll({
                url: (new URL(url)).href
            }, callback);
        }
        catch (err) {
            callback && callback([]);
        }
    };

    return obj;
});

container.define("oneGm", ["notify", "env", "http", "router", "factory", "oneStore"], function (notify, env, http, router, factory, oneStore) {
    var obj = {};

    obj.getData = function (scope) {
        return new Promise(function (resolve) {
            oneStore.getInstalledApp(scope).then(function (app) {
                var info = {
                    mode: env.getMode(),
                    version: env.getVersion(),
                    scriptHandler: env.getAid(),
                    script: {
                        name: app.app_title,
                        version: app.app_version,
                        optionUrl: app.option_url
                    }
                };

                var values = obj.getAppDao(scope).getAll();
                // replace uid
                Object.assign(values.$config ? values.$config : {}, {
                    uid: env.getUid()
                });

                var grants = [];
                if (app instanceof Object && app.grant_list instanceof Array) {
                    grants = app.grant_list;
                }

                resolve({
                    info: info,
                    values: values,
                    grants: grants
                });
            });
        });
    };

    obj.setValue = function (scope, name, value) {
        obj.getAppDao(scope).set(name, value);
    };

    obj.deleteValue = function (scope, name) {
        obj.getAppDao(scope).remove(name);
    };

    obj.openInTab = function (url, active) {
        return new Promise(function (resolve) {
            router.openTab(url, !active, resolve);
        });
    };

    obj.notification = function (text, title, image, onclick) {
        notify.showNotify(text, title, image, onclick);
    };

    obj.xmlHttpRequest = function (details) {
        return new Promise(function (resolve) {
            var option = {
                url: details.url,
                dataType: details.responseType,
                success: function (response, status, xhr) {
                    resolve({ code: 1, response: response });
                },
                error: function (xhr, status, error) {
                    resolve({ code: 0, error: error.message });
                }
            };

            // 请求数据
            if (details.data instanceof Object) {
                option.type = "post";
                option.data = details.data;
            } else {
                option.type = "get";
            }

            // 请求头
            if (details.headers) {
                option.headers = details.headers;
            }

            // 超时
            if (details.timeout) {
                option.timeout = details.timeout;
            }

            http.ajax(option);
        });
    };

    obj.getAppDao = function (scope) {
        return factory.getAppDao(scope);
    };

    return obj;
});

container.define("oneMigration", ["addonDao", "env", "factory"], function (addonDao, env, factory, require) {
    var obj = {
        mapping: {
            config: "$config",
            proxy: "$proxy",
            menu: "$menu",
            store: "$store"
        }
    };

    obj.buildBackup = function (scopes) {
        var backup = {
            info: env.getInfo(),
            scopes: [],
            items: {}
        };
        var storage = addonDao.getAll();

        if (scopes instanceof Array) {
            for (var name in storage) {
                scopes.forEach(function (scope) {
                    if (obj.mapping.hasOwnProperty(scope) && name == obj.mapping[scope]) {
                        backup.scopes.push(scope);
                        backup.items[name] = storage[name];
                    }
                });
            }

            if (scopes.indexOf("resource") >= 0) {
                backup.scopes.push("resource");
                for (var name in storage) {
                    if (name.indexOf("resource:") >= 0) {
                        backup.items[name] = storage[name];
                    }
                }
            }
        }

        return backup;
    };

    obj.applyBackup = function (scopes, backup) {
        if (scopes instanceof Array && backup instanceof Object && backup.items instanceof Object) {
            for (var name in backup.items) {
                scopes.forEach(function (scope) {
                    if (obj.mapping.hasOwnProperty(scope) && name == obj.mapping[scope]) {
                        addonDao.set(name, backup.items[name]);
                    }
                });
            }

            if (scopes.indexOf("resource") >= 0) {
                for (var name in backup.items) {
                    if (name.indexOf("resource:") >= 0) {
                        addonDao.set(name, backup.items[name]);
                    }
                }
            }
        }

        obj.reloadAddon();
    };

    obj.applyReset = function (scopes) {
        var storage = addonDao.getAll();

        if (scopes instanceof Array) {
            scopes.forEach(function (scope) {
                if (obj.mapping.hasOwnProperty(scope)) {
                    addonDao.remove(obj.mapping[scope]);
                }
            });

            if (scopes.indexOf("resource") >= 0) {
                for (var name in storage) {
                    if (name.indexOf("resource:") >= 0) {
                        addonDao.remove(name);
                    }
                }
            }
        }

        obj.reloadAddon();
    };

    obj.reloadAddon = function () {
        require("oneProxy").initProxy();

        require("oneMenu").initMenu();

        factory.getConfigDao().load();
    };

    return obj;
});