container.define("Resource", ["$"], function ($) {
	return function (dao, scope) {
		var obj = {};

		obj.loadResource = function (url) {
			return new Promise(function (resolve) {
				var resource = obj.getDao().get(url);
				if (resource && resource.state == 1) {
					resolve(resource);
				}
				else {
					obj.cacheResource(url).then(resolve);
				}
			});
		};

		obj.loadResourceBatch = function (urlList) {
			return new Promise(function (resolve) {
				var promiseList = [];
				urlList.forEach(function (url) {
					promiseList.push(obj.loadResource(url));
				});
				Promise.all(promiseList).then(function (resourceList) {
					var resResourceList = {};
					resourceList.forEach(function (resource) {
						resResourceList[resource.url] = resource;
					});
					resolve(resResourceList);
				});
			});
		};

		obj.cacheResource = function (url) {
			return new Promise(function (resolve) {
				obj.fetchResource(url).then(function (resource) {
					obj.getDao().set(url, resource);

					resolve(resource);
				});
			});
		};

		obj.cacheResourceAll = function (urlList) {
			return new Promise(function (resolve) {
				obj.fetchResourceBatch(urlList).then(function (resourceList) {
					obj.getDao().setAll(resourceList);

					resolve(resourceList);
				});
			});
		};

		obj.removeResourceAll = function () {
			obj.getDao().removeAll();
		};

		obj.fetchResource = function (url) {
			return new Promise(function (resolve) {
				obj.fetchContent(url).then(function (content) {
					resolve(obj.buildResource(url, content));
				});
			});
		};

		obj.fetchResourceBatch = function (urlList) {
			return new Promise(function (resolve) {
				var promiseList = [];
				urlList.forEach(function (url) {
					promiseList.push(obj.fetchResource(url));
				});
				Promise.all(promiseList).then(function (resourceList) {
					var resResourceList = {};
					resourceList.forEach(function (resource) {
						resResourceList[resource.url] = resource;
					});
					resolve(resResourceList);
				});
			});
		};

		obj.fetchContent = function (url) {
			return new Promise(function (resolve) {
				$.ajax({
					url: url,
					dataType: "text",
					timeout: 5000,
					success: function (content) {
						resolve(content);
					},
					error: function () {
						resolve("");
					}
				});
			});
		};

		obj.buildResource = function (url, content) {
			return {
				state: content ? 1 : 0,
				scope: obj.getScope(),
				url: url,
				content: content
			};
		};

		obj.getDao = function () {
			return dao;
		};

		obj.getScope = function () {
			return scope;
		};

		return obj;
	};
});

container.define("sandBox", [], function () {
	var obj = {
		props: null,
		reg: /(webkitStorageInfo|webkitIDB.*|webkitIndexedDB|webkitOfflineAudioContext|webkitAudioContext|webkitURL|webkitSpeech.*|Bluetooth.*|MIDI.*|StorageManager)/,
		ignores: [
			"chrome", "browser", "container",
			"$$", "$0", "$1", "$2", "$3", "$4", "$_", "$x",
			"$", "Snap", "CryptoJS", "QrcodeDecoder"
		]
	};

	obj.setIgnoreList = function (ignoreList) {
		obj.ignores = ignoreList;
		obj.resetSafePropList();
	};

	obj.appendIgnoreList = function (ignoreList) {
		obj.ignores = obj.ignores.concat(ignoreList);
		obj.resetSafePropList();
	};

	obj.getKeyList = function () {
		var keyList = [];
		for (var key in window) {
			keyList.push(key);
		}
		return keyList;
	};

	obj.getNameList = function () {
		return Object.getOwnPropertyNames(window);
	};

	obj.getSafePropList = function () {
		if (!obj.props) {
			var propList = [].concat(obj.getKeyList()).concat(obj.getNameList());
			var safePropList = [];
			propList.forEach(function (prop) {
				if (obj.isValidProp(prop) && safePropList.indexOf(prop) < 0) {
					safePropList.push(prop);
				}
			});
			obj.props = safePropList;
		}
		return obj.props;
	};

	obj.resetSafePropList = function () {
		obj.props = null;
	};

	obj.isValidProp = function (prop) {
		if (obj.reg.exec(prop)) {
			return 0;
		}
		else if (obj.ignores.indexOf(prop) >= 0) {
			return 0;
		}
		else {
			return 1;
		}
	};

	obj.isEventName = function (name) {
		if (name.substr(0, 2) == "on") {
			return 1;
		}
		else {
			return 0;
		}
	};

	return obj;
});

