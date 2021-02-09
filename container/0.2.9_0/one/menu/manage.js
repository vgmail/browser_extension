OneUi.define("menuUtil", [], function () {
    var obj = {};

    obj.getTypeMapping = function () {
        return {
            "link": "打开链接",
            "aria": "使用Aria下载",
            "download": "使用浏览器下载",
            "cookie": "管理Cookie",
            "qrcode": "生成二维码",
            "google_image": "使用谷歌搜索图片",
            "baidu_image": "使用百度搜索图片",
            "password": "显示明文密码",
            "script": "运行自定义JS"
        };
    };

    obj.getContextMapping = function () {
        return {
            "all": "所有",
            "page": "页面",
            "frame": "子页面",
            "selection": "选中内容",
            "link": "超链接",
            "image": "图片",
            "audio": "音频",
            "video": "视频"
        };
    };

    return obj;
});

OneUi.use(["site", "addon", "modal", "menuUtil"], function (site, addon, modal, menuUtil) {

    site.setMenu("one_menu_manage");

    addon.getInstall(function () {
        return window.OneContainer;
    }, function (OneContainer) {
        OneContainer.use(["menuBridge"], function (menuBridge) {
            var editor = null;

            var modalApp = new Vue({
                el: "#modal-default",
                data: {
                    tip: "",
                    id: "",
                    title: "",
                    type: "link",
                    status: 1,
                    contexts: ["page"],
                    payload: {},
                    type_mapping: menuUtil.getTypeMapping(),
                    context_mapping: menuUtil.getContextMapping()
                },
                created: function () {
                    this.initEditor();
                },
                methods: {
                    addMenu: function (type) {
                        this.tip = "新增菜单";

                        var item = {
                            id: "",
                            tip: "",
                            title: "",
                            type: "link",
                            status: 1,
                            contexts: ["page"],
                            payload: {}
                        };
                        if (type != "all") {
                            item.contexts = [type];
                        }
                        this.loadMenu(item);
                    },
                    editMenu: function (item) {
                        this.tip = "编辑菜单";
                        this.loadMenu(item);
                    },
                    loadMenu: function (item) {
                        this.id = item.id;
                        this.title = item.title;
                        this.type = item.type;
                        this.contexts = item.contexts;
                        this.payload = item.payload;

                        this.initEditor();

                        $("#modal-default").modal("show");
                    },
                    saveMenu: function () {
                        var detail = {
                            title: this.title,
                            type: this.type,
                            contexts: this.contexts,
                            payload: editor.getValue()
                        };
                        if (this.id) {
                            menuBridge.updateMenu(this.id, detail);
                        }
                        else {
                            menuBridge.addMenu(detail);
                        }

                        $("#modal-default").modal("hide");

                        addonApp.loadMenuList();
                    },
                    initEditor: function () {
                        var that = this;
                        var setting = that.getTypeEditorSetting(that.type);

                        editor && editor.destroy();

                        editor = new JSONEditor(document.getElementById("menu-payload"), {
                            theme: "bootstrap4",
                            iconlib: "fontawesome5",
                            disable_edit_json: true,
                            disable_collapse: true,
                            disable_properties: true,
                            disable_array_delete_last_row: true,
                            schema: {
                                type: "object",
                                title: "菜单配置",
                                required: setting.required,
                                properties: setting.properties
                            }
                        });
                        editor.on("change", function () {
                            that.payload = _.extend(that.payload, editor.getValue());
                        });

                        var payload = _.pick(that.payload, _.keys(setting.payload));
                        editor.setValue(_.extend(setting.payload, payload));
                    },
                    getTypeEditorSetting: function (type) {
                        var settings = {
                            "link": {
                                payload: {
                                    url: "",
                                    target: "unique"
                                },
                                required: [
                                    "url",
                                    "target"
                                ],
                                properties: {
                                    url: {
                                        title: "跳转链接",
                                        type: "string"
                                    },
                                    target: {
                                        title: "打开方式",
                                        type: "string",
                                        default: "unique",
                                        enum: ["unique", "new"],
                                        options: {
                                            enum_titles: ["固定窗口打开", "新窗口打开"]
                                        }
                                    }
                                }
                            },
                            "aria": {
                                payload: {
                                    server: "http://localhost:6800/jsonrpc",
                                    token: "",
                                    agent: "",
                                    header: []
                                },
                                required: [
                                    "server",
                                    "header"
                                ],
                                properties: {
                                    server: {
                                        title: "RPC链接",
                                        type: "string",
                                        default: "http://localhost:6800/jsonrpc"
                                    },
                                    token: {
                                        title: "RPC令牌",
                                        type: "string",
                                        default: ""
                                    },
                                    agent: {
                                        title: "浏览器标识",
                                        type: "string",
                                        default: ""
                                    },
                                    header: {
                                        title: "请求设置",
                                        type: "array",
                                        format: "table",
                                        options: {
                                            disable_array_reorder: true
                                        },
                                        items: {
                                            title: "请求头",
                                            type: "object",
                                            properties: {
                                                name: {
                                                    title: "名称",
                                                    type: "string",
                                                    options: {
                                                        input_width: "150px"
                                                    }
                                                },
                                                value: {
                                                    title: "值",
                                                    type: "string"
                                                }
                                            }
                                        }
                                    }
                                }
                            },
                            "download": {
                                payload: {
                                    agent: "",
                                    headers: []
                                },
                                required: [
                                    "agent",
                                    "headers"
                                ],
                                properties: {
                                    agent: {
                                        title: "浏览器标识（第三方下载器拦截时配置不生效）",
                                        type: "string",
                                        default: ""
                                    },
                                    headers: {
                                        title: "请求设置",
                                        type: "array",
                                        format: "table",
                                        options: {
                                            disable_array_reorder: true
                                        },
                                        items: {
                                            title: "请求头",
                                            type: "object",
                                            properties: {
                                                name: {
                                                    title: "名称",
                                                    type: "string",
                                                    options: {
                                                        input_width: "150px"
                                                    }
                                                },
                                                value: {
                                                    title: "值",
                                                    type: "string"
                                                }
                                            }
                                        }
                                    }
                                }
                            },
                            "script": {
                                payload: {
                                    script: ""
                                },
                                required: [
                                    "script"
                                ],
                                properties: {
                                    script: {
                                        title: "JS内容",
                                        type: "string",
                                        format: "textarea",
                                        options: {
                                            input_height: "200px"
                                        }
                                    }
                                }
                            }
                        };
                        return _.has(settings, type) ? settings[type] : {
                            payload: {},
                            properties: {}
                        };
                    }
                }
            });

            var addonApp = new Vue({
                mixins: [site.getMixin()],
                data: {
                    type: "all",
                    menu_list: [],
                    type_mapping: menuUtil.getTypeMapping(),
                    context_mapping: menuUtil.getContextMapping()
                },
                created: function () {
                    this.loadMenuList();
                },
                methods: {
                    showMenuList: function (type) {
                        this.type = type;
                        this.loadMenuList();
                    },
                    loadMenuList: function () {
                        var that = this;
                        menuBridge.getMenuList(function (menuList) {
                            that.menu_list = _.filter(menuList, function (menu) {
                                if (that.type == 'all') {
                                    return true;
                                }
                                else {
                                    return _.indexOf(menu.contexts, that.type) >= 0;
                                }
                            });
                        });
                    },
                    formatMenuType: function (type) {
                        if (_.has(this.type_mapping, type)) {
                            return this.type_mapping[type];
                        }
                        else {
                            return "...";
                        }
                    },
                    formatMenuContexts: function (contexts) {
                        var nameList = _.values(_.pick(this.context_mapping, contexts));
                        return nameList.join("、");
                    },
                    upMenu: function (index, item) {
                        if (index > 0) {
                            var targetItem = this.menu_list[index - 1];
                            menuBridge.moveMenu(item.id, targetItem.id, "up", this.loadMenuList);
                        }
                    },
                    downMenu: function (index, item) {
                        if (this.menu_list.length > 1 && index < this.menu_list.length - 1) {
                            var targetItem = this.menu_list[index + 1];
                            menuBridge.moveMenu(item.id, targetItem.id, "down", this.loadMenuList);
                        }
                    },
                    addMenu: function () {
                        modalApp.addMenu(this.type);
                    },
                    editMenu: function (item) {
                        modalApp.editMenu(item);
                    },
                    updateMenuStatus: function (item) {
                        menuBridge.updateMenu(item.id, item, this.loadMenuList);
                    },
                    deleteMenu: function (item) {
                        var that = this;
                        modal.prompt("确定要删除“" + item.title + "”么？", function () {
                            menuBridge.deleteMenu(item.id, that.loadMenuList);
                        });
                    },
                    importMenu: function (el) {
                        var that = this;
                        this.parseUploadFile(el, "text", function (json) {
                            var data = JSON.parse(json);
                            if (data instanceof Object && data.menus instanceof Array) {
                                menuBridge.importMenuList(data.menus, that.loadMenuList);
                            }
                        });
                    },
                    exportMenu: function () {
                        menuBridge.getMenuList(function (menuList) {
                            var blob = new Blob([JSON.stringify({
                                menus: menuList
                            }, null, 4)], {
                                type: "application/json;charset=utf-8"
                            });
                            saveAs(blob, "one_menu.json");
                        });
                    },
                    clearMenu: function () {
                        var that = this;
                        modal.prompt("确定要清空全部菜单么？", function () {
                            menuBridge.clearAllMenu(that.loadMenuList);
                        });
                    }
                }
            });
        });
    });
});