# 第一版实现 -- 只考虑实现效果，先不考虑别的

## HTML

直观上能够感觉到轮播图是一个**列表结构**，因此可以使用一个**无序列表**实现

```html
<div id="slider" class="slider-container">
  <!-- 轮播图主体 -->
  <ul>
    <li class="slider__item--selected">
      <img src="https://p5.ssl.qhimg.com/t0119c74624763dd070.png" alt="商品" />
    </li>
    <li class="slider__item">
      <img src="https://p4.ssl.qhimg.com/t01adbe3351db853eb3.jpg" alt="商品" />
    </li>
    <li class="slider__item">
      <img src="https://p2.ssl.qhimg.com/t01645cd5ba0c3b60cb.jpg" alt="商品" />
    </li>
    <li class="slider__item">
      <img src="https://p4.ssl.qhimg.com/t01331ac159b58f5478.jpg" alt="商品" />
    </li>
  </ul>

  <!-- 轮播图两侧按钮 -->
  <a class="slider__next"></a>
  <a class="slider__previous"></a>

  <!-- 轮播图底部控制条 -->
  <div class="slider__control">
    <span class="slider__control-buttons--selected"></span>
    <span class="slider__control-buttons"></span>
    <span class="slider__control-buttons"></span>
    <span class="slider__control-buttons"></span>
  </div>
</div>
```

## CSS

- 使用`绝对定位`将图片重叠放置在一处
- 使用`修饰符(modifier)`记录轮播图的状态，比如`.slider__item--selected`
- 使用`CSS transition`实现轮播图切换动画

```CSS
/* 轮播图主体 */

#slider {
  position: relative;
  width: 790px;
  height: 340px;
}

.slider-container {
  position: relative;
}

.slider-container ul {
  list-style-type: none;
  margin: 0;
  padding: 0;
  height: 100%;
  width: 100%;
}

.slider__item,
.slider__item--selected {
  position: absolute;
  opacity: 0;
  transition: opacity 1s;
}

.slider__item--selected {
  opacity: 1;
}

/* 底部控制条 */

.slider__control {
  position: absolute;
  padding: 5px;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  background-color: rgba(255, 255, 255, 0.5);
  border-radius: 12px;
}

.slider__control-buttons,
.slider__control-buttons--selected {
  display: inline-block;
  width: 15px;
  height: 15px;
  background-color: white;
  border-radius: 50%;
  cursor: pointer;
  margin: 0 5px;
}

.slider__control-buttons--selected {
  background-color: #3370ff;
}

/* 左右两侧切换按钮 */

.slider__next::after {
  content: '>';
}

.slider__previous::after {
  content: '<';
}

.slider__next,
.slider__previous {
  position: absolute;
  top: 50%;
  width: 30px;
  height: 50px;
  transform: translateY(-25px);
  line-height: 50px;
  text-align: center;
  background-color: rgba(0, 0, 0, 0.2);
  color: white;
  font-size: 24px;
  opacity: 0;
  transition: opacity 0.5s;
  cursor: pointer;
}

.slider__next {
  right: 0;
}

.slider__previous {
  left: 0;
}

#slider:hover .slider__next,
#slider:hover .slider__previous {
  opacity: 1;
}
```

## JavaScript

主要就是实现一个`Slider`类，完成以下几个`API`：

- getSelectedItem()
- getSelectedItemIndex()
- slideTo()
- slideNext()
- slidePreviout()

```JavaScript
class Slider {
  constructor(containerId) {
    this.container = document.getElementById(containerId)
    this.items = this.container.querySelectorAll(
      '.slider__item, .slider__item--selected'
    )
  }

  getSelectedItem() {
    const selected = this.container.querySelector('.slider__item--selected')
    return selected
  }

  getSelectedItemIndex() {
    return Array.from(this.items).indexOf(this.getSelectedItem())
  }

  slideTo(idx) {
    // 清除已选中元素的 --selected 修饰符
    const selectedItem = this.getSelectedItem()
    if (selectedItem) {
      selectedItem.className = 'slider__item'
    }

    // 给要切换到的目标元素添加上 --selected 修饰符
    const targetItem = this.items[idx]
    if (targetItem) {
      targetItem.className = 'slider__item--selected'
    }
  }

  slideNext() {
    const selectedItemIdx = this.getSelectedItemIndex()
    const nextIdx = (selectedItemIdx + 1) % this.items.length
    this.slideTo(nextIdx)
  }

  slidePrevious() {
    const selectedItemIdx = this.getSelectedItemIndex()
    // 加上 this.items.length 是为了防止 0 - 1 时变为负数
    const previousIdx =
      (this.items.length + selectedItemIdx - 1) % this.items.length
    this.slideTo(previousIdx)
  }
}

const slider = new Slider('slider')
setInterval(() => {
  slider.slideNext()
}, 1000)
```

