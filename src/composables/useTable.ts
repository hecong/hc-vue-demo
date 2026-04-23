import { ref, onMounted } from 'vue'

export interface PageResult<T> {
  list: T[]
  total: number
}

export interface UseTableOptions {
  immediate?: boolean
  defaultPageSize?: number
  pageSizes?: number[]
  loadingDelay?: number
}

function isPageResult<T>(val: unknown): val is PageResult<T> {
  return val !== null && typeof val === 'object' && 'list' in val && 'total' in val
}

export function useTable<T, SearchParams extends object = Record<string, unknown>>(
  fetchFn: (params: SearchParams & { pageNum: number; pageSize: number }) => Promise<PageResult<T> | T[] | undefined | null>,
  defaultSearchParams: SearchParams,
  options: UseTableOptions = {}
) {
  const {
    immediate = true,
    defaultPageSize = 10,
    pageSizes = [10, 20, 50, 100],
    loadingDelay = 300
  } = options

  const loading = ref(false)
  const tableData = ref<T[]>([])
  const total = ref(0)
  const pageNum = ref(1)
  const pageSize = ref(defaultPageSize)

  const searchParams = ref<SearchParams>({ ...defaultSearchParams } as SearchParams)

  async function fetchData() {
    let loadingTimer: ReturnType<typeof setTimeout> | null = null
    try {
      loadingTimer = setTimeout(() => {
        loading.value = true
      }, loadingDelay)

      const res = await fetchFn({
        ...searchParams.value,
        pageNum: pageNum.value,
        pageSize: pageSize.value
      } as SearchParams & { pageNum: number; pageSize: number })

      if (res) {
        if (isPageResult<T>(res)) {
          tableData.value = res.list
          total.value = res.total
        } else if (Array.isArray(res)) {
          tableData.value = res
          total.value = res.length
        }
      }
    } catch {
      // ignore - 由调用方或全局拦截器处理错误
    } finally {
      if (loadingTimer) clearTimeout(loadingTimer)
      loading.value = false
    }
  }

  function handleSearch() {
    pageNum.value = 1
    return fetchData()
  }

  function handleReset() {
    searchParams.value = { ...defaultSearchParams } as SearchParams
    return handleSearch()
  }

  function handlePageChange(page: number) {
    pageNum.value = page
    return fetchData()
  }

  function handleSizeChange(size: number) {
    pageSize.value = size
    pageNum.value = 1
    return fetchData()
  }

  if (immediate) {
    onMounted(fetchData)
  }

  return {
    loading,
    tableData,
    total,
    pageNum,
    pageSize,
    pageSizes,
    searchParams,
    fetchData,
    handleSearch,
    handleReset,
    handlePageChange,
    handleSizeChange
  }
}
