'use server';

import { cookies } from 'next/headers';

export async function loginAdmin(formData: FormData) {
  const password = formData.get('password');

  if (password !== process.env.ADMIN_PASSWORD) {
    return { ok: false };
  }

  cookies().set('admin-auth', 'true', {
    httpOnly: true,
    path: '/',
  });

  return { ok: true };
}

export async function logoutAdmin() {
  cookies().delete('admin-auth');
}
