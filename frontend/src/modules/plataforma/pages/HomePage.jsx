import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import Button from '@shared/components/Button'
import FeatureCard from '@shared/components/FeatureCard'
import {
  MapPin, Star, Users, Award
} from 'lucide-react'
import hotelImage from '@/assets/HOTEL.jpg'

const HomePage = () => {

  return (
    <div>
      {/* Hero Section con imagen de fondo */}
      <section className="relative h-[600px] flex items-center justify-center overflow-hidden">
        {/* Imagen de fondo */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url(${hotelImage})`
          }}
        />

        {/* Overlay oscuro para que el texto sea legible */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/50 to-black/60" />

        {/* Contenido */}
        <div className="relative z-10 text-center px-6 text-white max-w-5xl mx-auto">
          <h1 className="text-6xl md:text-7xl font-display font-black mb-6 tracking-tight leading-tight"
              style={{ textShadow: '0 4px 12px rgba(0,0,0,0.5), 0 2px 4px rgba(0,0,0,0.3)' }}>
            Casa Josefa
          </h1>
          <p className="text-2xl md:text-3xl mb-5 font-medium tracking-wide leading-relaxed"
             style={{ textShadow: '0 2px 8px rgba(0,0,0,0.4)' }}>
            Experiencia auténtica en el corazón del Lago Atitlán
          </p>
          <p className="text-base md:text-lg mb-8 text-gray-100 max-w-3xl mx-auto leading-relaxed"
             style={{ textShadow: '0 1px 4px rgba(0,0,0,0.3)' }}>
            Descubre la magia de Guatemala en un ambiente acogedor, rodeado de naturaleza,
            cultura y hospitalidad excepcional
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/plataforma/experiencias">
              <Button variant="primary" module="plataforma" size="lg">
                Explorar Experiencias
              </Button>
            </Link>
            <Link to="/plataforma/servicios">
              <Button variant="secondary" module="plataforma" size="lg">
                Ver Servicios
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-6 py-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-display font-black mb-5 tracking-tight leading-tight
                         bg-gradient-to-r from-plataforma-primary-700 via-plataforma-nature-700 to-plataforma-primary-700
                         bg-clip-text text-transparent">
            ¿Por qué Casa Josefa?
          </h2>
          <p className="text-lg md:text-xl text-gray-700 max-w-2xl mx-auto font-medium leading-relaxed">
            Experimenta la hospitalidad guatemalteca en su máxima expresión
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <FeatureCard
            icon={MapPin}
            title="Ubicación Privilegiada"
            description="En el corazón del Lago Atitlán, rodeado de naturaleza"
            gradient="from-plataforma-accent-500 to-plataforma-accent-600"
            delay={0}
          />

          <FeatureCard
            icon={Star}
            title="Servicio Excepcional"
            description="Atención personalizada para hacer tu estadía inolvidable"
            gradient="from-plataforma-primary-500 to-plataforma-primary-600"
            delay={0.1}
          />

          <FeatureCard
            icon={Users}
            title="Ambiente Familiar"
            description="Un hotel pequeño con el calor de hogar"
            gradient="from-plataforma-secondary-400 to-plataforma-secondary-500"
            delay={0.2}
          />

          <FeatureCard
            icon={Award}
            title="Experiencias Únicas"
            description="Tours y actividades para conectar con la cultura local"
            gradient="from-plataforma-nature-500 to-plataforma-nature-600"
            delay={0.3}
          />
        </div>
      </section>

    </div>
  )
}

export default HomePage
