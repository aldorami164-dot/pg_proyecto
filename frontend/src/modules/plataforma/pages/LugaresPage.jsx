import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Card from '@shared/components/Card'
import PlaceCard from '@shared/components/PlaceCard'
import { Loader2, AlertCircle, Map } from 'lucide-react'
import plataformaService from '@shared/services/plataformaService'

const LugaresPage = () => {
  const navigate = useNavigate()
  const [lugares, setLugares] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

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

  return (
    <div>
      {/* Hero Section compacto */}
      <section className="relative bg-gradient-to-br from-plataforma-secondary-600 via-plataforma-nature-600 to-plataforma-secondary-700 py-12">
        <div className="container mx-auto px-6 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 drop-shadow-lg">
            Lugares Turísticos
          </h1>
          <p className="text-base text-white/95 max-w-2xl mx-auto drop-shadow">
            Explora los mejores destinos alrededor del Lago Atitlán
          </p>
        </div>
      </section>

      <div className="container mx-auto px-6 py-12">
        {/* Lista de lugares */}
        {lugares.length === 0 ? (
          <Card module="plataforma" className="max-w-2xl mx-auto">
            <div className="text-center py-12">
              <Map className="mx-auto text-plataforma-secondary-400 mb-4" size={64} />
              <p className="text-lg text-gray-600">No hay lugares turísticos disponibles en este momento</p>
              <p className="text-gray-500 mt-2">
                Consulta en recepción por recomendaciones de lugares para visitar
              </p>
            </div>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {lugares.map((lugar, index) => (
              <PlaceCard
                key={lugar.id}
                lugar={lugar}
                onClick={() => navigate(`/plataforma/lugares/${lugar.id}`)}
                delay={index * 0.1}
              />
            ))}
          </div>
        )}

        {/* CTA Final */}
        {lugares.length > 0 && (
          <div className="mt-16">
            <Card module="plataforma" className="bg-gradient-to-br from-plataforma-secondary-600 to-plataforma-nature-700 border-0 text-white">
              <div className="text-center py-8">
                <h3 className="text-2xl font-bold mb-3">
                  ¿Necesitas Ayuda para Planificar tu Visita?
                </h3>
                <p className="text-white/90 mb-6 max-w-2xl mx-auto">
                  Nuestro equipo puede ayudarte con indicaciones, transporte y recomendaciones personalizadas.
                  Consulta en recepción para más información sobre estos increíbles lugares.
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
        )}
      </div>
    </div>
  )
}

export default LugaresPage
