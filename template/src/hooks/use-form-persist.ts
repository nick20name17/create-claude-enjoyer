import { useEffect, useRef } from 'react'
import type { FieldValues, UseFormReturn } from 'react-hook-form'
import { useDebouncedCallback } from 'use-debounce'

import type { FormDraftKey } from '@/constants/form-drafts'
import { formDraftStorageKey } from '@/helpers/form-drafts'

const isFileLike = (v: unknown) =>
  (typeof File !== 'undefined' && v instanceof File) ||
  (typeof Blob !== 'undefined' && v instanceof Blob) ||
  (typeof FileList !== 'undefined' && v instanceof FileList)

const stripFiles = (value: unknown): unknown => {
  if (isFileLike(value)) return undefined
  if (Array.isArray(value)) return value.map(stripFiles).filter(v => v !== undefined)
  if (value && typeof value === 'object') {
    const out: Record<string, unknown> = {}
    for (const [k, v] of Object.entries(value)) {
      const next = stripFiles(v)
      if (next !== undefined) out[k] = next
    }
    return out
  }
  return value
}

interface Options {
  enabled?: boolean
  debounceMs?: number
}

export const useFormPersist = <T extends FieldValues>(
  key: FormDraftKey,
  form: UseFormReturn<T>,
  { enabled = true, debounceMs = 300 }: Options = {}
) => {
  const lastSerializedRef = useRef<string | null>(null)

  const write = useDebouncedCallback((values: unknown) => {
    try {
      const json = JSON.stringify(stripFiles(values))
      if (json === lastSerializedRef.current) return
      lastSerializedRef.current = json
      window.localStorage.setItem(formDraftStorageKey(key), json)
    } catch {
      /* noop */
    }
  }, debounceMs)

  useEffect(() => {
    if (!enabled) return () => {}
    try {
      const raw = window.localStorage.getItem(formDraftStorageKey(key))
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<T>
        const merged = { ...form.getValues(), ...parsed }
        lastSerializedRef.current = JSON.stringify(stripFiles(merged))
        form.reset(merged)
      }
    } catch {
      /* noop */
    }

    const sub = form.watch(values => write(values))
    return () => {
      sub.unsubscribe()
      write.cancel()
    }
  }, [enabled, key, form, write])
}
