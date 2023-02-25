const { keywordsMgr } = require('../mgr/mgr')
const { tools } = require('../static/tools')
const { supportPermissions, plugin, config, defaultConfig, BotConf, imgsPath, segment, updateMdImg } = require('../static/constants')
const { updatePlugin, updater } = require('../static/updater')
const { changes } = require('../changes/changes')
const { dirname } = require('../../dirname')

const fs = require('fs')
const path = require('path')

const msgTool = {
    getMsgWithOutString: function(string, msgArray) {
        /**
         * 去除msgArray在string中存在的项
         * @returns 找到的项的toString()字符串 (Array[sting])
         */
        let matchingArr = string.match(new RegExp('({[a-z]{1,}:[a-zA-Z0-9]{1,}})', 'g'))
        let _matchingArray = matchingArr ? [...matchingArr] : [] // copy
        for (let index in msgArray) {
            let item = msgArray[index]
            for (let _i in matchingArr) {
                if (item.type == 'image') {
                    let _ta = item.url.split('-')
                    let md5 = _ta[_ta.length - 1].split('/')[0]
                    md5 = md5 ? md5 : "" // url中的md5值
                    let imageMd5 = matchingArr[_i].slice(7).slice(0, -1) // 图片的md5值
                    imageMd5 = imageMd5 ? imageMd5 : ''

                    if (md5.includes(imageMd5)) { // 如果md5在url中
                        console.log(item.file)
                        matchingArr.splice(_i, 1) // 在matchingArr移除已删除项
                        msgArray.splice(index, 1) // 在msgArray移除项
                        break // 跳出本层循环
                    }
                }
            }
        }
        msgArray.splice(0, matchingArr ? matchingArr.length : 0)
        return _matchingArray
    },
    replaceAir: function(string) {
        /**
         * 替换空白字符为单个空格
         */
        return string.replaceAll(/' '+/g, ' ') // 替换空白字符为单个空格
    },
    reverseEscape: function(msgarray) {
        let supportEscapes = {
            '\\\\': '\\',
            '\\a': '\a',
            '\\b': '\b',
            '\\f': '\f',
            '\\n': '\n',
            '\\r': '\r',
            '\\t': '\t',
            '\\0': '\0',
        }

        for (let index in msgarray) {
            let item = msgarray[index]
            if (item.type == 'text') {
                // item.text = item.text.split('\\\\').join('\\')
                for (let key in supportEscapes) {
                    let value = supportEscapes[key]
                    item.text = item.text.replaceAll(key, value)
                }
            }
        }
    }
}

const bkw2 = {
    add: function(event, parmas, plugin, lang) {
        let eventStr = msgTool.replaceAir(event.toString())
        let commandIndex = eventStr.split(' ').slice(0, 4).join(' ').length
            // console.log(eventStr, eventStr.split(' ').slice(0, 3))

        let [_, permission, keyname] = parmas

        if (!keyname || !permission) { // 缺少参数
            return [false, lang.bkw2.add.missargv]
        }
        permission = permission.toString()
        keyname = keyname.toString()

        let msgArr = event.message
        if (msgArr[0] && msgArr[0].type == 'text') {
            msgArr[0].text = msgTool.replaceAir(msgArr[0].text)
            msgArr[0].text = msgArr[0].text.slice(commandIndex) // 去掉命令在msgArr第一个text的部分
            if (msgArr[0].text.trim().length <= 0) {
                msgArr.splice(0, 1)
            } else {
                msgArr[0].text = msgArr[0].text.trim()
            }
        }
        msgTool.getMsgWithOutString(keyname, msgArr) // 去除msgArray在string中存在的项

        // TODO: 这么做会导致-*的参数(如-f)显示在回复内容中, 记得修
        // 修好了↓👇
        tools.rmOption(msgArr) // 替换<空格>+/-a-zA-Z为<空格>
        msgTool.reverseEscape(msgArr)

        if (msgArr.length <= 0) {
            return [false, lang.bkw2.add.missinfo]
        }

        let [stauts, msg] = keywordsMgr.add(keyname.toString(), permission, msgArr, event.group_id, 'oicq', { fuzzy: parmas.includes('+f') })
        let permissionsLocal = keywordsMgr.getPermissons(permission, lang.bkw2.permissons)
        if (stauts != 0) { // 添加失败
            return [
                [0, -2, -3].includes(stauts), tools.fromatString(lang.bkw2.adderrors[stauts], undefined, msg)
            ]
        } else { // 添加成功
            return [true, tools.fromatString(lang.bkw2.add.successed, undefined, [keyname, permissionsLocal.join(', ')])]
        }
    },

    remove: function(event, parmas, plugin, lang) {
        let [_, permission, keyname] = parmas
        if (!keyname || !permission) { // 缺少参数
            return [false, lang.bkw2.rm.missargv]
        }

        let [stauts, msg] = keywordsMgr.rm(keyname.toString(), permission, event.group_id)
        let permissionsLocal = keywordsMgr.getPermissons(permission, lang.bkw2.permissons)
        if (stauts != 0) { // 删除失败
            return [
                [0, -2, -3].includes(stauts), tools.fromatString(lang.bkw2.rmerrors[stauts], undefined, msg)
            ]
        } else { // 删除成功
            return [true, tools.fromatString(lang.bkw2.rm.successed, undefined, [keyname, permissionsLocal.join(', ')])]
        }
    },

    reload: async function(event, parmas, plugin, lang) {
        let [reloadStatus, reloadMsg] = await updater.reloadPlugin(plugin, BotConf, dirname)
        if (!reloadStatus == 0) { // 重载失败
            let msg = lang.bkw2.updater.failed[reloadStatus]
            return [false, tools.fromatString(msg, undefined, reloadMsg, plugin)]
        }
        return [true, tools.fromatString(lang.bkw2.plugin.reloadsuccess, undefined, undefined, plugin)]
    },

    updateInfo: function(event, parmas, plugin, lang) {
        let updateinfo = changes[plugin.version]
        if (updateinfo) {
            return [true, tools.fromatString(lang.bkw2.updater.changes, undefined, updateinfo, plugin)]
        } else {
            return [false, tools.fromatString(lang.bkw2.updater.changes, undefined, ' - ', plugin)] // 默认返回 - 
        }
    },

    markdown: async function(event, parmas, plugin, lang) {
        await updateMdImg()
        let filename = parmas[1].toString()

        if (filename.slice(-3).toLowerCase() == '.md') {
            filename = filename.slice(0, -3)
        }

        let absfilename = path.join(imgsPath, `${filename}.png`)
        if (!fs.existsSync(absfilename) || !fs.statSync(absfilename).isFile()) {
            return tools.fromatString(lang.bkw2.md.unknownfile, undefined, filename, plugin)
        } else {
            event.reply([tools.fromatString(lang.header, undefined, undefined, plugin), '\n', segment.image(absfilename)])
        }
    }
}

