import { logoutAdmin } from '../actions/auth';

<form
  action={async () => {
    'use server';
    await logoutAdmin();
  }}
>
  <button className="mb-4 text-sm text-red-600 underline">
    Đăng xuất
  </button>
</form>
