import { Star } from 'lucide-react'

/**
 * Card simple para testimonios/reviews
 */
const TestimonialCard = ({ name, location, rating = 5, comment, delay = 0 }) => {
  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-200
                    hover:border-plataforma-primary-300
                    transition-all duration-300 hover:shadow-lg">
      {/* Rating */}
      <div className="flex items-center gap-1 mb-3">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            size={16}
            className={i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
          />
        ))}
      </div>

      {/* Comentario */}
      <p className="text-gray-700 mb-4 leading-relaxed line-clamp-4 text-sm">
        "{comment}"
      </p>

      {/* Autor */}
      <div>
        <p className="font-semibold text-gray-900 text-sm">{name}</p>
        <p className="text-xs text-gray-500">{location}</p>
      </div>
    </div>
  )
}

export default TestimonialCard
