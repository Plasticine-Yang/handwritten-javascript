export default function quickSort(arr: number[]) {
  const sort = (arr: number[], lo: number, hi: number): void => {
    // base case
    if (lo >= hi) return

    // 分区找出 pivot 下标
    const p = partition(arr, lo, hi)

    // 将 pivot 左右两部分分别排序
    sort(arr, lo, p - 1)
    sort(arr, p + 1, hi)
  }

  const partition = (arr: number[], lo: number, hi: number): number => {
    // 以数组第一个元素作为哨兵
    const pivot = arr[lo]
    let i = lo + 1
    let j = hi

    while (i <= j) {
      // 让 i 前进到比 pivot 大的元素那里
      // 保证 i 走过的元素都比 pivot 小
      while (i < hi && arr[i] < pivot) i++
      // 同理，让 j 前进到比 pivot 小的元素那里
      // 保证 j 走过的元素都比 pivot 大
      while (j > lo && arr[j] > pivot) j--

      // 如果 i 超过了 j，那么应当跳出循环
      // 不跳出的话 会将 i j 交换，导致已经确认的大小关系被破坏
      if (i >= j) break

      // 交换 i j，保证 i 以及 i 右边的元素都是比 pivot 大
      // j 以及 j 左边的元素都是比 pivot 小
      swap(arr, i, j)
    }

    // 循环出来之后 此时 i 以及 i 右边的元素都比 pivot 大
    // j 以及 j 左边的元素都比 pivot 小
    // 只需要将 pivot 和 j 交换，这样一一来
    // pivot 左边的元素都比 pivot 小
    // pivot 右边的元素都比 pivot 大
    // 由于一开始 pivot 取的就是 arr[lo] 所以这里需要交换的是 lo 和 j
    swap(arr, lo, j)

    // 最终 j 就是 pivot 放到正确位置后的下标
    return j
  }

  const swap = (arr: number[], i: number, j: number) => {
    const temp = arr[i]
    arr[i] = arr[j]
    arr[j] = temp
  }

  sort(arr, 0, arr.length - 1)
}
