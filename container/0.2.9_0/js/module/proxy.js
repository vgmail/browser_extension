container.define("proxy", ["addon"], function (addon) {
    var obj = {
        handlers: {
            onChange: null,
            onError: null,
            onRequest: null
        }
    };

    obj.init = function () {
        obj.addChangeListener(function (settings) {
            obj.handlers.onChange && obj.handlers.onChange(settings);
        });

        obj.addErrorListener(function (details) {
            obj.handlers.onError && obj.handlers.onError(details);
        });

        obj.addRequestListener(function (requestInfo) {
            var result = [];
            if (obj.handlers.onRequest) {
                try {
                    result = obj.handlers.onRequest(requestInfo);
                } catch (e) { }
            }
            return result.length ? result : { type: "direct" };
        });
    };

    obj.onError = function (callback) {
        obj.handlers.onError = callback;
    };

    obj.onChange = function (callback) {
        obj.handlers.onChange = callback;
    };

    obj.onRequest = function (callback) {
        obj.handlers.onRequest = callback;
    };

    obj.setSystemProxy = function () {
        return new Promise(function (resolve) {
            var settings;
            if (addon.isChrome) {
                settings = {
                    value: {
                        mode: "system"
                    },
                    scope: "regular"
                };
            } else {
                settings = {
                    value: {
                        proxyType: "system"
                    }
                };
            }
            obj.setProxy(settings).then(resolve);
        });
    };

    obj.setPacUrl = function (pacUrl) {
        return new Promise(function (resolve) {
            var settings;
            if (addon.isChrome) {
                settings = {
                    scope: "regular",
                    value: {
                        mode: "pac_script",
                        pacScript: {
                            mandatory: true,
                            url: pacUrl
                        }
                    }
                };
            } else {
                settings = {
                    value: {
                        proxyType: "autoConfig",
                        autoConfigUrl: pacUrl
                    }
                };
            }
            obj.setProxy(settings).then(resolve);
        });
    };

    obj.setPacScript = function (pacScript) {
        return new Promise(function (resolve) {
            if (addon.isChrome) {
                var settings = {
                    value: {
                        mode: "pac_script",
                        pacScript: {
                            mandatory: true,
                            data: pacScript
                        }
                    },
                    scope: "regular"
                };
                obj.setProxy(settings).then(resolve);
            } else {
                resolve();
            }
        });
    };

    obj.getProxy = function () {
        return new Promise(function (resolve) {
            addon.proxy.settings.get({}, resolve);
        });
    };

    obj.setProxy = function (settings) {
        return new Promise(function (resolve) {
            obj.clearProxy().then(function () {
                addon.proxy.settings.set(settings, resolve);
            });
        });
    };

    obj.clearProxy = function () {
        return new Promise(function (resolve) {
            obj.handlers.onRequest = null;
            addon.proxy.settings.clear({}, resolve);
        });
    };

    obj.addRequestListener = function (listener, urls) {
        urls || (urls = ["<all_urls>"]);
        if (addon.proxy.onRequest) {
            addon.proxy.onRequest.addListener(listener, {
                urls: urls
            });
        }
    };

    obj.addChangeListener = function (listener) {
        if (addon.proxy.settings.onChange) {
            addon.proxy.settings.onChange.addListener(listener);
        }
    };

    obj.addErrorListener = function (listener) {
        if (addon.isChrome) {
            addon.proxy.onProxyError.addListener(listener);
        } else {
            addon.proxy.onError.addListener(listener);
        }
    };

    return obj.init(), obj;
});

container.define("proxyMatch", [], function () {
    var obj = {
        types: {
            DIRECT: "DIRECT",
            PROXY: "PROXY",
            HTTP: "HTTP",
            HTTPS: "HTTPS",
            SOCKS: "SOCKS",
            SOCKS4: "SOCKS4"
        }
    };

    obj.matchPacProxy = function (ruleList, url, host) {
        return obj.buildPacProxy(obj.matchProxyList(ruleList, url, host));
    };

    obj.matchProxyList = function (ruleList, url, host) {
        for (var i in ruleList) {
            var rule = ruleList[i];
            if (rule.proxy_list.length) {
                for (var j in rule.include_list) {
                    var pattern = rule.include_list[j];
                    if (pattern == "*" || host == pattern.toLowerCase() || (new RegExp("\\." + pattern + "$", "i")).test(host)) {
                        return rule.proxy_list;
                    }
                }
            }
        }
        return [];
    };

    obj.buildPacProxy = function (proxyList) {
        var rows = [];
        proxyList.forEach(function (item) {
            var type = item.type.toUpperCase();
            switch (type) {
                case obj.types.PROXY:
                case obj.types.HTTP:
                case obj.types.HTTPS:
                case obj.types.SOCKS4:
                    rows.push(type + " " + item.host + ":" + item.port);
                    break;
                case obj.types.SOCKS:
                    rows.push("SOCKS5 " + item.host + ":" + item.port);
                    break;
            }
        });
        if (rows.length == 0) {
            rows.push(obj.types.DIRECT);
        }
        return rows.join("; ");
    };

    return obj;
});

