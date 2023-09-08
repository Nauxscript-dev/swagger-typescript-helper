// ==UserScript==
// @name         Swagger typescript helper
// @license      MIT
// @version      0.0.1
// @description  一个帮助用户在 Swagger UI 中快速生成对应 Typescript 接口的脚本 / A script that assists users in quickly generating corresponding TypeScript interfaces in Swagger UI.
// @author       Nauxscript
// @run-at       document-start
// @match        */*/swagger-ui/*
// @namespace    Nauxscript
// @require      https://cdn.bootcdn.net/ajax/libs/jquery/3.6.4/jquery.js
// ==/UserScript==

(function () {
  'use strict';

  let apiDocsResponse

  let hook_fetch = window.fetch; //储存原始fetch
  window.unsafeWindow.fetch = async function (...args) { //劫持fetch
    if (args[0].endsWith('/api-docs')) {
      return await hook_fetch(...args).then((oriRes) => {
        let hookRes = oriRes.clone() //克隆原始response
        hookRes.text().then(res => { //读取克隆response
          try {
            res = JSON.parse(res)
            if (res?.components?.schemas && res?.paths) {
              apiDocsResponse = res
              console.log(apiDocsResponse)
              setTimeout(() => {
                init()
              }, 200)
            } else {
              console.error('Have no dict');
            }
          } catch (error) {
            console.error(error); 
          }
        })
        return oriRes //返回原始response
      })
    }
    return hook_fetch(...args)
  }

  $(document).on('click', '.opblock', function(event) {
    const container = event.currentTarget
    if ($(container).hasClass('is-open')) return 
    const pathEle = $(container).find('.opblock-summary-path').first()
    const methodEle = $(container).find('.opblock-summary-method').first()
    const path = $(pathEle).data('path')
    const method = $(methodEle).text()
    if (!path) return
    setTimeout(generateaBtns, 200, container, {
      path,
      method 
    })
  });

  $(document).on('click', '.gen-ts', function(event) {
    const btn = event.currentTarget
    console.log() 
    const path = $(btn).data('path')
    const method = $(btn).data('method')
    if (!path) {
      alert('Wrong path')
      console.error('wrong path');
      return
    }
    const response = apiDocsResponse.paths?.[path]?.[method.toLowerCase()]?.responses
    if (!response) {
      return console.error('No response model');
    }

    const {type, ref} = normalizeSchema(response['200']?.content?.['*/*']?.schema)
    
    if (!ref) {
      return console.error('No schemaRef');
    }
    const field = ref2field(ref)
    const schema = apiDocsResponse.components.schemas[field]
    console.log(schema) 
    const interfaceRaw = generateInterface(schema, 'HelloType', type) 
    console.log(interfaceRaw)
    const result = combineInterfaces(interfaceRaw)
    console.log(result)
  });

  function normalizeSchema(schemaRaw) {
    if (schemaRaw.$ref) {
      return {
        type: 'object',
        ref: schemaRaw.$ref
      }
    }

    if (schemaRaw?.type === 'array') {
      return {
        type: schemaRaw.type,
        ref: schemaRaw.items.$ref
      }
    }
    throw new Error('unexpected type', schemaRaw)
  }

  function init() {
    // generateaBtns(document)
  } 

  function generateaBtns(container, {
    path,
    method
  }) {
    const schemaItems = container.querySelectorAll('tr.response')
    console.log(schemaItems)
    schemaItems.forEach(item => {
      const copyBtn = createBtn(path, method)
      item.querySelector('a[data-name="model"]').parentNode.appendChild(copyBtn)
    })
  }

  function createBtn(path, method) {
    const copyBtn = document.createElement('button')
    copyBtn.classList.add('btn', 'gen-ts')
    copyBtn.dataset.path = path 
    copyBtn.dataset.method = method 
    copyBtn.innerText = '复制 TS Interface'
    return copyBtn
  }

  function generateInterface(json, name, currentType) {
    if (!json) return 'any'
    const dep = []
    let result = generateSarter(currentType, name)
    for (const key in json.properties) {
      const property = json.properties[key]
      let type = property.type;
      if (type === undefined) {
        // record
        const ref = property.$ref 
        console.log(type, ref)
        const innerTypeName = capitalizeFirstLetter(key) + 'Type'
        const schema = apiDocsResponse.components.schemas[ref2field(ref)]
        const data = generateInterface(schema, innerTypeName, 'object')
        dep.push(data.result,...data.dep)
        type = innerTypeName; // 或者你可以递归地生成嵌套的接口
      } else if (type === 'array') {
        const ref = property.items?.$ref
        console.log(type, ref)
        const innerTypeName = capitalizeFirstLetter(key) + 'Row'
        const schema = apiDocsResponse.components.schemas[ref2field(ref)]
        const data = generateInterface(schema, innerTypeName, 'object')
        dep.push(data.result, ...data.dep) 
        type = `${innerTypeName}[]`; // 或者你可以根据 'items' 属性生成具体的类型
      }
      result += `  ${key}: ${type};\n`;
    }
    if (currentType === 'object') {
      result += '}\n'
    } else {
      result += '[]'
    }
    return {result, dep};
  }

  function combineInterfaces(raw) {
    const depStr = raw.dep.reduce((prev, curr) => {
      prev += curr
      return prev
    }, '')
    return raw.result + depStr
  }

  function ref2field(ref) {
    return ref.replace('#/components/schemas/', '')   
  }

  function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  function generateSarter(type, name) {
    if (type === 'object') {
      return `interface ${name} {\n`;
    }

    if (type === 'array') {
      return `type ${name} = `
    }
  }

})()