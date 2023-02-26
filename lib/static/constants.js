const { exec } = require("node:child_process")
const { promisify } = require("node:util")
const promiseExec = promisify(exec)
    // const md2img = require('md2img')
const path = require('path')
const fs = require('fs')
const { dirname } = require('../../dirname')

var lang = {} // 语言jsonObj

try {
    var { disablePlugin, enablePlugin, PupPlugin, PluginDataDir, PupConf, axios, segment } = require('@pupbot/core')
    var botName = 'pup'
} catch (error) {
    try {
        var { disablePlugin, enablePlugin, KiviPlugin, PluginDataDir, KiviConf, axios, segment } = require('@kivibot/core')
        var botName = 'kivi'
    } catch (error) {
        var { disablePlugin, enablePlugin, Plugin, PluginDataDir, Conf, axios, segment } = require('keli')
        var botName = 'keli'
    }
}

axios.defaults.timeout = 90 * 1000 // 设置 1.5min 超时时间

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
    throw Error(`${name}: unknown/unsupport bot: ${botName}`)
}
PluginDataDir = path.join(PluginDataDir, `./${plugin.name}`)

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
const imgsPath = path.join(PluginDataDir, './images/')

async function updateMdImg() {
    return
    if (!fs.existsSync(imgsPath)) {
        try {
            fs.mkdirSync(imgsPath)
            plugin.logger.debug(`create ${imgsPath} success`)
        } catch (error) {
            plugin.logger.debug(`create ${imgsPath} error: ${error.stack}`)
        }
    } else if (fs.statSync(imgsPath).isFile()) {
        try {
            fs.rmSync(imgsPath)
            plugin.logger.debug(`remove file ${imgsPath} success`)
        } catch (error) {
            plugin.logger.debug(`remove file ${imgsPath} error: ${error.stack}`)
        }
        try {
            fs.mkdirSync(imgsPath)
            plugin.logger.debug(`create ${imgsPath} success`)
        } catch (error) {
            plugin.logger.warn(`create ${imgsPath} error: ${error.stack}`)
        }
    } else {
        plugin.logger.debug(`dir ${imgsPath} no error`)
    }

    let readmeFilename = path.join(dirname, 'readme.md')
    let readmeTarget = path.join(imgsPath, 'readme.png')
    md2img(readmeFilename, (buffer) => {
        fs.writeFileSync(readmeTarget, buffer)
    })

    let root = path.join(dirname, './docs')
    let files = fs.readdirSync(root)
    for (let index in files) {
        let item = files[index]
        try {
            let _filename = path.join(root, item)
            if (fs.existsSync(_filename) && fs.statSync(_filename).isFile() && item.slice(-3).toLowerCase() == '.md') {
                let targetFilename = path.join(imgsPath, `${item.slice(0, -3)}.png`)
                md2img(_filename, (buffer) => {
                    fs.writeFileSync(targetFilename, buffer)
                })
            }
        } catch (error) {}
    }
}

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
    botName,
    updateMdImg,
    imgsPath,
    segment
}