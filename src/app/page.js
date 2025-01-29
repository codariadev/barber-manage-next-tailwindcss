'use client'
import { usePathname } from 'next/navigation';
import React from 'react';

const Layout = ({ children }) => {
  const pathname = usePathname();

  // Redirecionar para a página de login se a URL for "/"
  if (pathname === '/') {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <h1>Redirecionando para a página de Login...</h1>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <main>{children}</main>
    </div>
  );
};

export default Layout;
