import {
  bubbleSort,
  insertSort,
  mergeSort,
  quickSort,
  selectionSort
} from '../src'

describe('sort', () => {
  let arr: number[]

  beforeEach(() => {
    arr = [5, 7, 8, 13, 2, 1, 7, 9]
  })

  afterEach(() => {
    expect(arr).toEqual([1, 2, 5, 7, 7, 8, 9, 13])
  })

  test('quickSort', () => {
    quickSort(arr)
  })

  test('bubbleSort', () => {
    bubbleSort(arr)
  })

  test('selectionSort', () => {
    selectionSort(arr)
  })

  test('insertSort', () => {
    insertSort(arr)
  })

  test('mergeSort', () => {
    arr = mergeSort(arr)
  })
})
