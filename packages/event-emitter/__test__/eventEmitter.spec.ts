import { EventEmitter } from '../src/index'

describe('eventEmitter', () => {
  test('happy path', () => {
    const fn1Spy = jest.fn()
    const fn2Spy = jest.fn()
    const fn3Spy = jest.fn()

    const eventEmitter = new EventEmitter()
    eventEmitter.addListener('hello', fn1Spy)
    eventEmitter.addListener('hello', fn2Spy)
    eventEmitter.once('hi', fn3Spy)

    // 触发 hello 事件应当让全部监听回调执行
    eventEmitter.emit('hello')
    expect(fn1Spy).toHaveReturnedTimes(1)
    expect(fn2Spy).toHaveReturnedTimes(1)

    // 再次触发仍然能够执行
    eventEmitter.emit('hello')
    expect(fn1Spy).toHaveReturnedTimes(2)
    expect(fn2Spy).toHaveReturnedTimes(2)

    // 触发 hi 事件则相应回调只执行一次
    eventEmitter.emit('hi')
    expect(fn3Spy).toHaveReturnedTimes(1)

    // 再次触发仍然只执行一次
    eventEmitter.emit('hi')
    expect(fn3Spy).toHaveReturnedTimes(1)

    // 移除 hello 的监听事件回调 fn1Spy
    eventEmitter.removeListener('hello', fn1Spy)
    // 再次触发 hello 事件时 fn1Spy 不应该被执行，fn2Spy 仍然能够执行
    eventEmitter.emit('hello')
    expect(fn1Spy).toHaveReturnedTimes(2)
    expect(fn2Spy).toHaveReturnedTimes(3)

    // 移除 hello 的所有回调
    eventEmitter.removeAllListener('hello')
    // 再次触发 hello 事件时 fn1Spy 和 fn2Spy 都不应该被执行
    eventEmitter.emit('hello')
    expect(fn1Spy).toHaveReturnedTimes(2)
    expect(fn2Spy).toHaveReturnedTimes(3)
  })
})
