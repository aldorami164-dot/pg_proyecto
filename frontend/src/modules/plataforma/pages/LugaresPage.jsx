import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Card from '@shared/components/Card'
import PlaceCard from '@shared/components/PlaceCard'
import FeaturedPlaceCard from '@shared/components/FeaturedPlaceCard'
import TestimonialCard from '@shared/components/TestimonialCard'
import { Loader2, AlertCircle, Map, Star } from 'lucide-react'
import plataformaService from '@shared/services/plataformaService'

const LugaresPage = () => {
  const navigate = useNavigate()
  const [lugares, setLugares] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filtroActivo, setFiltroActivo] = useState('todos')

  useEffect(() => {
    cargarLugares()
  }, [])

  const cargarLugares = async () => {
    setLoading(true)
    setError(null)

    try {
      const data = await plataformaService.getLugaresTuristicos()
      setLugares(data)
    } catch (err) {
      console.error('Error al cargar lugares:', err)
      setError(err.response?.data?.error || 'Error al cargar los lugares turísticos')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-6 py-12">
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <Loader2 className="animate-spin text-plataforma-primary-600 mb-4" size={48} />
          <p className="text-gray-600">Cargando lugares turísticos...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-6 py-12">
        <Card module="plataforma" className="max-w-2xl mx-auto">
          <div className="text-center py-12">
            <AlertCircle className="mx-auto text-red-500 mb-4" size={64} />
            <h2 className="text-2xl font-display font-bold text-gray-800 mb-2">
              Error al Cargar Lugares
            </h2>
            <p className="text-gray-600">{error}</p>
          </div>
        </Card>
      </div>
    )
  }

  // Testimonios de ejemplo
  const testimonios = [
    {
      name: "Ana Martínez",
      location: "España",
      rating: 5,
      comment: "Los volcanes son impresionantes y las vistas del lago son simplemente mágicas. Un paraíso natural que todos deberían conocer."
    },
    {
      name: "David Thompson",
      location: "Canadá",
      rating: 5,
      comment: "Santiago Atitlán was a highlight of our trip. The local culture and handicrafts are amazing. Highly recommended!"
    },
    {
      name: "Sofía Hernández",
      location: "Colombia",
      rating: 5,
      comment: "Cada pueblo tiene su encanto único. La hospitalidad de la gente y la belleza del paisaje son incomparables."
    }
  ]

  // Filtrar lugares por categoría
  const lugaresFiltrados = filtroActivo === 'todos'
    ? lugares
    : lugares.filter(lugar => lugar.categoria === filtroActivo)

  // Destacar el primer lugar filtrado
  const lugarDestacado = lugaresFiltrados[0]
  const lugaresRestantes = lugaresFiltrados.slice(1)

  return (
    <div>
      {/* Hero Section compacto */}
      <section className="relative bg-gradient-to-br from-plataforma-secondary-600 via-plataforma-nature-600 to-plataforma-secondary-700 py-16">
        <div className="container mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-3 drop-shadow-lg">
            Lugares Turísticos
          </h1>
          <p className="text-lg text-white/95 max-w-2xl mx-auto drop-shadow">
            Explora los mejores destinos alrededor del Lago Atitlán
          </p>
        </div>
      </section>

      <div className="container mx-auto px-6">
        {/* Filtros por categoría */}
        <div className="flex items-center justify-center gap-3 py-8 flex-wrap">
          {['todos', 'cultura', 'naturaleza', 'gastronomia', 'aventura'].map((filtro) => (
            <button
              key={filtro}
              onClick={() => setFiltroActivo(filtro)}
              className={`px-6 py-2 rounded-full font-medium capitalize transition-all duration-300
                ${filtroActivo === filtro
                  ? 'bg-plataforma-secondary-600 text-white shadow-md'
                  : 'bg-white text-gray-700 border border-gray-200 hover:border-plataforma-secondary-300 hover:shadow'
                }`}
            >
              {filtro === 'gastronomia' ? 'Gastronomía' : filtro}
            </button>
          ))}
        </div>

        {/* Mensaje si no hay lugares para el filtro */}
        {lugaresFiltrados.length === 0 ? (
          <Card module="plataforma" className="max-w-2xl mx-auto my-16">
            <div className="text-center py-12">
              <Map className="mx-auto text-plataforma-secondary-400 mb-4" size={64} />
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                No hay lugares en esta categoría
              </h3>
              <p className="text-gray-600 mb-4">
                Intenta con otra categoría o selecciona "Todos"
              </p>
              <button
                onClick={() => setFiltroActivo('todos')}
                className="px-6 py-2 bg-plataforma-secondary-600 text-white rounded-full
                           hover:bg-plataforma-secondary-700 transition-colors"
              >
                Ver Todos
              </button>
            </div>
          </Card>
        ) : (
          <>
            {/* Lugar Destacado */}
            {lugarDestacado && (
              <div className="mb-16">
                <FeaturedPlaceCard
                  lugar={lugarDestacado}
                  onClick={() => navigate(`/plataforma/lugares/${lugarDestacado.id}`)}
                />
              </div>
            )}

            {/* Separador con título */}
            {lugaresRestantes.length > 0 && (
              <div className="mb-12 text-center">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  {filtroActivo === 'todos' ? 'Todos los Lugares' : `Más Lugares ${filtroActivo.charAt(0).toUpperCase() + filtroActivo.slice(1)}`}
                </h2>
                <div className="w-24 h-1 bg-gradient-to-r from-plataforma-secondary-500 to-plataforma-nature-500 mx-auto rounded-full" />
              </div>
            )}

            {/* Lista de lugares restantes */}
            {lugaresRestantes.length > 0 && (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
                {lugaresRestantes.map((lugar, index) => (
                  <PlaceCard
                    key={lugar.id}
                    lugar={lugar}
                    onClick={() => navigate(`/plataforma/lugares/${lugar.id}`)}
                    delay={index * 0.1}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {/* Estadísticas / Trust Signals */}
        {!loading && !error && lugares.length > 0 && (
          <div className="bg-gradient-to-r from-plataforma-secondary-50 to-plataforma-nature-50 rounded-2xl p-8 mb-16 border border-plataforma-secondary-100">
            <div className="grid md:grid-cols-3 gap-8 text-center">
              <div>
                <div className="text-4xl font-bold text-plataforma-secondary-700 mb-2">12+</div>
                <div className="text-gray-600 font-medium">Pueblos Cercanos</div>
              </div>
              <div>
                <div className="flex items-center justify-center gap-2 mb-2">
                  <span className="text-4xl font-bold text-plataforma-secondary-700">4.9</span>
                  <Star className="fill-yellow-400 text-yellow-400" size={32} />
                </div>
                <div className="text-gray-600 font-medium">Calificación Promedio</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-plataforma-secondary-700 mb-2">3</div>
                <div className="text-gray-600 font-medium">Volcanes Majestuosos</div>
              </div>
            </div>
          </div>
        )}

        {/* Testimonios */}
        {!loading && !error && lugares.length > 0 && (
          <div className="mb-16">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Lo que Dicen Nuestros Visitantes
              </h2>
              <p className="text-gray-600">Experiencias reales de viajeros como tú</p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {testimonios.map((testimonio, index) => (
                <TestimonialCard
                  key={index}
                  {...testimonio}
                  delay={index * 0.1}
                />
              ))}
            </div>
          </div>
        )}

        {/* CTA Final - Contacto */}
        <div className="mb-16">
          <Card module="plataforma" className="bg-gradient-to-br from-plataforma-secondary-600 to-plataforma-nature-700 border-0 text-white">
            <div className="text-center py-8">
              <h3 className="text-2xl font-bold mb-3">
                ¿Necesitas Ayuda para Planificar tu Visita?
              </h3>
              <p className="text-white/90 mb-6 max-w-2xl mx-auto">
                Nuestro equipo está disponible 24/7 para ayudarte con indicaciones, transporte y
                recomendaciones personalizadas. Consulta en recepción para más información.
              </p>
              <button
                onClick={() => navigate('/plataforma/contacto')}
                className="px-8 py-3 bg-white text-plataforma-secondary-700 font-semibold rounded-xl
                           hover:bg-gray-50 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                Contactar Ahora
              </button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default LugaresPage
