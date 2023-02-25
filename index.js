const { PluginDataDir, axios, plugin, config, defaultConfig, BotConf, enablePlugin } = require('./lib/static/constants')
const { tools, MounteFunctions } = require('./lib/static/tools')
const { commands } = require('./lib/commands/commands')
const { languagesMgr } = require('./lib/mgr/mgr')
const { languages } = require('./lib/languages/languages')
const { changes } = require('./lib/changes/changes')
const { listener } = require('./lib/api/listener')
const { updatePlugin } = require('./lib/static/updater')
const { dirname } = require('./dirname') // 加载dirname以保证dirname是插件根目录
const { app } = require('./lib/api/server')

const { name, version } = require('./package.json')

var { lang } = require('./lib/static/constants');
var _bot = undefined
var server = undefined
var serverError = undefined
var admins = []

function updateLang(name) {
    let [status, _lang] = languagesMgr.find(name, languages, languages[defaultConfig.config.lang])
    if (!status) { // 如果不成功
        plugin.logger.warn(`load language warn: lang ${name} is not found`)
    }
    lang = _lang // 更新语言
}

async function hooker(event, parmas, plugin, lang, callback, _config, _defaultConfig, errorCallback) {
    _config = _config ? _config : config
    _defaultConfig = _defaultConfig ? _defaultConfig : defaultConfig

    plugin.mainAdmin = BotConf.admins[0] // 更新主管理员
    plugin.admins = BotConf.admins // 更新管理员列表
    let funcname = '[Unknown]'
    try {
        tools.reloadConfig(plugin, _config, _defaultConfig) // 重加载配置
        let result = await callback(event, parmas, plugin, lang, _config)
        tools.saveConfig(plugin, _config, _defaultConfig)
    } catch (error) {
        try {
            funcname = callback.name
        } catch (error) {}
        await errorCallback(event ? event : undefined, event ? event.sender.user_id : undefined, funcname, error, lang)
    }
}


async function msgSender(event, parmas, plugin, lang, callback, errorCallback, _config, _defaultConfig, ) {
    _config = _config ? _config : config
    _defaultConfig = _defaultConfig ? _defaultConfig : defaultConfig

    plugin.mainAdmin = BotConf.admins[0] // 更新主管理员
    plugin.admins = BotConf.admins // 更新管理员列表
    let funcname = '[Unknown]'
    try {
        tools.reloadConfig(plugin, _config, _defaultConfig) // 重加载配置
        let result = await callback(event, parmas, plugin, lang)
        if (result !== undefined) {
            if (result) { // 不为空
                if (typeof result == 'string') {
                    event.reply(result)
                } else {
                    let msg, reply
                    msg = result[0]
                    reply = result[1]
                    event.reply(msg, reply)
                }
            } else {
                plugin.logger.warn(`empty message`)
            }
        }
        tools.saveConfig(plugin, _config, _defaultConfig)
    } catch (error) {
        try {
            funcname = callback.name
        } catch (error) {}
        await errorCallback(event, event.sender.user_id, funcname, error, lang)
    }
}

async function onMounted() {
    tools.reloadConfig(plugin, config, defaultConfig) // 重加载配置
    updateLang(config.config.lang)
    let updateStatus = MounteFunctions.getUpdateStatus(config, lang, plugin.version, config.config.updated.latest)
    plugin.bot.sendPrivateMsg(plugin.mainAdmin, tools.fromatString(lang.mounted, lang.header, [(await MounteFunctions.getTotleDownloads(name, ' - ')), updateStatus ? `\n\n${updateStatus}` : ''], plugin)) // 提示消息
    config.config.updated.status = false
    tools.saveConfig(plugin, config, defaultConfig)

    plugin.onMessage((event, parmas) => hooker(event, parmas, plugin, lang, listener.main, config, defaultConfig, commands.report))
    plugin.onCmd(config.commands.bkw2.value, (event, parmas) => msgSender(event, parmas, plugin, lang, commands.bkw2, commands.report))
    plugin.onCmd(config.commands.update.value, (event, parmas) => msgSender(event, parmas, plugin, lang, updatePlugin, commands.report))
    plugin.cron('*/10 * * * *', () => hooker(undefined, [], plugin, lang, updatePlugin, undefined, undefined, commands.report))
    setTimeout(() => hooker(undefined, [], plugin, lang, updatePlugin, undefined, undefined, commands.report), 100) // 启用时延时后检查更新
}

plugin.onMounted(async() => {
    _bot = plugin.bot
    admins = plugin.admins
    try {
        await onMounted()
    } catch (error) {
        plugin.logger.error(`${plugin.name}: onMounted error: ${error.stack}`)
        commands.report(null, null, 'onMounted', error, lang)
        throw error // throw 到框架
    }
    let port = config.config.server.port
    let host = config.config.server.host
    server = await app.listen(port, host)

    server.on('error', (error) => { // 监听错误内容
        plugin.logger.warn(`${plugin.name}: failed to start httpapi: ${error}`)
        plugin.bot.sendPrivateMsg(plugin.mainAdmin, tools.fromatString(lang.bkw2.plugin.serverstartfailed, lang.header, error.message, plugin))
        server = undefined // 设置为未定义代表没有启动成功
        serverError = error // 设置错误内容
    })
    server.on('listening', () => { // 监听server启动
        let localhost = `(http://${ host.includes('0.0.0.0') ? host.replaceAll('0.0.0.0', '127.0.0.1') : undefined}:${port})`
        let serverStartedMsg = `http://${host}:${port} ${localhost.includes('undefined') ? '' : localhost}`.trimEnd()
        plugin.bot.sendPrivateMsg(plugin.mainAdmin, tools.fromatString(lang.bkw2.plugin.serverstartsuccess, lang.header, serverStartedMsg, plugin))
        plugin.logger.info(`${plugin.name}: httpapi run at ${serverStartedMsg}`)
    })
})

plugin.onUnmounted(() => {
    if (server) { // 尝试关闭httpapi
        server.close((error) => {
            if (error) {
                plugin.logger.warn(`${plugin.name}: close httpapi error: ${error.stack}`)
            } else {
                plugin.logger.debug(`${plugin.name}: close httpapi successed`)
            }
        })
    } else { // 服务器为undefined
        plugin.logger.warn(`${plugin.name}: httpapi server is undefined(starting failed): ${serverError}`)
    }

    return

    // 在插件禁用时调用框架的启用api我真是个天才（
    try {
        _bot.sendPrivateMsg(admins[0], 'Operations that are not allowed!')
        setTimeout(() => {
                enablePlugin(_bot, BotConf, dirname)
            }, 0) // 走全局的异步避免比框架禁用的慢
    } catch (error) {
        console.log(`at onUnmount error: ${error.stack}`)
    }
})

module.exports = { plugin, updatePlugin }