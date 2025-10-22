import { useState, useEffect } from 'react'
import { useAuth } from '@shared/context/AuthContext'
import reservasService from '@shared/services/reservasService'
import habitacionesService from '@shared/services/habitacionesService'
import Card from '@shared/components/Card'
import Button from '@shared/components/Button'
import Modal from '@shared/components/Modal'
import Input from '@shared/components/Input'
import Select from '@shared/components/Select'
import Textarea from '@shared/components/Textarea'
import Badge from '@shared/components/Badge'
import Table from '@shared/components/Table'
import Loader from '@shared/components/Loader'
import { Calendar, Plus, Search, Filter, Eye, CheckCircle, XCircle, Clock, Edit, MapPin, User, Trash2, List } from 'lucide-react'
import { formatDate, formatCurrency, calcularNoches } from '@shared/utils/formatters'
import toastMessages from '@shared/utils/toastMessages'

const ReservasPage = () => {
  const { user } = useAuth()
  const [reservas, setReservas] = useState([])
  const [habitaciones, setHabitaciones] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedReserva, setSelectedReserva] = useState(null)
  const [reservaToDelete, setReservaToDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [tabFecha, setTabFecha] = useState('todas') // 'hoy' | 'proximas' | 'todas'
  const [filters, setFilters] = useState({
    estado: '',
    canal: '',
    fecha_checkin: '',
    fecha_checkout: '',
    habitacion_id: '',
    busqueda: ''
  })

  // Estado del formulario
  const [formData, setFormData] = useState({
    huesped_nombre: '',
    huesped_apellido: '',
    huesped_email: '',
    huesped_telefono: '',
    huesped_dpi: '',
    habitacion_id: '',
    fecha_checkin: '',
    fecha_checkout: '',
    numero_huespedes: 1,
    canal_reserva: 'presencial',
    notas: ''
  })

  // Estado para habitaciones disponibles según fechas seleccionadas
  const [habitacionesDisponibles, setHabitacionesDisponibles] = useState([])
  const [buscandoDisponibilidad, setBuscandoDisponibilidad] = useState(false)

  const canales = [
    { value: 'booking', label: 'Booking.com' },
    { value: 'whatsapp', label: 'WhatsApp' },
    { value: 'facebook', label: 'Facebook' },
    { value: 'telefono', label: 'Teléfono' },
    { value: 'presencial', label: 'Presencial' }
  ]

  const estados = [
    { value: '', label: 'Reservas activas (Pendiente y Confirmada)' },
    { value: 'pendiente', label: 'Pendiente' },
    { value: 'confirmada', label: 'Confirmada' }
  ]

  useEffect(() => {
    cargarDatos()
  }, [filters])

  const cargarDatos = async () => {
    try {
      setLoading(true)
      // Construir params para filtros
      const params = {}

      // IMPORTANTE: Si no se especifica estado, solo mostrar activas (excluir completadas y canceladas)
      if (filters.estado) {
        params.estado = filters.estado
      } else {
        // Por defecto, excluir completadas y canceladas
        params.estados_excluir = 'completada,cancelada'
      }

      if (filters.canal) params.canal = filters.canal
      if (filters.habitacion_id) params.habitacion_id = filters.habitacion_id
      if (filters.busqueda) params.busqueda = filters.busqueda

      const [reservasRes, habitacionesRes] = await Promise.all([
        reservasService.listar(params),
        habitacionesService.listar()
      ])

      console.log('📊 Respuesta de reservas:', reservasRes)
      console.log('📊 Array de reservas:', reservasRes.reservas)
      console.log('📊 Cantidad de reservas:', reservasRes.reservas?.length)

      const reservasArray = reservasRes.reservas || []
      console.log('📊 Guardando en estado:', reservasArray)

      if (reservasArray.length > 0) {
        console.log('📊 Primera reserva completa:', JSON.stringify(reservasArray[0], null, 2))
      }

      setReservas(reservasArray)
      setHabitaciones(habitacionesRes.habitaciones || [])

      console.log('📊 Estado actualizado, reservas.length debería ser:', reservasArray.length)
    } catch (error) {
      console.error('Error al cargar datos:', error)
      toastMessages.reservas.cargar.error()
    } finally {
      setLoading(false)
    }
  }

  const calcularPrecio = () => {
    if (!formData.habitacion_id || !formData.fecha_checkin || !formData.fecha_checkout) {
      return
    }

    const habitacion = habitaciones.find(h => h.id === parseInt(formData.habitacion_id))
    if (!habitacion) return

    // Usar función helper para calcular noches
    const noches = calcularNoches(formData.fecha_checkin, formData.fecha_checkout)

    if (noches > 0) {
      const precio = noches * parseFloat(habitacion.precio_por_noche)
      setFormData(prev => ({ ...prev, precio_total: precio }))
    }
  }

  useEffect(() => {
    calcularPrecio()
  }, [formData.habitacion_id, formData.fecha_checkin, formData.fecha_checkout])

  // Buscar habitaciones disponibles cuando cambien las fechas
  useEffect(() => {
    const buscarDisponibilidad = async () => {
      // Solo buscar si hay ambas fechas y no está editando
      if (!formData.fecha_checkin || !formData.fecha_checkout || selectedReserva) {
        return
      }

      // Validar que checkout sea después de checkin
      const noches = calcularNoches(formData.fecha_checkin, formData.fecha_checkout)
      if (noches <= 0) {
        setHabitacionesDisponibles([])
        return
      }

      try {
        setBuscandoDisponibilidad(true)

        console.log('🔍 Buscando disponibilidad para:', formData.fecha_checkin, 'al', formData.fecha_checkout)

        // Llamar al endpoint de disponibilidad
        const params = {
          fecha_checkin: formData.fecha_checkin,
          fecha_checkout: formData.fecha_checkout
        }

        const response = await reservasService.verificarDisponibilidad(
          formData.fecha_checkin,
          formData.fecha_checkout
        )

        console.log('✅ Respuesta de disponibilidad:', response)
        console.log('📊 Habitaciones disponibles:', response.disponibles)

        // El backend devuelve { disponibles: [...] }
        setHabitacionesDisponibles(response.disponibles || [])

        // Si la habitación seleccionada ya no está disponible, limpiarla
        if (formData.habitacion_id) {
          const disponible = response.disponibles.find(h => h.id === parseInt(formData.habitacion_id))
          if (!disponible) {
            setFormData(prev => ({ ...prev, habitacion_id: '' }))
            toastMessages.generico.info('La habitación seleccionada no está disponible en esas fechas')
          }
        }
      } catch (error) {
        console.error('Error al buscar disponibilidad:', error)
        toastMessages.reservas.disponibilidad.error()
        setHabitacionesDisponibles([])
      } finally {
        setBuscandoDisponibilidad(false)
      }
    }

    buscarDisponibilidad()
  }, [formData.fecha_checkin, formData.fecha_checkout])

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validar fechas usando helper
    const noches = calcularNoches(formData.fecha_checkin, formData.fecha_checkout)

    if (noches <= 0) {
      toastMessages.reservas.validacion.fechasInvalidas()
      return
    }

    // Construir el objeto correcto para el backend
    // Asegurar que las fechas se envíen en formato correcto sin conversión de zona horaria

    // FIX CRÍTICO: Asegurar que las fechas sean STRINGS puros, no objetos Date
    // Si formData tiene Date objects, convertirlos a string YYYY-MM-DD
    const fechaCheckinString = typeof formData.fecha_checkin === 'string'
      ? formData.fecha_checkin
      : formData.fecha_checkin?.toISOString().split('T')[0]

    const fechaCheckoutString = typeof formData.fecha_checkout === 'string'
      ? formData.fecha_checkout
      : formData.fecha_checkout?.toISOString().split('T')[0]

    const dataToSend = {
      huesped: {
        nombre: formData.huesped_nombre,
        apellido: formData.huesped_apellido || null,
        email: formData.huesped_email || null,
        telefono: formData.huesped_telefono || null,
        dpi_pasaporte: formData.huesped_dpi || null
      },
      habitacion_id: parseInt(formData.habitacion_id),
      // IMPORTANTE: Enviar solo STRING en formato YYYY-MM-DD (NO objetos Date)
      fecha_checkin: fechaCheckinString,
      fecha_checkout: fechaCheckoutString,
      numero_huespedes: parseInt(formData.numero_huespedes),
      canal_reserva: formData.canal_reserva,
      notas: formData.notas || null
    }

    try {
      if (selectedReserva) {
        // Para actualizar solo se envían los campos permitidos
        // FIX: Asegurar que las fechas sean strings
        const updateData = {
          fecha_checkin: fechaCheckinString,
          fecha_checkout: fechaCheckoutString,
          numero_huespedes: parseInt(formData.numero_huespedes),
          notas: formData.notas || null
        }
        await reservasService.actualizar(selectedReserva.id, updateData)
        toastMessages.reservas.actualizar.success({ codigo: selectedReserva.codigo_reserva })
      } else {
        const result = await reservasService.crear(dataToSend)
        toastMessages.reservas.crear.success({
          codigo: result.codigo_reserva,
          huesped: formData.huesped_nombre
        })
      }

      setShowModal(false)
      resetForm()
      cargarDatos()
    } catch (error) {
      console.error('❌ Error completo:', error)
      console.error('❌ Response data:', JSON.stringify(error.response?.data, null, 2))
      console.error('❌ Response status:', error.response?.status)
      console.error('❌ Datos enviados:', JSON.stringify(dataToSend, null, 2))

      // Mostrar errores de validación específicos
      if (error.response?.data?.errors) {
        error.response.data.errors.forEach(err => {
          console.error(`   ❌ Campo: ${err.field} - ${err.message}`)
        })
      }

      const errorMsg = error.response?.data?.message || 'Error al guardar la reserva'
      if (selectedReserva) {
        toastMessages.reservas.actualizar.error(errorMsg)
      } else {
        toastMessages.reservas.crear.error(errorMsg)
      }
    }
  }

  const handleCambiarEstado = async (reservaId, nuevoEstado) => {
    try {
      await reservasService.cambiarEstado(reservaId, nuevoEstado)
      toastMessages.reservas.cambiarEstado.success(nuevoEstado)
      cargarDatos()
    } catch (error) {
      console.error('Error al cambiar estado:', error)
      toastMessages.reservas.cambiarEstado.error()
    }
  }

  const handleConfirmarEliminar = (reserva) => {
    setReservaToDelete(reserva)
    setShowDeleteModal(true)
  }

  const handleEliminarReserva = async () => {
    if (!reservaToDelete) return

    try {
      setDeleting(true)
      await reservasService.eliminar(reservaToDelete.id)
      toastMessages.reservas.eliminar.success()
      setShowDeleteModal(false)
      setReservaToDelete(null)
      cargarDatos() // Recargar la lista
    } catch (error) {
      console.error('Error al eliminar reserva:', error)
      toastMessages.reservas.eliminar.error()
    } finally {
      setDeleting(false)
    }
  }

  const resetForm = () => {
    setFormData({
      huesped_nombre: '',
      huesped_apellido: '',
      huesped_email: '',
      huesped_telefono: '',
      huesped_dpi: '',
      habitacion_id: '',
      fecha_checkin: '',
      fecha_checkout: '',
      numero_huespedes: 1,
      canal_reserva: 'presencial',
      notas: ''
    })
    setSelectedReserva(null)
  }

  const handleEdit = (reserva) => {
    setSelectedReserva(reserva)

    // FIX: Cargar datos correctos del backend
    // Al editar, el backend solo permite actualizar: fecha_checkin, fecha_checkout, numero_huespedes, notas
    // Los campos de huésped NO se pueden editar, pero los mostramos en el formulario como disabled
    setFormData({
      huesped_nombre: reserva.huesped_nombre || '',
      huesped_apellido: reserva.huesped_apellido || '',
      huesped_email: reserva.huesped_email || '',
      huesped_telefono: reserva.huesped_telefono || '',
      huesped_dpi: '', // No se guarda por seguridad
      habitacion_id: reserva.habitacion_id,
      // FIX: Asegurar que las fechas se parsean correctamente
      // El backend devuelve YYYY-MM-DD (línea 232-234 del controller)
      fecha_checkin: reserva.fecha_checkin?.includes('T')
        ? reserva.fecha_checkin.split('T')[0]
        : reserva.fecha_checkin,
      fecha_checkout: reserva.fecha_checkout?.includes('T')
        ? reserva.fecha_checkout.split('T')[0]
        : reserva.fecha_checkout,
      numero_huespedes: reserva.numero_huespedes || 1,
      canal_reserva: reserva.canal_reserva || 'presencial',
      notas: reserva.notas || ''
    })
    setShowModal(true)
  }

  const handleVerDetalle = async (reserva) => {
    setSelectedReserva(reserva)
    setShowDetailModal(true)
  }

  const getEstadoBadgeVariant = (estado) => {
    const variants = {
      'pendiente': 'warning',
      'confirmada': 'success',
      'completada': 'info',
      'cancelada': 'danger'
    }
    return variants[estado] || 'default'
  }

  // Filtrar reservas según el tab de fecha activo
  const reservasFiltradas = reservas.filter(reserva => {
    const fechaCheckin = reserva.fecha_checkin?.split('T')[0]

    // Obtener fecha local (no UTC) para evitar problemas de zona horaria
    const ahora = new Date()
    const hoy = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate())
      .toISOString().split('T')[0]

    const fechaEn7dias = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate() + 7)
      .toISOString().split('T')[0]

    if (tabFecha === 'hoy') {
      return fechaCheckin === hoy
    }
    if (tabFecha === 'proximas') {
      return fechaCheckin > hoy && fechaCheckin <= fechaEn7dias
    }
    return true // 'todas' - no filtra
  })

  // Contadores para los tabs
  const contadores = {
    hoy: reservas.filter(r => {
      const ahora = new Date()
      const hoy = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate())
        .toISOString().split('T')[0]
      return r.fecha_checkin?.split('T')[0] === hoy
    }).length,
    proximas: reservas.filter(r => {
      const fecha = r.fecha_checkin?.split('T')[0]
      const ahora = new Date()
      const hoy = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate())
        .toISOString().split('T')[0]
      const fechaEn7dias = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate() + 7)
        .toISOString().split('T')[0]
      return fecha > hoy && fecha <= fechaEn7dias
    }).length,
    todas: reservas.length
  }

  const columns = [
    {
      key: 'id',
      label: 'ID',
      render: (reserva) => `#${reserva.id}`
    },
    {
      key: 'huesped_nombre',
      label: 'Huésped',
      render: (reserva) => (
        <div>
          <div className="font-medium text-gray-900">{reserva.huesped_nombre}</div>
          <div className="text-sm text-gray-500">{reserva.huesped_email}</div>
        </div>
      )
    },
    {
      key: 'habitacion',
      label: 'Habitación',
      render: (reserva) => reserva.habitacion_numero || 'N/A'
    },
    {
      key: 'fechas',
      label: 'Fechas',
      render: (reserva) => (
        <div className="text-sm">
          <div>Check-in: {formatDate(reserva.fecha_checkin)}</div>
          <div>Check-out: {formatDate(reserva.fecha_checkout)}</div>
        </div>
      )
    },
    {
      key: 'canal',
      label: 'Canal',
      render: (reserva) => (
        <span className="text-sm capitalize">{reserva.canal}</span>
      )
    },
    {
      key: 'precio_total',
      label: 'Total',
      render: (reserva) => `Q${parseFloat(reserva.precio_total || 0).toFixed(2)}`
    },
    {
      key: 'estado',
      label: 'Estado',
      render: (reserva) => (
        <Badge variant={getEstadoBadgeVariant(reserva.estado_nombre)}>
          {reserva.estado_nombre?.toUpperCase() || 'N/A'}
        </Badge>
      )
    },
    {
      key: 'acciones',
      label: 'Acciones',
      render: (reserva) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleVerDetalle(reserva)}
            className="text-gestion-primary-600 hover:text-gestion-primary-700"
            title="Ver detalles"
          >
            <Eye size={18} />
          </button>

          {reserva.estado_nombre === 'pendiente' && (
            <>
              <button
                onClick={() => handleEdit(reserva)}
                className="text-blue-600 hover:text-blue-700"
                title="Editar"
              >
                <Edit size={18} />
              </button>
              <button
                onClick={() => handleCambiarEstado(reserva.id, 'confirmada')}
                className="text-green-600 hover:text-green-700"
                title="Confirmar"
              >
                <CheckCircle size={18} />
              </button>
              <button
                onClick={() => handleCambiarEstado(reserva.id, 'cancelada')}
                className="text-red-600 hover:text-red-700"
                title="Cancelar"
              >
                <XCircle size={18} />
              </button>
            </>
          )}

          {reserva.estado_nombre === 'confirmada' && (
            <button
              onClick={() => handleCambiarEstado(reserva.id, 'completada')}
              className="text-blue-600 hover:text-blue-700"
              title="Marcar como completada"
            >
              <CheckCircle size={18} />
            </button>
          )}
        </div>
      )
    }
  ]

  if (loading && reservas.length === 0) {
    return <Loader />
  }

  console.log('🎨 Renderizando ReservasPage con', reservas.length, 'reservas')

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card module="gestion" className="border-0 shadow-lg bg-white">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Reservas Activas</h1>
            <p className="text-gray-600 mt-1 text-sm md:text-base">Gestiona las reservas pendientes y confirmadas</p>
          </div>
          <Button
            variant="primary"
            module="gestion"
            onClick={() => {
              resetForm()
              setShowModal(true)
            }}
            className="w-full sm:w-auto"
          >
            <Plus size={20} className="mr-2" />
            Nueva Reserva
          </Button>
        </div>
      </Card>

      {/* Filtros */}
      <Card module="gestion" className="border shadow-md">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-9 w-4 h-4 text-gray-400 z-10" />
            <Input
              label="Buscar"
              type="text"
              name="busqueda"
              value={filters.busqueda}
              onChange={(e) => setFilters({ ...filters, busqueda: e.target.value })}
              placeholder="Nombre, email..."
              module="gestion"
              className="pl-10"
            />
          </div>

          <Select
            label="Estado"
            name="estado"
            value={filters.estado}
            onChange={(e) => setFilters({ ...filters, estado: e.target.value })}
            options={estados}
            module="gestion"
          />

          <Select
            label="Canal"
            name="canal"
            value={filters.canal}
            onChange={(e) => setFilters({ ...filters, canal: e.target.value })}
            options={[
              { value: '', label: 'Todos los canales' },
              ...canales
            ]}
            module="gestion"
          />

          <Select
            label="Habitación"
            name="habitacion_id"
            value={filters.habitacion_id}
            onChange={(e) => setFilters({ ...filters, habitacion_id: e.target.value })}
            options={[
              { value: '', label: 'Todas las habitaciones' },
              ...habitaciones.map(h => ({ value: h.id, label: `Hab. ${h.numero}` }))
            ]}
            module="gestion"
          />
        </div>
      </Card>

      {/* Tabs de Fecha */}
      <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-lg p-3 shadow-sm">
        <button
          onClick={() => setTabFecha('hoy')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-md font-medium transition-all ${
            tabFecha === 'hoy'
              ? 'bg-gray-800 text-white shadow-md'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <Calendar className="w-4 h-4" />
          Hoy
          <span className={`ml-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
            tabFecha === 'hoy' ? 'bg-white/20' : 'bg-gray-300 text-gray-700'
          }`}>
            {contadores.hoy}
          </span>
        </button>

        <button
          onClick={() => setTabFecha('proximas')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-md font-medium transition-all ${
            tabFecha === 'proximas'
              ? 'bg-gray-800 text-white shadow-md'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <Clock className="w-4 h-4" />
          Próximas 7 días
          <span className={`ml-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
            tabFecha === 'proximas' ? 'bg-white/20' : 'bg-gray-300 text-gray-700'
          }`}>
            {contadores.proximas}
          </span>
        </button>

        <button
          onClick={() => setTabFecha('todas')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-md font-medium transition-all ${
            tabFecha === 'todas'
              ? 'bg-gray-800 text-white shadow-md'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <List className="w-4 h-4" />
          Todas
          <span className={`ml-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
            tabFecha === 'todas' ? 'bg-white/20' : 'bg-gray-300 text-gray-700'
          }`}>
            {contadores.todas}
          </span>
        </button>
      </div>

      {/* Tabla Compacta Estilo Booking.com */}
      <Card module="gestion" className="overflow-hidden p-0">
        {reservas.length === 0 ? (
          <div className="text-center py-12 px-6">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No hay reservas registradas</p>
          </div>
        ) : reservasFiltradas.length === 0 ? (
          <div className="text-center py-12 px-6">
            <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No hay reservas para el período seleccionado</p>
            <p className="text-gray-400 text-sm mt-2">Intenta seleccionar otro filtro de fecha</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="reservas-table-compact">
              <thead>
                <tr>
                  <th>Huésped</th>
                  <th>Hab.</th>
                  <th>Check-in</th>
                  <th>Check-out</th>
                  <th>Huéspedes</th>
                  <th>Canal</th>
                  <th>Total</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {reservasFiltradas.map((reserva) => {
                  const iniciales = reserva.huesped_nombre
                    ?.split(' ')
                    .map(n => n[0])
                    .join('')
                    .toUpperCase()
                    .substring(0, 2) || 'HU'

                  return (
                    <tr
                      key={reserva.id}
                      className={`estado-${reserva.estado_nombre}`}
                    >
                      {/* Columna Huésped con avatar */}
                      <td data-label="Huésped">
                        <div className="flex items-center gap-2">
                          <div className="guest-avatar-compact">
                            {iniciales}
                          </div>
                          <div className="min-w-0">
                            <div className="font-semibold text-gray-900 truncate">
                              {reserva.huesped_nombre}
                            </div>
                            {reserva.huesped_email && (
                              <div className="text-xs text-gray-500 truncate">
                                {reserva.huesped_email}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Columna Habitación */}
                      <td data-label="Hab.">
                        <span className="font-semibold text-gray-900">
                          {reserva.habitacion_numero || 'N/A'}
                        </span>
                      </td>

                      {/* Columna Check-in */}
                      <td data-label="Check-in">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                          <span className="text-xs font-medium">
                            {formatDate(reserva.fecha_checkin)}
                          </span>
                        </div>
                      </td>

                      {/* Columna Check-out */}
                      <td data-label="Check-out">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                          <span className="text-xs font-medium">
                            {formatDate(reserva.fecha_checkout)}
                          </span>
                        </div>
                      </td>

                      {/* Columna Número de Huéspedes */}
                      <td data-label="Huéspedes">
                        <div className="flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-gray-600 flex-shrink-0" />
                          <span className="font-medium">{reserva.numero_huespedes}</span>
                        </div>
                      </td>

                      {/* Columna Canal */}
                      <td data-label="Canal">
                        <span className="text-xs capitalize text-gray-600">
                          {reserva.canal_reserva}
                        </span>
                      </td>

                      {/* Columna Total */}
                      <td data-label="Total">
                        <span className="font-bold text-gray-900">
                          Q{parseFloat(reserva.precio_total || 0).toFixed(2)}
                        </span>
                      </td>

                      {/* Columna Estado */}
                      <td data-label="Estado">
                        <span className={`status-icon ${reserva.estado_nombre}`}>
                          {reserva.estado_nombre?.toUpperCase() || 'N/A'}
                        </span>
                      </td>

                      {/* Columna Acciones - Aparecen en hover */}
                      <td data-label="Acciones" className="acciones-cell">
                        <div className="flex items-center gap-1">
                          {/* Botón Ver Detalles - SIEMPRE visible */}
                          <button
                            onClick={() => handleVerDetalle(reserva)}
                            className="action-btn-compact text-blue-600 hover:bg-blue-50"
                            title="Ver detalles"
                          >
                            <Eye size={16} />
                          </button>

                          {/* Botones PENDIENTE */}
                          {reserva.estado_nombre === 'pendiente' && (
                            <>
                              <button
                                onClick={() => handleEdit(reserva)}
                                className="action-btn-compact text-gray-600 hover:bg-gray-100"
                                title="Editar"
                              >
                                <Edit size={16} />
                              </button>

                              <button
                                onClick={() => handleCambiarEstado(reserva.id, 'confirmada')}
                                className="action-btn-compact text-green-600 hover:bg-green-50"
                                title="Confirmar"
                              >
                                <CheckCircle size={16} />
                              </button>

                              <button
                                onClick={() => handleCambiarEstado(reserva.id, 'cancelada')}
                                className="action-btn-compact text-red-600 hover:bg-red-50"
                                title="Cancelar"
                              >
                                <XCircle size={16} />
                              </button>
                            </>
                          )}

                          {/* Botones CONFIRMADA */}
                          {reserva.estado_nombre === 'confirmada' && (
                            <>
                              <button
                                onClick={() => handleCambiarEstado(reserva.id, 'completada')}
                                className="action-btn-compact text-blue-600 hover:bg-blue-50"
                                title="Check-out / Completar"
                              >
                                <CheckCircle size={16} />
                              </button>

                              <button
                                onClick={() => handleConfirmarEliminar(reserva)}
                                className="action-btn-compact text-red-600 hover:bg-red-50"
                                title="Eliminar reserva"
                              >
                                <Trash2 size={16} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Modal Crear/Editar */}
      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false)
          resetForm()
        }}
        title={selectedReserva ? 'Editar Reserva' : 'Nueva Reserva'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Mostrar alerta si está editando */}
          {selectedReserva && (
            <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
              <p className="text-sm text-blue-700">
                <strong>Modo edición:</strong> Solo puedes modificar fechas, número de huéspedes y notas. Los datos del huésped no son editables.
              </p>
            </div>
          )}

          {/* PASO 1: Fechas (primero) */}
          <div className="bg-gestion-primary-50 border-l-4 border-gestion-primary-500 p-4 mb-4">
            <h3 className="font-semibold text-gestion-primary-900 mb-2">Paso 1: Selecciona las fechas</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Check-in"
                type="date"
                name="fecha_checkin"
                value={formData.fecha_checkin}
                onChange={(e) => setFormData({ ...formData, fecha_checkin: e.target.value })}
                required
                module="gestion"
              />

              <Input
                label="Check-out"
                type="date"
                name="fecha_checkout"
                value={formData.fecha_checkout}
                onChange={(e) => setFormData({ ...formData, fecha_checkout: e.target.value })}
                required
                min={formData.fecha_checkin}
                module="gestion"
              />
            </div>

            {formData.fecha_checkin && formData.fecha_checkout && (
              <p className="text-sm text-gestion-primary-700 mt-2">
                ✓ {calcularNoches(formData.fecha_checkin, formData.fecha_checkout)} noche(s) seleccionada(s)
              </p>
            )}
          </div>

          {/* PASO 2: Habitación (solo se habilita después de seleccionar fechas) */}
          <div className="bg-gestion-primary-50 border-l-4 border-gestion-primary-500 p-4 mb-4">
            <h3 className="font-semibold text-gestion-primary-900 mb-2">Paso 2: Selecciona la habitación</h3>

            {!formData.fecha_checkin || !formData.fecha_checkout ? (
              <p className="text-sm text-gray-600">Primero selecciona las fechas para ver habitaciones disponibles</p>
            ) : buscandoDisponibilidad ? (
              <p className="text-sm text-gray-600">Buscando habitaciones disponibles...</p>
            ) : habitacionesDisponibles.length === 0 ? (
              <p className="text-sm text-red-600">No hay habitaciones disponibles para estas fechas</p>
            ) : (
              <div className="space-y-2">
                <p className="text-sm text-green-600">
                  ✓ {habitacionesDisponibles.length} habitación(es) disponible(s)
                </p>
                <Select
                  label="Habitación disponible"
                  name="habitacion_id"
                  value={formData.habitacion_id}
                  onChange={(e) => setFormData({ ...formData, habitacion_id: e.target.value })}
                  options={habitacionesDisponibles.map(h => ({
                    value: h.id,
                    label: `Hab. ${h.numero} - ${h.tipo} - ${h.capacidad_maxima} personas - Q${h.precio_por_noche}/noche`
                  }))}
                  required
                  disabled={!!selectedReserva}
                  module="gestion"
                />
              </div>
            )}
          </div>

          {/* PASO 3: Datos del huésped */}
          <div className="bg-gestion-primary-50 border-l-4 border-gestion-primary-500 p-4 mb-4">
            <h3 className="font-semibold text-gestion-primary-900 mb-2">Paso 3: Datos del huésped</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Nombre del huésped"
                type="text"
                name="huesped_nombre"
                value={formData.huesped_nombre}
                onChange={(e) => setFormData({ ...formData, huesped_nombre: e.target.value })}
                required={!selectedReserva}
                disabled={!!selectedReserva}
                module="gestion"
              />

              <Input
                label="Apellido del huésped"
                type="text"
                name="huesped_apellido"
                value={formData.huesped_apellido}
                onChange={(e) => setFormData({ ...formData, huesped_apellido: e.target.value })}
                disabled={!!selectedReserva}
                module="gestion"
              />

              <Input
                label="Email"
                type="email"
                name="huesped_email"
                value={formData.huesped_email}
                onChange={(e) => setFormData({ ...formData, huesped_email: e.target.value })}
                disabled={!!selectedReserva}
                module="gestion"
              />

              <Input
                label="Teléfono"
                type="tel"
                name="huesped_telefono"
                value={formData.huesped_telefono}
                onChange={(e) => setFormData({ ...formData, huesped_telefono: e.target.value })}
                disabled={!!selectedReserva}
                module="gestion"
              />

              <Input
                label="DPI / Pasaporte"
                type="text"
                name="huesped_dpi"
                value={formData.huesped_dpi}
                onChange={(e) => setFormData({ ...formData, huesped_dpi: e.target.value })}
                disabled={!!selectedReserva}
                module="gestion"
              />
            </div>
          </div>

          {/* PASO 4: Detalles adicionales */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            <Input
              label="Número de huéspedes"
              type="number"
              name="numero_huespedes"
              value={formData.numero_huespedes}
              onChange={(e) => setFormData({ ...formData, numero_huespedes: e.target.value })}
              min="1"
              required
              module="gestion"
            />

            <Select
              label="Canal de reserva"
              name="canal_reserva"
              value={formData.canal_reserva}
              onChange={(e) => setFormData({ ...formData, canal_reserva: e.target.value })}
              options={canales}
              required={!selectedReserva}
              disabled={!!selectedReserva}
              module="gestion"
            />
          </div>

          <Textarea
            label="Notas adicionales"
            name="notas"
            value={formData.notas}
            onChange={(e) => setFormData({ ...formData, notas: e.target.value })}
            rows={3}
            module="gestion"
          />

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="secondary"
              module="gestion"
              onClick={() => {
                setShowModal(false)
                resetForm()
              }}
            >
              Cancelar
            </Button>
            <Button type="submit" variant="primary" module="gestion">
              {selectedReserva ? 'Actualizar' : 'Crear'} Reserva
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal Detalles */}
      <Modal
        isOpen={showDetailModal}
        onClose={() => {
          setShowDetailModal(false)
          setSelectedReserva(null)
        }}
        title="Detalles de la Reserva"
        size="md"
      >
        {selectedReserva && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-600">ID</label>
                <p className="text-gray-900">#{selectedReserva.id}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Estado</label>
                <div className="mt-1">
                  <Badge variant={getEstadoBadgeVariant(selectedReserva.estado_nombre)}>
                    {selectedReserva.estado_nombre?.toUpperCase() || 'N/A'}
                  </Badge>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Huésped</label>
                <p className="text-gray-900">{selectedReserva.huesped_nombre}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Email</label>
                <p className="text-gray-900">{selectedReserva.huesped_email}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Teléfono</label>
                <p className="text-gray-900">{selectedReserva.huesped_telefono}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Habitación</label>
                <p className="text-gray-900">
                  {selectedReserva.habitacion_numero || 'N/A'}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Check-in</label>
                <p className="text-gray-900">
                  {formatDate(selectedReserva.fecha_checkin)}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Check-out</label>
                <p className="text-gray-900">
                  {formatDate(selectedReserva.fecha_checkout)}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Huéspedes</label>
                <p className="text-gray-900">{selectedReserva.numero_huespedes}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Canal</label>
                <p className="text-gray-900 capitalize">{selectedReserva.canal_reserva}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Precio Total</label>
                <p className="text-gray-900 font-semibold">
                  Q{parseFloat(selectedReserva.precio_total || 0).toFixed(2)}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Creada por</label>
                <p className="text-gray-900">{selectedReserva.creado_por_nombre || 'N/A'}</p>
              </div>
            </div>

            {selectedReserva.notas && (
              <div>
                <label className="text-sm font-medium text-gray-600">Notas</label>
                <p className="text-gray-900 mt-1">{selectedReserva.notas}</p>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Modal de Confirmación de Eliminación */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false)
          setReservaToDelete(null)
        }}
        title="Confirmar Eliminación"
        size="sm"
      >
        {reservaToDelete && (
          <div className="space-y-4">
            <div className="bg-red-50 border-l-4 border-red-400 p-4">
              <div className="flex items-start">
                <Trash2 className="text-red-600 mt-0.5 mr-3" size={20} />
                <div>
                  <p className="text-sm font-medium text-red-800">
                    ¿Estás seguro de eliminar esta reserva?
                  </p>
                  <p className="text-xs text-red-700 mt-1">
                    Esta acción no se puede deshacer. La reserva será eliminada permanentemente del sistema.
                  </p>
                  <p className="text-xs text-red-700 mt-2 font-semibold">
                    Nota: Esta opción es útil cuando un huésped llega pero se va en unas horas sin completar su estadía.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-3 rounded">
              <p className="text-sm font-medium text-gray-900">Reserva #{reservaToDelete.id}</p>
              <p className="text-xs text-gray-600 mt-1">
                Estado: <Badge variant={getEstadoBadgeVariant(reservaToDelete.estado_nombre)}>
                  {reservaToDelete.estado_nombre?.toUpperCase()}
                </Badge>
              </p>
              <p className="text-xs text-gray-600">
                Huésped: {reservaToDelete.huesped_nombre}
              </p>
              <p className="text-xs text-gray-600">
                Habitación: {reservaToDelete.habitacion_numero}
              </p>
              <p className="text-xs text-gray-600">
                Total: Q{parseFloat(reservaToDelete.precio_total || 0).toFixed(2)}
              </p>
            </div>

            <div className="flex gap-3 justify-end pt-2">
              <button
                onClick={() => {
                  setShowDeleteModal(false)
                  setReservaToDelete(null)
                }}
                disabled={deleting}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleEliminarReserva}
                disabled={deleting}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
              >
                {deleting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Eliminando...
                  </>
                ) : (
                  <>
                    <Trash2 size={16} />
                    Eliminar Reserva
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default ReservasPage
