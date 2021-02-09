var OneUi = (function () {
    var obj = {
        defines: {},
        modules: {}
    };

    obj.define = function (name, requires, callback) {
        name = obj.processName(name);
        obj.defines[name] = {
            requires: requires,
            callback: callback
        };
    };

    obj.require = function (name, cache) {
        if (typeof cache == "undefined") {
            cache = true;
        }

        name = obj.processName(name);
        if (cache && obj.modules.hasOwnProperty(name)) {
            return obj.modules[name];
        } else if (obj.defines.hasOwnProperty(name)) {
            var requires = obj.defines[name].requires;
            var callback = obj.defines[name].callback;

            var module = obj.use(requires, callback);
            cache && obj.register(name, module);
            return module;
        }
    };

    obj.use = function (requires, callback) {
        var module = {
            exports: undefined
        };
        var params = obj.buildParams(requires, module);
        var result = callback.apply(this, params);
        if (typeof result != "undefined") {
            return result;
        } else {
            return module.exports;
        }
    };

    obj.register = function (name, module) {
        name = obj.processName(name);
        obj.modules[name] = module;
    };

    obj.buildParams = function (requires, module) {
        var params = [];
        requires.forEach(function (name) {
            params.push(obj.require(name));
        });
        params.push(obj.require);
        params.push(module.exports);
        params.push(module);
        return params;
    };

    obj.processName = function (name) {
        return name.toLowerCase();
    };

    return obj;
})();

OneUi.define("menu", [], function () {
    var obj = {};

    obj.getMenuList = function () {
        return [
            {
                menu_id: "one_home_info",
                menu_title: "控制台",
                menu_full_title: "控制台",
                menu_class: "fa fa-tachometer-alt",
                menu_link: "/one/home/info.html",
                menu_target: "_self"
            },
            {
                menu_id: "one_proxy_option",
                menu_title: "代理",
                menu_full_title: "代理配置",
                menu_class: "fa fa-paper-plane",
                menu_link: "/one/proxy/option.html",
                menu_target: "_self"
            },
            {
                menu_id: "one_menu_manage",
                menu_title: "右键",
                menu_full_title: "右键菜单",
                menu_class: "fa fa-puzzle-piece",
                menu_link: "/one/menu/manage.html",
                menu_target: "_self"
            },
            {
                menu_id: "one_store_manage",
                menu_title: "应用",
                menu_full_title: "应用管理",
                menu_class: "fab fa-windows",
                menu_link: "/one/store/manage.html",
                menu_target: "_self"
            },
            {
                menu_id: "one_tool_index",
                menu_title: "助手",
                menu_full_title: "实用助手",
                menu_class: "fa fa-plus-square",
                sub_list: [
                    {
                        menu_id: "one_tool_qrcode",
                        menu_title: "二维码生成",
                        menu_full_title: "二维码生成",
                        menu_class: "fa fa-qrcode",
                        menu_link: "/one/tool/qrcode.html",
                        menu_target: "_self"
                    },
                    {
                        menu_id: "one_tool_cookie",
                        menu_title: "Cookie管理",
                        menu_full_title: "Cookie管理",
                        menu_class: "fa fa-id-card",
                        menu_link: "/one/tool/cookie.html",
                        menu_target: "_self"
                    },
                    {
                        menu_id: "one_tool_aria",
                        menu_title: "Aria下载管理",
                        menu_full_title: "Aria下载管理",
                        menu_class: "fa fa-download",
                        menu_link: "/one/tool/aria.html",
                        menu_target: "_self"
                    }
                ]
            }
        ];
    };

    return obj;
});

OneUi.define("option", [], function () {
    var obj = {};

    obj.isOptionActive = function (name) {
        var optionObject = obj.getOptionObject();
        if (optionObject.hasOwnProperty(name)) {
            return optionObject[name] == "off" ? false : true;
        }
        else {
            return true;
        }
    };

    obj.toogleOptionStatus = function (name) {
        var value = obj.isOptionActive(name);
        if (value == null) {
            value = true;
        }
        obj.setOptionStatus(name, !value);
    };

    obj.setOptionStatus = function (name, status) {
        var optionObject = obj.getOptionObject();
        optionObject[name] = status ? "on" : "off";
        obj.setOptionObject(optionObject);
    };

    obj.getOptionObject = function () {
        var optionObject = {};
        try {
            var optionJson = localStorage.getItem("option_json");
            optionJson || (optionJson = "{}");
            if (optionJson) {
                optionObject = JSON.parse(optionJson);
            }
        } catch (err) {
        }
        return optionObject;
    };

    obj.setOptionObject = function (optionObject) {
        localStorage.setItem("option_json", JSON.stringify(optionObject));
    };

    return obj;
});