## 使用自定义事件让控制条状态和轮播图同步

使用自定义事件，定义一个`slide`滑动事件，表示轮播图中的图片开始切换，通知相关状态发生变化

相关状态有：

- 底部控制条的相应项要添加`--selected`表示处于被选中状态

首先是轮播图切换的时候广播事件：

```JavaScript
// 使用自定义事件广播一个 `slide` 事件出去 通知相关状态发生变化
// 广播事件时携带的数据
const detail = { index: idx }
const event = new CustomEvent('slide', { bubbles: true, detail })
this.container.dispatchEvent(event)
```

然后涉及相关状态的地方添加对`slide`事件的监听，发生该事件时开始改变状态

现在就应该给底部控制条添加对`slide`事件的监听，将当前选中的控制条项的`--selected`移除
并从事件携带数据中获取到新的被选中轮播图下标，给相应的控制条项添加`--selected`修饰符

可以在构造函数中给容器添加`slide`事件的监听，当触发该事件时，将控制条的状态进行一个更新

```JavaScript
constructor(containerId) {
  this.container = document.getElementById(containerId)
  this.items = this.container.querySelectorAll(
    '.slider__item, .slider__item--selected'
  )

  const controller = this.container.querySelector('.slider__control')
  if (controller) {
    // 获取到所有的控制条项按钮
    const buttons = controller.querySelectorAll(
      '.slider__control-buttons, .slider__control-buttons--selected'
    )
    // 添加对 `slide` 事件的监听，修改控制条的状态
    this.container.addEventListener('slide', e => {
      // 从事件携带数据中获取到下一个轮播图下标
      const idx = e.detail.index
      // 获取到当前选中的控制条项
      const selected = controller.querySelector(
        '.slider__control-buttons--selected'
      )
      if (selected) {
        // 移除旧的选中项
        selected.className = 'slider__control-buttons'
      }
      // 给新的控制条项添加选中状态
      buttons[idx].className = 'slider__control-buttons--selected'
    })
  }
}
```

## 鼠标悬浮控制条项切换轮播图

同样是用事件的思路，鼠标悬浮时，会触发控制条项的`mouseover`事件，这时候就可以切换到对应的下标的轮播图

这个也同样是在构造函数中进行

```JavaScript
// 添加对 `mouseover` 事件的监听，鼠标悬浮在相应控制条项时会进行切换
// 利用事件捕获的原理对容器元素添加事件监听器而不是给每一个子元素添加事件监听器
controller.addEventListener('mouseover', e => {
  // e.target 就是触发事件的元素
  const idx = Array.from(buttons).indexOf(e.target)
  if (idx >= 0) {
    this.slideTo(idx)
    // 鼠标悬浮的时候不应该让轮播图继续自动切换
    this.stop()
  }
})

// 鼠标离开的时候 要让轮播图继续自动切换
controller.addEventListener('mouseout', () => {
  this.start()
})
```

## 左右切换按钮的点击事件监听

也是在构造函数中去添加事件监听器，注意在切换之前需要将自动切换轮播图关闭，因为可能
刚好是在切换的瞬间点击了切换按钮，这时候就会出现点击之后立刻跳到下一张轮播图的 bug

```JavaScript
// 左右两个切换按钮的切换逻辑
const previous = this.container.querySelector('.slider__previous')
if (previous) {
  previous.addEventListener('click', () => {
    this.stop()
    this.slidePrevious()
    this.start()
  })
}

const next = this.container.querySelector('.slider__next')
if (next) {
  next.addEventListener('click', () => {
    this.stop()
    this.slideNext()
    this.start()
  })
}
```

