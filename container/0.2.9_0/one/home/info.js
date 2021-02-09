OneUi.use(["site", "addon", "modal"], function (site, addon, modal) {

    site.setMenu("one_home_info");

    addon.getInstall(function () {
        return window.OneContainer;
    }, function (OneContainer) {
        OneContainer.use(["oneBridge"], function (oneBridge) {
            new Vue({
                mixins: [site.getMixin()],
                data: {
                    info: {},
                    updater: {},
                    manifest: {},
                    scopes: []
                },
                created: function () {
                    this.loadInfo();
                    this.loadUpdater();
                    this.loadManifest();
                    this.loadScopes();
                },
                methods: {
                    loadInfo: function () {
                        var that = this;
                        oneBridge.getInfo(function (info) {
                            that.info = info;
                        });
                    },
                    loadUpdater: function () {
                        var that = this;
                        oneBridge.getUpdater(function (updater) {
                            that.updater = updater;
                        });
                    },
                    loadManifest: function () {
                        var that = this;
                        oneBridge.getManifest(function (manifest) {
                            that.manifest = manifest;
                        });
                    },
                    loadScopes: function () {
                        var that = this;
                        oneBridge.getConfig("migration_scopes", function (scopes) {
                            if (scopes instanceof Array) {
                                that.scopes = scopes;
                            }
                            else {
                                that.scopes = ["config", "proxy", "menu", "store", "resource"];
                            }
                        });
                    },
                    formatScopesNameList: function (scopes) {
                        var nameList = [];
                        var scopeMapping = {
                            config: "配置",
                            proxy: "代理",
                            menu: "菜单",
                            store: "应用",
                            resource: "资源"
                        };
                        scopes.forEach(function (scope) {
                            if (scopeMapping.hasOwnProperty(scope)) {
                                nameList.push(scopeMapping[scope]);
                            }
                        });
                        return nameList;
                    },
                    syncScopes: function () {
                        oneBridge.setConfig("migration_scopes", this.scopes);
                    },
                    importBackup: function (el) {
                        var that = this;
                        this.parseUploadFile(el, "text", function (json) {
                            oneBridge.applyBackup(that.scopes, JSON.parse(json), function () {
                                location.reload();
                            });
                        });
                    },
                    exportBackup: function () {
                        var that = this;
                        oneBridge.buildBackup(that.scopes, function (backup) {
                            var blob = new Blob([JSON.stringify(backup, null, 4)], {
                                type: "application/json;charset=utf-8"
                            });
                            saveAs(blob, "one_backup.json");
                        });
                    },
                    resetAddon: function () {
                        var that = this;
                        modal.prompt("确定要重置“" + that.formatScopesNameList(that.scopes).join("、") + "”到初始状态么？", function () {
                            oneBridge.applyReset(that.scopes, function () {
                                location.reload();
                            });
                        });
                    }
                }
            });
        });
    });

});