# 实现 Node.js 的 EventEmitter

## 用到的类型接口声明

我们的`EventEmitter`实现中会定义三个接口：

1. `IEventEmitter`: 用于声明`EventEmitter`实例的类型
2. `IEventEmitterConstructor`: 用于声明`EventEmitter`类的构造函数类型
3. `IEventEmitterPrototype`: 用于声明`EventEmitter`构造函数原型的类型，实例中使用到的各种方法其实都是来自原型

由于`EventEmitter`和`@types/node`中的`EventEmitter`同名，这里为了避免命名冲突，加了一个`I`前缀，也起到一个表明它是`Interface`的作用

### IEventEmitter 接口需要定义些什么？

`IEventEmitter`接口定义的是`IEventEmitter`实例的类型，声明了实例中有什么属性和方法，那么这个接口中需要有什么呢？

首先，我们的底层实现肯定是需要一个映射数据结构，能够将事件名称映射到对应的回调函数列表，这样我们才能方便地注册事件回调和移除事件回调，所以我们再定义一个`eventMap`属性，用`Map`来实现

```ts
interface IEventEmitter {
  // 事件映射表 -- 用于存储事件的回调函数
  eventMap: Map<string, Function | Function[]>
}
```

### IEventEmitterConstructor 接口需要定义什么？

该接口主要用于声明构造函数的类型，我们的构造函数只需要返回一个`EventEmitter`实例即可，所以其声明如下

```ts
interface IEventEmitterConstructor {
  new (): IEventEmitter
}
```

### IEventEmitterPrototype 接口需要定义些什么？

最常用的`API`肯定是要实现的，比如`addListener`、`once`、`removeListener`、`removeAllListener`、`emit`等

由于我们现在什么都还没写，暂时不清除具体的类型定义要怎么写，但是我们能够知道的是它们都是函数，所以先统一将它们声明为`Function`类型，之后需要添加什么参数的时候再去修改类型定义即可

```ts
interface IEventEmitter {
  addListener: Function
  once: Function
  removeListener: Function
  removeAllListener: Function
  emit: Function
}
```

---

## 解决普通函数充当构造函数遇到的问题

### function 声明的函数的类型声明问题

可以使用类的方式去实现，但是为了挑战以下我们对`TypeScript`的理解，我采用的是普通函数充当构造函数的方式进行实现的

如果是以类的方式去实现，我们可以轻松的在类的`constructor`和各种方法中直接使用`this`

```ts
class EventEmitter {
  private events: Map<string, any>

  constructor() {
    this.events = new Map()
  }
}
```

但如果是用普通函数作为构造函数的话，会遇到`其目标缺少构造签名的 "new" 表达式隐式具有 "any" 类型`的报错，这时候我们就需要定义一个`IEventEmitterConstructor`接口，在里面声明构造函数的类型

```ts
interface IEventEmitterConstructor {
  new (): EventEmitter
}
```

那么这个`IEventEmitterConstructor`要怎么给普通函数声明呢？如果是以`function EventEmitter() {}`的方式编写函数的话，没办法为其添加类型声明，箭头函数又不合适，因为我们需要让这个函数作为构造函数使用，箭头函数是不能使用`new`关键字调用的，无法作为构造函数使用

可以声明一个变量，指向一个匿名函数，然后给这个变量进行类型断言，断言为`EventEmitterConstructor`的方式完成类型声明

```ts
const EventEmitter = function (
  this: IEventEmitter
) {} as unknown as IEventEmitterConstructor
```

这里因为类型不兼容，所以需要先转为`unknown`再转成`IEventEmitterConstructor`进行一个二次转型

---

## 抽象 EventListener 接口

为了方便管理事件监听回调，我们可以抽象成一个接口，因为我们不单止要管理事件监听回调函数，还要管理相关状态，比如一个回调是否只需要执行一次，这时候就要一个`once`属性去控制，所以把监听回调封装到一个对象中，抽象成接口方便管理

```ts
// 事件监听函数类型
type EventListenerCallback = (...args: any[]) => void

interface IEventListener {
  // 事件回调函数
  callback: EventListenerCallback
  // 是否只能触发一次
  once: boolean
}
```

再封装一个创建`IEventListener`的函数

```ts
const createEventListener = (
  callback: EventListenerCallback,
  once = false
): IEventListener => ({
  callback,
  once
})
```

---

## addListener 实现

`addListener`应当定义在构造函数的原型上而不是定义在构造函数对象上，这样能够避免每次实例化一个对象都会创建一个`addListener`函数对象的问题

那么马上就遇到一个问题了，我们怎么给`EventEmitter.prototype`声明类型呢？

可以使用`类型断言`的方式进行声明

```ts
;(EventEmitter.prototype as IEventEmitterPrototype).addListener = function () {}
```

具体实现如下：

```ts
;(EventEmitter.prototype as IEventEmitterPrototype).addListener = function (
  this: IEventEmitter,
  eventName: string,
  listener: EventListenerCallback
): IEventEmitter {
  let eventListener = this.eventMap.get(eventName)
  const newEventListener = createEventListener(listener)

  if (!eventListener) {
    // 首次注册事件监听回调
    this.eventMap.set(eventName, newEventListener)
  } else if (!Array.isArray(eventListener)) {
    // 事件已经一个监听回调 -- 转成数组存储 并把当前添加的监听回调添加进去
    // 转成数组
    this.eventMap.set(eventName, [eventListener, newEventListener])
  } else {
    // 事件已经有多个监听回调 -- 直接推入到数组中即可
    eventListener.push(newEventListener)
  }

  return this
}
```