## 第一版小结

第一版的实现中，主要有以下几个特点：

- 使用`HTML`完成轮播图的结构
- 使用`CSS`完成轮播图的展现效果
- 使用`JavaScript`完成轮播图的逻辑行为，具体包括：
  - API 设计，实现基本的轮播图需要用到的 API
  - 使用`Event`控制流

# 第二版 -- 重构改进轮播图组件

目前我们的轮播图组件已经实现了基本的功能，但是现在我们需要考虑一下是否有可以重构的地方

其实是有的，目前我们的实现中，轮播图底部的控制条其实可以抽离出来，因为作为一个通用组件的话，
用户可能并不想显示底部的控制条，这时候我们就需要将控制条解耦，使用插件的机制将其插件化，
这样就可以在需要的时候通过开启插件的方式显示底部控制条

类似地，左右两侧的切换按钮也可以通过插件化的设计将它们和轮播图解耦，将使用的权力交给外界

## 插件化 -- 通过依赖注入的方式实现

主要做以下几件事：

- 将底部控制条插件化
- 将左右两侧切换按钮插件化
- 插件与组件之间通过`依赖注入`方式建立联系

目前我们对控制条的状态变更以及左右两侧按钮的功能实现都是在构造函数中完成的，这导致构造函数看起来十分臃肿

由于我们现在需要抽离它们，所以可以直接把它们抽离成一个函数，并将相关的`this`修改一下

```JavaScript
function pluginController(slider) {
  // 控制条相关状态变更
  const controller = slider.container.querySelector('.slider__control')
  if (controller) {
    // 获取到所有的控制条项按钮
    const buttons = controller.querySelectorAll(
      '.slider__control-buttons, .slider__control-buttons--selected'
    )

    // 添加对 `mouseover` 事件的监听，鼠标悬浮在相应控制条项时会进行切换
    // 利用事件捕获的原理对容器元素添加事件监听器而不是给每一个子元素添加事件监听器
    controller.addEventListener('mouseover', e => {
      // e.target 就是触发事件的元素
      const idx = Array.from(buttons).indexOf(e.target)
      if (idx >= 0) {
        slider.slideTo(idx)
        // 鼠标悬浮的时候不应该让轮播图继续自动切换
        slider.stop()
      }
    })

    // 鼠标离开的时候 要让轮播图继续自动切换
    controller.addEventListener('mouseout', () => {
      slider.start()
    })

    // 添加对 `slide` 事件的监听，修改控制条的状态
    slider.container.addEventListener('slide', e => {
      // 从事件携带数据中获取到下一个轮播图下标
      const idx = e.detail.index
      // 获取到当前选中的控制条项
      const selected = controller.querySelector(
        '.slider__control-buttons--selected'
      )
      if (selected) {
        // 移除旧的选中项
        selected.className = 'slider__control-buttons'
      }
      // 给新的控制条项添加选中状态
      buttons[idx].className = 'slider__control-buttons--selected'
    })
  }
}
```

就是把构造函数中的相关逻辑直接剪切到函数中，再把`this`改成参数中传入的`slider`对象即可

类似地，左右切换按钮的插件化重构也是一样的处理

```JavaScript
function pluginPrevious(slider) {
  const previous = slider.container.querySelector('.slider__previous')
  if (previous) {
    previous.addEventListener('click', () => {
      slider.stop()
      slider.slidePrevious()
      slider.start()
    })
  }
}

function pluginNext(slider) {
  const next = slider.container.querySelector('.slider__next')
  if (next) {
    next.addEventListener('click', () => {
      slider.stop()
      slider.slideNext()
      slider.start()
    })
  }
}
```

现在有了插件了，那么怎么给我们的`slider`对象开启插件呢？这就要再实现一个注册插件的方法了

```JavaScript
class Slider {
  // 插件注册
  registerPlugins(...plugins) {
    plugins.forEach(plugin => plugin(this))
  }
}
```

然后就可以调用该方法进行一个插件注册

```JavaScript
const slider = new Slider('slider', 1000)
slider.registerPlugins(pluginController, pluginPrevious, pluginNext)
slider.start()
```

