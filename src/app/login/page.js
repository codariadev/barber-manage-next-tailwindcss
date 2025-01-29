import React from 'react';

const LoginPage = () => {
  return (
    <div className="flex justify-center items-center h-screen bg-gray-200">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-sm w-full">
        <h2 className="text-2xl font-bold mb-4">Login</h2>
        <form>
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
            <input type="email" id="email" name="email" className="mt-1 block w-full p-2 border border-gray-300 rounded-md" required />
          </div>
          <div className="mb-6">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">Senha</label>
            <input type="password" id="password" name="password" className="mt-1 block w-full p-2 border border-gray-300 rounded-md" required />
          </div>
          <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded-md">Entrar</button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
