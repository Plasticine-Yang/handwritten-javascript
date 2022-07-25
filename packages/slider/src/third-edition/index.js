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

// 开启底部控制条插件
const pluginController = {
  render(images) {
    return `
      <div class="slider__control">
        ${images
          .map(
            (_, i) => `
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

const slider = new Slider('slider', {
  name: 'slider',
  data: [
    'https://p5.ssl.qhimg.com/t0119c74624763dd070.png',
    'https://p4.ssl.qhimg.com/t01adbe3351db853eb3.jpg',
    'https://p2.ssl.qhimg.com/t01645cd5ba0c3b60cb.jpg',
    'https://p4.ssl.qhimg.com/t01331ac159b58f5478.jpg'
  ],
  cycle: 1000
})
slider.registerPlugins(pluginController, pluginPrevious, pluginNext)
slider.start()