## 模板化 -- 提高可扩展性

目前我们的轮播图组件中，图片是写死在`HTML`中的，如果想要更换图片或者添加图片还得去修改`HTML`

如果可以有一种机制，能够让图片由使用者自行决定就好了，这就需要将`HTML`模板化

首先我们的核心是轮播图的主体部分，所以先把这部分模板化

```JavaScript
class Slider {
  // 有多个参数的时候最好是将它们装到一个 `options` 对象中
  constructor(containerId, options = { images: [], cycle: 3000 }) {
    this.container = document.getElementById(containerId)
    this.options = options
    this.container.innterHTML = this.render()
    this.items = this.container.querySelectorAll(
      '.slider__item, .slider__item--selected'
    )
    // 多久切换到下一张轮播图
    this.cycle = cycle
    this.slideTo(0)
  }

  render() {
    const images = this.options.images
    const content = images.map(image =>
      `
        <li class="slider__item">
          <img src="${image}" alt="image" />
        </li>
      `.trim()
    )

    return `<ul>${content.join('')}</ul>`
  }
}
```

或许你会问，这样一来的话，那还有底部控制条以及两侧的切换按钮的`HTML`该咋办呢？

由于它们是作为插件存在的，那么理应将对应的模板渲染放到插件中去实现，如果也在类的`render`
方法中实现的话，就会出现当用户没有开启对应插件时，也会有对应的`HTML`显示，但这显然不是用户希望出现的

所以现在就到对应插件中实现，由于现在插件不仅要负责逻辑实现，还要负责`HTML`的模板渲染，所以我们需要修改一下
插件的结构，将插件从原来的函数类型转成对象类型，逻辑部分放到`action`属性中实现，而`HTML`模板相关部分则放到
`render`属性中实现

```JavaScript
const pluginController = {
  render(images) {
    return `
      <div class="slider__control">
        ${images
          .map(
            (image, i) => `
            <span class="slider__control-buttons${
              i === 0 ? '--selected' : ''
            }"></span>
          `
          )
          .join('')}
      </div>
    `.trim()
  },
  action(slider) {
    // 控制条相关状态变更
    const controller = slider.container.querySelector('.slider__control')
    if (controller) {
      // 获取到所有的控制条项按钮
      const buttons = controller.querySelectorAll(
        '.slider__control-buttons, .slider__control-buttons--selected'
      )

      // 添加对 `mouseover` 事件的监听，鼠标悬浮在相应控制条项时会进行切换
      // 利用事件捕获的原理对容器元素添加事件监听器而不是给每一个子元素添加事件监听器
      controller.addEventListener('mouseover', e => {
        // e.target 就是触发事件的元素
        const idx = Array.from(buttons).indexOf(e.target)
        if (idx >= 0) {
          slider.slideTo(idx)
          // 鼠标悬浮的时候不应该让轮播图继续自动切换
          slider.stop()
        }
      })

      // 鼠标离开的时候 要让轮播图继续自动切换
      controller.addEventListener('mouseout', () => {
        slider.start()
      })

      // 添加对 `slide` 事件的监听，修改控制条的状态
      slider.container.addEventListener('slide', e => {
        // 从事件携带数据中获取到下一个轮播图下标
        const idx = e.detail.index
        // 获取到当前选中的控制条项
        const selected = controller.querySelector(
          '.slider__control-buttons--selected'
        )
        if (selected) {
          // 移除旧的选中项
          selected.className = 'slider__control-buttons'
        }
        // 给新的控制条项添加选中状态
        buttons[idx].className = 'slider__control-buttons--selected'
      })
    }
  }
}
```

```JavaScript
const pluginPrevious = {
  render() {
    return `<a class="slider__previous"></a>`
  },
  action(slider) {
    const previous = slider.container.querySelector('.slider__previous')
    if (previous) {
      previous.addEventListener('click', () => {
        slider.stop()
        slider.slidePrevious()
        slider.start()
      })
    }
  }
}
```

