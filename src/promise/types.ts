export interface MyPromise<T> {}

export enum MyPromiseState {
  PENDING = 'pending',
  RESOLVED = 'resolved',
  REJECTED = 'rejected'
}

export type ExecutorResolve<T> = (value: T) => void
export type ExecutorReject = (reason?: any) => void

export type Executor<T> = (
  resolve: ExecutorResolve<T>,
  reject: ExecutorReject
) => void

export type OnFullFilled<T, TResult1> =
  | ((value: T) => TResult1 | MyPromiseLike<TResult1>)
  | undefined
  | null
export type OnRejected<TResult2> =
  | ((reason: any) => TResult2 | MyPromiseLike<TResult2>)
  | undefined
  | null

export interface MyPromiseLike<T> {
  then<TResult1 = T, TResult2 = never>(
    onFullfilled?: OnFullFilled<T, TResult1>,
    onRejected?: OnRejected<TResult2>
  ): MyPromiseLike<TResult1 | TResult2>
}
