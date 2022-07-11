type ResolvedValue<T = any> = T | MyPromise<T> | null | undefined
type RejectedReason = any | undefined

type Resolve<T = any> = (value?: ResolvedValue<T>) => void
type Reject = (reason?: RejectedReason) => void
type Executor<T = any> = (resolve: Resolve<T>, reject: Reject) => T

type OnFullfilled<T = any> = (
  value?: ResolvedValue<T>
) => T | MyPromiseLike<T> | MyPromise<T> | null | undefined | void
type OnRejected = (reason?: RejectedReason) => any | null | undefined | void

interface MyPromiseLike<T = any> {
  then: (
    onFullfilled?: OnFullfilled<T>,
    onRejected?: OnRejected
  ) => T | MyPromiseLike<T> | MyPromise<T>
}

/**
 * @description MyPromise 的状态
 */
const PENDING = 'PENDING'
const FULFILLED = 'FULFILLED'
const REJECTED = 'REJECTED'

type MyPromiseState = 'PENDING' | 'FULFILLED' | 'REJECTED'

/**
 * 根据 x 的类型作出不同的处理
 * x 为非 MyPromise 对象的时候 -- 直接 resolve
 * x 为 MyPromise 对象的时候 -- 调用其 resolve
 *
 * 剩下的还有一些细节会具体在代码中注释
 *
 * @param {MyPromise} promise MyPromise 实例
 * @param {any} x 前一个 MyPromise resolve 出来的值
 * @param {Function} resolve promise 对象构造函数中的 resolve
 * @param {Function} reject promise 对象构造函数中的 reject
 */
function resolvePromise<T = any>(
  promise: MyPromise<T>,
  x: ResolvedValue<T>,
  resolve: Resolve<T>,
  reject: Reject
) {
  // 根据 Promises A+ 规范 2.3.1: promise 和 x 指向同一个引用时应当 reject 一个 TypeError
  if (promise === x) {
    return reject(
      new TypeError('Chaining cycle detected for promise #<MyPromise>')
    )
  }

  // 2.3.3: x 是 object or function 时的情况
  let isCalled = false // 当 x 是 MyPromise 实例时，标记 x.then 中的回调是否有任何一个被调用过

  if ((typeof x === 'object' && x !== null) || typeof x === 'function') {
    // typeof null === 'object'，因此需要额外判断一下排除 x 是 null 的情况

    try {
      // x.then 可能被 Object.defineProperty 设置了 getter 劫持，并抛出异常，因此要 try/catch 捕获
      let then = (x as MyPromiseLike<T>).then

      if (typeof then === 'function') {
        // x 有 then 方法时，就将其视为是 MyPromise 对象
        // 2.3.3.3 执行 x.then，并且要显式绑定 this 指向，且有两个回调 resolvePromise 和 rejectPromise
        then.call(
          x,
          // resolvePromise
          y => {
            // 需要递归调用 MyPromise 中 resolve 出去的值，也就是这里的 y
            if (isCalled) return // 有任何一个回调已经被执行过了，忽略当前回调的执行

            isCalled = true // 首次执行回调，将标志变量置为 true，防止被重复调用或者调用 rejectPromise
            resolvePromise(promise, y, resolve, reject)
          },
          // rejectPromise
          r => {
            // 对于 reject，直接将其 reason 给 reject 出去即可
            if (isCalled) return // 有任何一个回调已经被执行过了，忽略当前回调的执行

            isCalled = true // 首次执行回调，将标志变量置为 true，防止被重复调用或者调用 resolvePromise
            reject(r)
          }
        )
      } else {
        // x 没有 then 方法 -- 不需要特殊处理，直接 resolve
        resolve(x)
      }
    } catch (e) {
      // 如果出错了的话，不应该还能调用 resolve，因此这里也要加上 isCalled 判断，防止去调用 resolve
      if (isCalled) return

      isCalled = true
      reject(e)
    }
  } else {
    // 基本数据类型 -- 直接 resolve
    resolve(x)
  }
}

export class MyPromise<T = unknown> {
  private status: MyPromiseState
  private value: ResolvedValue<T>
  private reason: RejectedReason
  private onFulfilledCallbackList: OnFullfilled<T>[]
  private onRejectedCallbackList: OnRejected[]

