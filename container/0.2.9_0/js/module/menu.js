container.define("downloader", ["http", "router", "crypto", "oneCookie"], function (http, router, crypto, oneCookie) {
    var obj = {};

    obj.addDownload = function (link, agent, header) {
        var headers = [];
        if (header instanceof Array) {
            headers = header;
        }
        if (agent) {
            headers.push({
                name: "User-Agent",
                value: agent
            });
        }
        http.download(link, obj.parseFileName(link), headers);
    };

    obj.addAriaTask = function (link, server, token, agent, header, callback) {
        try {
            var url = new URL(link);
            oneCookie.getCookieStr(url.origin, function (cookie) {
                var rpcObj = {
                    jsonrpc: "2.0",
                    method: "aria2.addUri",
                    id: crypto.md5(link),
                    params: [
                        "token:" + token,
                        [link],
                        {
                            header: obj.parseRpcHeader(cookie, agent, header),
                            out: obj.parseFileName(link)
                        }
                    ]
                };
                http.ajax({
                    url: server,
                    data: JSON.stringify(rpcObj),
                    headers: {
                        "content-type": "application/json"
                    },
                    type: "post",
                    dataType: "json",
                    success: function (response) {
                        callback && callback(response);
                    },
                    error: function () {
                        callback && callback("");
                    }
                });
            });
        }
        catch (err) {
        }
    };

    obj.parseRpcHeader = function (cookie, agent, header) {
        var mapping = {
            "cookie": cookie,
            "user-agent": agent ? agent : navigator.userAgent,
            "connection": "keep-alive"
        };
        if (header instanceof Array) {
            header.forEach(function (item) {
                if (item instanceof Object && item.name) {
                    mapping[item.name.toLocaleLowerCase()] = item.value ? item.value : "";
                }
            });
        }

        var rpcHeader = [];
        for (var name in mapping) {
            rpcHeader.push(name + ": " + mapping[name]);
        }
        return rpcHeader;
    };

    obj.parseFileName = function (url) {
        var param = router.parseUrlParam(url);
        if (param.filename) {
            return decodeURIComponent(param.filename);
        }
        else if (param.zipname) {
            return decodeURIComponent(param.zipname);
        }
        return "";
    };

    return obj;
});

container.define("similar", ["router", "http", "notify"], function (router, http, notify) {
    var obj = {};

    obj.similarGoogleImage = function (link) {
        var success = function (url) {
            router.openOneTab("google-image", url, true);
        };
        var error = function () {
            notify.showNotify("谷歌识图失败");
        };
        try {
            if (link.indexOf("data:") == 0) {
                var fd = new FormData();
                fd.append("encoded_image", obj.dataUrltoBlob(link), "image.png");
                fd.append("hl", "zh-CN");

                var xhr = http.xhr();
                http.ajax({
                    type: "post",
                    url: "https://www.google.com/searchbyimage/upload",
                    data: fd,
                    processData: false,
                    contentType: false,
                    xhr: function () {
                        return xhr;
                    },
                    complete: function () {
                        if (xhr.responseURL) {
                            success && success(xhr.responseURL);
                        }
                        else {
                            error && error();
                        }
                    }
                });
            }
            else {
                router.openOneTab("google-image", "https://www.google.com/searchbyimage?image_url=" + encodeURIComponent(link), true);
            }
        }
        catch (err) {
            error && error();
        }
    };

    obj.similarBaiduImage = function (link) {
        var success = function (url) {
            router.openOneTab("baidu-image", url, true);
        };
        var error = function () {
            notify.showNotify("百度识图失败");
        };
        try {
            var source, image;
            if (link.indexOf("data:") == 0) {
                source = "PC_UPLOAD_IMAGE_FILE";
                image = obj.dataUrltoBlob(link);
            }
            else {
                source = "PC_UPLOAD_SEARCH_URL";
                image = link;
            }
            obj.similarBaiduImageRequest(source, image, function (response) {
                if (response instanceof Object) {
                    if (response.status == 0) {
                        success && success(response.data.url);
                    }
                    else {
                        obj.similarBaiduImageRetry(link, success, error);
                    }
                }
            });
        }
        catch (err) {
            error && error();
        }
    };

    obj.similarBaiduImageRetry = function (link, success, error) {
        try {
            obj.urlToBlob(link, function (blob) {
                if (blob) {
                    obj.similarBaiduImageRequest("PC_UPLOAD_IMAGE_FILE", blob, function (response) {
                        if (response instanceof Object) {
                            if (response.status == 0) {
                                success && success(response.data.url);
                            }
                            else {
                                error && error();
                            }
                        }
                    });
                }
                else {
                    error && error();
                }
            });
        }
        catch (err) {
            error && error();
        }
    };

    obj.similarBaiduImageRequest = function (source, image, callback) {
        try {
            var fd = new FormData();
            fd.append("tn", "pc");
            fd.append("from", "pc");
            fd.append("uptime", (new Date()).getTime());
            fd.append("image_source", source);
            fd.append("image", image);
            fd.append("range", '{"page_from": "imageIndex"}');

            http.ajax({
                type: "post",
                url: "https://graph.baidu.com/upload",
                data: fd,
                dataType: "json",
                processData: false,
                contentType: false,
                success: function (response) {
                    callback && callback(response);
                },
                error: function () {
                    callback && callback(null);
                }
            });
        }
        catch (err) {
            callback && callback(null);
        }
    };

    obj.urlToBlob = function (url, callback) {
        var xhr = new XMLHttpRequest();
        xhr.open("GET", url, true);
        xhr.responseType = "blob";
        xhr.onload = function () {
            callback && callback(xhr.response);
        };
        xhr.onerror = function () {
            callback && callback(null);
        };
        xhr.ontimeout = function () {
            callback && callback(null);
        };
        xhr.send();
    };

    obj.dataUrltoBlob = function (dataurl) {
        var arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
            bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
        while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
        }
        return new Blob([u8arr], { type: mime });
    };

    return obj;
});

