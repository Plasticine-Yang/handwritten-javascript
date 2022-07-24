import { myInstanceof } from '../src'

describe('instanceof', () => {
  test('happy path', () => {
    function Foo(this: any, name: string) {
      this.name = name
    }
    const foo = new Foo('plasticine')

    expect(myInstanceof(foo, Foo)).toBe(true)
    expect(myInstanceof(foo, Object)).toBe(true)
    expect(myInstanceof(Foo, Function)).toBe(true)
    expect(myInstanceof(Foo, Object)).toBe(true)
  })
})
