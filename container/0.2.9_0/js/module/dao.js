container.define("cacheDao", [], function () {
    var obj = {
        items: {}
    };

    obj.get = function (name) {
        return obj.items[name];
    };

    obj.getBatch = function (names) {
        var items = {};
        names.forEach(function (name) {
            if (obj.items.hasOwnProperty(name)) {
                items[name] = obj.items[name];
            }
        });
        return items;
    };

    obj.getAll = function () {
        return obj.items;
    };

    obj.set = function (name, item) {
        obj.items[name] = item;
    };

    obj.setBatch = function (items) {
        obj.items = Object.assign(obj.items, items);
    };

    obj.setAll = function (items) {
        obj.items = Object.assign({}, items);
    };

    obj.remove = function (name) {
        delete obj.items[name];
    };

    obj.removeBatch = function (names) {
        names.forEach(function (name) {
            obj.remove(name);
        });
    };

    obj.removeAll = function () {
        obj.items = {};
    };

    return obj;
});

container.define("localDao", [], function () {
    var obj = {};

    obj.get = function (name) {
        return obj._get(name);
    };

    obj.getBatch = function (names) {
        var item = {};
        names.forEach(function (name) {
            if (localStorage.hasOwnProperty(name)) {
                item[name] = obj._get(name);
            }
        });
        return item;
    };

    obj.getAll = function () {
        var item = {};
        Object.keys(localStorage).forEach(function (name) {
            item[name] = obj._get(name);
        });
        return item;
    };

    obj.set = function (name, item) {
        obj._set(name, item);
    };

    obj.setBatch = function (items) {
        for (var name in items) {
            obj._set(name, items[name]);
        }
    };

    obj.setAll = function (items) {
        localStorage.clear();
        for (var name in items) {
            obj._set(name, items[name]);
        }
    };

    obj.remove = function (name) {
        localStorage.removeItem(name);
    };

    obj.removeBatch = function (names) {
        names.forEach(function (name) {
            localStorage.removeItem(name);
        });
    };

    obj.removeAll = function () {
        localStorage.clear();
    };

    obj._get = function (name) {
        return obj.decodeItem(localStorage.getItem(name));
    };

    obj._set = function (name, item) {
        localStorage.setItem(name, obj.encodeItem(item));
    };

    obj.encodeItem = function (item) {
        return JSON.stringify({
            value: item
        });
    };

    obj.decodeItem = function (item) {
        try {
            if (item) {
                return JSON.parse(item).value;
            }
        }
        catch (err) { }
        return undefined;
    };

    return obj;
});

container.define("addonDao", ["addon"], function (addon) {
    var obj = {
        items: {}
    };

    obj.get = function (name) {
        return obj.items[name];
    };

    obj.getBatch = function (names) {
        var items = {};
        names.forEach(function (name) {
            if (obj.items.hasOwnProperty(name)) {
                items[name] = obj.items[name];
            }
        });
        return items;
    };

    obj.getAll = function () {
        return obj.items;
    };

    obj.set = function (name, item) {
        obj.items[name] = item;

        var items = {};
        items[name] = item;
        obj.getStorage().set(items);
    };

    obj.setBatch = function (items) {
        obj.items = Object.assign(obj.items, items);

        obj.getStorage().set(items);
    };

    obj.setAll = function (items) {
        obj.items = items;

        obj.getStorage().clear(function () {
            obj.getStorage().set(items);
        });
    };

    obj.remove = function (name) {
        delete obj.items[name];

        obj.getStorage().remove(name);
    };

    obj.removeBatch = function (names) {
        names.forEach(function (name) {
            delete obj.items[name];
        });

        obj.getStorage().remove(names);
    };

    obj.removeAll = function () {
        obj.items = {};

        obj.getStorage().clear();
    };

    obj.getStorage = function () {
        return addon.storage.local;
    };

    obj.initDao = function () {
        return new Promise(function (resolve) {
            obj.getStorage().get(null, function (items) {
                obj.items = items;
                resolve();
            });
        });
    };

    return obj;
});

container.define("ScopeDao", [], function () {
    return function (dao, scope) {
        var obj = {
            items: {}
        };

        obj.get = function (name) {
            obj.load();

            return obj.items[name];
        };

        obj.getBatch = function (names) {
            obj.load();

            var items = {};
            names.forEach(function (name) {
                if (obj.items.hasOwnProperty(name)) {
                    items[name] = obj.items[name];
                }
            });
            return items;
        };

        obj.getAll = function () {
            obj.load();

            return obj.items;
        };

        obj.set = function (name, item) {
            obj.items[name] = item;

            obj.sync();
        };

        obj.setBatch = function (items) {
            obj.items = Object.assign(obj.items, items);

            obj.sync();
        };

        obj.setAll = function (items) {
            obj.items = Object.assign({}, items);

            obj.sync();
        };

        obj.remove = function (name) {
            delete obj.items[name];

            obj.sync();
        };

        obj.removeBatch = function (names) {
            names.forEach(function (name) {
                delete obj.items[name];
            });

            obj.sync();
        };

        obj.removeAll = function () {
            obj.items = {};

            obj.getDao().remove(obj.getScope());
        };

        obj.load = function () {
            var items = obj.getDao().get(obj.getScope());
            if (items instanceof Object) {
                obj.items = items;
            }
            else {
                obj.items = {};
            }
        };

        obj.sync = function () {
            obj.getDao().set(obj.getScope(), obj.items);
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