import { logout } from '@/lib/auth-actions';
import { getCurrentUser } from '@/lib/auth';
import { toPublicUser } from '@/lib/user-permissions';
import NavbarClient from './NavbarClient';

export default async function Navbar() {
  const currentUser = await getCurrentUser();
  const publicUser = currentUser ? toPublicUser(currentUser) : null;

  const handleLogout = async () => {
    'use server';
    await logout();
  };

  return <NavbarClient currentUser={publicUser} logoutAction={handleLogout} />;
}