container.define("proxyAuth", ["addon", "svgCrypt", "oneData"], function (addon, svgCrypt, oneData) {
    var obj = {
        auth: null,
        proxys: {},
        rules: [],
        requests: {}
    };

    obj.setAuth = function (authUrl, ruleList) {
        obj.resetAuth();

        obj.auth = authUrl;
        obj.rules = ruleList;

        obj.processAuth();

        obj.registerAuthListener();
    };

    obj.changeAuth = function (authUrl) {
        obj.resetAuth();

        obj.auth = authUrl;

        obj.processAuth();
    };

    obj.clearAuth = function () {
        obj.resetAuth();

        obj.removeAuthListener();
    };

    obj.resetAuth = function () {
        obj.auth = null;

        obj.proxys = {};

        obj.rules = [];

        obj.requests = [];
    };

    obj.processAuth = function () {
        for (var i in obj.rules) {
            var rule = Object.assign({}, obj.rules[i]);
            if (!rule.rule_auth) {
                rule.rule_auth = obj.auth;
            }

            for (var j in rule.proxy_list) {
                var proxy = Object.assign({}, rule.proxy_list[j]);
                if (!proxy.auth) {
                    proxy.auth = rule.rule_auth;
                }

                obj.proxys[obj.buildProxyKey(proxy.host, proxy.port)] = proxy;
            }
        }
    };

    obj.handleAuthEventChrome = function (requestDetails, callback) {
        var result = obj.handleAuthEventFireFox(requestDetails);
        if (result.then) {
            result.then(callback);
        }
        else {
            callback(result);
        }
    };

    obj.handleAuthEventFireFox = function (requestDetails) {
        if (!requestDetails.isProxy) {
            return;
        }

        if (obj.requests.hasOwnProperty(requestDetails.requestId)) {
            return { cancel: true };
        }
        else {
            obj.requests[requestDetails.requestId] = true;
        }

        var proxyHost = requestDetails.challenger.host;
        var proxyPort = requestDetails.challenger.port;
        var proxyKey = obj.buildProxyKey(proxyHost, proxyPort);
        if (obj.proxys.hasOwnProperty(proxyKey)) {
            var proxy = obj.proxys[proxyKey];
            if (proxy.username && proxy.password) {
                var auth = {
                    authCredentials: {
                        username: proxy.username,
                        password: proxy.password
                    }
                };
                delete proxy.username;
                delete proxy.password;
                return auth;
            }
            else if (proxy.auth) {
                return obj.requestProxyAuth(proxy.auth, proxy.no, proxyHost, proxyPort);
            }
        }

        if (obj.auth) {
            return obj.requestProxyAuth(obj.auth, undefined, proxyHost, proxyPort);
        }

        return { cancel: true };
    };

    obj.requestProxyAuth = function (authUrl, proxyNo, proxyHost, proxyPort) {
        return new Promise(function (resolve) {
            oneData.requestOneApi(authUrl, {
                proxy_no: proxyNo ? proxyNo : "",
                proxy_host: proxyHost,
                proxy_port: proxyPort,
                proxy_point: proxyNo ? svgCrypt.getStrPoint(proxyNo) : svgCrypt.getStrPoint(proxyHost)
            }, function (response) {
                if (response instanceof Object && response.data instanceof Object && response.data.username && response.data.password) {
                    resolve({
                        authCredentials: {
                            username: response.data.username,
                            password: response.data.password
                        }
                    });
                }
                else {
                    resolve({ cancel: true });
                }
            });
        });
    };

    obj.buildProxyKey = function (host, port) {
        return host.toLowerCase() + ":" + port;
    };

    obj.registerAuthListener = function () {
        if (addon.isChrome) {
            if (!addon.webRequest.onAuthRequired.hasListener(obj.handleAuthEventChrome)) {
                addon.webRequest.onAuthRequired.addListener(obj.handleAuthEventChrome, { urls: ["<all_urls>"] }, ["asyncBlocking"]);
            }
        }
        else {
            if (!addon.webRequest.onAuthRequired.hasListener(obj.handleAuthEventFireFox)) {
                addon.webRequest.onAuthRequired.addListener(obj.handleAuthEventFireFox, { urls: ["<all_urls>"] }, ["blocking"]);
            }
        }
    };

    obj.removeAuthListener = function () {
        if (addon.isChrome) {
            if (addon.webRequest.onAuthRequired.hasListener(obj.handleAuthEventChrome)) {
                addon.webRequest.onAuthRequired.removeListener(obj.handleAuthEventChrome);
            }
        }
        else {
            if (addon.webRequest.onAuthRequired.hasListener(obj.handleAuthEventFireFox)) {
                addon.webRequest.onAuthRequired.removeListener(obj.handleAuthEventFireFox);
            }
        }
    };

    return obj;
});

