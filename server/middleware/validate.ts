import { Request, Response, NextFunction } from 'express';
import { ValidationError } from './errorHandler.ts';

export type ValidationRule = {
  field: string;
  location?: 'body' | 'query' | 'params';
  required?: boolean;
  type?: 'string' | 'number' | 'boolean' | 'array' | 'object';
  enum?: string[];
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any, req: Request) => boolean | string | Promise<boolean | string>;
  message?: string;
};

export function validate(rules: ValidationRule[]) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const errors: { field: string; message: string; location: string }[] = [];

    for (const rule of rules) {
      const location = rule.location || 'body';
      const source = req[location] as Record<string, any> || {};
      const value = source[rule.field];

      // Required check
      if (rule.required && (value === undefined || value === null || value === '')) {
        errors.push({
          field: rule.field,
          message: rule.message || `${rule.field} is required in ${location}`,
          location,
        });
        continue;
      }

      // If optional and not provided, skip further checks
      if (value === undefined || value === null || value === '') {
        continue;
      }

      // Type check
      if (rule.type) {
        if (rule.type === 'array') {
          if (!Array.isArray(value)) {
            errors.push({
              field: rule.field,
              message: rule.message || `${rule.field} must be an array`,
              location,
            });
            continue;
          }
        } else if (rule.type === 'number') {
          const num = Number(value);
          if (isNaN(num)) {
            errors.push({
              field: rule.field,
              message: rule.message || `${rule.field} must be a valid number`,
              location,
            });
            continue;
          }
        } else if (typeof value !== rule.type) {
          errors.push({
            field: rule.field,
            message: rule.message || `${rule.field} must be of type ${rule.type}`,
            location,
          });
          continue;
        }
      }

      // Enum check
      if (rule.enum && !rule.enum.includes(value)) {
        errors.push({
          field: rule.field,
          message: rule.message || `${rule.field} must be one of: ${rule.enum.join(', ')}`,
          location,
        });
        continue;
      }

      // String length check
      if (typeof value === 'string') {
        if (rule.minLength !== undefined && value.length < rule.minLength) {
          errors.push({
            field: rule.field,
            message: rule.message || `${rule.field} must be at least ${rule.minLength} characters long`,
            location,
          });
          continue;
        }
        if (rule.maxLength !== undefined && value.length > rule.maxLength) {
          errors.push({
            field: rule.field,
            message: rule.message || `${rule.field} must not exceed ${rule.maxLength} characters`,
            location,
          });
          continue;
        }
        if (rule.pattern && !rule.pattern.test(value)) {
          errors.push({
            field: rule.field,
            message: rule.message || `${rule.field} format is invalid`,
            location,
          });
          continue;
        }
      }

      // Numeric bounds check
      if (typeof value === 'number' || (rule.type === 'number' && !isNaN(Number(value)))) {
        const num = Number(value);
        if (rule.min !== undefined && num < rule.min) {
          errors.push({
            field: rule.field,
            message: rule.message || `${rule.field} must be at least ${rule.min}`,
            location,
          });
          continue;
        }
        if (rule.max !== undefined && num > rule.max) {
          errors.push({
            field: rule.field,
            message: rule.message || `${rule.field} must not exceed ${rule.max}`,
            location,
          });
          continue;
        }
      }

      // Custom check
      if (rule.custom) {
        try {
          const result = await rule.custom(value, req);
          if (result !== true) {
            errors.push({
              field: rule.field,
              message: typeof result === 'string' ? result : (rule.message || `${rule.field} is invalid`),
              location,
            });
          }
        } catch (err: any) {
          errors.push({
            field: rule.field,
            message: err.message || `${rule.field} custom validation failed`,
            location,
          });
        }
      }
    }

    if (errors.length > 0) {
      return next(new ValidationError('One or more validation constraints failed', errors));
    }

    next();
  };
}
