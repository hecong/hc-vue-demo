import { ref, reactive } from 'vue'

export interface UseDialogOptions {
  addTitle?: string
  editTitle?: string
}

export function useDialog<T extends object>(
  submitFn: (data: T, isEdit: boolean, editId?: number | string) => Promise<void>,
  defaultForm: T,
  options: UseDialogOptions = {}
) {
  const { addTitle = '添加', editTitle = '编辑' } = options

  const visible = ref(false)
  const title = ref('')
  const isEdit = ref(false)
  const editId = ref<number | string | undefined>(undefined)
  const submitting = ref(false)

  const formData = reactive<T>({ ...defaultForm })

  function openAdd() {
    isEdit.value = false
    editId.value = undefined
    title.value = addTitle
    Object.assign(formData, defaultForm)
    visible.value = true
  }

  function openEdit(row: T & { id?: number | string }) {
    isEdit.value = true
    editId.value = row.id
    title.value = editTitle
    const rowWithoutId = { ...row as Record<string, unknown> }
    delete rowWithoutId.id
    Object.assign(formData, { ...defaultForm, ...rowWithoutId })
    visible.value = true
  }

  async function handleSubmit(validateFn?: () => Promise<boolean>) {
    if (validateFn) {
      const valid = await validateFn().catch(() => false)
      if (!valid) return
    }

    submitting.value = true
    try {
      await submitFn(formData as T, isEdit.value, editId.value)
      visible.value = false
    } catch {
      // ignore - 由调用方或全局拦截器处理错误
    } finally {
      submitting.value = false
    }
  }

  function close() {
    visible.value = false
  }

  return {
    visible,
    title,
    isEdit,
    editId,
    submitting,
    formData,
    openAdd,
    openEdit,
    handleSubmit,
    close
  }
}
