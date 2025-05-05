import React, { useState } from 'react';
import AuthService from '../api/services/AuthService';

const Login = () => {
  // 👉 Estados controlados para los inputs
  const [email, setEmail] = useState('josue@example.com');
  const [password, setPassword] = useState('josue123');

  // 👉 Estado para mensajes de error
  const [error, setError] = useState('');

  // 👉 Manejo del submit del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Llama a AuthService con las credenciales
      await AuthService.login({ email, password });

      // Si todo sale bien, redirige al dashboard o ruta protegida
      window.location.href = '/dashboard';

    } catch (err) {
      // Si hay error, muestra mensaje
      setError(err.message || 'Credenciales incorrectas');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-md p-6 bg-white rounded shadow">
        <h2 className="text-2xl font-bold mb-6 text-center">Iniciar Sesión</h2>

        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div>
            <label className="block text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-gray-700 mb-1">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />
          </div>

          {/* Botón */}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
          >
            Iniciar Sesión
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
