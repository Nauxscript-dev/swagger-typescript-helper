export function getSchemaByRef(ref, schemaData) {
  if (!ref || typeof ref !== 'string')
    return undefined
  const keys = ref.split('/')
  let r = schemaData
  for (const key of keys) {
    if (r[key])
      r = r[key]
  }
  return r === schemaData ? undefined : r
}

export function generateFnHelper(type) {
  if (type === 'object')
    return generateObjectType

  if (type === 'array')
    return generateArrayType

  return generateBasicType
}

//
export function generateBasicType(propertyRaw) {
  const { type } = propertyRaw
  let typeName = type
  if (type === 'integer')
    typeName = 'number'

  return {
    typeName,
    deps: [],
  }
}

export function generateObjectType(propertyRaw, key, schemaData = apiDocsResponse) {
  const { $ref } = propertyRaw
  const schema = getSchemaByRef($ref, schemaData)

  if (!schema || !schema.properties)
    throw new Error('generateObjectType inner error')

  let typeValue = ''

  const deps = []

  for (const key in schema.properties) {
    if (Object.hasOwnProperty.call(schema.properties, key)) {
      const element = schema.properties[key]
      const elementType = element.type || 'object'
      const generateFn = generateFnHelper(elementType)
      const { typeName, statementContent, deps: innerDeps } = generateFn(element, key, schemaData)
      if (statementContent)
        deps.push(statementContent)

      if (innerDeps.length)
        deps.push(...innerDeps)

      typeValue += `\n${key}: ${typeName}`
    }
  }

  const typeName = `${capitalizeFirstLetter(key)}Type`

  typeValue = `{${typeValue}
  }`

  return {
    typeName,
    statementContent: `${generateHeadStr('object', typeName)}${typeValue}`,
    deps,
  }
}

// type === 'array'
export function generateArrayType(propertyRaw, key, schemaData = apiDocsResponse) {
  if (!propertyRaw.items) {
    if (!schema || !schema.properties)
      throw new Error('generateArrayType inner error')
  }

  const deps = []
  const type = propertyRaw.items.type || 'object'
  const generateFn = generateFnHelper(type)
  const { typeName, statementContent, deps: innerDeps } = generateFn(propertyRaw.items, `${key}Row`, schemaData)

  if (statementContent)
    deps.push(statementContent)

  if (innerDeps.length)
    deps.push(...innerDeps)

  return {
    typeName: `${typeName}[]`,
    deps,
  }
}

export function generateInterface(schema, name, wrapperType) {
  if (!schema)
    return 'any'

  // store the inner generated type
  const deps = []

  // gennerate head, such as:
  // "type xxx = "
  // "interface xxx "
  let headStr = generateSarter(wrapperType, name)

  const { type } = schema
  // object
  if (type === 'object') {
    const { typeValue } = generateObjectType(schema, name, deps)
    headStr += `${typeValue} \n`
  }

  // array
  if (type === 'array') {
    const { typeValue } = generateArrayType(schema, name, deps)
    headStr += `${typeValue} \n`
  }

  // eslint-disable-next-line no-console
  console.log(headStr, deps)
}

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1)
}

function generateHeadStr(type, name) {
  if (type === 'object')
    return `\ninterface ${name} `

  if (type === 'array')
    return `\ntype ${name} = `

  if (type === 'enum')
    return `\ntype ${name} = `
}
