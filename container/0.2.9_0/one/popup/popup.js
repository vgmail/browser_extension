OneUi.use(["site", "addon", "modal"], function (site, addon, modal) {

    addon.getInstall(function () {
        return window.OneContainer;
    }, function (OneContainer) {

        OneContainer.use(["oneBridge"], function (oneBridge) {
            new Vue({
                el: "#addon-updater",
                data: {
                    updater: {}
                },
                created: function () {
                    this.loadUpdater();
                },
                ready: function () {
                    $(this.$el).addClass("vue-loaded");
                },
                methods: {
                    loadUpdater: function () {
                        var that = this;
                        oneBridge.getUpdater(function (updater) {
                            that.updater = updater;
                        });
                    }
                }
            });
        });

        OneContainer.use(["storeBridge", "proxyBridge"], function (storeBridge, proxyBridge) {
            new Vue({
                mixins: [site.getMixin()],
                data: {
                    auto_update: 1,
                    proxy_status: 1,
                    app_option: [],
                    app_list: []
                },
                created: function () {
                    this.loadProxyStatus();
                    this.loadAutoUpdate();
                    this.loadAppList();
                },
                methods: {
                    loadProxyStatus: function () {
                        var that = this;
                        proxyBridge.getProxyStatus(function (status) {
                            that.proxy_status = status == "off" ? 0 : 1;
                        });
                    },
                    syncProxyStatus: function () {
                        proxyBridge.setProxyStatus(this.proxy_status ? 1 : 0);
                    },
                    loadAutoUpdate: function () {
                        var that = this;
                        storeBridge.getAutoUpdate(function (autoUpdate) {
                            that.auto_update = autoUpdate == "off" ? 0 : 1;
                        });
                    },
                    syncAutoUpdate: function () {
                        storeBridge.setAutoUpdate(this.auto_update);
                    },
                    loadAppList: function () {
                        var that = this;
                        storeBridge.getStoreAndInstalledAppList(function (appList) {
                            if (appList instanceof Object) {
                                that.app_list = Object.values(appList);
                            }
                            else if (appList instanceof Array) {
                                that.app_list = appList;
                            }
                            else {
                                that.app_list = [];
                            }

                            var appOption = [];
                            that.app_list.forEach(function (app) {
                                if (app.app_status == 1) {
                                    appOption.push(app.app_name);
                                }
                            });
                            that.app_option = appOption;
                        });
                    },
                    setAppStatus: function (app) {
                        var status = this.app_option.indexOf(app.app_name) >= 0 ? 0 : 1;
                        storeBridge.setInstalledAppStatus(app.app_name, status);
                    },
                    optionApp: function (app) {
                        app.option_url && window.open(app.option_url);
                    },
                    installApp: function (app) {
                        storeBridge.installApp(app.info_url, this.loadAppList);
                    },
                    upgradeApp: function (app) {
                        storeBridge.upgradeApp(app.app_name, this.loadAppList);
                    },
                    uninstallApp: function (app) {
                        var that = this;
                        modal.prompt("确定要卸载“" + app.app_title + "”么？", function () {
                            storeBridge.uninstallApp(app.app_name, that.loadAppList);
                        });
                    },
                    showAppError: function (app) {
                        modal.alert(app.app_msg + '<p class="mt-4 ml-2">下载文件有问题？去 <a href="/one/store/manage.html" target="_blank">切换CDN</a> 试试吧！</p>');
                    }
                }
            });
        });
    });

});