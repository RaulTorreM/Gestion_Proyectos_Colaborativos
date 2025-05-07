import React, { useState } from 'react';
import AuthService from '../api/services/authService';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  // 👉 Estados controlados para los inputs
  const [email, setEmail] = useState('josue@example.com');
  const [password, setPassword] = useState('josue123');
  const auth = useAuth();

  // 👉 Estado para mensajes de error
  const [error, setError] = useState('');

  // 👉 Manejo del submit del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await auth.login({ email, password });

      // Si todo sale bien, redirige al dashboard o ruta protegida
      window.location.href = '/dashboard';
    } catch (err) {
      // Si hay error, muestra mensaje
      setError(err.error || 'Credenciales incorrectas');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-zinc-900">
      <div className="w-full max-w-md p-8 bg-white dark:bg-zinc-800 rounded-lg shadow-lg">
        <h2 className="text-3xl font-bold mb-6 text-center text-zinc-800 dark:text-white">Iniciar Sesión</h2>

        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email */}
          <div>
            <label className="block text-gray-700 dark:text-zinc-200 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:focus:ring-blue-400"
              required
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-gray-700 dark:text-gray-200 mb-1">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:focus:ring-blue-400"
              required
            />
          </div>

          {/* Botón */}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition duration-300 dark:bg-blue-500 dark:hover:bg-blue-600"
          >
            Iniciar Sesión
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
