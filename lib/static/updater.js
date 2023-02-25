const { UA, axios, disablePlugin, enablePlugin, BotConf, promiseExec, plugin, config, defaultConfig } = require('./constants')
const { name, version } = require('../../package.json')
const { tools, MounteFunctions } = require('./tools')
const { dirname } = require('../../dirname')

const updater = {
    checker: async function(pkgname, version) {
        // debug
        // return [-1, '0.0.1']

        let latestVersion = '0.0.0'
        try {
            let { data } = await (axios.get(`https://registry.npmjs.org/${pkgname}`, headers = UA))
            latestVersion = data['dist-tags'].latest
        } catch (error) {
            plugin.logger.warn(`${plugin.name} Failed to get latest version: ${error.stack}`)
            return [-2, error.stack]
        }

        let isLatest = tools.checkVersion(latestVersion, version)
        if (isLatest) {
            return [0, latestVersion]
        }

        return [-1, latestVersion]
    },
    reInstall: async function(pkgname) {
        try {
            let { stderr } = await promiseExec(`npm i ${pkgname ?? ''}@latest`)
            if (stderr) { // 发生错误
                return [false, stderr]
            }
            return [true, 'success']
        } catch (error) {
            return [false, error.stack]
        }
    },
    reloadPlugin: async function(plugin, BotConf, pkgpath, enable) {
        let _bot = plugin.bot
        if (pkgpath === undefined) {
            pkgpath = __dirname
        }
        if (enable === undefined) {
            enable = true
        }

        let disableStatus = await disablePlugin(_bot, BotConf, plugin, pkgpath)
        if (!(disableStatus === true)) {
            return [-1, disableStatus]
        }

        if (enable) {
            let enableStatus = await enablePlugin(_bot, BotConf, pkgpath)
            if (!(enableStatus === true)) {
                return [-2, enableStatus]
            }
        }

        return [0, 'success']
    }
}


const Updater = {
    check: async function() {
        let [status, errorOrlatestversion] = await updater.checker(name, version) // 检查更新
        if (status == 0) { // 是最新版本
            plugin.logger.debug(`${plugin.name} update: is latest version (this: ${plugin.version}, latest: ${errorOrlatestversion})`)
            config.config.updated.status = false
            return [0, '']
        } else if (status == -2) { // 检查更新错误
            plugin.logger.debug(`${plugin.name} update error↑↑↑`)
            config.config.updated.status = true
            config.config.updated.successed = -4
            config.config.updated.msg = errorOrlatestversion
            return [-1, errorOrlatestversion]
        }
        plugin.logger.debug(`get latestVersion: ${plugin.name} (latest: ${errorOrlatestversion})`)
        return [1, errorOrlatestversion] // 不是最新版本
    },

    update: async function(latersVersion) {
        plugin.logger.debug(`${plugin.name} try to update`)

        config.config.updated.status = true // 设置更新状态
        config.config.updated.latest = latersVersion // 设置最新版本
        tools.saveConfig(plugin, config, defaultConfig) // 保存配置
        let [reInstallStatus, msg] = await updater.reInstall(name) // 更新插件
        if (!reInstallStatus) { // 更新时安装插件失败
            plugin.logger.warn(`reInstall ${name} error: ${msg}`)
            config.config.updated.successed = -3
            config.config.updated.msg = msg !== null ? msg : reInstallError.stack
            tools.saveConfig(plugin, config, defaultConfig) // 保存配置
            return -2
        }

        let [reloadStatus, reloadMsg] = await updater.reloadPlugin(plugin, BotConf, dirname)
        if (!reloadStatus == 0) { // 重载失败
            plugin.logger.warn(`reload ${name} (dir=${dirname}) error: ${msg}`)
            config.config.updated.successed = reloadStatus
            config.config.updated.msg = reloadMsg
            tools.saveConfig(plugin, config, defaultConfig) // 保存配置
            return -3
        }

        // 更新成功
        config.config.updated.successed = 0
        config.config.updated.msg = ''
        tools.saveConfig(plugin, config, defaultConfig) // 保存配置
        return -3
    }
}

async function updatePlugin(event, _, plugin, lang) {
    let lastStatus = {}
    if (typeof config.config.updated == "object") {
        lastStatus = {...config.config.updated } // copy
    }
    if (event) {
        event.reply(tools.fromatString(lang.bkw2.updater.check, lang.header, undefined, plugin), true)
    }

    let status = 0
    let [versionStatus, latestVersion] = await Updater.check()

    if (versionStatus == 0) {
        if (event) {
            event.reply(tools.fromatString(lang.bkw2.updater.latest, lang.header, undefined, plugin))
        }
        return // 是最新版本

    } else if (versionStatus == 1) { // 有可用更新
        if (!event && lastStatus.successed == 0) { // 如果上次更新成功且当前不是手动更新
            plugin.bot.sendPrivateMsg(plugin.mainAdmin, tools.fromatString(lang.bkw2.updater.autotry, lang.header, latestVersion, plugin)) // 发送消息
        } else if (event) {
            event.reply(tools.fromatString(lang.bkw2.updater.try, lang.header, latestVersion, plugin))
        }
        status = await Updater.update(latestVersion) // 更新
    } else {
        status = -4 // 检查更新错误
    }

    if (status != -3) {
        let updateStatus = MounteFunctions.getUpdateStatus(config, lang, plugin.version, config.config.updated.latest)
        if (updateStatus) { // 如果上次更新了
            let errorMsg = tools.fromatString(updateStatus, lang.header, undefined, plugin)

            if (!event) { // 如果上次更新成功且当前不是手动更新
                if (lastStatus.successed == 0) {
                    plugin.bot.sendPrivateMsg(plugin.mainAdmin, errorMsg)
                } else {
                    plugin.logger.debug(`${plugin.name}: last update failed, will not send error message by auto update`)
                }
            } else {
                event.reply(errorMsg)

            }

            plugin.logger.warn(`${plugin.name}: update error (${plugin.version} => ${latestVersion})\n${errorMsg}`)
            config.config.updated.status = false
            tools.saveConfig(plugin, config, defaultConfig)
        }
    } else {
        plugin.logger.debug(`${plugin.name}: update successfully`)
    }
}


module.exports = { updater, Updater, updatePlugin }