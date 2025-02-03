import { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

// Criar um hook para gerenciar o estado de autenticação
const useAuth = () => {
  const [user, setUser] = useState(null); // Manter o estado do usuário autenticado
  const [loading, setLoading] = useState(true); // Para controlar quando a autenticação está carregando

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user); // Atualiza o usuário quando o estado de autenticação mudar
      setLoading(false); // Quando terminar de carregar, setamos loading como false
    });

    return () => unsubscribe(); // Limpar a inscrição quando o componente for desmontado
  }, []);

  return { user, loading };
};

export default useAuth;