container.define("proxyPac", ["proxyMatch"], function (proxyMatch) {
    var obj = {};

    obj.buildPacScript = function (ruleList) {
        var rows = [];
        rows.push(obj.serializeJson(ruleList, "ruleList"));
        rows.push(obj.serializeObject(proxyMatch, "proxyMatch"));
        rows.push(obj.serializeFunction(function (url, host) {
            return proxyMatch.matchPacProxy(ruleList, url, host);
        }, "FindProxyForURL"));
        return rows.join("\n");
    };

    obj.serializeObject = function (obj, name) {
        var rows = [];
        rows.push("var " + name + " = (function () {");
        rows.push("    var obj = {};");
        for (var i in obj) {
            var property = obj[i];
            if (property instanceof Function) {
                rows.push("    obj." + i + " = " + property.toString() + ";");
            } else if (property instanceof Array || property instanceof Object) {
                rows.push("    obj." + i + " = " + JSON.stringify(property) + ";");
            } else if (typeof property == "string") {
                rows.push("    obj." + i + " = \"" + property + "\";");
            } else {
                rows.push("    obj." + i + " = " + property + ";");
            }
        }
        rows.push("    return obj;");
        rows.push("})();");
        return rows.join("\n");
    };

    obj.serializeJson = function (json, name) {
        return "var " + name + " = " + JSON.stringify(json) + ";";
    };

    obj.serializeFunction = function (func, name) {
        return "var " + name + " = " + func.toString() + ";";
    };

    return obj;
});

