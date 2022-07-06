import { MyPromise } from '../index'

describe('my-promise', () => {
  test('resolve value', () => {
    new MyPromise(resolve => {
      setTimeout(() => {
        resolve(1)
      }, 3000)
    }).then(value => {
      expect(value).toBe(1)
    })
    jest.runAllTimers()
  })

  test('reject reason', () => {
    new MyPromise((_, reject) => {
      setTimeout(() => {
        reject('err')
      }, 3000)
    }).then(
      value => {
        console.log(value)
      },
      reason => {
        expect(reason).toBe('err')
      }
    )
    jest.runAllTimers()
  })

  test('call then multiple times', () => {
    const myPromise = new MyPromise(resolve => {
      setTimeout(() => {
        setTimeout(() => {
          resolve(1)
        })
      })
    })

    const fn1Spy = jest.fn()
    const fn2Spy = jest.fn()
    const fn3Spy = jest.fn()

    myPromise.then(() => fn1Spy())
    myPromise.then(() => fn2Spy())
    myPromise.then(() => fn3Spy())
    myPromise.then(() => fn1Spy())

    jest.runAllTimers()

    expect(fn1Spy).toHaveBeenCalledTimes(2)
    expect(fn2Spy).toHaveBeenCalledTimes(1)
    expect(fn3Spy).toHaveBeenCalledTimes(1)
  })
})