  constructor(executor: Executor<T>) {
    this.status = PENDING // 初始状态为 PENDING
    this.value = undefined // resolve 出去的值
    this.reason = undefined // reject 出去的原因

    // 维护两个列表容器 存放对应的回调
    this.onFulfilledCallbackList = []
    this.onRejectedCallbackList = []

    /**
     * resolve, reject 是两个函数 -- 每个 MyPromise 实例中的 resolve 方法是属于自己的
     * 如果将 resolve, reject 定义在构造器外面的话，方法会在构造函数的 prototype 上
     * 所以应当在构造器内部定义 resolve, reject 函数
     *
     * 并且一定要用箭头函数去定义 而不能是普通函数
     * 普通函数的 this 指向是在外部调用的时候决定的，不能保证指向实例本身
     * 而箭头函数中没有 this，会使用函数定义时的父函数 constructor 中的 this
     * 也就是说使用箭头函数能够保证 this 指向实例本身
     *
     * 而箭头函数要用 const 关键字声明一个引用变量去指向它，因此要在执行 executor 之前定义
     * 否则会由于暂时性死区导致无法找到 resolve, reject 函数
     */

    const resolve: Resolve<T> = (value: ResolvedValue<T>) => {
      // 当 value 是 MyPromise 实例的时候
      if (value instanceof MyPromise) {
        value.then(resolve, reject)

        // 一定要 return 否则会无限递归下去
        return
      }

      // 只有在 PENDING 状态时才能转换到 FULFILLED 状态
      if (this.status === PENDING) {
        this.status = FULFILLED
        this.value = value

        // 触发 resolve 行为，开始 “发布” resolved 事件
        this.onFulfilledCallbackList.forEach(fn => fn())
      }
    }

    const reject: Reject = (reason: RejectedReason) => {
      // 只有在 PENDING 状态时才能转换到 REJECTED 状态
      if (this.status === PENDING) {
        this.status = REJECTED
        this.reason = reason

        // 触发 reject 行为，开始 “发布” rejected 事件
        this.onRejectedCallbackList.forEach(fn => fn())
      }
    }

    try {
      executor(resolve, reject)
    } catch (e) {
      reject(e)
    }
  }

  then(onFulfilled?: OnFullfilled<T> | null, onRejected?: OnRejected | null) {
    // onFulfilled 和 onRejected 是可选参数，如果没传的时候应当设置默认值
    onFulfilled =
      typeof onFulfilled === 'function' ? onFulfilled : value => value
    onRejected =
      typeof onRejected === 'function'
        ? onRejected
        : reason => {
            throw reason
          }

    const promise2 = new MyPromise<T>((resolve, reject) => {
      // 根据状态去判断执行哪一个回调
      if (this.status === FULFILLED) {
        // 以宏任务的方式执行 resolvePromise 才能保证拿到 promise2 实例
        queueMicrotask(() => {
          try {
            let x = onFulfilled!(this.value)
            // 处理 x
            resolvePromise<T>(promise2, x, resolve, reject)
          } catch (e) {
            reject(e)
          }
        }, 0)
      }

      if (this.status === REJECTED) {
        queueMicrotask(() => {
          try {
            let x = onRejected!(this.reason)
            // 处理 x
            resolvePromise<T>(promise2, x, resolve, reject)
          } catch (e) {
            reject(e)
          }
        }, 0)
      }

      if (this.status === PENDING) {
        // pending 状态下需要 “订阅” fulfilled 和 rejected 事件
        this.onFulfilledCallbackList.push(() => {
          queueMicrotask(() => {
            try {
              let x = onFulfilled!(this.value)
              // 处理 x
              resolvePromise(promise2, x, resolve, reject)
            } catch (e) {
              reject(e)
            }
          }, 0)
        })
        this.onRejectedCallbackList.push(() => {
          queueMicrotask(() => {
            try {
              let x = onRejected!(this.reason)
              // 处理 x
              resolvePromise(promise2, x, resolve, reject)
            } catch (e) {
              reject(e)
            }
          }, 0)
        })
      }
    })

    return promise2
  }

  catch(onRejected: OnRejected) {
    return this.then(null, onRejected)
  }
}