container.define("proxyRule", ["oneData"], function (oneData) {
    var obj = {};

    obj.fetchPacScript = function (pacUrl) {
        return new Promise(function (resolve) {
            if (pacUrl) {
                oneData.requestOneContent(pacUrl).then(resolve);
            }
            else {
                resolve(null);
            }
        });
    };

    obj.fetchRuleList = function (ruleUrl) {
        return new Promise(function (resolve) {
            if (ruleUrl) {
                oneData.requestOneJson(ruleUrl).then(resolve);
            }
            else {
                resolve(null);
            }
        });
    };

    obj.checkPacScript = function (pacScript) {
        if (pacScript && pacScript.toLowerCase().indexOf("findproxyforurl") >= 0) {
            return true;
        }
        else {
            return false;
        }
    };

    obj.parseRuleList = function (ruleList) {
        return new Promise(function (resolve) {
            var promiseList = [];
            if (ruleList instanceof Array) {
                for (var i in ruleList) {
                    promiseList.push(obj.parseRuleItem(ruleList[i]));
                }
            }
            Promise.all(promiseList).then(resolve);
        });
    };

    obj.parseRuleItem = function (item) {
        return new Promise(function (resolve) {
            if (!(item instanceof Object)) {
                item = {};
            }

            var promiseList = [
                obj.parseRuleItemProxy(item.proxy_url, item.proxy_list),
                obj.parseRuleItemInclude(item.include_url, item.include_list),
                obj.parseRuleItemExclude(item.exclude_url, item.exclude_list)
            ];
            Promise.all(promiseList).then(function (result) {
                resolve(Object.assign(result[0], result[1], result[2], {
                    rule_auth: item.rule_auth
                }));
            });
        });
    };

    obj.parseRuleItemProxy = function (proxyUrl, proxyList) {
        return new Promise(function (resolve) {
            if (typeof proxyUrl == "string" && proxyUrl) {
                oneData.requestOneJson(proxyUrl).then(function (proxyList) {
                    resolve({
                        proxy_url: proxyUrl,
                        proxy_list: obj.filterRuleItemProxyList(proxyList)
                    });
                });
            } else {
                resolve({
                    proxy_url: "",
                    proxy_list: obj.filterRuleItemProxyList(proxyList)
                });
            }
        });
    };

    obj.filterRuleItemProxyList = function (proxyList) {
        var list = [];
        if (proxyList instanceof Array || proxyList instanceof Object) {
            for (var i in proxyList) {
                var item = proxyList[i];
                if (item instanceof Object && item.type && item.host && item.port) {
                    list.push(Object.assign({}, item));
                }
            }
        }
        return list;
    };

    obj.parseRuleItemInclude = function (includeUrl, includeList) {
        return new Promise(function (resolve) {
            if (typeof includeUrl == "string" && includeUrl) {
                oneData.requestOneJson(includeUrl).then(function (includeList) {
                    resolve({
                        include_url: includeUrl,
                        include_list: obj.filterRuleItemPatternList(includeList)
                    });
                });
            } else {
                resolve({
                    include_url: "",
                    include_list: obj.filterRuleItemPatternList(includeList)
                });
            }
        });
    };

    obj.parseRuleItemExclude = function (excludeUrl, excludeList) {
        return new Promise(function (resolve) {
            if (typeof excludeUrl == "string" && excludeUrl) {
                oneData.requestOneJson(excludeUrl).then(function (excludeList) {
                    resolve({
                        exclude_url: excludeUrl,
                        exclude_list: obj.filterRuleItemPatternList(excludeList)
                    });
                });
            } else {
                resolve({
                    exclude_url: "",
                    exclude_list: obj.filterRuleItemPatternList(excludeList)
                });
            }
        });
    };

    obj.filterRuleItemPatternList = function (patternList) {
        var list = [];
        if (patternList instanceof Array || patternList instanceof Object) {
            for (var i in patternList) {
                var pattern = patternList[i];
                if (typeof pattern == "string" && pattern) {
                    list.push(pattern.toLowerCase());
                }
            }
        }
        return list;
    };

    return obj;
});

container.define("proxyTest", ["manifest", "http", "oneData"], function (manifest, http, oneData) {
    var obj = {};

    obj.preTestProxy = function () {
        var apiUrl = manifest.getItem("proxy_default_test_url");
        var defaultTestUrlList = manifest.getItem("proxy_test_url_list");
        oneData.requestOneJson(apiUrl).then(function (proxyTestUrlList) {
            if (proxyTestUrlList instanceof Array && proxyTestUrlList.length) {
                obj.preTestUrlList(proxyTestUrlList);
            }
            else {
                obj.preTestUrlList(defaultTestUrlList);
            }
        });
    };

    obj.preTestUrlList = function (testUrlList) {
        // speed up loading && reduce proxy auth popup
        testUrlList.forEach(function (testUrl) {
            if (testUrl.indexOf("?") > 0) {
                testUrl = testUrl + "&_=" + Math.random();
            } else {
                testUrl = testUrl + "?_=" + Math.random();
            }
            http.ajax({
                type: "get",
                url: testUrl,
                timeout: 60000
            });
        });
    };

    return obj;
});

