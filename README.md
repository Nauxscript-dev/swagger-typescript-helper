# Swagger typescript helper

一个帮助用户在 Swagger 页面中生成接口出入参 Typescript 类型的油猴脚本。
A userscript that helps generate TypeScript types for API input and output parameters on Swagger pages.

有条件还是早日用 [ApiFox](https://apifox.com) 吧 T-T...
~~Fuxk that! Just use [ApiFox](https://apifox.com) my friends!~~

## Install

Note: Please install the [**Tampermonkey**](https://www.tampermonkey.net/) before installing this script. The Tampermonkey plugin can be downloaded from the Chrome Web Store (requires proxy) or the [Tampermonkey official website](https://www.tampermonkey.net/). 

There are two ways to install this script:  

1. Install through [Greasy Fork](https://greasyfork.org/zh-CN/scripts/474959-swagger-typescript-helper) for easier updates in the future (recommended); 
2. Create a new script in the Tampermonkey plugin, copy the contents of [this script](./index.js), save and enable it.

⚠️注意：安装该脚本前请先安装[**篡改猴（即油猴）**](https://www.tampermonkey.net/)插件，该插件可通过 chrome 插件商店（需代理）或 [篡改猴官网](https://www.tampermonkey.net/)下载。

安装本脚本有以下两种方法：

1. 通过 [Greasy Fork](https://greasyfork.org/zh-CN/scripts/474959-swagger-typescript-helper) 安装，后续更新更方便（推荐）；
2. 在篡改猴插件中新建脚本，把 [该脚本内容](./index.js) 复制进去，保存，启用。

## Setup

Currently, this script will be launched on all pages whose domain name addresses contain `swagger-ui`. If your Swagger address does not comply with this rule, please add corresponding domain name matching rules in the `User Matching` setting of the script.

目前会在所有域名地址包含 `swagger-ui` 的页面中启动改脚本；若你的 Swagger 地址不符合该规则，请在脚本设置的 `用户匹配` 中添加对应域名匹配规则。

## Usage

### 快捷键及页面按扭

To display the corresponding types, click on the buttons labeled `TS Interface`, `Parameters Interface`, etc. on the page.

点击页面中的 `TS Interface` `Parameters Interface` 等字样的按钮即可显示对应的类型。