container.define("appBuilder", ["sandBox", "factory"], function (sandBox, factory) {
	var obj = {};

	obj.buildBridgeScript = function (app, rule) {
		return obj.buildScript(app.app_name, app.web_event, ["/js/bridge.js"], rule.lib_list, rule.gm_list);
	};

	obj.buildInjectScript = function (app, rule) {
		return obj.buildScript(app.app_name, app.web_event, ["/js/inject.js"], rule.lib_list, rule.gm_list);
	};

	obj.buildScript = function (appName, webEvent, templateList, libList, gmList) {
		return new Promise(function (resolve) {
			var cacheResource = factory.getCacheResource();
			var appResource = factory.getAppResource(appName);
			var promiseList = [
				cacheResource.loadResourceBatch(templateList),
				appResource.loadResourceBatch(libList),
				appResource.loadResourceBatch(gmList)
			];
			Promise.all(promiseList).then(function (parts) {
				var templateCode = obj.contactScript(parts[0]);
				var thirdLibrary = obj.contactScript(parts[1]);
				var userScript = obj.contactScript(parts[2]);

				var script = templateCode;
				script = obj.replaceScript(script, '"#one#safe_prop#one#"', JSON.stringify(sandBox.getSafePropList()));
				script = obj.replaceScript(script, '"#one#third_library#one#"', thirdLibrary);
				script = obj.replaceScript(script, '"#one#user_script#one#"', userScript);
				script = obj.replaceScript(script, "#one#gm_scope#one#", appName);
				script = obj.replaceScript(script, "#one#web_event#one#", webEvent);

				resolve({
					parts: parts,
					script: script
				});
			});
		});
	};

	obj.contactScript = function (resourceList) {
		var scripts = [];
		for (var i in resourceList) {
			var resource = resourceList[i];
			if (resource.state == 1) {
				scripts.push(resource.content);
			}
		}
		return scripts.join(";");
	};

	obj.replaceScript = function (script, pattern, replace) {
		if (script.indexOf(pattern) >= 0) {
			var divideList = script.split(pattern);
			return divideList[0] + replace + divideList[1];
		}
		else {
			return script;
		}
	};

	return obj;
});

container.define("appWorker", ["addon", "appBuilder", "addonMessager"], function (addon, appBuilder, addonMessager) {
	var obj = {
		types: {
			INJECT: "inject",
			BRIDGE: "bridge"
		}
	};

	obj.runAppList = function (appList, url, event, sender) {
		for (var i in appList) {
			try {
				obj.runApp(appList[i], url, event, sender);
			}
			catch (err) { }
		}
	};

	obj.runApp = function (app, url, event, sender) {
		app.web_event = event;
		app.rule_list.forEach(function (rule) {
			if (app.app_status == 1 && app.app_error == 0) {
				if (obj.matchAppRule(rule, url)) {
					obj.applyAppRule(app, rule, sender);
				}
			}
		});
	};

	obj.matchAppRule = function (rule, url) {
		var i, pattern;
		for (i in rule.exclude_list) {
			pattern = rule.exclude_list[i];
			if (url.indexOf(pattern) >= 0 || pattern == "*") {
				return false;
			}
		}
		for (i in rule.include_list) {
			pattern = rule.include_list[i];
			if (url.indexOf(pattern) >= 0 || pattern == "*") {
				return true;
			}
		}
		return false;
	};

	obj.applyAppRule = function (app, rule, sender) {
		var applyType = rule.apply_type.toLowerCase();
		if (applyType == obj.types.BRIDGE) {
			obj.applyAppBridgeContentScript(app, rule, sender);
		} else if (applyType == obj.types.INJECT) {
			obj.applyAppInjectContentScript(app, rule, sender);
		}
	};

	obj.applyAppBridgeContentScript = function (app, rule, sender) {
		appBuilder.buildBridgeScript(app, rule).then(function (result) {
			addon.tabs.executeScript(sender.tab.id, {
				code: result.script
			});
		});
	};

	obj.applyAppInjectContentScript = function (app, rule, sender) {
		appBuilder.buildInjectScript(app, rule).then(function (result) {
			addonMessager.postTabMessage(sender.tab.id, "store_app_response", {
				script: result.script
			});
		});
	};

	return obj;
});

