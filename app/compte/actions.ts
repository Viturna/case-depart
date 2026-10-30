'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

async function getOrigin() {
  const h = await headers();
  return h.get('origin') || `https://${h.get('host')}`;
}

function safeNext(value: FormDataEntryValue | null): string {
  const next = typeof value === 'string' ? value : '';
  return next.startsWith('/') && !next.startsWith('//') ? next : '/compte';
}

export async function signUpAction(formData: FormData) {
  const email = String(formData.get('email') || '').trim();
  const password = String(formData.get('password') || '');
  const nom = String(formData.get('nom') || '').trim();

  if (!email || password.length < 8) {
    return { error: 'E-mail invalide ou mot de passe trop court (8 caractères minimum).' };
  }

  const supabase = await createClient();
  const origin = await getOrigin();

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { nom },
      emailRedirectTo: `${origin}/auth/callback?next=/compte`,
    },
  });

  if (error) {
    return { error: error.message };
  }

  return { success: 'Compte créé. Vérifie ta boîte mail pour confirmer ton adresse.' };
}

export async function signInAction(formData: FormData) {
  const email = String(formData.get('email') || '').trim();
  const password = String(formData.get('password') || '');
  const next = safeNext(formData.get('next'));

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: 'E-mail ou mot de passe incorrect.' };
  }

  redirect(next);
}

export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/');
}

export async function requestPasswordResetAction(formData: FormData) {
  const email = String(formData.get('email') || '').trim();
  const supabase = await createClient();
  const origin = await getOrigin();

  if (email) {
    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${origin}/auth/callback?next=/compte/reinitialiser`,
    });
  }

  // Message identique que l'e-mail existe ou non : évite de révéler qui a un compte.
  return { success: 'Si un compte existe avec cette adresse, un e-mail de réinitialisation vient d\'être envoyé.' };
}

export async function updatePasswordAfterResetAction(formData: FormData) {
  const password = String(formData.get('password') || '');
  const confirmation = String(formData.get('confirmation') || '');

  if (password.length < 8) {
    return { error: 'Le mot de passe doit contenir au moins 8 caractères.' };
  }
  if (password !== confirmation) {
    return { error: 'Les deux mots de passe ne correspondent pas.' };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: 'Lien expiré. Referais une demande de réinitialisation.' };
  }

  const { error } = await supabase.auth.updateUser({ password });
  if (error) {
    return { error: error.message };
  }

  redirect('/compte?motdepasse=modifie');
}

export async function updateProfileAction(formData: FormData) {
  const nom = String(formData.get('nom') || '').trim();

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: 'Session expirée.' };
  }

  const { error } = await supabase.from('profiles').update({ nom }).eq('id', user.id);
  if (error) {
    return { error: 'Impossible de mettre à jour le profil.' };
  }

  await supabase.auth.updateUser({ data: { nom } });

  revalidatePath('/compte');
  return { success: 'Profil mis à jour.' };
}

export async function changePasswordAction(formData: FormData) {
  const currentPassword = String(formData.get('currentPassword') || '');
  const newPassword = String(formData.get('newPassword') || '');
  const confirmation = String(formData.get('confirmation') || '');

  if (newPassword.length < 8) {
    return { error: 'Le nouveau mot de passe doit contenir au moins 8 caractères.' };
  }
  if (newPassword !== confirmation) {
    return { error: 'Les deux mots de passe ne correspondent pas.' };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) {
    return { error: 'Session expirée.' };
  }

  // Revérifie le mot de passe actuel avant d'accepter le changement.
  const { error: verifyError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: currentPassword,
  });
  if (verifyError) {
    return { error: 'Mot de passe actuel incorrect.' };
  }

  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) {
    return { error: error.message };
  }

  return { success: 'Mot de passe modifié.' };
}

export async function deleteAccountAction(formData: FormData) {
  const password = String(formData.get('password') || '');
  const confirmation = String(formData.get('confirmation') || '');

  if (confirmation !== 'SUPPRIMER') {
    return { error: 'Tape SUPPRIMER pour confirmer.' };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) {
    return { error: 'Session expirée.' };
  }

  const { error: verifyError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password,
  });
  if (verifyError) {
    return { error: 'Mot de passe incorrect.' };
  }

  const admin = createAdminClient();
  const { error } = await admin.auth.admin.deleteUser(user.id);
  if (error) {
    return { error: 'La suppression a échoué. Réessaie ou contacte-nous.' };
  }

  await supabase.auth.signOut();
  redirect('/?compte=supprime');
}
