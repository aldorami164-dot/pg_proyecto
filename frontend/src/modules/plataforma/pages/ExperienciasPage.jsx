import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Card from '@shared/components/Card'
import ExperienceCard from '@shared/components/ExperienceCard'
import FeaturedExperienceCard from '@shared/components/FeaturedExperienceCard'
import TestimonialCard from '@shared/components/TestimonialCard'
import { Compass, Loader2, AlertCircle, Star } from 'lucide-react'
import plataformaService from '@shared/services/plataformaService'

const ExperienciasPage = () => {
  const navigate = useNavigate()
  const [experiencias, setExperiencias] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filtroActivo, setFiltroActivo] = useState('todas')

  useEffect(() => {
    cargarExperiencias()
  }, [])

  const cargarExperiencias = async () => {
    setLoading(true)
    setError(null)

    try {
      const data = await plataformaService.getExperiencias()
      setExperiencias(data)
    } catch (err) {
      console.error('Error al cargar experiencias:', err)
      setError(err.response?.data?.error || 'Error al cargar las experiencias')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-6 py-12">
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <Loader2 className="animate-spin text-plataforma-primary-600 mb-4" size={48} />
          <p className="text-gray-600">Cargando experiencias...</p>
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
              Error al Cargar Experiencias
            </h2>
            <p className="text-gray-600">{error}</p>
          </div>
        </Card>
      </div>
    )
  }


  // Filtrar experiencias por categoría
  const experienciasFiltradas = filtroActivo === 'todas'
    ? experiencias
    : experiencias.filter(exp => exp.categoria === filtroActivo)

  // Destacar la primera experiencia filtrada
  const experienciaDestacada = experienciasFiltradas[0]
  const experienciasRestantes = experienciasFiltradas.slice(1)

  return (
    <div>
      {/* Hero Section compacto */}
      <section className="relative bg-gradient-to-br from-plataforma-primary-600 via-plataforma-nature-600 to-plataforma-primary-700 py-16">
        <div className="container mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-3 drop-shadow-lg">
            Experiencias Únicas
          </h1>
          <p className="text-lg text-white/95 max-w-2xl mx-auto drop-shadow">
            Descubre las maravillas del Lago Atitlán y conecta con la cultura local
          </p>
        </div>
      </section>

      <div className="container mx-auto px-6">
        {/* Filtros por categoría */}
        <div className="flex items-center justify-center gap-3 py-8 flex-wrap">
          {['todas', 'aventura', 'cultura', 'naturaleza', 'gastronomia'].map((filtro) => (
            <button
              key={filtro}
              onClick={() => setFiltroActivo(filtro)}
              className={`px-6 py-2 rounded-full font-medium capitalize transition-all duration-300
                ${filtroActivo === filtro
                  ? 'bg-plataforma-primary-600 text-white shadow-md'
                  : 'bg-white text-gray-700 border border-gray-200 hover:border-plataforma-primary-300 hover:shadow'
                }`}
            >
              {filtro === 'gastronomia' ? 'Gastronomía' : filtro}
            </button>
          ))}
        </div>

        {/* Mensaje si no hay experiencias para el filtro */}
        {experienciasFiltradas.length === 0 ? (
          <Card module="plataforma" className="max-w-2xl mx-auto my-16">
            <div className="text-center py-12">
              <Compass className="mx-auto text-plataforma-primary-400 mb-4" size={64} />
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                No hay experiencias en esta categoría
              </h3>
              <p className="text-gray-600 mb-4">
                Intenta con otra categoría o selecciona "Todas"
              </p>
              <button
                onClick={() => setFiltroActivo('todas')}
                className="px-6 py-2 bg-plataforma-primary-600 text-white rounded-full
                           hover:bg-plataforma-primary-700 transition-colors"
              >
                Ver Todas
              </button>
            </div>
          </Card>
        ) : (
          <>
            {/* Experiencia Destacada */}
            {experienciaDestacada && (
              <div className="mb-16">
                <FeaturedExperienceCard
                  experiencia={experienciaDestacada}
                  onClick={() => navigate(`/plataforma/experiencias/${experienciaDestacada.id}`)}
                />
              </div>
            )}

            {/* Separador con título */}
            {experienciasRestantes.length > 0 && (
              <div className="mb-12 text-center">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  {filtroActivo === 'todas' ? 'Todas las Experiencias' : `Más Experiencias de ${filtroActivo.charAt(0).toUpperCase() + filtroActivo.slice(1)}`}
                </h2>
                <div className="w-24 h-1 bg-gradient-to-r from-plataforma-primary-500 to-plataforma-accent-500 mx-auto rounded-full" />
              </div>
            )}

            {/* Lista de experiencias restantes */}
            {experienciasRestantes.length > 0 && (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
                {experienciasRestantes.map((experiencia, index) => (
                  <ExperienceCard
                    key={experiencia.id}
                    experiencia={experiencia}
                    onClick={() => navigate(`/plataforma/experiencias/${experiencia.id}`)}
                    delay={index * 0.1}
                  />
                ))}
              </div>
            )}
          </>
        )}


        {/* CTA Final - Contacto */}
        <div className="mb-16">
          <Card module="plataforma" className="bg-gradient-to-br from-plataforma-primary-600 to-plataforma-nature-700 border-0 text-white">
            <div className="text-center py-8">
              <h3 className="text-2xl font-bold mb-3">
                ¿Necesitas una Experiencia Personalizada?
              </h3>
              <p className="text-white/90 mb-6 max-w-2xl mx-auto">
                Nuestro equipo está disponible 24/7 para ayudarte a planificar la experiencia perfecta.
                Consulta en recepción para más información, disponibilidad y reservaciones especiales.
              </p>
              <button
                onClick={() => navigate('/plataforma/contacto')}
                className="px-8 py-3 bg-white text-plataforma-primary-700 font-semibold rounded-xl
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

export default ExperienciasPage
