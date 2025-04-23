import Sidebar from './Sidebar'
import TopBar from './TopBar'
import Footer from './Footer'

export default function MainLayout({ children }) {
  return (
    <div className="flex flex-col min-h-screen bg-black text-white">
      <div className="flex flex-1">
        <Sidebar />
        <div className="flex-1 flex flex-col border-l border-gray-700"> {/* Borde lateral sutil */}
          <TopBar />
          <main className="flex-1 overflow-y-auto border-t border-gray-700"> {/* Borde superior sutil */}
            {children}
          </main>
        </div>
      </div>
      <Footer />
    </div>
  )
}