import { useState, useEffect } from 'react'
import reportesService from '@shared/services/reportesService'
import Card from '@shared/components/Card'
import Button from '@shared/components/Button'
import Modal from '@shared/components/Modal'
import Input from '@shared/components/Input'
import Select from '@shared/components/Select'
import Badge from '@shared/components/Badge'
import Table from '@shared/components/Table'
import Loader from '@shared/components/Loader'
import { BarChart3, Plus, Calendar, TrendingUp, Eye, Download, DollarSign, Users, Trash2 } from 'lucide-react'
import { toast } from 'react-hot-toast'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'

const ReportesPage = () => {
  const [reportes, setReportes] = useState([])
  const [loading, setLoading] = useState(true)
  const [showGenerarModal, setShowGenerarModal] = useState(false)
  const [showDetalleModal, setShowDetalleModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedReporte, setSelectedReporte] = useState(null)
  const [reporteToDelete, setReporteToDelete] = useState(null)
  const [generandoReporte, setGenerandoReporte] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [filters, setFilters] = useState({
    tipo_periodo: '',
    fecha_desde: '',
    fecha_hasta: ''
  })

  // Estado del formulario
  const [formData, setFormData] = useState({
    fecha_inicio: '',
    fecha_fin: '',
    tipo_periodo: 'semanal'
  })

  // Tipos de período - ALINEADOS CON EL BACKEND
  const tiposPeriodo = [
    { value: '', label: 'Todos los períodos' },
    { value: 'semanal', label: 'Semanal' },
    { value: 'mensual', label: 'Mensual' }
  ]

  const tiposPeriodoForm = [
    { value: 'semanal', label: 'Semanal' },
    { value: 'mensual', label: 'Mensual' }
  ]

  useEffect(() => {
    cargarReportes()
  }, [filters])

  const cargarReportes = async () => {
    try {
      setLoading(true)
      const params = {}
      if (filters.tipo_periodo) params.tipo_periodo = filters.tipo_periodo
      if (filters.fecha_desde) params.fecha_desde = filters.fecha_desde
      if (filters.fecha_hasta) params.fecha_hasta = filters.fecha_hasta

      const response = await reportesService.listar(params)
      setReportes(response.reportes || [])
    } catch (error) {
      console.error('Error al cargar reportes:', error)
      toast.error('Error al cargar los reportes')
    } finally {
      setLoading(false)
    }
  }

  const handleGenerarReporte = async (e) => {
    e.preventDefault()

    try {
      setGenerandoReporte(true)

      const response = await reportesService.generar({
        fecha_inicio: formData.fecha_inicio,
        fecha_fin: formData.fecha_fin,
        tipo_periodo: formData.tipo_periodo
      })

      toast.success('Reporte generado exitosamente')
      setShowGenerarModal(false)
      resetForm()
      cargarReportes()

      // Mostrar el reporte generado
      if (response) {
        setSelectedReporte(response)
        setShowDetalleModal(true)
      }
    } catch (error) {
      console.error('Error al generar reporte:', error)
      toast.error(error.response?.data?.message || 'Error al generar el reporte')
    } finally {
      setGenerandoReporte(false)
    }
  }

  const resetForm = () => {
    setFormData({
      fecha_inicio: '',
      fecha_fin: '',
      tipo_periodo: 'semanal'
    })
  }

  const handleVerDetalle = async (reporte) => {
    try {
      const response = await reportesService.obtener(reporte.id)
      setSelectedReporte(response)
      setShowDetalleModal(true)
    } catch (error) {
      console.error('Error al obtener detalles:', error)
      toast.error('Error al cargar los detalles del reporte')
    }
  }

  const handleConfirmarEliminar = (reporte) => {
    setReporteToDelete(reporte)
    setShowDeleteModal(true)
  }

  const handleEliminarReporte = async () => {
    if (!reporteToDelete) return

    try {
      setDeleting(true)
      await reportesService.eliminar(reporteToDelete.id)
      toast.success('Reporte eliminado exitosamente')
      setShowDeleteModal(false)
      setReporteToDelete(null)
      cargarReportes()
    } catch (error) {
      console.error('Error al eliminar reporte:', error)
      toast.error('Error al eliminar el reporte')
    } finally {
      setDeleting(false)
    }
  }

  const getTipoPeriodoBadge = (tipo) => {
    const variants = {
      'semanal': 'primary',
      'mensual': 'success'
    }
    return variants[tipo] || 'default'
  }

  const getOcupacionColor = (porcentaje) => {
    if (porcentaje >= 80) return 'text-green-600'
    if (porcentaje >= 50) return 'text-yellow-600'
    return 'text-red-600'
  }

  const columns = [
    {
      key: 'id',
      label: 'ID',
      render: (reporte) => `#${reporte.id}`
    },
    {
      key: 'periodo',
      label: 'Período',
      render: (reporte) => (
        <div>
          <Badge variant={getTipoPeriodoBadge(reporte.tipo_periodo)}>
            {reporte.tipo_periodo.toUpperCase()}
          </Badge>
          <div className="text-sm text-gray-600 mt-1">
            {new Date(reporte.fecha_inicio).toLocaleDateString()} - {new Date(reporte.fecha_fin).toLocaleDateString()}
          </div>
        </div>
      )
    },
    {
      key: 'ocupacion',
      label: 'Ocupación',
      render: (reporte) => (
        <div className="text-center">
          <div className={`text-2xl font-bold ${getOcupacionColor(reporte.porcentaje_ocupacion || 0)}`}>
            {reporte.porcentaje_ocupacion ? Number(reporte.porcentaje_ocupacion).toFixed(1) : '0.0'}%
          </div>
          <div className="text-sm text-gray-600">
            {reporte.habitaciones_ocupadas || 0} / {reporte.total_habitaciones || 0}
          </div>
        </div>
      )
    },
    {
      key: 'reservas',
      label: 'Reservas',
      render: (reporte) => (
        <div className="text-center">
          <div className="text-xl font-semibold text-gray-900">{reporte.total_reservas}</div>
          <div className="text-xs text-gray-500">Total</div>
        </div>
      )
    },
    {
      key: 'generado',
      label: 'Generado',
      render: (reporte) => (
        <div className="text-sm">
          <div>{new Date(reporte.creado_en).toLocaleDateString()}</div>
          <div className="text-gray-500">{reporte.generado_por_nombre}</div>
        </div>
      )
    },
    {
      key: 'acciones',
      label: 'Acciones',
      render: (reporte) => (
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => handleVerDetalle(reporte)}
            title="Ver detalles"
          >
            <Eye size={16} />
          </Button>
          <button
            onClick={() => handleConfirmarEliminar(reporte)}
            className="action-btn-compact text-red-600 hover:bg-red-50"
            title="Eliminar reporte"
          >
            <Trash2 size={16} />
          </button>
        </div>
      )
    }
  ]

  if (loading && reportes.length === 0) {
    return <Loader />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reportes de Ocupación</h1>
          <p className="text-gray-600 mt-1">Genera y visualiza reportes de ocupación del hotel</p>
        </div>
        <Button
          variant="primary"
          module="gestion"
          onClick={() => {
            resetForm()
            setShowGenerarModal(true)
          }}
        >
          <Plus size={20} className="mr-2" />
          Generar Reporte
        </Button>
      </div>

      {/* Resumen rápido */}
      {reportes.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card module="gestion">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Reportes Generados</p>
                <p className="text-3xl font-bold text-blue-600 mt-2">{reportes.length}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <BarChart3 className="text-blue-600" size={24} />
              </div>
            </div>
          </Card>

          <Card module="gestion">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Último Reporte</p>
                <p className="text-xl font-bold text-gray-900 mt-2">
                  {reportes[0]?.porcentaje_ocupacion ? Number(reportes[0].porcentaje_ocupacion).toFixed(1) : '0.0'}%
                </p>
                <p className="text-xs text-gray-500 mt-1">Ocupación</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <TrendingUp className="text-green-600" size={24} />
              </div>
            </div>
          </Card>

          <Card module="gestion">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Período Común</p>
                <p className="text-xl font-bold text-gray-900 mt-2 capitalize">
                  {reportes[0]?.tipo_periodo || 'N/A'}
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <Calendar className="text-purple-600" size={24} />
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Filtros */}
      <Card module="gestion">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Select
            label="Tipo de Período"
            name="tipo_periodo"
            value={filters.tipo_periodo}
            onChange={(e) => setFilters({ ...filters, tipo_periodo: e.target.value })}
            options={tiposPeriodo}
            module="gestion"
          />

          <Input
            label="Fecha Desde"
            type="date"
            name="fecha_desde"
            value={filters.fecha_desde}
            onChange={(e) => setFilters({ ...filters, fecha_desde: e.target.value })}
            module="gestion"
          />

          <Input
            label="Fecha Hasta"
            type="date"
            name="fecha_hasta"
            value={filters.fecha_hasta}
            onChange={(e) => setFilters({ ...filters, fecha_hasta: e.target.value })}
            module="gestion"
          />
        </div>
      </Card>

      {/* Tabla */}
      <Card title="Historial de Reportes" module="gestion">
        <Table
          columns={columns}
          data={reportes}
          emptyMessage="No hay reportes generados. Genera tu primer reporte para comenzar."
        />
      </Card>

      {/* Modal Generar Reporte */}
      <Modal
        isOpen={showGenerarModal}
        onClose={() => {
          setShowGenerarModal(false)
          resetForm()
        }}
        title="Generar Reporte de Ocupación"
        size="md"
      >
        <form onSubmit={handleGenerarReporte} className="space-y-4">
          <p className="text-gray-600">
            Genera un reporte de ocupación para el período seleccionado. El reporte incluirá estadísticas detalladas de habitaciones y reservas.
          </p>

          <Input
            label="Fecha de Inicio"
            type="date"
            name="fecha_inicio"
            value={formData.fecha_inicio}
            onChange={(e) => setFormData({ ...formData, fecha_inicio: e.target.value })}
            required
            max={formData.fecha_fin || undefined}
            module="gestion"
          />

          <Input
            label="Fecha de Fin"
            type="date"
            name="fecha_fin"
            value={formData.fecha_fin}
            onChange={(e) => setFormData({ ...formData, fecha_fin: e.target.value })}
            required
            min={formData.fecha_inicio || undefined}
            module="gestion"
          />

          <Select
            label="Tipo de Período"
            name="tipo_periodo"
            value={formData.tipo_periodo}
            onChange={(e) => setFormData({ ...formData, tipo_periodo: e.target.value })}
            options={tiposPeriodoForm}
            required
            module="gestion"
          />

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              💡 El reporte se generará utilizando los datos históricos del período seleccionado.
            </p>
          </div>

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="secondary"
              module="gestion"
              onClick={() => {
                setShowGenerarModal(false)
                resetForm()
              }}
              disabled={generandoReporte}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="primary"
              module="gestion"
              disabled={generandoReporte}
            >
              {generandoReporte ? 'Generando...' : 'Generar Reporte'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal Detalle Reporte */}
      <Modal
        isOpen={showDetalleModal}
        onClose={() => {
          setShowDetalleModal(false)
          setSelectedReporte(null)
        }}
        title="Detalles del Reporte de Ocupación"
        size="xl"
      >
        {selectedReporte && (() => {
          // ==================== NUEVO: Preparar datos mejorados ====================
          // Datos para gráfica de pastel (promedio)
          const dataOcupacion = [
            {
              name: 'Ocupadas',
              value: selectedReporte.habitaciones_ocupadas || 0,
              porcentaje: selectedReporte.porcentaje_ocupacion || 0
            },
            {
              name: 'Disponibles',
              value: (selectedReporte.total_habitaciones || 0) - (selectedReporte.habitaciones_ocupadas || 0),
              porcentaje: 100 - (selectedReporte.porcentaje_ocupacion || 0)
            }
          ]

          // Datos para gráfica de línea (ocupación día por día)
          const dataOcupacionDiaria = (selectedReporte.ocupacion_por_dia || []).map(dia => ({
            fecha: new Date(dia.fecha).toLocaleDateString('es-GT', { month: 'short', day: 'numeric' }),
            habitaciones: Number(dia.habitaciones_ocupadas) || 0
          }))
          // ==================== FIN NUEVO ====================

          const COLORS = {
            ocupadas: '#0ea5e9',    // Sky blue
            disponibles: '#94a3b8'  // Slate
          }

          return (
            <div className="space-y-6">
              {/* Header del reporte */}
              <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg p-6 text-white shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-bold">Reporte #{selectedReporte.id}</h3>
                    <p className="text-blue-100 mt-1">
                      {new Date(selectedReporte.fecha_inicio).toLocaleDateString('es-GT')} - {new Date(selectedReporte.fecha_fin).toLocaleDateString('es-GT')}
                    </p>
                  </div>
                  <Badge variant="default" className="bg-white text-blue-700 border-0">
                    {selectedReporte.tipo_periodo.toUpperCase()}
                  </Badge>
                </div>
              </div>

              {/* Métricas principales en cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-5 text-center shadow-md">
                  <div className="flex justify-center mb-2">
                    <div className="p-2 bg-green-500 rounded-full">
                      <TrendingUp className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <p className="text-xs font-semibold text-green-900 uppercase tracking-wide">Ocupación Promedio</p>
                  <p className="text-4xl font-bold text-green-600 mt-2">
                    {selectedReporte.porcentaje_ocupacion ? Number(selectedReporte.porcentaje_ocupacion).toFixed(1) : '0.0'}%
                  </p>
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-xl p-5 text-center shadow-md">
                  <div className="flex justify-center mb-2">
                    <div className="p-2 bg-blue-500 rounded-full">
                      <Users className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <p className="text-xs font-semibold text-blue-900 uppercase tracking-wide">Ocupación Diaria Promedio</p>
                  <p className="text-4xl font-bold text-blue-600 mt-2">
                    {selectedReporte.habitaciones_ocupadas} hab.
                  </p>
                  <p className="text-xs text-blue-700 mt-1 font-medium">
                    ocupadas por día en promedio
                  </p>
                  <p className="text-xs text-blue-600 mt-1">
                    de {selectedReporte.total_habitaciones} habitaciones totales
                  </p>
                  {selectedReporte.dias_periodo && (
                    <p className="text-xs text-blue-500 mt-1 italic">
                      Período de {selectedReporte.dias_periodo} días
                    </p>
                  )}
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-indigo-50 border-2 border-purple-200 rounded-xl p-5 text-center shadow-md">
                  <div className="flex justify-center mb-2">
                    <div className="p-2 bg-purple-500 rounded-full">
                      <Calendar className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <p className="text-xs font-semibold text-purple-900 uppercase tracking-wide">Total Reservas</p>
                  <p className="text-4xl font-bold text-purple-600 mt-2">
                    {selectedReporte.total_reservas}
                  </p>
                </div>
              </div>

              {/* Gráficas */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Gráfica de Pastel - Ocupación */}
                <Card module="gestion" className="border-2 shadow-lg">
                  <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-blue-600" />
                    Ocupación Promedio del Período
                  </h4>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={dataOcupacion}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, porcentaje }) => `${name}: ${Number(porcentaje || 0).toFixed(1)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        <Cell fill={COLORS.ocupadas} />
                        <Cell fill={COLORS.disponibles} />
                      </Pie>
                      <Tooltip formatter={(value) => `${value} habitaciones`} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </Card>

                {/* ==================== NUEVO: Gráfica de Línea - Ocupación Diaria ==================== */}
                <Card module="gestion" className="border-2 shadow-lg">
                  <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-blue-600" />
                    Ocupación Día por Día
                  </h4>
                  {dataOcupacionDiaria.length > 0 ? (
                    <ResponsiveContainer width="100%" height={250}>
                      <LineChart data={dataOcupacionDiaria}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis
                          dataKey="fecha"
                          stroke="#6b7280"
                          style={{ fontSize: '11px' }}
                          angle={-45}
                          textAnchor="end"
                          height={70}
                        />
                        <YAxis
                          stroke="#6b7280"
                          style={{ fontSize: '12px' }}
                          label={{ value: 'Habitaciones', angle: -90, position: 'insideLeft', style: { fontSize: '12px' } }}
                        />
                        <Tooltip
                          formatter={(value) => [`${value} habitaciones`, 'Ocupadas']}
                          contentStyle={{
                            backgroundColor: 'white',
                            border: '1px solid #e5e7eb',
                            borderRadius: '8px',
                            fontSize: '12px'
                          }}
                        />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="habitaciones"
                          stroke="#0ea5e9"
                          strokeWidth={3}
                          dot={{ fill: '#0ea5e9', r: 5 }}
                          activeDot={{ r: 7 }}
                          name="Habitaciones Ocupadas"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-[250px] text-gray-500">
                      <p>No hay datos diarios disponibles</p>
                    </div>
                  )}
                </Card>
                {/* ==================== FIN NUEVO ==================== */}
              </div>

              {/* Indicador visual de ocupación */}
              <Card module="gestion" className="border-2 shadow-lg">
                <h4 className="text-lg font-bold text-gray-900 mb-4">Nivel de Ocupación</h4>
                <div className="relative w-full h-8 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`absolute top-0 left-0 h-full rounded-full transition-all duration-500 ${
                      selectedReporte.porcentaje_ocupacion >= 80 ? 'bg-gradient-to-r from-green-500 to-emerald-600' :
                      selectedReporte.porcentaje_ocupacion >= 50 ? 'bg-gradient-to-r from-yellow-500 to-orange-500' :
                      'bg-gradient-to-r from-red-500 to-rose-600'
                    }`}
                    style={{ width: `${selectedReporte.porcentaje_ocupacion || 0}%` }}
                  >
                    <div className="flex items-center justify-end h-full px-3">
                      <span className="text-white text-xs font-bold">
                        {Number(selectedReporte.porcentaje_ocupacion || 0).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex justify-between mt-2 text-xs text-gray-600">
                  <span>0%</span>
                  <span>50%</span>
                  <span>100%</span>
                </div>
              </Card>

              {/* Información adicional */}
              <Card module="gestion" className="bg-gray-50 border shadow-sm">
                <h4 className="text-sm font-bold text-gray-900 mb-3">Información del Reporte</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between py-2 border-b border-gray-200">
                    <span className="text-gray-600">Generado por:</span>
                    <span className="font-medium text-gray-900">{selectedReporte.generado_por_nombre}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-200">
                    <span className="text-gray-600">Fecha de generación:</span>
                    <span className="font-medium text-gray-900">
                      {new Date(selectedReporte.creado_en).toLocaleString('es-GT')}
                    </span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-gray-600">Período analizado:</span>
                    <span className="font-medium text-gray-900 capitalize">{selectedReporte.tipo_periodo}</span>
                  </div>
                </div>
              </Card>

              {/* Interpretación */}
              <div className={`rounded-xl p-5 border-2 ${
                selectedReporte.porcentaje_ocupacion >= 80 ? 'bg-green-50 border-green-200' :
                selectedReporte.porcentaje_ocupacion >= 50 ? 'bg-yellow-50 border-yellow-200' :
                'bg-red-50 border-red-200'
              }`}>
                <h4 className={`text-sm font-bold mb-2 flex items-center gap-2 ${
                  selectedReporte.porcentaje_ocupacion >= 80 ? 'text-green-900' :
                  selectedReporte.porcentaje_ocupacion >= 50 ? 'text-yellow-900' :
                  'text-red-900'
                }`}>
                  📊 Análisis e Interpretación
                </h4>
                <p className={`text-sm ${
                  selectedReporte.porcentaje_ocupacion >= 80 ? 'text-green-800' :
                  selectedReporte.porcentaje_ocupacion >= 50 ? 'text-yellow-800' :
                  'text-red-800'
                }`}>
                  {selectedReporte.porcentaje_ocupacion >= 80 &&
                    '✅ Excelente nivel de ocupación. El hotel está operando cerca de su capacidad máxima. Considere estrategias de precios premium durante períodos de alta demanda.'}
                  {selectedReporte.porcentaje_ocupacion >= 50 && selectedReporte.porcentaje_ocupacion < 80 &&
                    '⚠️ Ocupación moderada. Hay oportunidad de mejorar con estrategias de marketing digital, promociones especiales y alianzas con plataformas de reservas.'}
                  {selectedReporte.porcentaje_ocupacion < 50 &&
                    '⚠️ Ocupación baja. Se recomienda urgentemente: revisar precios competitivos, mejorar presencia en línea, ofrecer descuentos estratégicos y analizar la experiencia del cliente.'}
                </p>
              </div>
            </div>
          )
        })()}
      </Modal>

      {/* Modal de Confirmación de Eliminación */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false)
          setReporteToDelete(null)
        }}
        title="Confirmar Eliminación"
        size="sm"
      >
        {reporteToDelete && (
          <div className="space-y-4">
            <div className="bg-red-50 border-l-4 border-red-400 p-4">
              <div className="flex items-start">
                <Trash2 className="text-red-600 mt-0.5 mr-3" size={20} />
                <div>
                  <p className="text-sm font-medium text-red-800">
                    ¿Estás seguro de eliminar este reporte?
                  </p>
                  <p className="text-xs text-red-700 mt-1">
                    Esta acción no se puede deshacer. El reporte será eliminado permanentemente del sistema.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-3 rounded">
              <p className="text-sm font-medium text-gray-900">Reporte #{reporteToDelete.id}</p>
              <p className="text-xs text-gray-600 mt-1">
                Período: {new Date(reporteToDelete.fecha_inicio).toLocaleDateString()} - {new Date(reporteToDelete.fecha_fin).toLocaleDateString()}
              </p>
              <p className="text-xs text-gray-600">
                Tipo: <Badge variant={getTipoPeriodoBadge(reporteToDelete.tipo_periodo)}>
                  {reporteToDelete.tipo_periodo.toUpperCase()}
                </Badge>
              </p>
              <p className="text-xs text-gray-600">
                Ocupación: {reporteToDelete.porcentaje_ocupacion ? Number(reporteToDelete.porcentaje_ocupacion).toFixed(1) : '0.0'}%
              </p>
            </div>

            <div className="flex gap-3 justify-end pt-2">
              <button
                onClick={() => {
                  setShowDeleteModal(false)
                  setReporteToDelete(null)
                }}
                disabled={deleting}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleEliminarReporte}
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
                    Eliminar Reporte
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

export default ReportesPage
