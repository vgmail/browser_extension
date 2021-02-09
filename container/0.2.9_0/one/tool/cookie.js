OneUi.use(["site", "addon", "modal", "router"], function (site, addon, modal, router) {

    site.setMenu("one_tool_cookie");

    addon.getInstall(function () {
        return window.OneContainer;
    }, function (OneContainer) {
        OneContainer.use(["oneBridge", "cookieBridge"], function (oneBridge, cookieBridge) {

            var modalApp = new Vue({
                el: "#modal-default",
                data: {
                    tip: "",
                    url: "",
                    https: false,
                    name: "",
                    path: "/",
                    value: "",
                    storeId: "0",
                    httpOnly: false,
                    hostOnly: false,
                    domain: "",
                    session: false,
                    expirationDate: 0,
                    secure: false,
                    sameSite: "unspecified",
                    format: "YYYY-MM-DD HH:mm:ss"
                },
                watch: {
                    session: function (value) {
                        this.showTimePicker();
                    }
                },
                methods: {
                    showTimePicker: function () {
                        if (this.session) {
                            $("#cookie-expire-date").data("daterangepicker") && $("#cookie-expire-date").data("daterangepicker").remove();
                        }
                        else {
                            $("#cookie-expire-date").daterangepicker({
                                singleDatePicker: true,
                                timePicker: true,
                                timePicker24Hour: true,
                                timePickerSeconds: true,
                                showDropdowns: true,
                                locale: {
                                    format: this.format,
                                    applyLabel: "确定",
                                    cancelLabel: "取消",
                                }
                            });
                        }
                    },
                    addCookie: function (url) {
                        this.tip = "新增Cookie";

                        this.loadCookie(url, {
                            https: false,
                            url: "",
                            name: "",
                            path: "/",
                            value: "",
                            storeId: "0",
                            httpOnly: false,
                            hostOnly: false,
                            domain: "",
                            session: false,
                            expirationDate: moment().add(30, "day").unix(),
                            secure: false,
                            sameSite: "unspecified"
                        });
                    },
                    editCookie: function (url, item) {
                        this.tip = "编辑Cookie";

                        this.loadCookie(url, item);
                    },
                    loadCookie: function (url, item) {
                        this.url = url;
                        try {
                            var query = (new URL(this.url));
                            if (query.protocol == "https:") {
                                this.https = true;
                                if (item.domain == "") {
                                    item.domain = "." + query.hostname;
                                }
                            }
                            else {
                                this.https = false;
                            }
                        }
                        catch (err) {
                            this.https = false;
                        }

                        this.name = item.name;
                        this.path = item.path;
                        this.value = item.value;
                        this.httpOnly = item.httpOnly;
                        this.storeId = item.storeId;

                        this.hostOnly = item.hostOnly;
                        if (this.hostOnly) {
                            this.domain = "." + item.domain;
                        }
                        else {
                            this.domain = item.domain;
                        }

                        this.session = item.session;
                        if (this.session) {
                            this.expirationDate = moment().format("YYYY-MM-DD 00:00:00");
                        }
                        else {
                            this.expirationDate = moment.unix(item.expirationDate).format(this.format);
                        }

                        this.secure = item.secure;
                        this.sameSite = item.sameSite;

                        $("#modal-default").modal("show");
                        setTimeout(this.showTimePicker, 500);
                    },
                    saveCookie: function () {
                        var detail = {
                            name: this.name,
                            path: this.path,
                            value: this.value,
                            storeId: this.storeId,
                            httpOnly: this.httpOnly
                        };

                        if (this.hostOnly == false) {
                            detail.domain = this.domain;
                        }

                        if (this.session == false) {
                            detail.expirationDate = moment(this.expirationDate).unix();
                        }

                        if (this.secure) {
                            detail.secure = this.secure;
                            detail.sameSite = this.sameSite;
                        }

                        cookieBridge.setCookie(this.url, detail);

                        $("#modal-default").modal("hide");

                        addonApp.loadCookieList();
                    }
                }
            });

            var addonApp = new Vue({
                mixins: [site.getMixin()],
                data: {
                    url: "https://www.baidu.com/",
                    cookie_list: []
                },
                created: function () {
                    this.initRequest();
                },
                methods: {
                    initRequest: function () {
                        var that = this;
                        var url = router.getUrlParam("url");
                        if (url) {
                            oneBridge.setConfig("cookie_url", decodeURIComponent(url), function () {
                                location.href = location.pathname;
                            });
                        }
                        else {
                            oneBridge.getConfig("cookie_url", function (url) {
                                url && (that.url = url);
                                that.loadCookieList();
                            });
                        }
                    },
                    updateCookieUrl: function () {
                        oneBridge.setConfig("cookie_url", this.url);
                        this.loadCookieList();
                    },
                    loadCookieList: function () {
                        var that = this;
                        cookieBridge.getCookieList(that.url, function (cookieList) {
                            that.cookie_list = that.formatCookieList(cookieList);
                        });
                    },
                    formatCookieList: function (cookieList) {
                        cookieList.forEach(function (item) {
                            item.value = decodeURIComponent(item.value);

                            if (item.session) {
                                item.expirationDateStr = "仅会话";
                            }
                            else {
                                item.expirationDateStr = moment.unix(item.expirationDate).format("YYYY-MM-DD HH:mm:ss");
                            }

                            if (item.secure) {
                                if (item.sameSite == "no_restriction") {
                                    item.sameSiteStr = "不限制";
                                }
                                else if (item.sameSite == "no_restriction") {
                                    item.sameSiteStr = "宽松";
                                }
                                else if (item.sameSite == "no_restriction") {
                                    item.sameSiteStr = "严格";
                                }
                                else {
                                    item.sameSiteStr = "未设置";
                                }
                                item.sameSiteStr += "(" + item.sameSite + ")";
                            }
                            else {
                                item.sameSiteStr = "...";
                            }
                        });
                        return cookieList;
                    },
                    addCookie: function () {
                        modalApp.addCookie(this.url);
                    },
                    editCookie: function (item) {
                        modalApp.editCookie(this.url, item);
                    },
                    deleteCookie: function (item) {
                        var that = this;
                        modal.prompt("确定要删除“" + item.name + "”么？", function () {
                            cookieBridge.removeCookie(that.url, item.name, that.loadCookieList);
                        });
                    },
                    importCookie: function (el) {
                        var that = this;
                        this.parseUploadFile(el, "text", function (json) {
                            var data = JSON.parse(json);
                            if (data instanceof Object && data.cookies instanceof Array) {
                                cookieBridge.importCookieList(data.url, data.cookies, that.loadCookieList);
                            }
                        });
                    },
                    exportCookie: function () {
                        var that = this;
                        cookieBridge.getCookieList(that.url, function (cookieList) {
                            var blob = new Blob([JSON.stringify({
                                url: that.url,
                                cookies: cookieList
                            }, null, 4)], {
                                type: "application/json;charset=utf-8"
                            });
                            saveAs(blob, "one_cookie.json");
                        });
                    },
                    clearCookie: function () {
                        var that = this;
                        modal.prompt("确定要清空全部Cookie么？", function () {
                            cookieBridge.clearAllCookie(that.url, that.loadCookieList);
                        });
                    }
                }
            });
        });
    });

});