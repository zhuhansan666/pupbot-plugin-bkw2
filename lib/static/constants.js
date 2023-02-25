const { exec } = require("node:child_process")
const { promisify } = require("node:util")
const promiseExec = promisify(exec)

var lang = {} // 语言jsonObj

try {
    var { disablePlugin, enablePlugin, PupPlugin, PluginDataDir, PupConf, axios } = require('@pupbot/core')
    var botName = 'pup'
} catch (error) {
    try {
        var { disablePlugin, enablePlugin, KiviPlugin, PluginDataDir, KiviConf, axios } = require('@kivibot/core')
        var botName = 'kivi'
    } catch (error) {
        var { disablePlugin, enablePlugin, Plugin, PluginDataDir, Conf, axios } = require('keli')
        var botName = 'keli'
    }
}

const { name, version } = require('../../package.json')
if (botName == 'pup') {
    var pluginName = name.replace('pupbot-plugin-', '')
    var plugin = new PupPlugin(pluginName, version)
    var BotConf = PupConf
} else if (botName == 'kivi') {
    var pluginName = name.replace('kivibot-plugin-', '')
    var plugin = new KiviPlugin(pluginName, version)
    var BotConf = KiviConf
} else if (botName == 'keli') {
    var pluginName = name.replace('keli-', '')
    var plugin = new Plugin(pluginName, version)
    var BotConf = Conf
} else {
    throw Error(`unknown bot: ${botName}`)
}

const supportMsgType = ['oicq', 'js']
const supportPermissions = ['mainadmin', 'admins', 'members', 'false']
const permissionNames = {
    l: 'locals', // 当前群聊
    g: 'groups', // 所有群聊
    p: 'privates', // 所有私聊
    a: 'global' // 全局
}
const UA = {
    "user-agent": `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36 Edg/109.0.1518.70`
}

/*
keywords格式
{
    type: "oicq", // oicq模式
    value: [
        // oicq支持的内容
    ],
    extra: {} // 附加属性, 如 fuzzy: false
}
或
{
    type: "js", // js文件模式
    value: "", // jsfile路径
    extra: {} // 附加属性
}
*/

const config = {
    keywords: {
        locals: {}, // 群聊单独配置项
        groups: {}, // 全局群聊配置项
        privates: {}, // 全局私聊配置项
        global: {} // 全局配置项
    },
    config: {
        updated: { status: false, successed: 0, msg: '', latest: null }, // 上次更新的详情, 用于提示用户是否更新成功
        lang: 'zh-cn',
        server: {
            host: "0.0.0.0",
            port: 7070
        }
    },
    commands: { // permission: mainadmin, admins, members
        bkw2: { permission: 'admins', value: ['/bkw2'] },
        update: { permission: 'admins', value: ['/bkw2update', '/bkw2up'] }
    }
}

const defaultConfig = JSON.parse(JSON.stringify(config)) // deep copy

module.exports = {
    disablePlugin,
    enablePlugin,
    PupPlugin,
    PluginDataDir,
    axios,
    plugin,
    name,
    pluginName,
    version,
    config,
    defaultConfig,
    BotConf,
    supportPermissions,
    UA,
    exec,
    promiseExec,
    permissionNames,
    lang,
    supportMsgType,
    botName
}