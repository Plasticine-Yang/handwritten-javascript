import {
  Executor,
  ExecutorReject,
  ExecutorResolve,
  isFunction,
  isObject,
  MyPromiseLike,
  MyPromiseState,
  OnFullFilled,
  OnRejected
} from './types'

export class MyPromise<T> {
  private state: MyPromiseState = MyPromiseState.PENDING
  private value!: T
  private reason?: any
  private onFullfilledCallbacks: (() => void)[] = []
  private onRejectedCallbacks: (() => void)[] = []

  constructor(executor: Executor<T>) {
    // 异常捕获
    try {
      executor(this.resolve.bind(this), this.reject.bind(this))
    } catch (e) {
      this.reject(e)
    }
  }

  private resolve(value: T): void {
    try {
      if (this.state === MyPromiseState.PENDING) {
        // 只有处于 pending 状态的时候才允许改变状态
        this.state = MyPromiseState.RESOLVED
        this.value = value
        // 从任务队列中取出任务执行
        this.onFullfilledCallbacks.forEach(fn => fn())
      }
    } catch (e) {
      this.reject(e)
    }
  }

  private reject(reason?: any): void {
    if (this.state === MyPromiseState.PENDING) {
      // 只有处于 pending 状态的时候才允许改变状态
      this.state = MyPromiseState.REJECTED
      this.reason = reason
      this.onRejectedCallbacks.forEach(fn => fn())
    }
  }

  public then<TResult1 = T, TResult2 = never>(
    onFullfilled?: OnFullFilled<T, TResult1>,
    onRejected?: OnRejected<TResult2>
  ) {
    // 没有传入回调的时候使用默认回调
    onFullfilled = isFunction(onFullfilled)
      ? onFullfilled
      : (value: T | TResult1) => value as TResult1
    onRejected = isFunction(onRejected)
      ? onRejected
      : (reason: any) => {
          throw reason
        }

    // 返回一个 promise 实现链式调用
    const promise2 = new MyPromise<TResult1 | TResult2>((resolve, reject) => {
      // 将回调放到微任务队列中执行
      const resolveMicrotask = () => {
        queueMicrotask(() => {
          try {
            if (onFullfilled) {
              const x = onFullfilled(this.value)
              resolvePromise<TResult1>(
                promise2 as MyPromise<TResult1>,
                x,
                resolve,
                reject
              )
            }
          } catch (e) {
            reject(e)
          }
        })
      }
      const rejectMicrotask = () => {
        queueMicrotask(() => {
          try {
            if (onRejected) {
              const x = onRejected(this.reason)
              resolvePromise<TResult2>(
                promise2 as MyPromise<TResult2>,
                x,
                resolve,
                reject
              )
            }
          } catch (e) {
            reject(e)
          }
        })
      }

      switch (this.state) {
        case MyPromiseState.RESOLVED:
          resolveMicrotask()
          break
        case MyPromiseState.REJECTED:
          rejectMicrotask()
          break
        case MyPromiseState.PENDING:
          this.onFullfilledCallbacks.push(() => {
            onFullfilled && onFullfilled(this.value)
          })
          this.onRejectedCallbacks.push(() => {
            onRejected && onRejected(this.reason)
          })
      }
    })

    return promise2
  }
}

function resolvePromise<T>(
  promise2: MyPromise<T>,
  x: T | MyPromiseLike<T>,
  resolve: ExecutorResolve<T>,
  reject: ExecutorReject
) {
  if (x === promise2) {
    // 避免循环引用
    return reject(
      new Error('TypeError: Chaining cycle detected for promise #<MyPromise>')
    )
  }

  // 记录是否已被调用过
  let called = false

  if (isObject(x) || isFunction(x)) {
    try {
      // 判断是否有 then 方法
      const then = (x as MyPromiseLike<T>).then
      if (isFunction(then)) {
        // x 是一个 MyPromiseLike
        then.call(
          x,
          y => {
            if (called) return
            called = true
            // 因为 x 是一个 MyPromiseLike，所以递归调用去处理
            // 直到返回的是普通值为止
            resolvePromise(promise2, y, resolve, reject)
          },
          r => {
            if (called) return
            called = true
            reject(r)
          }
        )
      }
    } catch (e) {
      // 对于异常的捕获也要根据 called 来触发 reject
      // reject 只用触发一次即可
      if (called) return
      called = true
      reject(e)
    }
  } else {
    // 普通值
    resolve(x)
  }
}