OneUi.define("modal", [], function () {
    var obj = {
        modals: {
            alert: {},
            prompt: {}
        }
    };

    obj.alert = function (text, complete) {
        if ($("#modal-alert").length == 0) {
            $("body").append(`<div class="modal fade" id="modal-alert">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <p class="modal-title">提示</p>
                            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                                <span aria-hidden="true">&times;</span>
                            </button>
                        </div>
                        <div class="modal-body">
                        </div>
                    </div>
                </div>
            </div>`);
            $("#modal-alert").on("hidden.bs.modal", function () {
                obj.modals.alert.complete && obj.modals.alert.complete();
            });
        }

        $("#modal-alert .modal-body").html("<p class='m-2'>" + text + "</p>");
        $("#modal-alert").modal("show");

        obj.modals.alert.complete = complete;
    };

    obj.prompt = function (text, confirm, complete) {
        if ($("#modal-prompt").length == 0) {
            $("body").append(`<div class="modal fade" id="modal-prompt">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <p class="modal-title">提示</p>
                            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                                <span aria-hidden="true">&times;</span>
                            </button>
                        </div>
                        <div class="modal-body">
                        </div>
                        <div class="modal-footer justify-content-between">
                            <button type="button" class="btn btn-default" data-dismiss="modal">取消</button>
                            <button type="button" class="btn btn-primary btn-prompt-confirm">确定</button>
                        </div>
                    </div>
                </div>
            </div>`);
            $("#modal-prompt .btn-prompt-confirm").click(function () {
                $("#modal-prompt").modal("hide");
                obj.modals.prompt.confirm && obj.modals.prompt.confirm();
            });
            $("#modal-prompt").on("hidden.bs.modal", function () {
                obj.modals.prompt.complete && obj.modals.prompt.complete();
            });
        }

        $("#modal-prompt .modal-body").html("<p class='m-2'>" + text + "</p>");
        $("#modal-prompt").modal("show");

        obj.modals.prompt.confirm = confirm;
        obj.modals.prompt.complete = complete;
    };

    return obj;
});

OneUi.define("toast", [], function () {
    var obj = {};

    obj.error = function (message) {
        toastr.error(message);
    };

    obj.success = function (message) {
        toastr.success(message);
    };

    return obj;
});

OneUi.define("userApi", [], function () {
    var obj = {
        base: "https://api.newday.me"
    };

    obj.getUser = function () {
        return new Promise(function (resolve) {
            $.ajax({
                url: obj.base + "/api/user/info",
                type: "post",
                dataType: "json",
                xhrFields: {
                    withCredentials: true
                },
                success: function (response) {
                    resolve(response);
                },
                error: function () {
                    resolve({
                        code: 0,
                        msg: "网络链接错误，请检查您的网络链接"
                    });
                }
            });
        });
    };

    obj.loginUser = function (userCode) {
        return new Promise(function (resolve) {
            $.ajax({
                url: obj.base + "/api/user/auth",
                type: "post",
                dataType: "json",
                data: {
                    code: userCode
                },
                xhrFields: {
                    withCredentials: true
                },
                success: function (response) {
                    resolve(response);
                },
                error: function () {
                    resolve({
                        code: 0,
                        msg: "网络链接错误，请检查您的网络链接"
                    });
                }
            });
        });
    };

    obj.modifyUser = function (userNick, userEmail, userInfo) {
        return new Promise(function (resolve) {
            $.ajax({
                url: obj.base + "/api/user/modify",
                type: "post",
                dataType: "json",
                data: {
                    user_nick: userNick,
                    user_email: userEmail,
                    user_info: userInfo
                },
                xhrFields: {
                    withCredentials: true
                },
                success: function (response) {
                    resolve(response);
                },
                error: function () {
                    resolve({
                        code: 0,
                        msg: "网络链接错误，请检查您的网络链接"
                    });
                }
            });
        });
    };

    obj.logoutUser = function () {
        return new Promise(function (resolve) {
            $.ajax({
                url: obj.base + "/api/user/logout",
                type: "post",
                dataType: "json",
                xhrFields: {
                    withCredentials: true
                },
                success: function (response) {
                    resolve(response);
                },
                error: function () {
                    resolve({
                        code: 0,
                        msg: "网络链接错误，请检查您的网络链接"
                    });
                }
            });
        });
    };

    return obj;
});

