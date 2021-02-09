function setting_init() {
    $("#mzk_user_username").html(MZK_BGS.mzk_user_info.username);
    $("#mzk_user_level_button").html(MZK_BGS.mzk_user_info.vip_level);
    if (MZK_BGS.mzk_user_info.is_vip) {
        $("#mzk_user_type").html(MZK_BGS.get_lan_msg("user_vip_title"));
        $("#mzk_vip_exp").html(MZK_BGS.mzk_user_info.vip_expired);
    } else {
        $("#mzk_user_type").html(MZK_BGS.get_lan_msg("user_member_title"));
        $("#mzk_vip_exp").html(MZK_BGS.get_lan_msg("vip_expiry_date_status"));
    }
    if (!MZK_BGS.mzk_user_info.email) {
        $("#mzk_email_login_button").show();
        $("#mzk_logout").hide();
        $("#mzk_email_login_button").click(function () {
            window.location.href = "login.html";
        });

    } else {
        $("#mzk_email_login_button").hide();
        $("#mzk_logout").show();
        $("#mzk_logout").on("click", function () {
            MZK_BGS.user_logout(function () {
                window.close();
            });
        });
    }
}


jQuery(function () {
    check_user_login(setting_init);
    lang_init();
    $("#feedback_button").click(function () {
        chrome.tabs.create({
            url: chrome.runtime.getURL("helper/open_tracket.html")
        });
    });

    $("#aboutus_button").on("click",function () {
        window.location.href = "about.html";
    });

    $("#mobileclient_button").on("click",function () {
        if (!MZK_BGS.mzk_user_info.is_vip || MZK_BGS.mzk_user_info.vip_level < 1) {
            only_vip_tips();
            return false;
        }
        chrome.tabs.create({
            url: chrome.runtime.getURL("page.html?/client/feed")
        });
    });

    $("#autofixtool_button").on("click", function () {
        $.confirm({
            title: MZK_BGS.get_lan_msg("autofix_confirm_title"),
            content: MZK_BGS.get_lan_msg("autofix_confirm_content"),
            type: 'red',
            typeAnimated: true,
            buttons: {
                ok: {
                    text: MZK_BGS.get_lan_msg("fix_button"),
                    btnClass: 'btn-red',
                    action: function () {
                        MZK_BGS.KeepLive_Session();
                        fix_proxy_permissions();
                        JqueryAlertMsg(MZK_BGS.get_lan_msg("autofix_success"));
                    }
                },
                close: function () {
                }
            }
        });
    });

    $("#custom_domain_button").on("click", function () {
        if (!MZK_BGS.mzk_user_info.is_vip || MZK_BGS.mzk_user_info.vip_level < 1) {
            only_vip_tips();
            return false;
        }
        chrome.tabs.create({
            url: chrome.runtime.getURL("helper/proxydomain.html")
        });
    });

    $("#about_website_button").on("click", function () {
        chrome.tabs.create({
            url: "https://iguge.app"
        });
    });
});