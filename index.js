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

  function setupContainer(container) {
    const pathEle = $(container).find('.opblock-summary-path').first()
    const methodEle = $(container).find('.opblock-summary-method').first()
    const path = $(pathEle).data('path')
    const method = $(methodEle).text()
    if (!path) return
    setTimeout(generateaBtns, 200, container, {
      path,
      method 
    })
  }

  $(document).on('click', '.opblock', function(event) {
    const container = event.currentTarget
    if ($(container).hasClass('is-open')) return 
    setupContainer(container) 
  });

  $(document).on('click', '.gen-ts', function(event) {
    const btn = event.currentTarget
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

  $(document).on('click', '.ts-tab', function(event) {
    const btn = event.currentTarget
    const container = $(btn).closest('.model-example')
    const codeContainer = $(container).children().last()
    if ($(btn).hasClass('show')) {
      $(container).children('.ts-container').hide()
      $(btn).removeClass('show')
    } else {
      $(btn).addClass('show')
      if ($(container).has('.ts-container').length) {
        $(container).children('.ts-container').show()
      } else {
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

        const { type, ref } = normalizeSchema(response['200']?.content?.['*/*']?.schema)

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
        if (!container) {
          return console.error('no container');
        }

        const tsContainer = $(`
          <div class="ts-container" style="margin-bottom: 5px">
            <div class="highlight-code">
              <pre class="example microlight" style="display: block; overflow-x: auto; padding: 0.5em; background: rgb(51, 51, 51); color: white;">
                <code style="white-space: pre;">
                  ${result}
                </code>
              </pre>
            </div>
          </div>
        `)

        $(codeContainer).before(tsContainer)
      }
    }
  })

  

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
    $('.opblock.is-open').each(function(){
      setupContainer(this)
    })
  } 

  function generateaBtns(container, {
    path,
    method
  }) {
    const schemaItems = container.querySelectorAll('tr.response')
    console.log(schemaItems)
    schemaItems.forEach(item => {
      const tabBtn = createTab(path, method)
      item.querySelector('.tab').appendChild(tabBtn)
    })
  }

  function createTab(path, method) {
    const tabBtn = document.createElement('li')
    tabBtn.classList.add('tabitem', 'ts-tab')
    tabBtn.dataset.path = path 
    tabBtn.dataset.method = method 
    tabBtn.style.borderLeft = '1px solid rgba(0,0,0,.2)';
    tabBtn.style.paddingLeft = '6px';
    const innerALabel = document.createElement('a')
    innerALabel.innerText = 'TS Interface'
    tabBtn.append(innerALabel)
    return tabBtn
  }

  function generateInterface(json, name, currentType) {
    if (!json) return 'any'
    const dep = []
    let result = generateSarter(currentType, name)
    for (const key in json.properties) {
      const property = json.properties[key]
      let type = property.type;
      if (type === undefined) {
        // object 
        const ref = property.$ref 
        console.log(type, ref)
        const innerTypeName = capitalizeFirstLetter(key) + 'Type'
        const schema = apiDocsResponse.components.schemas[ref2field(ref)]
        const data = generateInterface(schema, innerTypeName, 'object')
        dep.push(data.result,...data.dep)
        type = innerTypeName; 
      } else if (type === 'array') {
        const ref = property.items?.$ref
        console.log(type, ref)
        const innerTypeName = capitalizeFirstLetter(key) + 'Row'
        const schema = apiDocsResponse.components.schemas[ref2field(ref)]
        const data = generateInterface(schema, innerTypeName, 'object')
        dep.push(data.result, ...data.dep) 
        type = `${innerTypeName}[]`;
      } else if (type === 'integer') {
        type = 'number'
      } else if (type === 'string' && property.enum) {
        type = name + capitalizeFirstLetter(key)
        dep.push(generateEnum(type, property.enum))
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
      return `\ninterface ${name} {\n`;
    }

    if (type === 'array') {
      return `\ntype ${name} = `
    }

    if (type === 'enum') {
      return `\nenum ${name} = `
    }
  }

  /**
   * @author: tzx
   * @description: 
   * @param { string } name 
   * @param { Array<string> } enums
   */
  function generateEnum(name, enums = []) {
    if (!enums.length || !name)
      return ''
    return generateSarter('enum', name) + enums.map(s => `'${s}'`).join(' | ') + '\n'
  }

})()