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
              // eslint-disable-next-line no-alert
              alert('123')
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
