import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('josue@example.com');
  const [password, setPassword] = useState('josue123');
  const [error, setError] = useState('');
  const auth = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await auth.login({ email, password });
      window.location.href = '/dashboard';
    } catch (err) {
      setError(err.error || 'Credenciales incorrectas');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-blue-200 to-blue-300 dark:from-zinc-900 dark:to-zinc-800 flex items-center justify-center px-4">
      <div className="w-full max-w-6xl grid md:grid-cols-2 items-center gap-12 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md shadow-2xl rounded-2xl p-10 border border-gray-200 dark:border-zinc-700">
        
        {/* Panel izquierdo: branding + descripción */}
        <div className="space-y-6">
          <div className="flex items-center space-x-4">
            <img src="/main_icon.ico" alt="Logo GestIAPro" className="w-14 h-14" />
            <h1 className="text-4xl font-extrabold text-zinc-800 dark:text-white">GestIAPro</h1>
          </div>
          <p className="text-lg text-zinc-700 dark:text-zinc-300">
            Plataforma colaborativa con Inteligencia Artificial para la planificación, seguimiento y control de proyectos. 
            Incorpora chat multilingüe en tiempo real, tablero Kanban, panel administrativo, y generación automatizada de historias de usuario.
          </p>
          <ul className="list-disc list-inside text-zinc-600 dark:text-zinc-400">
            <li>Gestión ágil y visual</li>
            <li>Predicción de historias con IA</li>
            <li>Panel de métricas y control</li>
          </ul>
          <footer className="pt-6 text-sm text-zinc-500 dark:text-zinc-400">
            Universidad Continental – Huancayo, Perú · 2025
          </footer>
        </div>

        {/* Panel derecho: formulario de login */}
        <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-md p-8 w-full max-w-md mx-auto">
          <h2 className="text-2xl font-bold mb-6 text-center text-zinc-800 dark:text-white">Iniciar Sesión</h2>
          {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-200 mb-1">Correo electrónico</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-zinc-600 dark:bg-zinc-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-200 mb-1">Contraseña</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-zinc-600 dark:bg-zinc-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition duration-300 dark:bg-blue-500 dark:hover:bg-blue-600"
            >
              Iniciar Sesión
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