container.define("appInfo", ["oneData"], function (oneData) {
	var obj = {};

	obj.fetchAppInfo = function (appUrl) {
		return new Promise(function (resolve) {
			oneData.requestOneJson(appUrl).then(resolve);
		});
	};

	obj.fetchAppList = function (storeUrl) {
		return new Promise(function (resolve) {
			oneData.requestOneJson(storeUrl).then(resolve);
		});
	};

	obj.parseAppList = function (appList) {
		var list = {};
		if (appList instanceof Array || appList instanceof Object) {
			for (var i in appList) {
				var app = obj.parseAppInfo(appList[i]);
				app && (list[app.app_name] = app);
			}
		}
		return list;
	};

	obj.parseAppInfo = function (app) {
		if (!(app instanceof Object && app.app_name && app.app_title && app.app_version)) {
			return null;
		}

		app.rule_list = obj.parseAppRuleList(app.rule_list);

		return app;
	};

	obj.parseAppRuleList = function (ruleList) {
		var list = [];
		if (ruleList instanceof Array || ruleList instanceof Object) {
			for (var i in ruleList) {
				var item = obj.parseRuleItem(ruleList[i]);
				item && list.push(item);
			}
		}
		return list;
	};

	obj.parseRuleItem = function (item) {
		if (!(item instanceof Object && item.apply_type)) {
			return null;
		}

		item.lib_list = obj.filterRuleItemUrlList(item.lib_list);
		item.gm_list = obj.filterRuleItemUrlList(item.gm_list);
		item.include_list = obj.filterRuleItemPatternList(item.include_list);
		item.exclude_list = obj.filterRuleItemPatternList(item.exclude_list);

		return item;
	};

	obj.filterRuleItemUrlList = function (urlList) {
		var list = [];
		if (urlList instanceof Array || urlList instanceof Object) {
			for (var i in urlList) {
				var url = urlList[i];
				if (typeof url == "string" && url) {
					list.push(url);
				}
			}
		}
		return list;
	};

	obj.filterRuleItemPatternList = function (patternList) {
		var list = [];
		if (patternList instanceof Array || patternList instanceof Object) {
			for (var i in patternList) {
				var pattern = patternList[i];
				if (typeof pattern == "string" && pattern) {
					list.push(pattern);
				}
			}
		}
		return list;
	};

	return obj;
});

container.define("appResource", ["factory"], function (factory) {
	var obj = {};

	obj.cacheAppResource = function (app) {
		return new Promise(function (resolve) {
			var urlList = obj.concatAppResourceUrlList(app);
			var appResource = obj.getAppResource(app.app_name);
			appResource.loadResourceBatch(urlList).then(resolve);
		});
	};

	obj.cleanAppResource = function (appName) {
		obj.getAppResource(appName).removeResourceAll();
	};

	obj.concatAppResourceUrlList = function (app) {
		var urlList = [];
		app.rule_list.forEach(function (rule) {
			rule.lib_list.forEach(function (url) {
				if (urlList.indexOf(url) < 0) {
					urlList.push(url);
				}
			});
			rule.gm_list.forEach(function (url) {
				if (urlList.indexOf(url) < 0) {
					urlList.push(url);
				}
			});
		});
		return urlList;
	};

	obj.getAppResource = function (appName) {
		return factory.getAppResource(appName);
	};

	return obj;
});

