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
