OneUi.use(["site", "addon", "router"], function (site, addon, router) {

    site.setMenu("one_tool_qrcode");

    addon.getInstall(function () {
        return window.OneContainer;
    }, function (OneContainer) {
        OneContainer.use(["oneBridge"], function (oneBridge) {

            new Vue({
                mixins: [site.getMixin()],
                data: {
                    size: 800,
                    text: location.href,
                    fill: "#000000",
                    background: "#FFFFFF",
                    ecLevel: "Q",
                    imageName: "未选择文件",
                    imageSrc: null
                },
                created: function () {
                    this.initElement();
                    this.initRequest();
                    this.initDropZone();
                },
                methods: {
                    initElement: function () {
                        var that = this;
                        $(".qrcode-colorpicker").colorPicker({
                            renderCallback: function ($el) {
                                $el.val("#" + this.color.colors.HEX);
                                that.showQrcode();
                            }
                        });
                    },
                    initRequest: function () {
                        var text = router.getUrlParam("text");
                        if (text) {
                            this.text = decodeURIComponent(text);
                            this.cacheOption(function () {
                                location.href = location.pathname;
                            });
                        }
                        else {
                            this.loadOption();
                        }
                    },
                    initDropZone: function () {
                        var that = this;
                        var selector = "#my-dropzone";
                        var myDropzone = new Dropzone(selector, {
                            url: "/",
                            acceptedFiles: "image/*",
                            accept: function (file) {
                                that.uploadQrcode({
                                    target: {
                                        files: [file]
                                    }
                                });
                            }
                        });
                        myDropzone.on("dragover", function () {
                            $(selector).addClass("hovering");
                        });
                        myDropzone.on("dragleave", function () {
                            $(selector).removeClass("hovering");
                        });
                        myDropzone.on("dragend", function () {
                            $(selector).removeClass("hovering");
                        });
                        myDropzone.on("drop", function () {
                            $(selector).removeClass("hovering");
                        });
                    },
                    cacheOption: function (callback) {
                        oneBridge.setConfig("qrcode_option", {
                            size: this.size,
                            text: this.text,
                            fill: this.fill,
                            background: this.background,
                            ecLevel: this.ecLevel,
                            imageName: this.imageName,
                            imageSrc: this.imageSrc
                        }, callback);
                    },
                    loadOption: function () {
                        var that = this;
                        oneBridge.getConfig("qrcode_option", function (qrcodeOption) {
                            if (qrcodeOption instanceof Object) {
                                for (var name in qrcodeOption) {
                                    if (qrcodeOption[name]) {
                                        that[name] = qrcodeOption[name];
                                    }
                                }
                            }
                            that.showQrcode();
                        });
                    },
                    showQrcode: function () {
                        var that = this;
                        var option = {
                            render: "image",
                            quiet: 1,
                            radius: 10,
                            mode: 4,
                            mSize: 0.2,
                            mPosX: 0.5,
                            mPosY: 0.5,
                            size: this.size,
                            text: this.text,
                            fill: this.fill,
                            background: this.background,
                            ecLevel: this.ecLevel
                        };
                        if (that.imageSrc) {
                            var image = new Image();
                            image.src = this.imageSrc;
                            option.image = image;
                            setTimeout(function () {
                                that.craeteQrcode(option);
                            }, 250);
                        }
                        else {
                            that.craeteQrcode(option);
                        }
                    },
                    craeteQrcode: function (option) {
                        try {
                            $(".qrcode-area").empty().qrcode(option);
                            this.cacheOption();
                        }
                        catch (err) {
                        }
                    },
                    downloadQrcode: function () {
                        saveAs($(".qrcode-area img").attr("src"), "one_qrcode.png");
                    },
                    uploadQrcode: function (el) {
                        var that = this;
                        that.parseUploadFile(el, "url", function (imageSrc) {
                            var image = new Image();
                            image.onload = function (e) {
                                var qr = new QrcodeDecoder();
                                qr.decodeFromImage(image).then(function (result) {
                                    if (result instanceof Object && result.data) {
                                        that.text = result.data;
                                        that.showQrcode();
                                    }
                                });
                            };
                            image.src = imageSrc;
                        });
                    },
                    onLogoClear: function () {
                        this.imageName = "未选择文件";
                        this.imageSrc = "";
                        this.showQrcode();
                    },
                    onLogoChange: function (el) {
                        var that = this;
                        that.parseUploadFile(el, "url", function (imageSrc, file) {
                            var allowTypes = [
                                "image/png",
                                "image/jpg",
                                "image/jpeg",
                                "image/gif",
                                "image/bmp"
                            ];
                            if (allowTypes.indexOf(file.type) >= 0) {
                                that.imageName = file.name;
                                that.imageSrc = imageSrc;
                                that.showQrcode();
                            }
                        });
                    }
                }
            });

        });
    });

});