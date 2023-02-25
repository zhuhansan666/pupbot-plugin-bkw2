const { supportPermissions, axios, plugin, UA } = require('./constants')
const { changes } = require('../changes/changes')

const tools = {
    _fromatConfig: function(config, defaultConfig) {
        for (let key in defaultConfig) { // 遍历默认配置
            let value = defaultConfig[key]
            if (typeof value == "object") { // 如果是obj
                if (value instanceof Array) { // 是array
                    for (let index in value) { // 遍历
                        let item = value[index]
                        if (!config[key].includes(item)) { // 如果不存在直接添加
                            config[key].push(item)
                        } else if (typeof item == "object") { // 如果是对象(array/json)
                            tools._fromatConfig(config[key], item) // 回调保证里面的每一项都存在
                        }
                    }
                } else if (value instanceof Object) { // 如果是obj(json)
                    for (let _k in value) { // 遍历
                        let _v = value[_k]
                        if (config[key] === undefined) { // 如果不存在直接添加
                            config[key] = value
                        }
                        if (config[key][_k] === undefined) { // 如果不存在直接添加
                            config[key][_k] = _v
                        } else if (typeof value == "object") { // 如果是对象(array/json)
                            let _dc = defaultConfig[key][_k]
                            tools._fromatConfig(config[key][_k], _dc !== undefined ? _dc : {}) // 回调添加
                        }
                    }
                }
            } else if (config[key] === undefined) { // 如果是其他类型且不存在
                config[key] = value // 直接添加
            }
        }
    },
    reloadConfig: function(plugin, _config, _defaultConfig) {
        /**
         * 加载配置
         */
        Object.assign(_config, plugin.loadConfig())
        tools._fromatConfig(_config, _defaultConfig)
    },
    saveConfig: function(plugin, _config, _defaultConfig) {
        /**
         * 保存配置
         */
        tools._fromatConfig(_config, _defaultConfig)
        plugin.saveConfig(_config)
    },
    fromatString: function(string, header, vars, _plugin) {
        function replace(_string) {
            _string = _string.replaceAll('{pv}', _plugin.version)
            _string = _string.replaceAll('{pn}', _plugin.name) // 替换全部
            return _string
        }
        _plugin = _plugin !== undefined ? _plugin : plugin

        if (header !== undefined) {
            string = `${header}\n${string}`
        }

        if (vars === undefined) {
            return replace(string)
        } else if (typeof vars != "object") {
            vars = [vars]
        }

        for (let index in vars) {
            string = string.replaceAll(`{${index}}`, vars[index]) // 替换全部
        }
        return replace(string)
    },
    checkVersion: function(latest, thisVer) {
        let _arr = latest.toString().split('.')
        let _this = thisVer.toString().split('.')
        for (let i = 0; i < _arr.length; i++) {
            try {
                _arr[i] = parseInt(_arr[i])
                _this[i] = parseInt(_this[i])
            } catch (error) {
                plugin.logger.warn(`Compare version warn: ${error.stack}`)
            }
        }

        if (_this[0] > _arr[0]) {
            return true
        } else if (_this[0] == _arr[0]) {
            if (_this[1] > _arr[1]) {
                return true
            } else if (_this[1] == _arr[1]) {
                if (_this[2] >= _arr[2]) {
                    return true
                }
            }
        }

        return false
    },
    hasPermisson: function(sender, permission, plugin) {
        let uid = sender.user_id
        let statusCode = 0
        permission = permission.toLowerCase()

        if (!supportPermissions.includes(permission)) {
            permission = supportPermissions[0]
            statusCode = -1
        }

        if (permission == 'false') {
            return [statusCode, false]
        } else if (permission == 'mainadmin') {
            return [statusCode, uid === plugin.mainAdmin]
        } else if (permission == 'admins') {
            return [statusCode, plugin.admins.includes(uid)]
        } else if (permission == 'members') {
            return [statusCode, true]
        } else { // 未知权限组
            statusCode = -1
            return [statusCode, false]
        }
    },
    rmOption: function(msgarray) {
        /**
         * 将msgarray以<空格>+/-{a-z,A-Z}<空白字符>替换为<空格>
         */
        for (let index in msgarray) {
            let item = msgarray[index]
            if (item.type == 'text') {
                item.text = item.text.replaceAll(new RegExp('(\s[+-][a-zA-Z])', 'g'), ' ').trim()
            }
        }
    },
}

const MounteFunctions = {
    getTotleDownloads: async function(pkgname, _default) {
        let _date = new Date()
        let nowDate = `${_date.getFullYear()}-${_date.getMonth() + 1}-${_date.getDate()}`
        let api = `https://api.npmjs.org/downloads/point/1970-01-01:${nowDate}/${pkgname}`
        let data = {}
        try {
            data = await (await axios.get(api, header = UA)).data
        } catch (error) {
            plugin.logger.warn(`get totle downloads error: ${error}`)
        }
        let downloads = data.downloads

        return downloads == undefined ? (_default !== undefined ? _default : -1) : downloads
    },
    getUpdateStatus: function(_config, _lang, version, latest, _default) {
        if (!_config.config.updated.status) {
            return
        }

        // 如果上次更新了
        let _string = _lang.bkw2.updater.failed[`${_config.config.updated.successed}`.toString()] // 找对应错误code的提示内容
        if (_config.config.updated.successed != 0 && _string) {
            return tools.fromatString(_string, undefined, _config.config.updated.msg, plugin)
        }

        if (latest != null && version != latest) {
            return tools.fromatString(_lang.bkw2.updater.failed.unknown, undefined, `: ${_lang.bkw2.updater.failed.notlatest}`, plugin)
        }

        let changesInfo = changes[version]
        return tools.fromatString(_lang.bkw2.updater.success, undefined, changesInfo ? changesInfo : (_default ? _default : ' - '), plugin)
    }
}

module.exports = { tools, MounteFunctions }


// let html = tools.markdownToHtml('`print("hello world")`', { async: false })
// console.log(html)
// html = `<html><div>\n${html}</div></html>`
//     // console.log(html)
//     // console.log(tools.htmlToPng(html))
// let node = new JSDOM(html)
//     // console.log(node)
// toPng(node)
//     .then(function(dataUrl) {
//         var img = new Image();
//         img.src = dataUrl;
//         console.log(img)
//     })
//     .catch(function(error) {
//         console.error(error.stack);
//     });
// console.log(tools.fromatString('awa\n6\n{0}\n{1}', undefined, ["1114514", "66adawd"], ))