container.define("qrcoder", ["notify", "router", "QrcodeDecoder"], function (notify, router, QrcodeDecoder) {
    var obj = {};

    obj.scanQrcode = function (url) {
        obj.decodeQrcode(url).then(function (text) {
            obj.buildQrcode(text);
        }).catch(function (error) {
            notify.showNotify(error);
        });
    };

    obj.jumpQrcode = function (url) {
        obj.decodeQrcode(url).then(function (text) {
            router.openTab(text, true);
        }).catch(function (error) {
            notify.showNotify(error);
        });
    };

    obj.buildQrcode = function (text) {
        router.openOneTab("tool-qrcode", "/one/tool/qrcode.html?text=" + encodeURIComponent(text), true);
    };

    obj.decodeQrcode = function (url) {
        return new Promise(function (resolve, reject) {
            var image = new Image();
            image.onload = function (e) {
                var qr = new QrcodeDecoder();
                qr.decodeFromImage(image).then(function (result) {
                    if (result instanceof Object && result.data) {
                        resolve(result.data);
                    }
                    else {
                        reject("识别二维码失败");
                    }
                });
            };
            image.onerror = function () {
                reject("不是二维码图片");
            };
            image.src = url;
        });
    };

    return obj;
});

container.define("menuSettings", ["addon", "manifest", "factory"], function (addon, manifest, factory) {
    var obj = {};

    obj.initMenu = function () {
        var currentVersion = manifest.getItem("menu_current_version");
        var currentMenuList = manifest.getItem("menu_default_settings");
        var localVersion = obj.getDao().get("version");
        currentMenuList.forEach(function (item) {
            if (!localVersion || item.version > localVersion) {
                obj.saveMenu(item);
            }
        });
        obj.getDao().set("version", currentVersion);
    };

    obj.getMenuList = function () {
        obj.initMenu();

        var menuList = [];
        var localMenuList = obj.getLocalMenuList();
        for (var menuId in localMenuList) {
            var parseItem = obj.parseMenuItem(localMenuList[menuId]);
            if (parseItem) {
                menuList.push(parseItem);
            }
        }
        return obj.sortMenuList(menuList);
    };

    obj.addMenu = function (item) {
        item.id = obj.generateUuid();
        obj.saveMenu(item);
    };

    obj.updateMenu = function (menuId, item) {
        var localMenuList = obj.getLocalMenuList();
        if (localMenuList.hasOwnProperty(menuId)) {
            item = Object.assign(localMenuList[menuId], item, { id: menuId });
            obj.saveMenu(item);
        }
    };

    obj.saveMenu = function (item) {
        var parseItem = obj.parseMenuItem(item);
        if (parseItem) {
            var localMenuList = obj.getLocalMenuList();
            localMenuList[parseItem.id] = parseItem;
            obj.setLocalMenuList(localMenuList);
        }
    };

    obj.moveMenu = function (currentId, targetId, position) {
        var menuList = obj.getMenuList();
        var currentItem = _.find(menuList, { id: currentId });
        var targetItem = _.find(menuList, { id: targetId });
        if (currentItem && targetItem) {
            var sort = 1;
            _.each(menuList, function (menu) {
                if (menu.id == targetId) {
                    if (position == "up") {
                        currentItem.sort = sort++;
                        targetItem.sort = sort++;
                    }
                    else {
                        targetItem.sort = sort++;
                        currentItem.sort = sort++;
                    }
                }
                else if (menu.id != currentId) {
                    menu.sort = sort++;
                }
            });
            var localMenuList = _.zipObject(_.map(menuList, "id"), menuList);
            obj.setLocalMenuList(localMenuList);
        }
    };

    obj.deleteMenu = function (menuId) {
        var localMenuList = obj.getLocalMenuList();
        delete localMenuList[menuId];
        obj.setLocalMenuList(localMenuList);
    };

    obj.getMenuNum = function () {
        var localMenuList = obj.getLocalMenuList();
        return localMenuList.length;
    };

    obj.parseMenuItem = function (item) {
        if (item instanceof Object && item.id && item.type && item.title && item.contexts instanceof Array) {
            var nowTime = (new Date()).getTime();
            var allowContexts = _.values(addon.contextMenus.ContextType);
            var parseItem = {
                id: item.id,
                type: item.type,
                title: item.title,
                contexts: _.intersection(item.contexts, allowContexts),
                payload: {},
                status: item.status ? 1 : 0,
                sort: item.sort ? item.sort : obj.getMenuNum() + 1,
                crtime: item.crtime ? item.crtime : nowTime,
                uptime: item.uptime ? item.uptime : nowTime
            };
            if (item.payload instanceof Object) {
                parseItem.payload = item.payload;
            }
            return parseItem;
        }
        else {
            return null;
        }
    };

    obj.sortMenuList = function (menuList) {
        return menuList.sort(function (a, b) {
            if (a.sort < b.sort) {
                return -1;
            }
            else if (a.sort > b.sort) {
                return 1;
            }
            else {
                return 0;
            }
        });
    };

    obj.getMenuNum = function () {
        return Object.keys(obj.getLocalMenuList()).length;
    };

    obj.getLocalMenuList = function () {
        var localMenuList = obj.getDao().get("menu_list");
        localMenuList || (localMenuList = {});
        return localMenuList;
    };

    obj.setLocalMenuList = function (localMenuList) {
        obj.getDao().set("menu_list", localMenuList);
    };

    obj.clearLocalMenuList = function () {
        obj.setLocalMenuList({});
    };

    obj.generateUuid = function () {
        var time = new Date().getTime();
        return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (char) {
            var value = (time + Math.random() * 16) % 16 | 0;
            time = Math.floor(time / 16);
            return (char == "x" ? value : (value & 3 | 8)).toString(16);
        });
    };

    obj.getDao = function () {
        return factory.getMenuDao();
    };

    return obj;
});

