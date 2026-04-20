import { logout } from '@/lib/auth-actions';
import { getCurrentUser } from '@/lib/auth';
import NavbarClient from './NavbarClient';

export default async function Navbar() {
  const currentUser = await getCurrentUser();

  const handleLogout = async () => {
    'use server';
    await logout();
  };

  return <NavbarClient currentUser={currentUser} logoutAction={handleLogout} />;
}