### 抽离注册事件监听逻辑

注意到之后要实现的`once`方法其实做的事情和`addListener`是一样的，只是在创建`IEventListener`的时候要创建一个`once: true`的对象，所以这里我们可以先提前将`addListener`的逻辑抽离成一个函数，方便后面`once`复用

```ts
/**
 * @description 抽象出基本的注册事件监听逻辑
 * @param eventEmitter IEventEmitter 对象
 * @param eventName 事件名
 * @param listener 事件监听回调函数
 * @param once 是否只触发一次
 * @returns eventEmitter 对象本身 用于支持链式调用
 */
const baseAddListener = (
  eventEmitter: IEventEmitter,
  eventName: string,
  listener: EventListenerCallback,
  once: boolean
): IEventEmitter => {
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
```

这样一来`addListener`的实现直接调用`baseAddListener`即可

```ts
;(EventEmitter.prototype as IEventEmitterPrototype).addListener = function (
  this: IEventEmitter,
  eventName: string,
  listener: EventListenerCallback
): IEventEmitter {
  baseAddListener(this, eventName, listener, false)
  return this
}
```

---

## once 实现

调用`IEventEmitter`对象的`once`方法能够将事件监听回调注册，并且保证该回调只会执行一次，由于前面已经封装了`baseAddListener`，所以可以直接复用

```ts
;(EventEmitter.prototype as IEventEmitterPrototype).once = function (
  this: IEventEmitter,
  eventName: string,
  listener: EventListenerCallback
): IEventEmitter {
  baseAddListener(this, eventName, listener, true)
  return this
}
```

---

## removeListener 实现

实现思路就是先判断对应的事件名的事件监听对象是否存在，存在的话根据是数组还是对象来进行不同处理

如果是对象，则先判断是否和要删除的回调一致，是的话就将整个`eventMap`的记录删除

如果是数组则遍历数组，则遍历数组找出和要删除的回调相同的事件监听对象，将其从数组中移除，还要注意**数组塌陷**的问题

```ts
;(EventEmitter.prototype as IEventEmitterPrototype).removeListener = function (
  this: IEventEmitter,
  eventName: string,
  listener: EventListenerCallback
): IEventEmitter {
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
```

---

## removeAllListener 实现

这个的实现就简单粗暴了，有传入事件名的话就把该事件对应的所有监听对象移除，没有传入的话直接清空整个`eventMap`哈希表即可

```ts
;(EventEmitter.prototype as IEventEmitterPrototype).removeAllListener =
  function (this: IEventEmitter, eventName?: string): IEventEmitter {
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
```

---

## emit 实现

首先要获取对应的事件监听对象，然后根据是数组还是单个对象来作出不同处理

数组则遍历执行，并且判断一下对应的监听对象是否是只需要执行一次的，是的话就在执行后将其从监听回调数组中删除，可以复用`removeListener`

如果是单独对象的话，则也是执行并判断是否只需要执行一次，是的话就删除

```ts
;(EventEmitter.prototype as IEventEmitterPrototype).emit = function (
  this: IEventEmitter & IEventEmitterPrototype,
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
```

这里由于我们要复用`removeListener`，但是`this`指向声明的是`IEventEmitter`类型，而`removeListener`是在`IEventEmitterPrototype`上的，所以我们可以利用交叉类型将类型声明变得更加宽泛一些

---

## 更新 IEventEmitterPrototype 接口中的方法类型定义

现在我们全部的方法都实现完了，那么可以根据我们用到的参数和返回值类型去定义一下`IEventEmitterPrototype`中的方法类型声明

---

## 类型修正

### 修改构造函数返回值类型，指定暴露给用户使用的接口

```ts
// 暴露给用户使用的 EventEmitter 实例的类型
type EventEmitterInstance = IEventEmitter & IEventEmitterPrototype

interface IEventEmitterConstructor {
  new (): EventEmitterInstance
}
```

### 完善 IEventEmitterPrototype 的类型

```ts
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
```

---

## 测试使用

使用`jest`编写一个简单的单元测试`happy path`看看基本使用能否通过

```ts
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
```

运行测试命令后发现能够正常通过

---

## 打包导出

这里我们使用`rollup`进行打包，并且要让其能够在浏览器和`node`环境下都能够使用

`rollup`配置如下

```js
import { resolve } from 'path'
import esbuild from 'rollup-plugin-esbuild'
import nodeResolve from '@rollup/plugin-node-resolve'

const resolvePath = resolve.bind(null, __dirname)

/** @type { import('rollup').RollupOptions } */
export default {
  input: resolvePath('src/index.ts'),
  output: [
    {
      dir: resolvePath('dist/esm'),
      format: 'esm',
      preserveModules: true
    },
    {
      dir: resolvePath('dist/cjs'),
      format: 'cjs',
      preserveModules: true,
      exports: 'auto'
    }
  ],
  plugins: [nodeResolve(), esbuild({ target: 'esnext' })]
}
```

并在`package.json`中添加打包脚本

```json
"scripts": {
  "build": "rollup -c rollup.esm.config.js"
}
```

然后运行打包命令即可看到打包结果

---
