import {
  Controller,
  type Control,
  type ControllerRenderProps,
  type FieldPath,
  type FieldValues
} from 'react-hook-form'

import { Field, FieldError, FieldLabel } from '@/components/ui/field'

type FormFieldProps<T extends FieldValues, N extends FieldPath<T>> = {
  control: Control<T>
  name: N
  label: string
  children: (
    field: ControllerRenderProps<T, N> & { id: string; 'aria-invalid': boolean }
  ) => React.ReactNode
}

export const FormField = <T extends FieldValues, N extends FieldPath<T>>({
  control,
  name,
  label,
  children
}: FormFieldProps<T, N>) => (
  <Controller
    control={control}
    name={name}
    render={({ field, fieldState }) => (
      <Field data-invalid={fieldState.invalid || undefined}>
        <FieldLabel htmlFor={name}>{label}</FieldLabel>
        {children({ ...field, id: name, 'aria-invalid': fieldState.invalid })}
        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
      </Field>
    )}
  />
)
