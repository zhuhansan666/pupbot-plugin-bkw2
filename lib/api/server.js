const { keywordsMgr } = require('../mgr/mgr')
const { config, defaultConfig, plugin, supportMsgType, permissionNames } = require('../static/constants')
const express = require('express')
const { tools } = require('../static/tools')
const app = express()

function createResponse(code, msg, data, extra) {
    let response = { code: code, msg: msg ? msg : '', data: data ? data : {}, extra: extra ? extra : {} }
    return response
}

function stringToObj(string, _default) { // safe to array
    if (typeof string == "object") {
        return string
    }
    if (string === undefined || string === null) {
        return _default ? _default : ''
    }

    try {
        return JSON.parse(string.replaceAll("'", '"'))
    } catch (error) {}

    if (string[0] == '[' && string[string.length - 1] == ']') {
        try {
            return JSON.parse(`{"array": ${string}}`.replaceAll("'", '"')).array
        } catch (error) {}
    }

    return _default ? _default : string
}

app.get('/', (request, response) => {
    /**
     * 获取服务器状态
     * @returns {code: 200, msg: 'server starting successful', data: {}}
     */
    response.json(createResponse(200, 'server starting successful'))
    return
})


app.get('/api/add', async(request, response) => {
    /**
     * 添加关键字
     * @param key -> 关键字(字符串)
     * @param value -> 回复内容, oicq支持的格式(数组)
     * @param per -> 权限组(字符串)
     * @param gid -> 群号(可选, 在包含当前群聊时必选)(字符串或数字)
     * @param type -> 类型, 'oicq' / 'js', 暂不支持'js'(可选, 字符串)
     * @param extra -> 附加属性, json格式的Object(可选, 默认{})
     * @returns {code： 状态码, msg: 信息, data: {key: 关键字, value: 回复内容, per: 权限组}}
     */
    let { key, value, per, gid, type, extra } = request.query

    if (!type) {
        type = 'oicq'
    }
    if (!(typeof key == "string" && typeof type == "string")) {
        response.json(createResponse(400, 'bad key or type'))
        return
    }

    // 不区分大小写
    extra = extra.toLowerCase()
    type = type.toLowerCase()
    per = per.toLowerCase()

    if (!(supportMsgType.includes(type) && Object.keys(permissionNames).includes(per))) { // 参数不符合标准
        response.json(createResponse(400, 'bad type or per'))
        return
    }

    extra = stringToObj(extra, {})
    if (extra instanceof Array) {
        extra = { array: extra }
    }

    value = stringToObj(value) // 转Js格式的Object
    if (!value instanceof Array) {
        value = [value]
    }

    let [status, msg] = await keywordsMgr.add(key, per, value, gid, type, extra, config, defaultConfig, plugin)
    if (status != 0) {
        if (status == -1) {
            response.json(createResponse(400, 'unkown permissons'))
            return
        } else if (status == -2) {
            response.json(createResponse(400, 'has some unkown permissons'))
            return
        } else if (status == -3) {
            response.json(createResponse(400, msg))
            return
        }
    }

    response.json(createResponse(200, 'success', { key: key, value: value, per: per }))
    return
})

app.get('/api/rm', async(request, response) => {
    /**
     * 删除关键字
     * @param key -> 关键字(字符串)
     * @param per -> 权限组(字符串)
     * @param gid -> 群号(可选, 在包含当前群聊时必选)(字符串或数字)
     * @returns {code： 状态码, msg: 信息, data: {key: 关键字, per: 权限组}}
     */
    let { key, per, gid } = request.query

    if (!(typeof key == "string")) {
        response.json(createResponse(400, 'bad key or type'))
        return
    }

    // 不区分大小写
    per = per.toLowerCase()

    if (!(Object.keys(permissionNames).includes(per))) { // 参数不符合标准
        response.json(createResponse(400, 'bad type or per'))
        return
    }

    let [status, msg] = await keywordsMgr.rm(key, per, gid, config, defaultConfig, plugin)
    if (status != 0) {
        if (status == -1) {
            response.json(createResponse(400, 'unkown permissons'))
            return
        } else if (status == -2) {
            response.json(createResponse(400, 'has some unkown permissons'))
            return
        } else if (status == -3) {
            response.json(createResponse(400, msg))
            return
        }
    }

    response.json(createResponse(200, 'success', { key: key, per: per }))
    return
})

app.get('/api/each', async(request, response) => {
    /**
     * 返回所有键值对
     * @returns {code: 200, msg: 'success', data: config文件的keywords子键}
     */
    tools.reloadConfig(plugin, config, defaultConfig)
    response.json(createResponse(200, 'success', config.keywords))
    return
})

module.exports = { app }