const commands = {
    report: async function(event, senderId, funcname, error, lang) {
        console.log(error.stack)
        let msg = tools.fromatString(lang.report, lang.header, [funcname, error.stack])
        plugin.bot.sendPrivateMsg(plugin.mainAdmin, msg)
        plugin.logger.error(msg)
    },
    bkw2: async function(event, parmas, plugin, lang) {
        let [statusCode, hasP] = tools.hasPermisson(event.sender, config.commands.bkw2.permission, plugin)
        if (statusCode == -1) { // 未知的权限组
            config.commands.bkw2.permission = supportPermissions[0]
            tools.saveConfig(plugin, config, defaultConfig)
        }
        if (!hasP) { // 没有权限
            plugin.logger.info(`${event.sender.user_id} has not permission to use ${event.toString()} (from ${ event.group_id ? 'group-'+event.group_id: 'private-'+event.sender.user_id} )`)
            return
        }

        command = parmas[0]
        if (!command) { // 参数为空 
            return tools.fromatString(lang.bkw2.help, lang.header)
        }

        command = command.toString().toLowerCase()
        if (command == 'h' || command == 'help') { // 帮助
            return tools.fromatString(lang.bkw2.help, lang.header)
        } else if (command == 'add' || command == 'a') { // 添加
            let [status, msg] = await bkw2.add(event, parmas, plugin, lang)
            if (!status) {
                plugin.logger.warn(`bad to call bkw2 add:\n${msg}`)
            }
            return tools.fromatString(msg, lang.header)

        } else if (command == 'r' || command == 'rm' || command == 'remove') { // 删除
            let [status, msg] = await bkw2.remove(event, parmas, plugin, lang)
            if (!status) {
                plugin.logger.warn(`bad to call bkw2 rm:\n${msg}`)
            }
            return tools.fromatString(msg, lang.header)

        } else if (command == 'u' || command == 'up' || command == 'update') { // 更新
            updatePlugin(event, [], plugin, lang)
            return
        } else if (command == 'reload' || command == 'rl' || command == 'r') { // 重载
            let [status, msg] = await bkw2.reload(event, parmas, plugin, lang)
            if (!status) {
                plugin.logger.warn(`bad to call bkw2 reload:\n${msg}`)
            }
            return tools.fromatString(msg, lang.header)
        } else if (command == 'info' || command == 'i') { // 显示更新内容
            let [status, msg] = await bkw2.updateInfo(event, parmas, plugin, lang)
            if (!status) {
                plugin.logger.warn(`bad to call bkw2 updateInfo:\n${msg}`)
            }
            return tools.fromatString(msg, lang.header)
        } else if (command == 'markdown' || command == 'md') {
            let msg = await bkw2.markdown(event, parmas, plugin, lang)
            if (msg) {
                return tools.fromatString(msg, lang.header, undefined, plugin)
            }
        } else if (command == 'readme') {
            bkw2.markdown(event, [undefined, 'readme'], plugin, lang)
        } else if (command == 'about') { // 关于
            return tools.fromatString(lang.about, lang.header)
        } else {
            return tools.fromatString(lang.bkw2.unknowncmd, lang.header, event.raw_message, plugin)
        }
    }
}

module.exports = { commands }