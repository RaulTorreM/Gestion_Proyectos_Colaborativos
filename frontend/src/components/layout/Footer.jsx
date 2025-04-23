// src/components/layout/Footer.jsx
export default function Footer() {
    return (
      <footer className="bg-black border-t border-gray-800 py-4">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center text-gray-400 text-sm">
            <div className="mb-2 md:mb-0">
              <span>© {new Date().getFullYear()} Proyectos2 - Gestión de Proyectos</span>
            </div>
            <div className="flex space-x-4">
              <a href="#" className="hover:text-white">Términos</a>
              <a href="#" className="hover:text-white">Privacidad</a>
              <a href="#" className="hover:text-white">Soporte</a>
            </div>
          </div>
        </div>
      </footer>
    )
  }