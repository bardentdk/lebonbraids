import { z } from 'zod';

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email requis')
    .email('Email invalide'),
  password: z.string().min(1, 'Mot de passe requis'),
  remember: z.boolean().optional(),
});

export const registerSchema = z
  .object({
    firstName: z
      .string()
      .min(2, 'Prénom trop court')
      .max(50, 'Prénom trop long'),
    lastName: z
      .string()
      .min(2, 'Nom trop court')
      .max(50, 'Nom trop long'),
    email: z
      .string()
      .min(1, 'Email requis')
      .email('Email invalide'),
    phone: z
      .string()
      .min(10, 'Téléphone invalide')
      .regex(/^[\d\s+().-]+$/, 'Format invalide')
      .optional()
      .or(z.literal('')),
    password: z
      .string()
      .min(8, 'Minimum 8 caractères')
      .regex(/[A-Z]/, 'Au moins une majuscule')
      .regex(/[0-9]/, 'Au moins un chiffre'),
    confirmPassword: z.string(),
    // acceptTerms: z.literal(true, {
    //   errorMap: () => ({ message: 'Vous devez accepter les conditions' }),
    // }),
    acceptTerms: z.literal(true, {
      message: 'Vous devez accepter les conditions',
    }),
    marketingConsent: z.boolean().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Les mots de passe ne correspondent pas',
    path: ['confirmPassword'],
  });

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, 'Email requis')
    .email('Email invalide'),
});

export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, 'Minimum 8 caractères')
      .regex(/[A-Z]/, 'Au moins une majuscule')
      .regex(/[0-9]/, 'Au moins un chiffre'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Les mots de passe ne correspondent pas',
    path: ['confirmPassword'],
  });

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;