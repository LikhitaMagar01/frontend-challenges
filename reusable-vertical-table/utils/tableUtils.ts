import { desserts } from '~/data/foodData'
import type { LoadDataParams, LoadDataResult } from '~/types'

export const loadData = async ({ page, itemsPerPage, sortBy, search }: LoadDataParams): Promise<LoadDataResult> => {
  try {
    await new Promise(resolve => setTimeout(resolve, 500))
    const start = (page - 1) * itemsPerPage
    const end = start + itemsPerPage
    let items = desserts.slice()
    if (search) {
      items = items.filter(item => item.name.toLowerCase().includes(search.toLowerCase()))
    }
    if (sortBy.length) {
      const sortKey = sortBy[0].key
      const sortOrder = sortBy[0].order
      items.sort((a, b) => {
        const aValue = a[sortKey]
        const bValue = b[sortKey]
        return sortOrder === 'desc' ? bValue - aValue : aValue - bValue
      })
    }
    const paginated = items.slice(start, end === -1 ? undefined : end)
    return { items: paginated, total: items.length }
  } catch (error) {
    console.error('Error in loadData:', error)
    throw error
  }
}
