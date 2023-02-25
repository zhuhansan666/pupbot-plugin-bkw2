const languages = {
    'zh-cn': {
        name: ['简中', '简体中文', 'Chinese', 'chinese'],
        header: '〓 {pn} 〓',
        report: ':(\n我们遇到了一些问题\n在 {0} 函数内发生没有预料的错误:\n{1}',
        mounted: `与君初相识，犹如故人归。别来无恙啊!
欢迎您使用 {pn} ({pv})
使用 /bkw2 lang set <语言名称> 以设置语言 (暂不支持哦
您与{0}人一同选择了{pn}!{1}`.trim(),
        // `为避免插件重载时出现问题, 请不要使用/plugin reload <插件名称>, 如需重载请使用/bkw2 reload
        // 否则可能会导致有多个{pn}同时运行, 给您带来不便, 敬请谅解!{1}`.trim(),
        about: `感谢您使用 {pn}
当前版本: {pv}
作者: 爱喝牛奶
作者B站: https://space.bilibili.com/687039517?spm_id_from=333.788.0.0
关于插件配置文件详情, 请参阅 https://npmjs.com/package/pupbot-plugin-bkw2
(不同机器人的readme是一样的捏)
开源链接:
    github:
        pupbot: https://github.com/zhuhansan666/pupbot-plugin-bkw2
        kivibot: https://github.com/zhuhansan666/kivibot-plugin-bkw2
        keli: https://github.com/zhuhansan666/keli-bkw2
    npm:
        pupbot: https://npmjs.com/package/pupbot-plugin-bkw2
        kivibot: https://npmjs.com/package/kivibot-plugin-bkw2
        keli: https://npmjs.com/package/keli-bkw2`.trim(),
        bkw2: {
            help: `帮助: 要仔细看哦!
    ● {pn} 现已支持HttpApi! 获取使用方法, 请键入 /bkw2 markdown serverApi
    
    ● <>代表此参数必选, []代表此参数可选, 带引号的参数名称代表键入此内容, 键入时无需带上<>, []等符号
    ● /bkw2 help(或h) -> 显示本帮助信息
    ● /bkw2 readme -> 显示readme内容

    ● /bkw2 add <权限组> <名称> <内容/特殊参数> -> 添加关键词 (特殊参数: +f开启模糊匹配, 不出现+f关闭模糊匹配)
    ● /bkw2 rm <权限组> <名称> -> 删除关键词
    ● <权限组> 合法内容: l -> 当前群聊, g -> 所有群聊, p -> 所有私聊, a -> 全局.

    ● /bkw2 reload(或rl) -> 重载插件
    ● /bkw2 about -> 显示关于信息
    ● /bkw2 update(或up) -> 手动检查更新
    ● /bkw2update 或 /bkw2up -> 手动检查更新
    ● /bkw2 info(或i) -> 显示当前版本更新内容

    ● /bkw2 markdown <文件名称(不能包含后缀名)> -> 查看指定markdown文件的内容(图片)`.trim(),
            // `● /bkw2 config <名称> -> 配置 {pn}:
            // ● /bkw2 config lang <'set <语言名称>' -> 设置语言 | 'list' -> 显示支持的语言 > -> 语言配置
            // ● /bkw2 config cmd <命令名> <权限: ['mainadmin' -> 仅限主管理员, 'admins' -> 所有机器人管理员, 'members' -> 任何成员, 'false' -> 禁用]> -> 设置命令权限
            // ● /bkw2 config server [地址] [端口] -> 设置/获取HttpApi地址和端口(地址&端口均为空时返回服务器地址)
            // `.trim(),
            unknowncmd: '糟糕! 未知的命令 {0}, 键入/bkw2 help以获取帮助',
            emptymsg: '糟糕! 发送失败: 空消息 {0}',
            add: {
                missargv: '糟糕, 添加失败! 缺少 <权限组> 或 <名称>',
                missinfo: '糟糕, 添加失败! 缺少 <内容>',
                successed: '恭喜您! 添加成功, 名称: {0}, 权限: {1}'
            },
            rm: {
                missargv: '糟糕, 删除失败! 缺少 <权限组> 或 <名称>',
                successed: '恭喜您! 删除成功, 名称: {0}, 权限: {1}'
            },
            adderrors: {
                '-1': '糟糕! 添加失败: 未知的权限组: {0}',
                '-2': '糟糕! 添加成功部分内容但发生问题: 未知的权限组: {0}',
                '-3': '糟糕! 添加失败: 无法在私聊添加/修改当前群聊项'
            },
            rmerrors: {
                '-1': '糟糕! 删除失败: 未知的权限组: {0}',
                '-2': '糟糕! 删除部分成功但发生问题: 未知的权限组: {0}',
                '-3': '糟糕! 删除失败: 无法在私聊删除当前群聊项'
            },
            permissons: {
                l: '当前群聊',
                g: '所有群聊',
                p: '所有私聊',
                a: '全局'
            },
            updater: {
                check: '东市买骏马，西市买鞍鞯，南市买辔头，北市买长鞭。\n正在为您检查更新...\n这可能需要几秒钟, 请坐和放宽。',
                autotry: '海内存知己, 天涯若比邻。\n监测到最新版本: {0}\n正在为您自动更新更新 {pn} ({pv} => {0})\n请不要关闭计算机或框架 或 重载插件\n提示: 更新耗时较长, 请坐和放宽~',
                try: '海内存知己, 天涯若比邻。\n获取到最新版本: {0}, 正在更新 {pn} ({pv} => {0})\n请不要关闭计算机和框架 或 重载插件\n提示: 更新耗时较长, 请坐和放宽~',
                success: '休对故人思故国，且将新火试新茶。\n您已经成为了最新的, 敬请开始吧!\n插件更新成功, 当前版本: {pv}\n更新内容:\n{0}',
                changes: '千门万户曈曈日，总把新桃换旧符。\n当前版本: {pv}\n更新内容:\n{0}',
                latest: '您是最新的!\n当前已为最新版本: {pv}\n',
                failed: {
                    '-1': ':(\n我们遇到了一些问题\n重载插件禁用插件错误: {0}',
                    '-2': ':(\n我们遇到了一些问题\n重载插件启用插件错误: {0}',
                    '-3': ':(\n我们遇到了一些问题\n安装插件失败: {0}',
                    '-4': ':(\n我们遇到了一些问题\n请求最新版本号错误: {0}',
                    '-10': '',
                    unknown: '意想不到的事情发生了!\n因未预期的原因导致更新错误{0}',
                    notlatest: ':(\n我们遇到了一些问题\n插件版本于最新版本不符',
                }
            },
            plugin: {
                reloadsuccess: '恭喜您! 插件重载成功!',
                serverstartfailed: '我们遇到了一些问题, HttpApi服务器启动失败: {0}',
                serverstartsuccess: '不错, 您现在很好! HttpApi服务器启动成功: {0}'
            },
            md: {
                unknownfile: `糟糕! 未知的文件: {0}`
            },
            command: {
                unknown: '糟糕! 未知的命令: {0}'
            }
        }
    },
    // 'zh-tw': {
    //     name: ['繁中', '繁體中文', 'Chinese (Traditional)', 'chinese (traditional)'],
    //     header: '〓 {pn} 〓',
    //     bkw2: {
    //         help: `
    //         `.trim()
    //     }
    // }
}

module.exports = { languages }