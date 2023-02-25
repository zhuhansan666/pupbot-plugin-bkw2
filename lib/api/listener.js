const { plugin } = require('../static/constants')
const { tools } = require("../static/tools")

const listener = {
    find: function(jsonObj, keyword) {
        if (!(typeof jsonObj == 'object' && jsonObj instanceof Object)) {
            return false
        }
        for (let key in jsonObj) {
            let value = jsonObj[key]
            if (!value.extra) {
                value.extra = {}
            }
            if (value.extra.fuzzy) { // 模糊匹配
                if (keyword.includes(key)) {
                    return value.value
                }
            } else {
                if (key == keyword) {
                    return value.value
                }
            }
        }
    },
    send: function(event, msg, lang) {
        try {
            if (msg.length > 0) {
                event.reply(msg)
            } else {
                event.reply(tools.fromatString(lang.bkw2.emptymsg, lang.header, '', plugin))
            }
        } catch (error) {
            event.reply(tools.fromatString(lang.bkw2.emptymsg, lang.header, error.stack, plugin))
        }
    },
    privateMsg: function(event, parmas, plugin, config, lang) {
        let msg = event.toString()
        let value

        let privates = config.keywords.privates
        value = listener.find(privates, msg)
        if (value) {
            listener.send(event, value, lang)
            return
        }

        delete privates

        let global = config.keywords.global
        value = listener.find(global, msg)
        if (value) {
            listener.send(event, value, lang)
            return
        }

        delete global
    },
    groupMsg: function(event, parmas, plugin, config, lang) {
        let msg = event.toString()
        let value

        let locals = config.keywords.locals
        if (locals) {
            value = listener.find(locals[event.group_id], msg)
            if (value) {
                listener.send(event, value, lang)
                return
            }
        }

        delete locals

        let groups = config.keywords.groups
        value = listener.find(groups, msg)
        if (value) {
            listener.send(event, value, lang)
            return
        }

        delete groups

        let global = config.keywords.global
        value = listener.find(global, msg)
        if (value) {
            listener.send(event, value, lang)
            return
        }

        delete global
    },
    main: function(event, parmas, plugin, lang, config) {
        if (event.message_type == 'group') {
            listener.groupMsg(event, parmas, plugin, config, lang)
        } else {
            listener.privateMsg(event, parmas, plugin, config, lang)
        }
    }
}

module.exports = { listener }