import type { ReactNode } from 'react';

import Footer from '@/components/Footer';
import Navbar from '@/components/Navbar';

export default function NewFamilyLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Navbar />
      <div className="pt-0">{children}</div>
      <Footer />
    </>
  );
}
