class Slider {
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
}

const slider = new Slider('slider')
setInterval(() => {
  slider.slideNext()
}, 1000)
