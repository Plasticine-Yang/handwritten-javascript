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
  | ((value: T) => TResult1)
  | undefined
  | null
export type OnRejected<TResult2> =
  | ((reason: any) => TResult2)
  | undefined
  | null
