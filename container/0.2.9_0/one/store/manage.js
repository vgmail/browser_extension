OneUi.use(["site", "addon", "modal"], function (site, addon, modal) {

    site.setMenu("one_store_manage");

    addon.getInstall(function () {
        return window.OneContainer;
    }, function (OneContainer) {
        OneContainer.use(["storeBridge", "oneBridge"], function (storeBridge, oneBridge) {
            new Vue({
                mixins: [site.getMixin()],
                data: {
                    store_url: "",
                    cdn_mode: "auto",
                    auto_update: 0,
                    app_option: [],
                    app_list: [],
                    cdn_list: []
                },
                created: function () {
                    this.loadCdnData();
                    this.loadStoreUrl();
                    this.loadAutoUpdate();
                    this.loadAppList();
                },
                methods: {
                    loadCdnData: function () {
                        var that = this;
                        oneBridge.getCdnMode(function (cdnMode) {
                            that.cdn_mode = cdnMode;
                        });
                        oneBridge.getManifest(function (manifest) {
                            that.cdn_list = manifest["store_cdn_list"];
                        });
                    },
                    syncCdnData: function () {
                        oneBridge.setCdnMode(this.cdn_mode);
                    },
                    loadStoreUrl: function () {
                        var that = this;
                        storeBridge.getStoreUrl(function (storeUrl) {
                            that.store_url = storeUrl;
                        });
                    },
                    syncStoreUrl: function () {
                        storeBridge.setStoreUrl(this.store_url, this.loadAppList);
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
                    }
                }
            });
        });
    });
});