OneUi.define("user", ["userApi"], function (userApi) {
    var obj = {
        api: userApi,
        store: {
            login: false,
            user_no: "",
            user_phone: "****",
            user_email: "",
            user_nick: "",
            user_info: "",
            user_head: ""
        }
    };

    obj.getStore = function () {
        return obj.store;
    };

    obj.loadUser = function (callback) {
        obj.api.getUser().then(function (response) {
            var user = obj.getStore();
            if (response instanceof Object && response.code === 1) {
                user.login = true;
                Object.assign(user, response.data);
            } else {
                user.login = false;
            }
            callback && callback(user);
        });
    };

    return obj;
});

OneUi.define("site", ["menu", "option", "toast", "user"], function (menu, option, toast, user) {
    var obj = {
        title: document.title
    };

    obj.getMenuList = function () {
        return menu.getMenuList();
    };

    obj.setMenu = function (menuId) {
        obj.getMenuList().forEach(function (menu) {
            if (menu.menu_id == menuId) {
                $("#" + menu.menu_id).addClass("active");
                obj.setTitle(menu.menu_full_title);
            }
            else if (menu.sub_list) {
                menu.sub_list.forEach(function (subMenu) {
                    if (subMenu.menu_id == menuId) {
                        $("#" + menu.menu_id).addClass("active");
                        $("#" + subMenu.menu_id).addClass("active");
                        obj.setTitle(subMenu.menu_full_title + " - " + menu.menu_full_title);
                    }
                });
            }
        });
    };

    obj.initNavbar = function () {
        Vue.component("navbar", {
            data: function () {
                return {
                    user: user.getStore(),
                    menu_list: obj.getMenuList()
                };
            },
            methods: {
                doUserLogout: function () {
                    var that = this;
                    user.api.logoutUser().then(function (response) {
                        if (response instanceof Object) {
                            if (response.code == 1) {
                                toast.success("注销成功");

                                user.loadUser();

                                $(that.$el).modal("hide");
                            }
                            else {
                                toast.error(response.msg);
                            }
                        }
                        else {
                            toast.error("注销发生意外");
                        }
                    });
                }
            },
            template: `<nav class="main-header navbar navbar-expand-md navbar-dark navbar-primary">
                <div class="container">
                    <!-- navbar logo -->
                    <a class="navbar-brand">
                        <div class="brand-image">
                            <i class="fas addon-icon icon-0023 text-white"></i>
                            <span class="brand-text text-white">集装箱</span>
                        </div>
                    </a>
            
                    <button class="navbar-toggler order-1" type="button" data-toggle="collapse" data-target="#menu-list">
                        <span class="navbar-toggler-icon"></span>
                    </button>
            
                    <!-- navbar links -->
                    <div class="navbar-collapse order-3 collapse" id="menu-list">
                        <ul class="order-1 order-md-3 navbar-nav ml-auto">
                            <template v-for="menu in menu_list">
                                <template v-if="menu.sub_list">
                                    <li class="nav-item dropdown">
                                        <a data-toggle="dropdown" aria-haspopup="true" aria-expanded="false"
                                            class="nav-link dropdown-toggle" :id="menu.menu_id"
                                            :title="menu.menu_full_title">
                                            <i class="mr-1" :class="menu.menu_class"></i> {{menu.menu_title}}
                                        </a>
                                        <ul :aria-labelledby="menu.menu_id" class="dropdown-menu border-0 shadow">
                                            <template v-for="sub_menu in menu.sub_list">
                                                <li>
                                                    <a class="dropdown-item" :href="sub_menu.menu_link"
                                                        :target="sub_menu.menu_target" :id="sub_menu.menu_id"
                                                        :title="sub_menu.menu_full_title">
                                                        <i class="mr-1" :class="sub_menu.menu_class"></i>
                                                        {{sub_menu.menu_title}}
                                                    </a>
                                                </li>
                                            </template>
                                        </ul>
                                    </li>
                                </template>
                                <template v-else>
                                    <li class="nav-item">
                                        <a class="nav-link" :href="menu.menu_link" :target="menu.menu_target"
                                            :id="menu.menu_id" :title="menu.menu_full_title">
                                            <i class="mr-1" :class="menu.menu_class"></i> {{menu.menu_title}}
                                        </a>
                                    </li>
                                </template>
                            </template>
                            <li class="nav-item dropdown" id="user-manage">
                                <a class="nav-link dropdown-toggle" data-toggle="dropdown">
                                    <span class="vue-delay-hide">欢迎，游客</span>
                                    <span class="vue-delay-show">
                                        <template v-if="user.login">
                                            欢迎，{{user.user_nick}}
                                        </template>
                                        <template v-else>
                                            欢迎，游客
                                        </template>
                                    </span>
                                    <span class="caret ml-1"></span>
                                </a>
                                <div class="dropdown-menu">
                                    <a class="dropdown-item" :class="user.login ? 'vue-delay-hide' : ''" data-toggle="modal" data-target="#login-modal">
                                        <i class="fa fa-user mr-2"></i>用户登录
                                    </a>
                                    <template v-if="user.login">
                                        <a class="dropdown-item" data-toggle="modal" data-target="#setting-modal">
                                            <i class="fa fa-cog mr-2"></i>资料设置
                                        </a>
                                        <a class="dropdown-item" @click="doUserLogout()">
                                            <i class="fa fa-power-off mr-2"></i>安全退出
                                        </a>
                                    </template>
                                    <a class="dropdown-item" target="_blank" href="http://go.newday.me/s/one-home">
                                        <i class="fa fa-home mr-2"></i>插件主页
                                    </a>
                                    <a class="dropdown-item" target="_blank" href="http://go.newday.me/s/one-doc">
                                        <i class="fa fa-question-circle mr-2"></i>帮助文档
                                    </a>
                                    <a class="dropdown-item" target="_blank" href="http://go.newday.me/s/privacy">
                                        <i class="fa fa-id-card mr-2"></i>隐私协议
                                    </a>
                                </div>
                            </li>
                        </ul>
                    </div>
                </div>
            </nav>`
        });
        new Vue({
            el: "#addon-navbar",
            mixins: [obj.getMixin()]
        });
    };

    obj.initNavbarPopup = function () {
        new Vue({
            el: "#addon-navbar",
            data: {
                user: user.getStore(),
                menu_list: obj.getMenuList()
            }
        });
    };

    obj.initLoginModal = function () {
        Vue.component("login-modal", {
            data: function () {
                return {
                    code: ""
                };
            },
            methods: {
                doUserLogin: function () {
                    var that = this;
                    user.api.loginUser(that.code).then(function (response) {
                        if (response instanceof Object) {
                            if (response.code == 1) {
                                toast.success("登录成功");

                                user.loadUser();

                                $(that.$el).modal("hide");
                            }
                            else {
                                toast.error(response.msg);
                            }
                        }
                        else {
                            toast.error("登录发生意外");
                        }
                    });
                }
            },
            template: `<div class="modal fade" id="login-modal">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title" style="font-size: 1.1rem">用户登录</h5>
                            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                                <span aria-hidden="true">&times;</span>
                            </button>
                        </div>
                        <!-- /.modal-header -->
                        <div class="modal-body">
                            <div class="row">
                                <div class="col-md-5">
                                    <p class="text-center">
                                        <img src="https://open.weixin.qq.com/qr/code?username=gh_22a357e2dd9a" style="width: 94%" />
                                    </p>
                                </div>
                                <div class="col-md-7">
                                    <dl class="mt-3">
                                        <dt>Step NO.0</dt>
                                        <dd>使用微信扫描左侧二维码，关注公众号</dd>
                                        <dt>Step NO.1</dt>
                                        <dd>发送“登录”或“授权码”，已关联账号则返回授权码</dd>
                                        <dt>Step NO.2</dt>
                                        <dd>对于新用户，需要用户使用
                                        <a target="_blank" href="http://go.newday.me/s/doc-login?scene=addon_one" title="点击查看">手机号<i class="fa fa-question-circle"></i></a>
                                        注册和关联账号</dd>
                                        <dt>Step NO.3</dt>
                                        <dd>输入授权码进行授权登录</dd>
                                        <dd>
                                            <div class="input-group" style="width: 90%">
                                                <input type="text" class="form-control" placeholder="授权码" v-model="code">
                                                <span class="input-group-append">
                                                    <button type="button" class="btn btn-primary btn-flat" @click="doUserLogin()">
                                                        <i class="fa fa-unlock mr-2"></i>授权
                                                    </button>
                                                </span>
                                            </div>
                                        </dd>
                                    </dl>
                                </div>
                            </div>
                        </div>
                        <!-- /.modal-body -->
                    </div>
                </div>
            </div>`
        });
        new Vue({
            el: "#addon-login-modal",
            methods: {
                doUserLogin: function () {
                    alert(1111);
                }
            }
        });
    };

    obj.initSettingModal = function () {
        Vue.component("setting-modal", {
            data: function () {
                return {
                    user: user.getStore()
                };
            },
            methods: {
                doUserSave: function () {
                    var that = this;
                    user.api.modifyUser(that.user.user_nick, that.user.user_email, that.user.user_info).then(function (response) {
                        if (response instanceof Object) {
                            if (response.code == 1) {
                                toast.success("更新成功");

                                $(that.$el).modal("hide");
                            }
                            else {
                                toast.error(response.msg);
                            }
                        }
                        else {
                            toast.error("更新发生意外");
                        }
                    });
                }
            },
            template: `<div class="modal fade" id="setting-modal">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title" style="font-size: 1.1rem">资料设置</h5>
                            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                                <span aria-hidden="true">&times;</span>
                            </button>
                        </div>
                        <!-- /.modal-header -->
                        <div class="modal-body">
                            <div class="form-group">
                                <label for="setting-user-phone">手机号</label>
                                <input type="email" class="form-control" id="setting-user-phone" v-model="user.user_phone"
                                    disabled>
                            </div>
                            <div class="form-group">
                                <label for="setting-user-nick">昵称</label>
                                <input type="email" class="form-control" id="setting-user-nick" v-model="user.user_nick"
                                    placeholder="昵称">
                            </div>
                            <div class="form-group">
                                <label for="setting-user-email">邮箱</label>
                                <input type="email" class="form-control" id="setting-user-email"
                                    v-model="user.user_email" placeholder="您常用的邮箱...">
                            </div>
                            <div class="form-group">
                                <label for="setting-user-info">介绍</label>
                                <textarea id="setting-user-info" class="form-control" rows="3"
                                        placeholder="简单介绍下自己呗..." v-model="user.user_info"></textarea>
                            </div>
                        </div>
                        <!-- /.modal-body -->
                        <div class="modal-footer justify-content-between">
                            <button type="button" class="btn btn-default" data-dismiss="modal">
                                <i class="fa fa-times"></i> 取消
                            </button>
                            <button type="button" class="btn btn-primary" @click="doUserSave()">
                                <i class="fa fa-save"></i> 更新
                            </button>
                        </div>
                        <!-- /.modal-footer -->
                    </div>
                </div>
            </div>`
        });
        new Vue({
            el: "#addon-setting-modal"
        });
    };

    obj.getMixin = function () {
        return {
            el: "#addon-manage",
            ready: function () {
                $("body").addClass("vue-loaded");
            },
            methods: {
                parseCardClass: function (name, reverse) {
                    reverse || (reverse = false);
                    if (this.isCardOpen(name)) {
                        return reverse ? "collapsed-card" : "";
                    }
                    else {
                        return reverse ? "" : "collapsed-card";
                    }
                },
                parseCardIconClass: function (name, reverse) {
                    reverse || (reverse = false);
                    if (this.isCardOpen(name)) {
                        return reverse ? "fa-plus" : "fa-minus";
                    }
                    else {
                        return reverse ? "fa-minus" : "fa-plus";
                    }
                },
                isCardOpen: function (name) {
                    return option.isOptionActive(name);
                },
                toggleCardOpen: function (name) {
                    option.toogleOptionStatus(name);
                },
                parseUploadFile: function (el, type, callback) {
                    var element = el.target;
                    if (element.files && element.files.length > 0) {
                        var file = element.files[0];
                        var reader = new FileReader();
                        reader.onload = function (e) {
                            $(element).val("");
                            callback && callback(e.target.result, file);
                        };
                        if (type == "url") {
                            reader.readAsDataURL(file);
                        }
                        else {
                            reader.readAsText(file);
                        }
                    }
                }
            }
        };
    };

    obj.setTitle = function (title) {
        document.title = title + " - " + obj.title;
    };

    obj.prettyScrollbar = function () {
        if (!obj.isPopupPage()) {
            $element = $(".content-wrapper");
            $element.css("height", $element.css("min-height"));
            $element.overlayScrollbars && $element.overlayScrollbars({
                scrollbars: {
                    autoHide: "leave"
                },
                overflowBehavior: {
                    x: "hidden"
                }
            });
        }
    };

    obj.registerLightbox = function () {
        if ($.fn.ekkoLightbox) {
            $(document).on("click", '[data-toggle="lightbox"]', function (event) {
                event.preventDefault();
                $(this).ekkoLightbox();
            });
        }
    };

    obj.initJsonEditorLang = function () {
        if (typeof JSONEditor != "undefined") {
            JSONEditor.defaults.languages.en = {
                "error_uniqueItems": "数组的值必须唯一",
                "error_maxProperties": "对象至多有{{0}}个属性",
                "error_minProperties": "对象至少有{{0}}个属性",
                "error_required": "对象缺少属性{{0}}'",
                "error_additional_properties": "对象存在多余的属性{{0}}",
                "error_dependency": "必须有{{0}}这个属性",
                "error_date": "日期格式必须为{{0}}",
                "error_time": "时间格式必须为{{0}}",
                "error_datetime_local": "日期格式必须为{{0}}",
                "error_invalid_epoch": "日期必须大于1970年1月1号",
                "error_ipv4": "不是合法的IPv4地址",
                "error_ipv6": "不是合法的IPv6地址",
                "error_hostname": "主机格式不正确",
                "button_delete_all": "全部",
                "button_delete_all_title": "删除所有",
                "button_delete_last": "上条{{0}}",
                "button_delete_last_title": "删除上条{{0}}",
                "button_add_row_title": "新增{{0}}",
                "button_move_down_title": "下移",
                "button_move_up_title": "上移",
                "button_object_properties": "属性",
                "button_delete_row_title": "删除{{0}}",
                "button_delete_row_title_short": "删除",
                "button_copy_row_title_short": "复制",
                "button_collapse": "折叠",
                "button_expand": "展开",
                "flatpickr_toggle_button": "切换",
                "flatpickr_clear_button": "清除",
                "choices_placeholder_text": "值",
                "default_array_item_title": "项目",
                "button_delete_node_warning": "确定删除这条数据?"
            };
            JSONEditor.defaults.themes.bootstrap4.prototype.getButtonOrigin = JSONEditor.defaults.themes.bootstrap4.prototype.getButton;
            JSONEditor.defaults.themes.bootstrap4.prototype.getButton = function (text, icon, title) {
                var textMapping = {
                    "JSON": "JSON",
                    "Copy": "复制",
                    "Save": "保存",
                    "Cancel": "取消"
                };
                if (textMapping.hasOwnProperty(text)) {
                    text = textMapping[text];
                    title = textMapping[text];
                }
                return this.getButtonOrigin(text, icon, title);
            };
        }
    };

    obj.isPopupPage = function () {
        if (location.href.indexOf("popup.html") >= 0) {
            return true;
        }
        else {
            return false;
        }
    };

    return obj;
});

OneUi.define("addon", [], function () {
    var obj = {};

    obj.getInstall = function (getFunc, callback) {
        var result = getFunc();
        if (result) {
            callback(result);
        }
        else {
            setTimeout(function () {
                obj.getInstall(getFunc, callback);
            }, 200);
        }
    };

    obj.getInstallBatch = function (getFuncList, callback) {
        var promiseList = [];
        getFuncList.forEach(function (getFunc) {
            promiseList.push(new Promise(function (resolve) {
                obj.getInstall(getFunc, resolve);
            }));
        });
        Promise.all(promiseList).then(function (result) {
            callback.apply(callback, result);
        });
    };

    return obj;
});

OneUi.define("router", [], function () {
    var obj = {
        url: location.href
    };

    obj.getUrl = function () {
        return obj.url;
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

    return obj;
});

OneUi.use(["user", "site"], function (user, site) {

    user.loadUser();

    if (site.isPopupPage()) {
        site.initNavbarPopup();
    }
    else {
        site.initNavbar();
    }

    site.initLoginModal();

    site.initSettingModal();

    site.prettyScrollbar();

    site.initJsonEditorLang();

});