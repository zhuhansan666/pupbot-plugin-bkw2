const { permissionNames } = require('../static/constants')
const { tools } = require('../static/tools')
const { config, defaultConfig, plugin } = require('../static/constants')


const keywordsMgr = {
    getPermissons: function(permissions, jsonObj) {
        permissions = permissions.toString().replace(' ', '')
        let result = []
        let errors = []
        jsonObj = jsonObj !== undefined ? jsonObj : permissionNames

        if (permissions != '*') { // 通配符
            for (let index in permissions) {
                let char = permissions[index]
                char = char.toLowerCase() // 转小写
                let permisson = jsonObj[char]
                if (permisson) {
                    result.push(permisson)
                } else {
                    errors.push(char)
                }
            }
        } else {
            result = Object.values(jsonObj) // 直接全部加上去
        }
        return [result, errors]
    },
    add: function(key, permissions, info, gid, type, extra, _config, _defaultConfig, _plugin) {
        /**
         * @returns [status<number>, ?msg<string>]
         * status -> 0: success, -1: unknown permissons, -2: success but has some unknown permissons, -3: success but gid unkonwn
         */
        let code = 0
        type = type === undefined ? 'oicq' : type
        _config = _config === undefined ? config : _config
        _defaultConfig = _defaultConfig === undefined ? defaultConfig : _defaultConfig
        extra = extra === undefined ? {} : extra
        _plugin = _plugin === undefined ? plugin : _plugin

        let [result, errors] = keywordsMgr.getPermissons(permissions)
        if (result.length <= 0) { // 没有足够的权限组
            if (errors.length > 0) {
                code = -1
                return [code, errors.join(', ')]
            }
            code = -1
            return [code, undefined]
        }

        let errorMsg = ''
        let value = { type: type, value: info, extra: extra }
        for (let index in result) {
            let item = result[index]
            if (_config.keywords[item] === undefined) {
                continue
            }
            if (item != 'locals') {
                _config.keywords[item][key] = value
            } else {
                if (!gid) {
                    code = -3
                    errorMsg = 'gid unknown but used'
                } else {
                    if (!_config.keywords.locals[gid.toString()]) { // 创建
                        _config.keywords.locals[gid.toString()] = {}
                    }
                    _config.keywords.locals[gid.toString()][key] = value
                }
            }
        }

        tools.saveConfig(_plugin, _config, _defaultConfig) // 保存
        if (code != 0) {
            return [code, errorMsg]
        } else {
            return [code, undefined]
        }
    },
    rm: function(key, permissions, gid, _config, _defaultConfig, _plugin) {
        /**
         * @returns [status<number>, ?msg<string>]
         * status -> 0: success, -1: unknown permissons, -2: success but has some unknown permissons, -3: success but gid unkonwn
         */
        let code = 0
        _config = _config === undefined ? config : _config
        _defaultConfig = _defaultConfig === undefined ? defaultConfig : _defaultConfig
        _plugin = _plugin === undefined ? plugin : _plugin

        let [result, errors] = keywordsMgr.getPermissons(permissions)
        if (result.length <= 0) { // 没有足够的权限组
            if (errors.length > 0) {
                code = -2
                return [code, errors]
            }
            code = -1
            return [code, ]
        }

        let errorMsg = ''
        for (let index in result) {
            let item = result[index]
            if (_config.keywords[item] === undefined) {
                continue
            }
            if (item != 'locals') {
                if (_config.keywords[item][key] !== undefined) { // rm
                    delete _config.keywords[item][key]
                }
            } else {
                if (!gid) {
                    code = -3
                    errorMsg = 'gid unknown but used'
                } else {
                    let fatherKey = _config.keywords.locals[gid.toString()]
                    if (fatherKey && fatherKey[key]) {
                        delete _config.keywords.locals[gid.toString()][key]
                    }
                    if (fatherKey !== undefined && JSON.stringify(fatherKey) == '{}') { // 删除夫键
                        delete _config.keywords.locals[gid.toString()]
                    }
                }
            }
        }

        tools.saveConfig(_plugin, _config, _defaultConfig) // 保存
        if (code != 0) {
            return [code, errorMsg]
        } else {
            return [code, ]
        }
    }
}

const languagesMgr = {
    find: function(name, languages, _default) {
        /**
         * @returns [status<bool>, lang<jsonObj>]
         */
        let lang = languages[name]
        if (lang) {
            return [true, lang]
        }

        for (let key in languages) {
            let value = languages[key]
            if (value.name.includes(name) || value.name.includes(name.toLowerCase())) {
                return [true, value]
            }
        }

        return [false, _default ? _default : undefined]
    }
}

module.exports = { keywordsMgr, languagesMgr }