container.define("oneMenu", ["addon", "menuSettings", "router", "similar", "downloader", "qrcoder"], function (addon, menuSettings, router, similar, downloader, qrcoder) {
    var obj = {
        items: {}
    };

    obj.initMenu = function () {
        if (addon.contextMenus) {
            var menuList = obj.getMenuList();
            obj.clearMenu().then(function () {
                menuList.forEach(function (item) {
                    obj.registerMenuItem(item);
                });
            });
        }
    };

    obj.getMenuList = function () {
        return menuSettings.getMenuList();
    };

    obj.addMenu = function (detail) {
        menuSettings.addMenu(detail);
        obj.initMenu();
    };

    obj.updateMenu = function (menuId, detail) {
        menuSettings.updateMenu(menuId, detail);
        obj.initMenu();
    };

    obj.moveMenu = function (currentId, targetId, position) {
        menuSettings.moveMenu(currentId, targetId, position);
        obj.initMenu();
    };

    obj.deleteMenu = function (menuId) {
        menuSettings.deleteMenu(menuId);
        obj.initMenu();
    };

    obj.importMenuList = function (menuList) {
        menuList.forEach(function (menu) {
            menuSettings.saveMenu(menu);
        });
        obj.initMenu();
    };

    obj.clearAllMenu = function () {
        menuSettings.setLocalMenuList({});
        obj.initMenu();
    };

    obj.registerMenuItem = function (item) {
        if (item.status) {
            obj.items[item.id] = item;
            addon.contextMenus.create({
                id: item.id,
                title: item.title,
                contexts: item.contexts,
                onclick: function (info, tab) {
                    if (obj.items.hasOwnProperty(info.menuItemId)) {
                        var item = obj.items[info.menuItemId];
                        obj.handleMenuClick(item, info, tab);
                    }
                }
            });
        }
    };

    obj.clearMenu = function () {
        return new Promise(function (resolve) {
            obj.items = {};
            addon.contextMenus.removeAll(resolve);
        });
    };

    obj.handleMenuClick = function (item, info, tab) {
        switch (item.type) {
            case "link":
                obj.handleMenuLinkEvent(item, info, tab);
                break;
            case "qrcode":
                obj.handleMenuQrcodeEvent(item, info, tab);
                break;
            case "qrcode_scan":
                obj.handleMenuQrcodeScanEvent(item, info, tab);
                break;
            case "qrcode_jump":
                obj.handleMenuQrcodeJumpEvent(item, info, tab);
                break;
            case "cookie":
                obj.handleMenuCookieEvent(item, info, tab);
                break;
            case "aria":
                obj.handleMenuAriaEvent(item, info, tab);
                break;
            case "download":
                obj.handleMenuDownloadEvent(item, info, tab);
                break;
            case "google_image":
                obj.handleMenuGoogleImageEvent(item, info, tab);
                break;
            case "baidu_image":
                obj.handleMenuBaiduImageEvent(item, info, tab);
                break;
            case "password":
                obj.handleMenuPasswordEvent(item, info, tab);
                break;
            case "script":
                obj.handleMenuScriptEvent(item, info, tab);
                break;
        }
    };

    obj.handleMenuLinkEvent = function (item, info, tab) {
        var vars = {
            "{content}": encodeURIComponent(obj.getPossibleLink(info)),
            "{text}": encodeURIComponent(info.selectionText),
            "{link}": encodeURIComponent(info.linkUrl),
            "{page}": encodeURIComponent(info.pageUrl),
            "{frame}": encodeURIComponent(info.frameUrl),
            "{src}": encodeURIComponent(info.srcUrl)
        };
        for (var name in item.payload) {
            vars["[{" + name + "}]"] = encodeURIComponent(item.payload[name]);
        }
        var url = obj.replaceVars(vars, item.payload.url);
        if (item.payload.target == "new") {
            router.openTab(url, true);
        }
        else {
            router.openOneTab(item.id, url, true);
        }
    };

    obj.handleMenuQrcodeEvent = function (item, info, tab) {
        var text = obj.getPossibleLink(info);
        qrcoder.buildQrcode(text);
    };

    obj.handleMenuQrcodeScanEvent = function (item, info, tab) {
        var text = obj.getPossibleLink(info);
        qrcoder.scanQrcode(text);
    };

    obj.handleMenuQrcodeJumpEvent = function (item, info, tab) {
        var text = obj.getPossibleLink(info);
        qrcoder.jumpQrcode(text);
    };

    obj.handleMenuCookieEvent = function (item, info, tab) {
        var link = obj.getPossibleLink(info);
        router.openOneTab("tool-cookie", "/one/tool/cookie.html?url=" + encodeURIComponent(link), true);
    };

    obj.handleMenuAriaEvent = function (item, info, tab) {
        var link = obj.getPossibleLink(info);
        downloader.addAriaTask(link, item.payload.server, item.payload.token, item.payload.agent, item.payload.header);
    };

    obj.handleMenuDownloadEvent = function (item, info, tab) {
        var link = obj.getPossibleLink(info);
        downloader.addDownload(link, item.payload.agent, item.payload.headers);
    };

    obj.handleMenuGoogleImageEvent = function (item, info, tab) {
        var link = obj.getPossibleLink(info);
        similar.similarGoogleImage(link);
    };

    obj.handleMenuBaiduImageEvent = function (item, info, tab) {
        var link = obj.getPossibleLink(info);
        similar.similarBaiduImage(link);
    };

    obj.handleMenuPasswordEvent = function (item, info, tab) {
        var showPassword = function () {
            var inputs = document.getElementsByTagName("input");
            for (var i = 0; i < inputs.length; i++) {
                if (window.__nd_toggle_password == 1) {
                    if (inputs[i].classList.contains("nd-toggle-password") == true) {
                        inputs[i].type = "password";
                    }
                }
                else {
                    if (inputs[i].type == "password") {
                        inputs[i].type = "text";

                        if (!inputs[i].classList.contains("nd-toggle-password")) {
                            inputs[i].classList.add("nd-toggle-password");
                        }
                    }
                }
            }
            window.__nd_toggle_password = window.__nd_toggle_password == 1 ? 0 : 1;
        };
        addon.tabs.executeScript(tab.id, {
            code: "(" + showPassword.toString() + ")();"
        });
    };

    obj.handleMenuScriptEvent = function (item, info, tab) {
        addon.tabs.executeScript(tab.id, {
            code: item.payload.script
        });
    };

    obj.getPossibleLink = function (info) {
        var link = "";
        if (info.srcUrl) {
            link = info.srcUrl;
        }
        else if (info.linkUrl) {
            link = info.linkUrl;
        }
        else if (info.selectionText) {
            link = info.selectionText;
        }
        else if (info.frameUrl) {
            link = info.frameUrl;
        }
        else {
            link = info.pageUrl;
        }
        return link;
    };

    obj.replaceVars = function (vars, value) {
        Object.keys(vars).forEach(function (key) {
            value = value.replace(key, vars[key]);
        });
        return value;
    };

    return obj;
});