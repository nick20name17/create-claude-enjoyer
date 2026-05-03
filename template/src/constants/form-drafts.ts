export const FORM_DRAFT_PREFIX = 'form-draft:'

export const FORM_DRAFT_KEYS = {} as const

export type FormDraftKey = (typeof FORM_DRAFT_KEYS)[keyof typeof FORM_DRAFT_KEYS]
