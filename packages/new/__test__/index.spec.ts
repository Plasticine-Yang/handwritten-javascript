import { myNew } from '../src'

describe('new', () => {
  function Foo(this: any, name: string) {
    this.name = name
  }

  test('raw new', () => {
    const foo = new Foo('plasticine')
    expect(Object.prototype.toString.call(foo)).toBe('[object Object]')
    expect(foo.name === 'plasticine')
    expect(Object.getPrototypeOf(foo)).toBe(Foo.prototype)
  })

  test('my new', () => {
    const foo = myNew(Foo, 'plasticine')
    expect(Object.prototype.toString.call(foo)).toBe('[object Object]')
    expect(foo.name === 'plasticine')
    expect(Object.getPrototypeOf(foo)).toBe(Foo.prototype)
  })
})
