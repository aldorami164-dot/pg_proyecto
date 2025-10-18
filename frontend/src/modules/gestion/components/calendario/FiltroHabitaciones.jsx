import { Home } from 'lucide-react'

const FiltroHabitaciones = ({ habitaciones, habitacionSeleccionada, onChange }) => {
  return (
    <div className="flex items-center gap-3">
      <Home className="text-gray-600" size={20} />
      <select
        value={habitacionSeleccionada || 'todas'}
        onChange={(e) => onChange(e.target.value === 'todas' ? null : parseInt(e.target.value))}
        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-700 font-medium cursor-pointer hover:border-gray-400 transition-colors"
      >
        <option value="todas">Todas las habitaciones</option>
        {habitaciones.map((habitacion) => (
          <option key={habitacion.id} value={habitacion.id}>
            Habitación {habitacion.numero} - {habitacion.tipo_habitacion}
          </option>
        ))}
      </select>
    </div>
  )
}

export default FiltroHabitaciones
