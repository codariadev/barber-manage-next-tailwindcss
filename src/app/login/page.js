"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

const LoginPage = () => {
  const [email] = useState("alves2.eduardo@gmail.com");
  const [password] = useState("12345678");
  const [inputEmail, setInputEmail] = useState('');
  const [inputPassword, setInputPassword] = useState('');
  const router = useRouter();

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validação simples: verifica se o email e a senha estão corretos
    if (inputEmail === email && inputPassword === password) {
      // Redireciona para a home
      router.push('/home');
    } else {
      alert("Email ou senha incorretos!");
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-200">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-sm w-full">
        <h2 className="text-2xl font-bold mb-4">Login</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
            <input 
              type="email" 
              id="email" 
              name="email" 
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md" 
              value={inputEmail}  // Valor do email inserido
              onChange={(e) => setInputEmail(e.target.value)}  // Atualiza o estado com o valor digitado
              required 
            />
          </div>
          <div className="mb-6">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">Senha</label>
            <input 
              type="password" 
              id="password" 
              name="password" 
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md" 
              value={inputPassword}  // Valor da senha inserida
              onChange={(e) => setInputPassword(e.target.value)}  // Atualiza o estado com o valor digitado
              required 
            />
          </div>
          <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded-md">Entrar</button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
