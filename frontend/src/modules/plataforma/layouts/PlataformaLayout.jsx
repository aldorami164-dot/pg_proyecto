import { useState, useEffect } from 'react'
import { Outlet, NavLink, Link } from 'react-router-dom'
import { Menu, X, Phone, Mail, MapPin } from 'lucide-react'

const PlataformaLayout = () => {
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  // Detectar scroll para cambiar estilo del header
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navItems = [
    { path: '/plataforma', label: 'Inicio' },
    { path: '/plataforma/experiencias', label: 'Experiencias' },
    { path: '/plataforma/lugares', label: 'Lugares' },
    { path: '/plataforma/servicios', label: 'Servicios' },
    { path: '/plataforma/contacto', label: 'Contacto' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-plataforma-accent-50 to-white">
      {/* Header */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-white shadow-lg border-b border-plataforma-primary-100'
            : 'bg-plataforma-primary-600 shadow-xl'
        }`}
      >
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link to="/plataforma" className="flex items-center gap-3 group">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-plataforma-secondary-400 to-plataforma-secondary-600 flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                <span className="text-white font-bold text-2xl">CJ</span>
              </div>
              <div>
                <h1 className={`text-2xl font-display font-bold transition-colors ${scrolled ? 'text-plataforma-primary-700' : 'text-white'}`}>
                  Casa Josefa
                </h1>
                <p className={`text-sm transition-colors ${scrolled ? 'text-plataforma-nature-600' : 'text-plataforma-accent-100'}`}>
                  Lago Atitlán, Guatemala
                </p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-2">
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === '/plataforma'}
                  className={({ isActive }) =>
                    `px-5 py-2.5 font-medium rounded-lg transition-all duration-200 ${
                      isActive
                        ? scrolled
                          ? 'bg-plataforma-primary-100 text-plataforma-primary-700 font-bold'
                          : 'bg-white/20 text-white font-bold backdrop-blur-sm'
                        : scrolled
                        ? 'text-gray-700 hover:bg-plataforma-primary-50 hover:text-plataforma-primary-700'
                        : 'text-plataforma-accent-50 hover:bg-white/10 hover:text-white'
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>

            {/* CTA Button */}
            <Link
              to="/"
              className={`hidden md:flex items-center gap-2 px-6 py-3 font-bold rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105 ${
                scrolled
                  ? 'bg-plataforma-secondary-500 hover:bg-plataforma-secondary-600 text-white'
                  : 'bg-white text-plataforma-primary-700 hover:bg-plataforma-accent-50'
              }`}
            >
              ← Inicio
            </Link>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className={`md:hidden p-2.5 rounded-xl transition-all duration-200 ${
                scrolled
                  ? 'text-plataforma-primary-700 hover:bg-plataforma-primary-50'
                  : 'text-white hover:bg-white/20 backdrop-blur-sm'
              }`}
            >
              {menuOpen ? <X size={26} /> : <Menu size={26} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {menuOpen && (
          <div className="md:hidden bg-white border-t border-plataforma-primary-200 shadow-2xl animate-slide-up">
            <nav className="container mx-auto px-6 py-6">
              <ul className="space-y-2">
                {navItems.map((item) => (
                  <li key={item.path}>
                    <NavLink
                      to={item.path}
                      end={item.path === '/plataforma'}
                      onClick={() => setMenuOpen(false)}
                      className={({ isActive }) =>
                        `block px-5 py-3.5 rounded-xl font-semibold transition-all duration-200 ${
                          isActive
                            ? 'bg-plataforma-primary-100 text-plataforma-primary-700 shadow-md'
                            : 'text-gray-700 hover:bg-plataforma-primary-50'
                        }`
                      }
                    >
                      {item.label}
                    </NavLink>
                  </li>
                ))}
                <li className="pt-2">
                  <Link
                    to="/"
                    onClick={() => setMenuOpen(false)}
                    className="block w-full px-5 py-3.5 bg-plataforma-secondary-500 hover:bg-plataforma-secondary-600 text-white font-bold rounded-xl text-center transition-all duration-200 shadow-lg"
                  >
                    ← Volver al inicio
                  </Link>
                </li>
              </ul>
            </nav>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="pt-20">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-gradient-to-br from-plataforma-primary-700 via-plataforma-primary-600 to-plataforma-nature-700 text-white mt-24">
        <div className="container mx-auto px-6 py-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {/* Sobre nosotros */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-plataforma-secondary-500 flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-xl">CJ</span>
                </div>
                <h3 className="text-2xl font-display font-bold">Casa Josefa</h3>
              </div>
              <p className="text-plataforma-accent-100 leading-relaxed mb-4">
                Experimenta la belleza del Lago Atitlán en nuestro acogedor hotel familiar.
                Hospitalidad guatemalteca en su máxima expresión.
              </p>
            </div>

            {/* Contacto */}
            <div>
              <h3 className="text-xl font-display font-bold mb-6 text-plataforma-accent-50">Contacto</h3>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <Phone size={20} className="text-plataforma-secondary-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-white">+502 7721-7139</p>
                    <p className="text-sm text-plataforma-accent-100">Recepción 24/7</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Mail size={20} className="text-plataforma-secondary-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-white break-all">casajosefaatitlan@gmail.com</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <MapPin size={20} className="text-plataforma-secondary-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-white">Canton Tzanjuyu</p>
                    <p className="text-sm text-plataforma-accent-100">Santiago Atitlán, Sololá</p>
                  </div>
                </li>
              </ul>
            </div>

            {/* Links rápidos */}
            <div>
              <h3 className="text-xl font-display font-bold mb-6 text-plataforma-accent-50">Navegación</h3>
              <ul className="space-y-3">
                {navItems.map((item) => (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      className="text-plataforma-accent-100 hover:text-plataforma-secondary-300 transition-colors flex items-center gap-2 group"
                    >
                      <span className="w-1.5 h-1.5 bg-plataforma-secondary-400 rounded-full group-hover:scale-150 transition-transform"></span>
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-plataforma-primary-500/30 text-center">
            <p className="text-plataforma-accent-100">
              &copy; {new Date().getFullYear()} <span className="font-semibold text-white">Casa Josefa Hotel</span> - Todos los derechos reservados.
            </p>
            <p className="text-sm text-plataforma-accent-200 mt-2">
              Lago Atitlán, Guatemala 🇬🇹
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default PlataformaLayout
