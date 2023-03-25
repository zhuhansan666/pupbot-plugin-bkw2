## 更好的关键词回复-2 | pupbot-plugin-bkw2 / kivibot-plugin-bkw2 / keli-bkw2
## 用于自定义关键字并回复

> 当前仍为公测版本
> 推荐使用较为成熟的 [pupbot-better-keywords-rebuild](https://github.com/zhuhansan666/pupbot-plugin-better-keywords-rebuild) / [kivibot-better-keywords-rebuild](https://github.com/zhuhansan666/kivibot-plugin-better-keywords-rebuild)
> 发生bug请发在交流群或私信qq=3088420339

[![npm-version](https://img.shields.io/npm/v/pupbot-plugin-bkw2?color=527dec&label=pupbot-plugin-bkw2&style=flat-square)](https://npm.im/pupbot-plugin-bkw2) [![dm](https://shields.io/npm/dm/pupbot-plugin-bkw2?style=flat-square)](https://npm.im/pupbot-plugin-bkw2)
交流反馈群: <a target="_blank" href="https://qm.qq.com/cgi-bin/qm/qr?k=kYuPTlWnpv2JYpH_7PX_7Gct5A-CaLak&jump_from=webapi&authKey=xHpTweFarFYr878W2gFyyuWGoySD9eRacy150RDk8SOwJHaV6jXUYbcQ8UucDmTv">点击加入</a> 或者 群号: `652833880`

## 安装
```
/plugin add bkw2
```

## 启用
```
/plugin on bkw2
```

## 指令
> 帮助见 `/bkw2` 或 `/bkw2 help`

## 兼容性提示
> 现已支持 `kivibot`、`keli`和 `pupbot`, 但本插件仅在 `pupbot` 进行测试, 不保证完全兼容其他框架!
* 本插件与 better-keywords 和 better-keywords-rebuid 默认指令几乎相同 ~~(前面那俩插件都是我写的)~~, 为避免混淆, 建议卸载或禁用后再使用本插件

## [HttpApi文档](./docs/serverApi.md)

## 配置文件详解
> 如下为默认配置, 默认配置子项被删除后会自动添加
> 注释内容仅供说明, 生产环境配置文件不应也不能含有注释
```
{
    keywords: {
        locals: {}, // 群聊单独配置项
        groups: {}, // 全局群聊配置项
        privates: {}, // 全局私聊配置项
        global: {} // 全局配置项
    },
    config: {
        updated: { status: false, successed: -10, msg: '' }, // *该项请不要手动修改 上次更新的详情, 用于提示用户是否更新成功
        lang: 'zh-cn', // 语言
        server: { // httpapi服务器配置(不支持热加载)
            host: "0.0.0.0", // api网址
            port: 7070 // api端口
        }
    },
    commands: { // permission(权限): mainadmin/仅主管理员, admins/所有机器人管理员, members/任意用户; value: [<指令触发词0>, <指令触发词1>, ...]
        bkw2: { permission: 'admins', value: ['/bkw', '/bkw2'] },
    }
}
```


## 已知异常但未修复的问题
* *已修复* ~~当关键词为非文本(如@,图片,表情等)开头时, 回复内容会包含关键词~~
* *无法/较难修复* 受框架影响, 如果插件重载失败可能导致多个插件同时运行但是较老的插件的'plugin'对象为'undefined'导致控制台显示报错, 忽略即可

## 已修复的问题 / 已修复的不合理设定
* [详见更新日志](./lib/changes/changes.js)
* 当关键词为非文本(如@,图片,表情等)开头时, 回复内容会包含关键词

## 大版本看点
* 0.0.1 => 首个可用版本
* 0.1.7 => 修复问题: 当关键词为非文本(如@,图片,表情等)开头时, 回复内容会包含关键词

## issue / bug 反馈
您可以直接在 我的Github [For Pupbot](https://github.com/zhuhansan666/pupbot-plugin-bkw2) / [For Kivibot](https://github.com/zhuhansan666/kivibot-plugin-bkw2) / [For Keli](https://github.com/zhuhansan666/keli-bkw2) 提出issue
> 但是我不常看 Github, 推荐加QQ `3088420339` 发送 