container.define("oneProxy", ["addon", "manifest", "notify", "proxy", "proxyMatch", "proxyPac", "proxyAuth", "proxyRule", "proxyTest", "factory"], function (addon, manifest, notify, proxy, proxyMatch, proxyPac, proxyAuth, proxyRule, proxyTest, factory) {
    var obj = {
        timer: null,
        modes: {
            PAC_URL: "mode_pac_url",
            RULE_URL: "mode_rule_url",
            RULE_LIST: "mode_rule_list"
        }
    };

    obj.initProxy = function (resolve) {
        return new Promise(function () {
            if (obj.getProxyStatus() != "off") {
                var setting = obj.getModeProxySetting(null);
                obj.applyProxyWithSetting(setting).then(resolve);
            }
            else {
                obj.clearProxy().then(resolve);
            }
        });
    };

    obj.initProxyTimer = function (interval) {
        obj.timer && clearTimeout(obj.timer);
        interval && (obj.timer = setTimeout(obj.initProxy, interval * 1000));
    };

    obj.parseTestIntveral = function (interval) {
        interval = parseInt(interval);
        if (isNaN(interval) || interval < 1) {
            interval = 30;
        }
        return interval;
    };

    obj.parseProdIntveral = function (interval) {
        var nanInterval = parseInt(manifest.getItem("proxy_nan_interval"));
        var minInterval = parseInt(manifest.getItem("proxy_min_interval"));
        var maxInterval = parseInt(manifest.getItem("proxy_max_interval"));

        interval = parseInt(interval);
        nanInterval || (nanInterval = 3600);
        minInterval || (minInterval = 600);
        maxInterval || (maxInterval = 21600);

        if (isNaN(interval)) {
            interval = nanInterval;
        }
        else if (interval < minInterval) {
            interval = minInterval;
        }
        else if (interval > maxInterval) {
            interval = maxInterval;
        }

        return interval;
    };

    obj.toggleProxyStatus = function () {
        if (obj.getProxyStatus() != "off") {
            obj.setProxyStatus(0);
            notify.showNotify("已关闭代理");
        }
        else {
            obj.setProxyStatus(1);
            notify.showNotify("已启用代理");
        }
    };

    obj.getProxyStatus = function () {
        return obj.getProxyDao().get("proxy_status") == "on" ? "on" : "off";
    };

    obj.setProxyStatus = function (status) {
        obj.getProxyDao().set("proxy_status", status ? "on" : "off");

        obj.initProxy();
    };

    obj.getAuthUrl = function () {
        var authUrl = obj.getProxyDao().get("auth_url");
        authUrl || (authUrl = manifest.getItem("proxy_default_auth_url"));
        return authUrl;
    };

    obj.setAuthUrl = function (authUrl) {
        obj.getProxyDao().set("auth_url", authUrl);

        proxyAuth.changeAuth(authUrl);
    };

    obj.applyProxyWithSetting = function (setting) {
        return new Promise(function (resolve) {
            obj.buildProxySetting(setting).then(function (result) {
                if (result.code == 1) {
                    setting = Object.assign(result.data, {
                        interval: obj.parseProdIntveral(setting.interval)
                    });

                    obj.initProxyTimer(setting.interval);

                    obj.setModeProxySetting(setting.mode, setting);

                    obj.setProxyWithSetting(setting);
                }
                resolve(result);
            });
        });
    };

    obj.testProxyWithSetting = function (setting, interval) {
        return new Promise(function (resolve) {
            obj.buildProxySetting(setting).then(function (result) {
                if (result.code == 1) {
                    setting = Object.assign(result.data, {
                        interval: obj.parseProdIntveral(setting.interval)
                    });

                    setting.interval = obj.parseProdIntveral(interval);

                    obj.initProxyTimer(obj.parseTestIntveral(interval));

                    obj.setProxyWithSetting(setting);
                }
                resolve(result);
            });
        });
    };

    obj.setProxyWithSetting = function (setting) {
        return new Promise(function (resolve) {
            var mode = setting.mode;
            if (mode == obj.modes.PAC_URL) {
                obj.setProxyWithPacUrl(setting.pac_url).then(resolve);
            }
            else if (mode == obj.modes.RULE_URL) {
                obj.setProxyWithRuleList(setting.parse_rule_list).then(resolve);
            }
            else if (mode == obj.modes.RULE_LIST) {
                obj.setProxyWithRuleList(setting.parse_rule_list).then(resolve);
            }
            else {
                obj.clearProxy().then(resolve);
            }
        });
    };

    obj.setProxyWithPacUrl = function (pacUrl) {
        return new Promise(function (resolve) {
            proxyAuth.setAuth(obj.getAuthUrl(), []);

            proxy.setPacUrl(pacUrl).then(function () {
                proxyTest.preTestProxy();

                resolve();
            });
        });
    };

    obj.setProxyWithRuleList = function (ruleList) {
        return new Promise(function (resolve) {
            proxyAuth.setAuth(obj.getAuthUrl(), ruleList);

            if (addon.isChrome) {
                proxy.setPacScript(proxyPac.buildPacScript(ruleList)).then(function () {
                    proxyTest.preTestProxy();

                    resolve();
                });
            } else {
                proxy.onRequest(function (requestInfo) {
                    var url = new URL(requestInfo.url);
                    return proxyMatch.matchProxyList(ruleList, requestInfo.url, url.host);
                });

                proxyTest.preTestProxy();

                resolve();
            }
        });
    };

    obj.clearProxy = function () {
        return new Promise(function (resolve) {
            proxyAuth.clearAuth();
            proxy.clearProxy().then(resolve);
        });
    };

    obj.buildProxySetting = function (setting) {
        return new Promise(function (resolve) {
            var mode = setting.mode;
            if (mode == obj.modes.PAC_URL) {
                obj.buildProxySettingWithPacUrl(setting.pac_url).then(resolve);
            }
            else if (mode == obj.modes.RULE_URL) {
                obj.buildProxySettingWithRuleUrl(setting.rule_url).then(resolve);
            }
            else if (mode == obj.modes.RULE_LIST) {
                obj.buildProxySettingWithRuleList(setting.rule_list).then(resolve);
            }
            else {
                resolve({
                    code: 0,
                    msg: "未知的代理模式",
                    data: setting
                });
            }
        });
    };

    obj.buildProxySettingWithPacUrl = function (pacUrl) {
        return new Promise(function (resolve) {
            proxyRule.fetchPacScript(pacUrl).then(function (pacScript) {
                var data = {
                    mode: obj.modes.PAC_URL,
                    pac_url: pacUrl,
                    pac_script: pacScript
                };
                if (proxyRule.checkPacScript(pacScript)) {
                    resolve({
                        code: 1,
                        msg: "success",
                        data: data
                    });
                }
                else {
                    resolve({
                        code: 0,
                        msg: "无效的PAC地址",
                        data: data
                    });
                }
            });
        });
    };

    obj.buildProxySettingWithRuleUrl = function (ruleUrl) {
        return new Promise(function (resolve) {
            proxyRule.fetchRuleList(ruleUrl).then(function (ruleList) {
                var data = {
                    mode: obj.modes.RULE_URL,
                    rule_url: ruleUrl
                };
                if (ruleList instanceof Array) {
                    obj.buildProxySettingWithRuleList(ruleList).then(function (setting) {
                        Object.assign(setting.data, data);
                        resolve(setting);
                    });
                }
                else {
                    resolve({
                        code: 0,
                        msg: "无效的RULE地址",
                        data: data
                    });
                }
            });
        });
    };

    obj.buildProxySettingWithRuleList = function (ruleList) {
        return new Promise(function (resolve) {
            proxyRule.parseRuleList(ruleList).then(function (parseRuleList) {
                var data = {
                    mode: obj.modes.RULE_LIST,
                    rule_list: ruleList,
                    parse_rule_list: parseRuleList
                };
                if (parseRuleList.length) {
                    resolve({
                        code: 1,
                        msg: "success",
                        data: data
                    });
                }
                else {
                    resolve({
                        code: 0,
                        msg: "无效的RULE规则",
                        data: data
                    });
                }
            });
        });
    };

    obj.getModeProxySetting = function (mode) {
        mode || (mode = obj.getProxyMode());
        var setting = obj.getProxySettingsDao().get(mode);
        if (setting instanceof Object) {
            return setting;
        }
        else {
            var defaultProxySettings = manifest.getItem("proxy_default_settings");
            if (defaultProxySettings instanceof Object && defaultProxySettings.hasOwnProperty(mode)) {
                return defaultProxySettings[mode];
            }
            else {
                return {
                    mode: mode,
                    interval: 3600
                };
            }
        }
    };

    obj.setModeProxySetting = function (mode, setting) {
        obj.getProxySettingsDao().set(mode, setting);

        obj.setProxyMode(mode);
    };

    obj.getProxyMode = function () {
        var mode = obj.getProxyDao().get("proxy_mode");
        return mode ? mode : manifest.getItem("proxy_default_mode");
    };

    obj.setProxyMode = function (mode) {
        obj.getProxyDao().set("proxy_mode", mode);
    };

    obj.getProxyDao = function () {
        return factory.getProxyDao();
    };

    obj.getProxySettingsDao = function () {
        return factory.getProxySettingsDao();
    };

    return obj;
});