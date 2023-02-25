## HttpApi开发文档

> 关键字寻找方式
> 私聊: 全部私聊关键字 -> 全局关键字 -> 找不到退出
> 群聊: 当前群聊关键字 -> 全部群关键字 -> 全局关键字 -> 找不到退出

### 开发须知:
* 如需用到本插件的HttpApi作为依赖项请在`package.json`加入
    ```
    "dependencies": {
        "pupbot-plugin-bkw2": "latest" // 对kivibot进行兼容性支持, 无论是pupbot-还是kivibot-均支持两个框架
    }
    ```
* 如果您担心bkw2没有启用, 可以在您插件先引入`path`库, 然后头部写入
    `const { enablePlugin, PupConf, NodeModulesDir } = require('@pupbot/core')`
    (Kivibot `const { enablePlugin, KiviConf, NodeModulesDir } = require('@kivibot/core')`)
    再在`plugin.onMounted`的回调函数中加上
    `enablePlugin(plugin.bot, PupConf 或 KiviConf, path.join(NodeModulesDir, 'pupbot-plugin-bkw2'))`

### ● 服务器运行地址
* 位于配置文件.config
* 如下为默认配置
  ```
    server: { // httpapi服务器配置(不支持热加载)
                host: "0.0.0.0", // api网址
                port: 7070 // api端口
            }
  ```

### 获取服务器运行状态
* 路径: `/`
* 参数: 无
* 返回值 
  ```
  {code: 状态码, msg: 信息, data: {}}
  ```

### 添加关键词
* 路径: `/api/add`
* 参数:
    > 注：下列类型仅提供格式, 传入时需转为字符串进行传参.
    ```
    key -> 关键字(字符串)
    value -> 回复内容, oicq支持的格式(数组)
    per -> 权限组(字符串)
    gid -> 群号(可选, 在包含当前群聊时必选)(字符串或数字)
    type -> 类型, 'oicq' / 'js', 暂不支持'js'(可选, 字符串)
    extra -> 附加属性, json格式的Object(可选, 默认{})
    ```
* 返回值: 
    ```
    {code： 状态码, msg: 信息, data: {key: 关键字, value: 回复内容, per: 权限组}}
    ```

## 删除关键字
* 路径: `/api/rm`
* 参数:
    > 注：下列类型仅提供格式, 传入时需转为字符串进行传参.
    ```
    key -> 关键字(字符串)
    per -> 权限组(字符串)
    gid -> 群号(可选, 在包含当前群聊时必选)(字符串或数字)
    ```
* 返回值: 
    ```
    {code： 状态码, msg: 信息, data: {key: 关键字, per: 权限组}}
    ```

## 返回所有键值对
* 路径: `/api/each`
* 参数: 无
* 返回值: 
    ```
    {code: 200, msg: 'success', data: config文件的keywords子键}
    // config文件的keywords子键 -> {
        "locals": { // 群聊单独配置项(当前群聊的关键字)
            群号(字符串或数字, 会自动转成字符串): {
                关键字(字符串): 回复内容(数组)
            }
        }, 
        "groups": { // 全局群聊配置项
            关键字(字符串): 回复内容(数组)
        },
        "privates": { // 全局私聊配置项
            关键字(字符串): 回复内容(数组)
        },
        "global": { // 全局配置项(群聊和私聊均可触发)
            关键字(字符串): 回复内容(数组)
        }
    }
    // 以上内容的回复内容均为oicq标准的信息, 应当来自 event.message
    ```
