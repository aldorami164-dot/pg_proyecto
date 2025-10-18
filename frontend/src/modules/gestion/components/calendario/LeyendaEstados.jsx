const LeyendaEstados = () => {
  const estados = [
    {
      color: 'bg-white border-gray-300',
      texto: 'text-gray-700',
      label: 'Disponible',
      descripcion: 'Habitación libre para reservar'
    },
    {
      color: 'bg-red-50 border-red-300',
      texto: 'text-red-800',
      label: 'Ocupada',
      descripcion: 'Habitación reservada (confirmada)'
    }
  ]

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <h3 className="text-sm font-semibold text-gray-700 mb-3">Leyenda de Estados</h3>
      <div className="flex flex-wrap gap-6">
        {estados.map((estado, index) => (
          <div key={index} className="flex items-center gap-3">
            <div
              className={`w-16 h-12 rounded border-2 flex items-center justify-center ${estado.color}`}
            >
              <span className={`text-xs font-medium ${estado.texto}`}>
                {estado.label}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm text-gray-800 font-semibold">{estado.label}</span>
              <span className="text-xs text-gray-500">{estado.descripcion}</span>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-3 pt-3 border-t border-gray-200">
        <p className="text-xs text-gray-600">
          <span className="font-semibold">Nota:</span> Las reservas pendientes no bloquean habitaciones.
          Solo las confirmadas se muestran como ocupadas. El día de checkout NO se cuenta como ocupado.
        </p>
      </div>
    </div>
  )
}

export default LeyendaEstados
