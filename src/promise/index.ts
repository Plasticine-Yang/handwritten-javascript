import { Executor, MyPromiseState, OnFullFilled, OnRejected } from './types'

export class MyPromise<T> {
  private state: MyPromiseState = MyPromiseState.PENDING
  private value!: T
  private reason?: any
  private onFullfilledCallbacks: (() => void)[] = []
  private onRejectedCallbacks: (() => void)[] = []

  constructor(executor: Executor<T>) {
    executor(this.resolve.bind(this), this.reject.bind(this))
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
    switch (this.state) {
      case MyPromiseState.RESOLVED:
        onFullfilled && onFullfilled(this.value)
        break
      case MyPromiseState.REJECTED:
        onRejected && onRejected(this.reason)
        break
      case MyPromiseState.PENDING:
        this.onFullfilledCallbacks.push(() => {
          onFullfilled && onFullfilled(this.value)
        })
        this.onRejectedCallbacks.push(() => {
          onRejected && onRejected(this.reason)
        })
    }
  }
}