```JavaScript
const pluginNext = {
  render() {
    return `<a class="slider__next"></a>`
  },
  action(slider) {
    const next = slider.container.querySelector('.slider__next')
    if (next) {
      next.addEventListener('click', () => {
        slider.stop()
        slider.slideNext()
        slider.start()
      })
    }
  }
}
```

这样一来，我们的`HTML`结构就变得特别简单了，只需要保留一个容器元素

```html
<div id="slider" class="slider-container"></div>
```

插件由函数变成了对象，我们的注册组件方法`registerPlugins`的实现也需要发生变化

```JavaScript
class Slider {
  registerPlugins(...plugins) {
    plugins.forEach(plugin => {
      // 处理插件的视图
      const pluginContainer = document.createElement('div')
      // 为了语义化 添加一个类名表明该结点来自插件
      pluginController.className = '.slider__plugin'
      pluginContainer.innerHTML = plugin.render(this.options.images)
      this.container.appendChild(pluginContainer)

      // 处理插件的逻辑
      plugin.action(this)
    })
  }
}
```

# 第三版 -- 抽象成组件框架

无论是`Slider`还是它的相关插件，都可以抽象成组件类型

```JavaScript
class Component {
  constructor(containerId, options = { name, data: [] }) {
    this.container = document.getElementById(containerId)
    this.options = options
    this.container.innerHTML = this.render(options.data)
  }

  // 插件注册
  registerPlugins(...plugins) {
    plugins.forEach(plugin => {
      // 处理插件的视图
      const pluginContainer = document.createElement('div')
      // 为了语义化 添加一个类名表明该结点来自插件
      pluginController.className = '.slider__plugin'
      pluginContainer.innerHTML = plugin.render(this.options.data)
      this.container.appendChild(pluginContainer)

      // 处理插件的逻辑
      plugin.action(this)
    })
  }

  render() {
    /* abstract */
    return ''
  }
}
```

然后`Slider`作为子类去继承`Component`

```JavaScript
class Slider extends Component {
  // 有多个参数的时候最好是将它们装到一个 `options` 对象中
  constructor(containerId, options = { images: [], cycle: 3000 }) {
    super(containerId, options)
    this.items = this.container.querySelectorAll(
      '.slider__item, .slider__item--selected'
    )
    // 多久切换到下一张轮播图
    this.cycle = options.cycle || 3000
    this.slideTo(0)
  }

  render(data) {
    const content = data.map(image =>
      `
        <li class="slider__item">
          <img src="${image}" alt="image" />
        </li>
      `.trim()
    )

    return `<ul>${content.join('')}</ul>`
  }

  getSelectedItem() {
    const selected = this.container.querySelector('.slider__item--selected')
    return selected
  }

  getSelectedItemIndex() {
    return Array.from(this.items).indexOf(this.getSelectedItem())
  }

  slideTo(idx) {
    // 清除已选中元素的 --selected 修饰符
    const selectedItem = this.getSelectedItem()
    if (selectedItem) {
      selectedItem.className = 'slider__item'
    }

    // 给要切换到的目标元素添加上 --selected 修饰符
    const targetItem = this.items[idx]
    if (targetItem) {
      targetItem.className = 'slider__item--selected'
    }

    // 使用自定义事件广播一个 `slide` 事件出去 通知相关状态发生变化
    // 广播事件时携带的数据
    const detail = { index: idx }
    const event = new CustomEvent('slide', { bubbles: true, detail })
    this.container.dispatchEvent(event)
  }

  slideNext() {
    const selectedItemIdx = this.getSelectedItemIndex()
    const nextIdx = (selectedItemIdx + 1) % this.items.length
    this.slideTo(nextIdx)
  }

  slidePrevious() {
    const selectedItemIdx = this.getSelectedItemIndex()
    // 加上 this.items.length 是为了防止 0 - 1 时变为负数
    const previousIdx =
      (this.items.length + selectedItemIdx - 1) % this.items.length
    this.slideTo(previousIdx)
  }

  start() {
    // 要先让已经在运行的定时器停止 否则会开启多个定时器
    this.stop()
    this._timer = setInterval(() => this.slideNext(), this.cycle)
  }

  stop() {
    clearInterval(this._timer)
  }
}
```

这样抽象之后，我们可以继续实现别的组件，进一步提高抽象程度