container.define("oneStore", ["manifest", "calendar", "notify", "env", "appInfo", "appWorker", "appResource", "factory"], function (manifest, calendar, notify, env, appInfo, appWorker, appResource, factory) {
	var obj = {};

	obj.initStore = function () {
		return new Promise(function (resolve) {
			if (manifest.getItem("store_auto_install") == "yes") {
				obj.runAutoInstall().then(resolve);
			}
			else if (obj.getAutoUpdate() != "off") {
				obj.runAutoUpdate().then(resolve);
			}
			else {
				resolve();
			}
		});
	};

	obj.toggleAutoUpdate = function () {
		if (obj.getAutoUpdate() != "off") {
			obj.setAutoUpdate(0);
			notify.showNotify("已关闭自动更新");
		}
		else {
			obj.setAutoUpdate(1);
			notify.showNotify("已启用自动更新");
		}
	};

	obj.getAutoUpdate = function () {
		return obj.getStoreDao().get("auto_update") == "off" ? "off" : "on";
	};

	obj.setAutoUpdate = function (status) {
		obj.getStoreDao().set("auto_update", status ? "on" : "off");
	};

	obj.getStoreUrl = function () {
		var storeUrl = obj.getStoreDao().get("store_url");
		storeUrl || (storeUrl = manifest.getItem("store_default_url"));
		return storeUrl;
	};

	obj.setStoreUrl = function (storeUrl) {
		obj.getStoreDao().set("store_url", storeUrl);
	};

	obj.commandAutoUpdate = function () {
		obj.runAutoUpdate().then(function () {
			notify.showNotify("自动更新应用完成");
		});
	};

	obj.commandUpdateAll = function () {
		obj.runAutoUpdate(true).then(function () {
			notify.showNotify("更新所有应用完成");
		});
	};

	obj.commandInstallAll = function () {
		obj.runAutoInstall().then(function () {
			notify.showNotify("安装所有应用完成");
		});
	};

	obj.runAutoInstall = function () {
		return new Promise(function (resolve) {
			obj.getStoreAndInstalledAppList().then(function (appList) {
				var installList = [];
				var nowTime = calendar.getTime();
				for (var i in appList) {
					var app = appList[i];
					if (app.app_status != 1) {
						installList.push(app);
					}
					else if (app.update_time < nowTime - manifest.getItem("store_app_update_interval") * 1000) {
						installList.push(app);
					}
				}
				obj.installAppBatch(installList).then(resolve);
			});
		});
	};

	obj.runAutoUpdate = function (force) {
		return new Promise(function (resolve) {
			obj.getInstalledAppList().then(function (appList) {
				var appNameList = [];
				var nowTime = calendar.getTime();
				for (var i in appList) {
					var app = appList[i];
					if (app.app_error != 0) {
						appNameList.push(app);
					}
					else if (app.update_time < nowTime - manifest.getItem("store_app_update_interval") * 1000 || force) {
						appNameList.push(app.app_name);
					}
				}
				if (appNameList) {
					obj.upgradeAppBatch(appNameList).then(resolve);
				}
				else {
					resolve();
				}
			});
		});
	};

	obj.installAppWithAppUrl = function (appUrl) {
		return new Promise(function (resolve) {
			appInfo.fetchAppInfo(appUrl).then(function (app) {
				obj.installApp(app).then(resolve);
			});
		});
	};

	obj.installApp = function (app) {
		return new Promise(function (resolve) {
			app = appInfo.parseAppInfo(app);
			if (app instanceof Object) {
				Object.assign(app, {
					install_time: calendar.getTime(),
					install_date: calendar.formatTime("m-d H:i", app.update_time)
				});
				if (app.require_version > env.getVersion()) {
					Object.assign(app, {
						app_status: 0,
						app_error: 1,
						app_msg: "插件版本过低，应用要求插件最低版本为" + app.require_version
					});
					obj.setInstalledApp(app.app_name, app).then(resolve);
				}
				else {
					appResource.cacheAppResource(app).then(function (resourceList) {
						obj.setInstalledApp(app.app_name, obj.parseInstalledApp(app, resourceList)).then(resolve);
					});
				}
			}
			else {
				resolve();
			}
		});
	};

	obj.installAppBatch = function (appList) {
		return new Promise(function (resolve) {
			var promiseList = [];
			appList.forEach(function (app) {
				promiseList.push(obj.installApp(app));
			});
			Promise.all(promiseList).then(resolve);
		});
	};

	obj.parseInstalledApp = function (app, resourceList) {
		Object.assign(app, {
			app_status: 1,
			app_error: 0,
			app_msg: ""
		});

		for (var i in resourceList) {
			var resource = resourceList[i];
			if (resource.state != 1) {
				app.app_status = 0;
				app.app_error = 1;
				app.app_msg = "下载文件[" + resource.url + "]失败";
				break;
			}
		}

		return app;
	};

	obj.upgradeApp = function (appName) {
		return new Promise(function (resolve) {
			obj.getInstalledApp(appName).then(function (app) {
				if (app instanceof Object && app.info_url) {
					obj.installAppWithAppUrl(app.info_url).then(resolve);
				}
				else {
					resolve();
				}
			});
		});
	};

	obj.upgradeAppBatch = function (appNameList) {
		return new Promise(function (resolve) {
			var promiseList = [];
			appNameList.forEach(function (appName) {
				promiseList.push(obj.upgradeApp(appName));
			});
			Promise.all(promiseList).then(resolve);
		});
	};

	obj.uninstallApp = function (appName) {
		return new Promise(function (resolve) {
			appResource.cleanAppResource(appName);
			obj.removeInstallApp(appName);
			obj.clearAppSetting(appName);
			resolve();
		});
	};

	obj.clearAppSetting = function (appName) {
		factory.getAppDao(appName).removeAll();
	};

	obj.getStoreAppList = function () {
		return new Promise(function (resolve) {
			var storeUrl = obj.getStoreUrl();
			appInfo.fetchAppList(storeUrl).then(function (appData) {
				var appList = [];
				if (appData instanceof Object && (appData.list instanceof Array || appData.list instanceof Object)) {
					appList = appInfo.parseAppList(appData.list);
				}
				resolve(appList);
			});
		});
	};

	obj.getStoreAndInstalledAppList = function () {
		return new Promise(function (resolve) {
			obj.getStoreAppList().then(function (appList) {
				obj.concatInstalledAppList(appList).then(function (appList) {
					resolve(obj.sortAppList(Object.values(appList)));
				});
			});
		});
	};

	obj.sortAppList = function (appList) {
		return appList.sort(function (a, b) {
			var aw = typeof a.app_weight == "undefined" ? 0 : a.app_weight;
			var bw = typeof b.app_weight == "undefined" ? 0 : b.app_weight;
			if (aw < bw) {
				return 1;
			}
			else if (aw > bw) {
				return -1;
			}
			else {
				return 0;
			}
		});
	};

	obj.concatInstalledAppList = function (appList) {
		return new Promise(function (resolve) {
			obj.getInstalledAppList().then(function (installedAppList) {
				var emptyApp = {
					app_status: 0,
					app_error: 0,
					app_msg: "",
					app_version: "",
					update_time: 0,
					update_date: "",
					need_update: 0
				};
				for (var i in appList) {
					var storeApp = appList[i];
					if (installedAppList.hasOwnProperty(storeApp.app_name)) {
						obj.concatInstalledApp(storeApp, installedAppList[storeApp.app_name]);
					}
					else {
						obj.concatInstalledApp(storeApp, emptyApp);
					}
				}

				for (var j in installedAppList) {
					var installedApp = installedAppList[j];
					if (!appList.hasOwnProperty(installedApp.app_name)) {
						appList[installedApp.app_name] = obj.concatInstalledApp(installedApp, installedApp);
					}
				}

				resolve(appList);
			});
		});
	};

	obj.concatInstalledApp = function (storeApp, installedApp) {
		Object.assign(storeApp, {
			app_status: installedApp.app_status,
			app_error: installedApp.app_error,
			app_msg: installedApp.app_msg,
			install_version: installedApp.app_version,
			update_date: installedApp.update_date,
			need_update: installedApp.app_version < storeApp.app_version ? 1 : 0
		});
		return storeApp;
	};

	obj.runInstalledAppList = function (url, event, sender) {
		return new Promise(function (resolve) {
			obj.getInstalledAppList().then(function (appList) {
				resolve(appWorker.runAppList(appList, url, event, sender));
			});
		});
	};

	obj.getInstalledApp = function (appName) {
		return new Promise(function (resolve) {
			resolve(obj.getStoreAppsDao().get(appName));
		});
	};

	obj.getInstalledAppList = function () {
		return new Promise(function (resolve) {
			var appList = obj.getStoreAppsDao().getAll();
			if (appList instanceof Object) {
				resolve(appList);
			}
			else {
				resolve([]);
			}
		});
	};

	obj.setInstalledApp = function (appName, app) {
		return new Promise(function (resolve) {
			Object.assign(app, {
				update_time: calendar.getTime(),
				update_date: calendar.formatTime("m-d H:i", app.update_time)
			});
			obj.getStoreAppsDao().set(appName, app);
			resolve();
		});
	};

	obj.setInstalledAppStatus = function (appName, appStatus) {
		return new Promise(function (resolve) {
			obj.getInstalledApp(appName).then(function (app) {
				if (app instanceof Object) {
					Object.assign(app, {
						app_status: appStatus ? 1 : 0
					});
					obj.setInstalledApp(appName, app).then(resolve);
				}
			});
		});
	};

	obj.removeInstallApp = function (appName) {
		obj.getStoreAppsDao().remove(appName);
	};

	obj.getStoreDao = function () {
		return factory.getStoreDao();
	};

	obj.getStoreAppsDao = function () {
		return factory.getStoreAppsDao();
	};

	return obj;
});