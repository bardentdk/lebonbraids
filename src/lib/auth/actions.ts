'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import {
  loginSchema,
  registerSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  type LoginInput,
  type RegisterInput,
  type ForgotPasswordInput,
  type ResetPasswordInput,
} from './validators';

export type ActionResult =
  | { success: true; message?: string; redirectTo?: string }
  | { success: false; error: string; fieldErrors?: Record<string, string> };

// =============================================
// LOGIN
// =============================================
export async function loginAction(data: LoginInput): Promise<ActionResult> {
  const parsed = loginSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      error: 'Données invalides',
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string>,
    };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    let errorMessage = "Impossible de se connecter";
    if (error.message.includes('Invalid login credentials')) {
      errorMessage = 'Email ou mot de passe incorrect';
    } else if (error.message.includes('Email not confirmed')) {
      errorMessage = 'Merci de confirmer votre email avant de vous connecter';
    }
    return { success: false, error: errorMessage };
  }

  // Détermine la redirection selon le rôle
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let redirectTo = '/';
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role === 'admin' || profile?.role === 'staff') {
      redirectTo = '/admin';
    } else {
      redirectTo = '/';
    }
  }

  revalidatePath('/', 'layout');
  return { success: true, message: 'Connexion réussie', redirectTo };
}

// =============================================
// REGISTER
// =============================================
export async function registerAction(data: RegisterInput): Promise<ActionResult> {
  const parsed = registerSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      error: 'Données invalides',
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string>,
    };
  }

  const supabase = await createClient();

  const { data: authData, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: {
        first_name: parsed.data.firstName,
        last_name: parsed.data.lastName,
        phone: parsed.data.phone || null,
      },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/api/auth/callback`,
    },
  });

  if (error) {
    let errorMessage = "Impossible de créer le compte";
    if (error.message.includes('already registered')) {
      errorMessage = 'Un compte existe déjà avec cet email';
    }
    return { success: false, error: errorMessage };
  }

  // Mise à jour du consentement marketing
  if (authData.user && parsed.data.marketingConsent) {
    await supabase
      .from('profiles')
      .update({ marketing_consent: true })
      .eq('id', authData.user.id);
  }

  // Si la confirmation email est activée → redirige vers verify-email
  if (authData.user && !authData.session) {
    return {
      success: true,
      message: 'Compte créé ! Vérifie ta boîte mail pour confirmer.',
      redirectTo: `/verify-email?email=${encodeURIComponent(parsed.data.email)}`,
    };
  }

  revalidatePath('/', 'layout');
  return {
    success: true,
    message: 'Bienvenue ! Ton compte a été créé.',
    redirectTo: '/',
  };
}

// =============================================
// FORGOT PASSWORD
// =============================================
export async function forgotPasswordAction(
  data: ForgotPasswordInput
): Promise<ActionResult> {
  const parsed = forgotPasswordSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      error: 'Email invalide',
    };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/reset-password`,
  });

  if (error) {
    return { success: false, error: "Impossible d'envoyer l'email" };
  }

  return {
    success: true,
    message: 'Si un compte existe, un email a été envoyé.',
  };
}

// =============================================
// RESET PASSWORD
// =============================================
export async function resetPasswordAction(
  data: ResetPasswordInput
): Promise<ActionResult> {
  const parsed = resetPasswordSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      error: 'Données invalides',
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string>,
    };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.updateUser({
    password: parsed.data.password,
  });

  if (error) {
    return { success: false, error: 'Impossible de mettre à jour le mot de passe' };
  }

  revalidatePath('/', 'layout');
  return {
    success: true,
    message: 'Mot de passe mis à jour !',
    redirectTo: '/login',
  };
}

// =============================================
// SIGN OUT
// =============================================
export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath('/', 'layout');
  redirect('/login');
}