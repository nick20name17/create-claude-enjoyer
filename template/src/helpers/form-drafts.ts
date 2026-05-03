import { FORM_DRAFT_PREFIX, type FormDraftKey } from '@/constants/form-drafts'

export const formDraftStorageKey = (key: FormDraftKey) => `${FORM_DRAFT_PREFIX}${key}`

export const clearFormDraft = (key: FormDraftKey) => {
  try {
    window.localStorage.removeItem(formDraftStorageKey(key))
  } catch {
    /* noop */
  }
}

export const clearAllFormDrafts = () => {
  try {
    for (let i = window.localStorage.length - 1; i >= 0; i--) {
      const k = window.localStorage.key(i)
      if (k?.startsWith(FORM_DRAFT_PREFIX)) window.localStorage.removeItem(k)
    }
  } catch {
    /* noop */
  }
}
