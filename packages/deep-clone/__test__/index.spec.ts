import { deepClone } from '../src'

describe('deep-clone', () => {
  const setProp = new Set<string>(['a', 'b', 'c'])

  test('should clone an object', () => {
    const foo = {
      name: 'foo',
      age: 21
    }

    const clonedFoo = deepClone(foo)

    // 不应当是同一个内存地址的对象
    expect(clonedFoo).not.toBe(foo)

    // 属性应当相同
    expect(clonedFoo).toEqual(foo)
  })

  test('should handle circle reference', () => {
    const foo: Record<string, any> = {
      name: 'foo',
      age: 21
    }
    foo.bar = foo

    const clonedFoo = deepClone(foo)
  })

  test('should clone array', () => {
    const foo = {
      name: 'foo',
      age: 21,
      friends: ['Bar', 'Baz', 'Plasticine']
    }

    const clonedFoo = deepClone(foo)

    expect(clonedFoo.friends).not.toBe(foo.friends)
    expect(clonedFoo.friends).toEqual(foo.friends)
  })

  test('should clone nested object', () => {
    const foo = {
      name: 'foo',
      age: 21,
      family: {
        father: 'Tom',
        mother: 'Christine'
      }
    }

    const clonedFoo = deepClone(foo)

    expect(clonedFoo.family).not.toBe(foo.family)
    expect(clonedFoo.family).toEqual(foo.family)
  })

  test('should clone Map', () => {
    const mapProp = new Map<string, any>([
      ['prop1', 'value1'],
      ['prop2', 'value2']
    ])
    const foo = {
      name: 'foo',
      age: 21,
      mapProp
    }

    const clonedFoo = deepClone(foo)

    expect(clonedFoo.mapProp).not.toBe(foo.mapProp)
    expect(clonedFoo.mapProp).toEqual(foo.mapProp)
  })

  test('should clone Set', () => {
    const setProp = new Set<string>(['1', '2'])

    const foo = {
      name: 'foo',
      age: 21,
      setProp
    }

    const clonedFoo = deepClone(foo)

    expect(clonedFoo.setProp).not.toBe(foo.setProp)
    expect(clonedFoo.setProp).toEqual(foo.setProp)
  })

  test('should clone Date', () => {
    const birthday = new Date()
    const foo = {
      name: 'foo',
      age: 21,
      birthday
    }

    const clonedFoo = deepClone(foo)

    expect(clonedFoo.birthday).not.toBe(foo.birthday)
    expect(clonedFoo.birthday).toEqual(foo.birthday)
  })

  test('should clone RegExp', () => {
    const regExp = /hello/
    const foo = {
      name: 'foo',
      age: 21,
      regExp
    }

    const clonedFoo = deepClone(foo)

    expect(clonedFoo.regExp).not.toBe(foo.regExp)
    expect(clonedFoo.regExp).toEqual(foo.regExp)
  })
})
