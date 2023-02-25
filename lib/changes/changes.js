const changes = {
    "0.0.1": `首个可用版本`,
    "0.0.2": `新增权限组提示`,
    "0.0.3": `修复更新信息重复提示问题`,
    "0.0.4": `修复已知问题`,
    "0.0.5": `对HttpApi进行支持`,
    "0.1.0": `修复更新成功但是显示'更新插件发生未知错误'的问题`,
    "0.1.1": `新增命令不正确提示`,
    "0.1.2": `新增空消息判断`,
    "0.1.3": `修复 'Cannot find module 'date-and-time'`,
    "0.1.4": `对 keli 框架进行支持`,
    "0.1.5": `修复 〓 bkw2 启用失败 〓\nunknown bot: undefined 的问题`,
    "0.1.6": `修复问题 '发送失败: 空消息 (}'`,
    "0.1.7": `修复问题 当关键词为非文本(如@,图片,表情等)开头时, 回复内容会包含关键词\n更新、修改languages使得更加符合阅读习惯`,
    "0.1.8": `1. 修复 HttpApi异常无法捕获 的问题
2. 修复 指令仅含有数字字符导致 'TypeError: command.toLowerCase is not a function' 的问题
3. 修复 'TypeError: Cannot read properties of undefined (reading 'type')'
4. 修复 因字符串中不含有 ({[a-z]{1,}:[a-zA-Z0-9]{1,}}) 此正则表达式字符导致返回值为 null 不可使用 ... 的问题 ('TypeError: matchingArr is not iterable')
5. 更新、优化 HttpApi 服务器启动、关闭、错误提示 和 日志信息
6. 更新版本号和changes/changes.js (this`,
    "0.1.9": `1. 更新、优化 语言文件
2. 新增 插件自动更新提示
3. 新增 显示当前版本更新信息
4. 划掉[修复 因框架问题, 导致'plugin.admins'和'plugin.mainAdmin'不会热更新 的问题] 受框架限制, 无法完成此修复
5. 修复并更新 检查更新提示
6. 更新版本号和changes/changes.js (this`,
    "0.1.10": `1. 修复 显示当前版本更新信息 成功时显示 '〓 bkw2 〓\n.' 的问题`,
    "0.1.11": `1. 修复 检查更新错误 'ReferenceError: errorOrlatestversion is not defined'
2. 修复各项 检查更新问题, 改进 检查更新机制
3. 新增了一些微软式中文 (bushi
4. 修复奇奇怪怪的bug若干
注意: 已知问题: 受框架影响, 如果插件重载失败可能导致多个插件同时运行但是较老的插件的'plugin'对象为'undefined'导致控制台显示报错, 忽略即可`,
    "0.1.12": `1. 修复&更改特性 会将单个或多个空字符替换为单个空格 的问题
2. 修复特性 (qq限制)将 \\ 替换为 \\\\ 的问题(注: 受nodejs和本人能力限制, 目前仅支持如下转义字符: \\\\, \\a, \\b, \\f, \\n, \\r, \\t, \\0)
3. 新增了 一些?很多! 微软式中文`,
    "0.1.13": `1. 修复 更新成功但是显示'更新插件发生未知错误'的问题
2. 新增 '/bkw2 readme'、'/bkw2 markdown' 命令, 详见 '/bkw2 help'
注意: 本次改动较大, 可能导致出现bug, 如有, 请QQ群聊反馈 652833880`,
    "0.1.14": `修复重大bug:
    puppeteer安装失败导致无法更新后后台一直尝试最终机器人运行速度变慢`
}

module.exports = { changes }