import * as z from 'zod/mini'

export const RequiredStringSchema = z
  .string({ error: "Обов'язкове поле" })
  .check(z.minLength(1, { error: "Обов'язкове поле" }), z.trim())

export const EmailSchema = z
  .email({ error: 'Невірний email' })
  .check(z.minLength(1, { error: "Обов'язкове поле" }), z.trim())

export const PasswordSchema = RequiredStringSchema.check(
  z.minLength(8, { error: 'Мінімум 8 символів' }),
  z.maxLength(64, { error: 'Максимум 64 символи' })
)
