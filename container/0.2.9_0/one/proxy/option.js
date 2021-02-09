OneUi.use(["site", "addon", "modal"], function (site, addon, modal) {

    site.setMenu("one_proxy_option");

    addon.getInstall(function () {
        return window.OneContainer;
    }, function (OneContainer) {
        OneContainer.use(["proxyBridge"], function (proxyBridge) {
            var editors = {};
            var counter = {
                interval: null,
                message: "商店应用对代理的更改都会同步到这里...",
                time: 45
            };
            new Vue({
                mixins: [site.getMixin()],
                data: {
                    count_time: 0,
                    count_message: counter.message,
                    proxy_status: 1,
                    auth_url: "",
                    proxy_setting: {},
                    mode: "mode_pac_url",
                    mode_mapping: {
                        mode_pac_url: "PAC模式",
                        mode_rule_url: "智能RULE",
                        mode_rule_list: "自定义RULE"
                    }
                },
                created: function () {
                    this.loadProxyStatus();
                    this.loadAuthUrl();
                    this.loadProxySetting(null);
                },
                methods: {
                    showProxySetting: function (mode) {
                        this.mode = mode;
                    },
                    startCountDown: function () {
                        var that = this;

                        that.stopCountDown();

                        that.count_time = counter.time;
                        counter.interval = setInterval(function () {
                            that.count_time--;
                            if (that.count_time < 0) {
                                that.stopCountDown();
                            }
                            else {
                                that.count_message = "测试不是持久化操作，" + that.count_time + "秒后将自动还原为之前的设置";
                            }
                        }, 1000);
                    },
                    stopCountDown: function () {
                        this.count_message = counter.message;
                        counter.interval && clearInterval(counter.interval);
                    },
                    loadProxyStatus: function () {
                        var that = this;
                        proxyBridge.getProxyStatus(function (status) {
                            that.proxy_status = status == "off" ? 0 : 1;
                        });
                    },
                    syncProxyStatus: function () {
                        proxyBridge.setProxyStatus(this.proxy_status ? 1 : 0);
                    },
                    loadAuthUrl: function () {
                        var that = this;
                        proxyBridge.getAuthUrl(function (authUrl) {
                            that.auth_url = authUrl;
                        });
                    },
                    syncAuthUrl: function () {
                        proxyBridge.setAuthUrl(this.auth_url);
                    },
                    loadProxySetting: function (mode) {
                        proxyBridge.getProxySetting(mode, this.setEditorValue);
                    },
                    testProxySetting: function () {
                        var that = this;

                        that.syncEditorValue();

                        proxyBridge.testProxySetting(that.proxy_setting, counter.time, function (result) {
                            if (result.code == 1) {
                                that.setEditorValue(result.data);

                                that.startCountDown();

                                modal.alert("临时应用代理成功");
                            }
                            else {
                                modal.alert(result.msg);
                            }
                        });
                    },
                    applyProxySetting: function () {
                        var that = this;
                        if (that.syncEditorValue()) {
                            proxyBridge.setProxySetting(that.proxy_setting, function (result) {
                                if (result.code == 1) {
                                    that.loadProxySetting(that.proxy_setting.mode);

                                    that.stopCountDown();

                                    modal.alert("保存并设置代理成功");
                                }
                                else {
                                    modal.alert(result.error);
                                }
                            });
                        }
                    },
                    syncEditorValue: function () {
                        var that = this;
                        try {
                            var mode = that.proxy_setting.mode;
                            if (mode == "mode_pac_url" && !that.proxy_setting.pac_url) {
                                modal.alert("请填写PAC链接");
                                return false;
                            }
                            else if (mode == "mode_rule_list") {
                                var editor = that.autoInitEditor(mode);
                                that.proxy_setting.rule_list = JSON.parse(editor.getValue());
                            }
                            return true;
                        }
                        catch (err) {
                            modal.alert(err);
                            return false;
                        }
                    },
                    setEditorValue: function (setting) {
                        var that = this;
                        that.proxy_setting = setting;
                        setTimeout(function () {
                            try {
                                var mode = that.proxy_setting.mode;
                                if ($("#tab_" + mode).hasClass("active")) {
                                    var editor = that.autoInitEditor(mode);
                                    if (mode == "mode_pac_url") {
                                        that.proxy_setting.pac_script && editor.setValue(that.proxy_setting.pac_script);
                                    }
                                    else {
                                        var ruleListJson = JSON.stringify(that.proxy_setting.rule_list, null, 4);
                                        ruleListJson && editor.setValue(ruleListJson);
                                    }
                                }
                            }
                            catch (err) {
                                modal.alert(err);
                            }
                        }, 1000);
                    },
                    autoInitEditor: function (mode) {
                        var id = "editor_" + mode;
                        if (!editors.hasOwnProperty(id)) {
                            var element = document.getElementById(id);
                            if (element) {
                                var editor = CodeMirror.fromTextArea(element, {
                                    mode: element.getAttribute("mode"),
                                    theme: "eclipse",
                                    lint: true,
                                    indentUnit: 4,
                                    lineNumbers: true,
                                    readOnly: element.hasAttribute("disabled") ? true : false
                                });
                                editors[id] = editor;
                            }
                            else {
                                return null;
                            }
                        }
                        return editors[id];
                    }
                }
            });
        });
    });

});