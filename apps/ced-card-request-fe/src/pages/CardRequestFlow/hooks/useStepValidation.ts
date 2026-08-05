import { useState } from 'react';
import type { NuovaDomandaInBozzaRequest } from '../../../core/api/generated/model';

type RequestField = keyof NuovaDomandaInBozzaRequest;

export type ValidationRules = {
  required?: boolean;
  maxLength?: number;
  pattern?: RegExp;
  patternMessage?: string;
};

export type ValidatableField = ValidationRules & {
  field: RequestField;
  value: string;
};

export type FieldErrors = Partial<Record<RequestField, string>>;

const getFieldError = ({
  value,
  required,
  maxLength,
  pattern,
  patternMessage,
}: ValidatableField) => {
  const trimmed = value.trim();

  if (!trimmed) return required ? 'Campo obbligatorio' : undefined;
  if (maxLength && trimmed.length > maxLength) {
    return `Massimo ${maxLength} caratteri`;
  }
  if (pattern && !pattern.test(trimmed)) {
    return patternMessage ?? 'Formato non valido';
  }

  return undefined;
};

export const useStepValidation = (fields: ValidatableField[]) => {
  const [errors, setErrors] = useState<FieldErrors>({});

  const resetFieldError = (field: RequestField) => {
    setErrors((prev) => (prev[field] ? { ...prev, [field]: undefined } : prev));
  };

  const validate = () => {
    const newErrors: FieldErrors = {};

    for (const item of fields) {
      const error = getFieldError(item);
      if (error) {
        newErrors[item.field] = error;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  return { errors, validate, resetFieldError };
};
