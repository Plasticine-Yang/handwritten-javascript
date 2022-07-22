import { bubbleSort, quickSort } from '../src'

describe('sort', () => {
  let arr: number[]

  beforeEach(() => {
    arr = [5, 7, 8, 13, 2, 1, 7, 9]
  })

  test('quickSort', () => {
    quickSort(arr)
    expect(arr).toEqual([1, 2, 5, 7, 7, 8, 9, 13])
  })

  test('bubbleSort', () => {
    bubbleSort(arr)
    expect(arr).toEqual([1, 2, 5, 7, 7, 8, 9, 13])
  })
})
