import { test, expect } from 'vitest';
import { generateObjectType } from '../core';

test('simple object type', () => {
  const result = generateObjectType({
    $ref: '#/components/schemas/a.test.data'
  }, 'hello', {
    components: {
      schemas: {
        'a.test.data': {
          description: 'test schema',
          properties: {
            id: {
              description: "id string",
              type: "string"
            },
            name: {
              description: "name string",
              type: "string"
            }
          },
          required: ["id"],
          type: "object"
        }
      }
    }
  }) 
  expect(result).matchSnapshot()
})

test('nested simple object in an object type', () => {
  const result = generateObjectType({
    $ref: '#/components/schemas/a.test.data'
  }, 'hello', {
    components: {
      schemas: {
        'a.test.data': {
          description: 'test schema',
          properties: {
            id: {
              description: "id string",
              type: "string"
            },
            name: {
              $ref: '#/components/schemas/b.test.data' 
            }
          },
          type: "object"
        },
        'b.test.data': {
          description: 'test schema 2',
          properties: {
            type: {
              type: "string",
              description: "type string",
            },
          },
          type: "object" 

        }
      }
    }
  }) 
  expect(result).matchSnapshot()
})

test('nested simple array in an object type', () => {
  const result = generateObjectType({
    $ref: '#/components/schemas/a.test.data'
  }, 'hello', {
    components: {
      schemas: {
        'a.test.data': {
          description: 'test schema',
          properties: {
            id: {
              description: "id string",
              type: "string"
            },
            name: {
              description: 'object inner array',
              type: "array",
              items: {
                type: "string",
                description: 'array inner string'
              }
            }
          },
          type: "object"
        },
      }
    }
  }) 
  expect(result).matchSnapshot()
})

test('nested complex array in an object type', () => {
  const result = generateObjectType({
    $ref: '#/components/schemas/a.test.data'
  }, 'hello', {
    components: {
      schemas: {
        'a.test.data': {
          description: 'test schema',
          properties: {
            id: {
              description: "id string",
              type: "string"
            },
            name: {
              description: 'object inner array',
              type: "array",
              items: {
                $ref: '#/components/schemas/b.test.data' 
              }
            }
          },
          type: "object"
        },
        'b.test.data': {
          description: 'test schema 2',
          properties: {
            type: {
              type: "string",
              description: "type string",
            },
          },
          type: "object" 
        }
      }
    }
  }) 
  expect(result).matchSnapshot()
})