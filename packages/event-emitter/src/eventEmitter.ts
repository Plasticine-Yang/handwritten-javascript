// EventEmitter 实例的类型接口
interface IEventEmitter {
  // 事件映射表 -- 用于存储事件的回调函数
  eventMap: Map<string, IEventListener | IEventListener[]>
}

// EventEmitter 构造函数的类型接口
interface IEventEmitterConstructor {
  new (): EventEmitterInstance
}

// EventEmitter 的原型对象类型接口
interface IEventEmitterPrototype {
  addListener: (
    eventName: string,
    listener: EventListenerCallback
  ) => EventEmitterInstance
  once: (
    eventName: string,
    listener: EventListenerCallback
  ) => EventEmitterInstance
  removeListener: (
    eventName: string,
    listener: EventListenerCallback
  ) => EventEmitterInstance
  removeAllListener: (eventName?: string) => EventEmitterInstance
  emit: (eventName: string) => boolean
}

interface IEventListener {
  // 事件回调函数
  callback: EventListenerCallback
  // 是否只能触发一次
  once: boolean
}

// 事件监听函数类型
type EventListenerCallback = (...args: any[]) => void

// 暴露给用户使用的 EventEmitter 实例的类型
type EventEmitterInstance = IEventEmitter & IEventEmitterPrototype

/**
 * @description EventEmitter 构造函数
 */
const EventEmitter = function (this: IEventEmitter) {
  this.eventMap = new Map()
} as unknown as IEventEmitterConstructor

// 创建监听回调对象
const createEventListener = (
  callback: EventListenerCallback,
  once = false
): IEventListener => ({
  callback,
  once
})

/**
 * @description 抽象出基本的注册事件监听逻辑
 * @param eventEmitter IEventEmitter 对象
 * @param eventName 事件名
 * @param listener 事件监听回调函数
 * @param once 是否只触发一次
 * @returns eventEmitter 对象本身 用于支持链式调用
 */
const baseAddListener = (
  eventEmitter: EventEmitterInstance,
  eventName: string,
  listener: EventListenerCallback,
  once: boolean
): EventEmitterInstance => {
  let eventListener = eventEmitter.eventMap.get(eventName)
  const newEventListener = createEventListener(listener, once)

  if (!eventListener) {
    // 首次注册事件监听回调
    eventEmitter.eventMap.set(eventName, newEventListener)
  } else if (!Array.isArray(eventListener)) {
    // 事件已经一个监听回调 -- 转成数组存储 并把当前添加的监听回调添加进去
    // 转成数组
    eventEmitter.eventMap.set(eventName, [eventListener, newEventListener])
  } else {
    // 事件已经有多个监听回调 -- 直接推入到数组中即可
    eventListener.push(newEventListener)
  }

  return eventEmitter
}

;(EventEmitter.prototype as IEventEmitterPrototype).addListener = function (
  this: EventEmitterInstance,
  eventName: string,
  listener: EventListenerCallback
): EventEmitterInstance {
  baseAddListener(this, eventName, listener, false)
  return this
}
;(EventEmitter.prototype as IEventEmitterPrototype).once = function (
  this: EventEmitterInstance,
  eventName: string,
  listener: EventListenerCallback
): EventEmitterInstance {
  baseAddListener(this, eventName, listener, true)
  return this
}
;(EventEmitter.prototype as IEventEmitterPrototype).removeListener = function (
  this: EventEmitterInstance,
  eventName: string,
  listener: EventListenerCallback
): EventEmitterInstance {
  const eventListener = this.eventMap.get(eventName)

  if (eventListener) {
    const { callback } = eventListener as IEventListener
    if (!Array.isArray(eventListener)) {
      // 只有一个事件监听对象
      if (callback === listener) {
        // 是要删除的回调 -- 直接把整个 map 记录删除即可
        this.eventMap.delete(eventName)
      }
    } else {
      // 有多个事件监听对象 -- 遍历它们找出 callback 和 listener 相同的进行删除
      // else 分支中 TypeScript 会自动帮我们把 eventListener 断言为数组类型 不需要手动进行类型断言
      // i < (eventListener as IEventListener[]).length 没必要
      for (let i = 0; i < eventListener.length; i++) {
        if (eventListener[i].callback === listener) {
          eventListener.splice(i, 1)
          // 由于将其从数组中移除后，后续元素会往前挪，因此要让 i-- 保持相对位置不变，防止数组塌陷
          i--
          if (eventListener.length === 1) {
            // 删除后如果长度为 1 的话不需要用数组存储了
            this.eventMap.set(eventName, eventListener[0])
          }
        }
      }
    }
  }

  return this
}
;(EventEmitter.prototype as IEventEmitterPrototype).removeAllListener =
  function (
    this: EventEmitterInstance,
    eventName?: string
  ): EventEmitterInstance {
    if (eventName) {
      // 有指定事件名则将该事件下注册的所有监听对象移除
      if (this.eventMap.has(eventName)) {
        this.eventMap.delete(eventName)
      }
    } else {
      // 没有指定事件名则是将所有事件下注册的所有监听对象移除
      this.eventMap.clear()
    }

    return this
  }
;(EventEmitter.prototype as IEventEmitterPrototype).emit = function (
  this: EventEmitterInstance,
  eventName: string,
  ...args: any[]
): boolean {
  const eventListener = this.eventMap.get(eventName)
  if (!eventListener) return false

  if (Array.isArray(eventListener)) {
    // 有多个回调 -- 逐一执行
    eventListener.forEach(listener => {
      listener.callback.apply(this, args)
      // 带有 once: true 标记的表明执行完毕后就要将其移除了
      if (listener.once) {
        this.removeListener(eventName, listener.callback)
      }
    })
  } else {
    const { callback, once } = eventListener
    // 只有一个回调 -- 直接执行
    callback.apply(this, args)
    if (once) {
      // 同样需要处理一下是否只执行一次
      this.removeListener(eventName, callback)
    }
  }

  return true
}

export { EventEmitter }
