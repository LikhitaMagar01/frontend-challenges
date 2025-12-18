export interface Header {
  title: string
  key: string
  type?: string
  display?: 'text' | 'checkbox' | 'datepicker'
}

export interface Item {
  [key: string]: any
}

export interface LoadDataParams {
  page: number
  itemsPerPage: number
  sortBy: any[]
  search?: string
}

export interface LoadDataResult {
  items: Item[]
  total: number
}
