// ==UserScript==
// @name         Swagger typescript helper
// @license      MIT
// @version      0.0.7
// @description  一个帮助用户在 Swagger UI 中快速生成对应 Typescript 接口的脚本 / A script that assists users in quickly generating corresponding TypeScript interfaces in Swagger UI.
// @author       Nauxscript
// @run-at       document-start
// @match        */swagger-ui/*
// @match        */*/swagger-ui/*
// @match        */*/*/swagger-ui/*
// @namespace    Nauxscript
// @require      https://cdn.bootcdn.net/ajax/libs/jquery/3.6.4/jquery.js
// ==/UserScript==

let apiDocsResponse

const hook_fetch = window.fetch // 储存原始fetch
window.unsafeWindow.fetch = async function (...args) { // 劫持fetch
  if (args[0].endsWith('/api-docs')) {
    return await hook_fetch(...args).then((oriRes) => {
      const hookRes = oriRes.clone() // 克隆原始response
      hookRes.text().then((res) => { // 读取克隆response
        try {
          res = JSON.parse(res)
          if (res?.components?.schemas && res?.paths) {
            apiDocsResponse = res
            // eslint-disable-next-line no-console
            console.log(apiDocsResponse)
            setTimeout(() => {
              // init()
            }, 200)
          }
          else {
            console.error('Have no dict')
          }
        }
        catch (error) {
          console.error(error)
        }
      })
      return oriRes // 返回原始response
    })
  }
  return hook_fetch(...args)
}
