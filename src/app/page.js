// Em uma página, como app/page.js

"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Redireciona para a página de login
    router.push('/login');
  }, [router]);

  return null; // Nada será renderizado enquanto o redirecionamento ocorre
}
