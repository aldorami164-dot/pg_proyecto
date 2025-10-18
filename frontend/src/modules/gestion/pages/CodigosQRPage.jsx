import { useState, useEffect } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import qrService from '@shared/services/qrService'
import habitacionesService from '@shared/services/habitacionesService'
import Card from '@shared/components/Card'
import Button from '@shared/components/Button'
import Modal from '@shared/components/Modal'
import Input from '@shared/components/Input'
import Select from '@shared/components/Select'
import Badge from '@shared/components/Badge'
import Table from '@shared/components/Table'
import Loader from '@shared/components/Loader'
import { QrCode, Plus, Link as LinkIcon, Unlink, Copy, ExternalLink, Download } from 'lucide-react'
import toastMessages from '@shared/utils/toastMessages'

const CodigosQRPage = () => {
  const [codigosQr, setCodigosQr] = useState([])
  const [habitaciones, setHabitaciones] = useState([])
  const [loading, setLoading] = useState(true)
  const [showGenerarModal, setShowGenerarModal] = useState(false)
  const [showAsignarModal, setShowAsignarModal] = useState(false)
  const [showQrModal, setShowQrModal] = useState(false)
  const [selectedQr, setSelectedQr] = useState(null)
  const [cantidad, setCantidad] = useState(1)
  const [habitacionSeleccionada, setHabitacionSeleccionada] = useState('')
  const [filters, setFilters] = useState({
    estado: ''
  })

  const estadosQr = [
    { value: '', label: 'Todos los estados' },
    { value: 'sin_asignar', label: 'Sin Asignar' },
    { value: 'asignado', label: 'Asignado' },
    { value: 'inactivo', label: 'Inactivo' }
  ]

  useEffect(() => {
    cargarDatos()
  }, [filters])

  const cargarDatos = async () => {
    try {
      setLoading(true)

      const params = {}
      if (filters.estado) params.estado = filters.estado

      const [qrRes, habitacionesRes] = await Promise.all([
        qrService.listar(params),
        habitacionesService.listar()
      ])

      setCodigosQr(qrRes.codigos_qr || [])
      setHabitaciones(habitacionesRes.habitaciones || [])
    } catch (error) {
      console.error('Error al cargar datos:', error)
      toastMessages.generico.error('Error al cargar los códigos QR')
    } finally {
      setLoading(false)
    }
  }

  const handleGenerarQr = async () => {
    try {
      if (cantidad < 1 || cantidad > 50) {
        toastMessages.generico.error('La cantidad debe estar entre 1 y 50')
        return
      }

      const response = await qrService.generar(cantidad)
      toastMessages.generico.success(`${cantidad} código(s) QR generado(s) exitosamente`)
      setShowGenerarModal(false)
      setCantidad(1)
      cargarDatos()
    } catch (error) {
      console.error('Error al generar QR:', error)
      toastMessages.generico.error('Error al generar los códigos QR')
    }
  }

  const handleAsignarQr = async () => {
    if (!selectedQr || !habitacionSeleccionada) {
      toastMessages.generico.error('Selecciona una habitación')
      return
    }

    try {
      await qrService.asignar(selectedQr.id, parseInt(habitacionSeleccionada))
      toastMessages.generico.success('QR asignado exitosamente a la habitación')
      setShowAsignarModal(false)
      setSelectedQr(null)
      setHabitacionSeleccionada('')
      cargarDatos()
    } catch (error) {
      console.error('Error al asignar QR:', error)
      const mensaje = error.response?.data?.message || 'Error al asignar el código QR'
      toastMessages.generico.error(mensaje)
    }
  }

  const handleDesasignar = async (qrId) => {
    if (!confirm('¿Estás seguro de que deseas desasignar este código QR?')) {
      return
    }

    try {
      await qrService.desasignar(qrId)
      toastMessages.generico.success('QR desasignado exitosamente')
      cargarDatos()
    } catch (error) {
      console.error('Error al desasignar QR:', error)
      toastMessages.generico.error('Error al desasignar el código QR')
    }
  }

  const abrirModalAsignar = (qr) => {
    // Verificación de seguridad
    if (qr.estado === 'asignado') {
      toastMessages.generico.warning('Este QR ya está asignado. Desasígnalo primero.')
      return
    }
    setSelectedQr(qr)
    setHabitacionSeleccionada('')  // Siempre empezar sin selección
    setShowAsignarModal(true)
  }

  const copiarCodigo = (codigo) => {
    navigator.clipboard.writeText(codigo)
    toastMessages.generico.success('Código copiado al portapapeles')
  }

  const copiarUrl = (url) => {
    navigator.clipboard.writeText(url)
    toastMessages.generico.success('URL copiada al portapapeles')
  }

  const verQr = (qr) => {
    setSelectedQr(qr)
    setShowQrModal(true)
  }

  const descargarQr = () => {
    if (!selectedQr) return

    // Obtener el SVG del QR
    const svg = document.getElementById('qr-code-svg')
    if (!svg) return

    // Convertir SVG a canvas
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const svgData = new XMLSerializer().serializeToString(svg)
    const img = new Image()

    img.onload = () => {
      canvas.width = img.width
      canvas.height = img.height
      ctx.drawImage(img, 0, 0)

      // Descargar como PNG
      const pngFile = canvas.toDataURL('image/png')
      const downloadLink = document.createElement('a')
      downloadLink.download = `QR_${selectedQr.habitacion_numero || selectedQr.codigo.substring(0, 8)}.png`
      downloadLink.href = pngFile
      downloadLink.click()

      toastMessages.generico.success('Código QR descargado')
    }

    img.src = 'data:image/svg+xml;base64,' + btoa(svgData)
  }

  const getEstadoBadgeVariant = (estado) => {
    const variants = {
      'sin_asignar': 'warning',
      'asignado': 'success',
      'inactivo': 'default'
    }
    return variants[estado] || 'default'
  }

  const columns = [
    {
      key: 'codigo',
      label: 'Código',
      render: (qr) => (
        <div className="flex items-center gap-2">
          <code className="text-sm bg-gray-100 px-2 py-1 rounded font-mono">
            {qr.codigo?.substring(0, 8)}...
          </code>
          <button
            onClick={() => copiarCodigo(qr.codigo)}
            className="text-gestion-primary-600 hover:text-gestion-primary-700"
            title="Copiar código completo"
          >
            <Copy size={16} />
          </button>
        </div>
      )
    },
    {
      key: 'estado',
      label: 'Estado',
      render: (qr) => (
        <Badge variant={getEstadoBadgeVariant(qr.estado)}>
          {qr.estado === 'sin_asignar' ? 'SIN ASIGNAR' : qr.estado.toUpperCase()}
        </Badge>
      )
    },
    {
      key: 'habitacion',
      label: 'Habitación',
      render: (qr) => (
        qr.habitacion_numero ? (
          <div>
            <span className="font-medium text-gray-900">Hab. {qr.habitacion_numero}</span>
          </div>
        ) : (
          <span className="text-gray-400 text-sm">No asignado</span>
        )
      )
    },
    {
      key: 'url',
      label: 'URL Destino',
      render: (qr) => (
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600 truncate max-w-xs">
            {qr.url_destino}
          </span>
          <button
            onClick={() => copiarUrl(qr.url_destino)}
            className="text-gestion-primary-600 hover:text-gestion-primary-700"
            title="Copiar URL"
          >
            <Copy size={16} />
          </button>
          {qr.estado === 'asignado' && (
            <a
              href={qr.url_destino}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gestion-primary-600 hover:text-gestion-primary-700"
              title="Abrir en nueva pestaña"
            >
              <ExternalLink size={16} />
            </a>
          )}
        </div>
      )
    },
    {
      key: 'estadisticas',
      label: 'Lecturas',
      render: (qr) => (
        <div className="text-sm">
          <div className="font-medium text-gray-900">{qr.total_lecturas || 0}</div>
          {qr.ultima_lectura && (
            <div className="text-gray-500 text-xs">
              Última: {new Date(qr.ultima_lectura).toLocaleDateString()}
            </div>
          )}
        </div>
      )
    },
    {
      key: 'fecha',
      label: 'Creado',
      render: (qr) => (
        <div className="text-sm">
          <div>{new Date(qr.creado_en).toLocaleDateString()}</div>
          {qr.creado_por_nombre && (
            <div className="text-gray-500 text-xs">{qr.creado_por_nombre}</div>
          )}
        </div>
      )
    },
    {
      key: 'acciones',
      label: 'Acciones',
      render: (qr) => (
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => verQr(qr)}
            title="Ver código QR"
          >
            <QrCode size={16} />
          </Button>

          {(qr.estado === 'sin_asignar' || qr.estado === 'inactivo') && (
            <Button
              variant="primary"
              size="sm"
              module="gestion"
              onClick={() => abrirModalAsignar(qr)}
              title="Asignar a habitación"
            >
              <LinkIcon size={16} />
            </Button>
          )}

          {qr.estado === 'asignado' && (
            <Button
              variant="danger"
              size="sm"
              onClick={() => handleDesasignar(qr.id)}
              title="Desasignar"
            >
              <Unlink size={16} />
            </Button>
          )}
        </div>
      )
    }
  ]

  // Estadísticas
  const qrSinAsignar = codigosQr.filter(q => q.estado === 'sin_asignar').length
  const qrAsignados = codigosQr.filter(q => q.estado === 'asignado').length
  const qrInactivos = codigosQr.filter(q => q.estado === 'inactivo').length

  if (loading && codigosQr.length === 0) {
    return <Loader />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Códigos QR</h1>
          <p className="text-gray-600 mt-1">Genera y gestiona códigos QR para habitaciones</p>
        </div>
        <Button
          variant="primary"
          module="gestion"
          onClick={() => setShowGenerarModal(true)}
        >
          <Plus size={20} className="mr-2" />
          Generar QR
        </Button>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card module="gestion">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Sin Asignar</p>
              <p className="text-3xl font-bold text-yellow-600 mt-2">{qrSinAsignar}</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-full">
              <QrCode className="text-yellow-600" size={24} />
            </div>
          </div>
        </Card>

        <Card module="gestion">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Asignados</p>
              <p className="text-3xl font-bold text-green-600 mt-2">{qrAsignados}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <LinkIcon className="text-green-600" size={24} />
            </div>
          </div>
        </Card>

        <Card module="gestion">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Inactivos</p>
              <p className="text-3xl font-bold text-gray-600 mt-2">{qrInactivos}</p>
            </div>
            <div className="p-3 bg-gray-100 rounded-full">
              <Unlink className="text-gray-600" size={24} />
            </div>
          </div>
        </Card>
      </div>

      {/* Filtros */}
      <Card module="gestion">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Select
            label="Estado"
            name="estado"
            value={filters.estado}
            onChange={(e) => setFilters({ ...filters, estado: e.target.value })}
            options={estadosQr}
            module="gestion"
          />
        </div>
      </Card>

      {/* Tabla */}
      <Card title="Listado de Códigos QR" module="gestion">
        <Table
          columns={columns}
          data={codigosQr}
          emptyMessage="No hay códigos QR generados"
        />
      </Card>

      {/* Modal Generar QR */}
      <Modal
        isOpen={showGenerarModal}
        onClose={() => {
          setShowGenerarModal(false)
          setCantidad(1)
        }}
        title="Generar Códigos QR"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Genera múltiples códigos QR en stock para asignar posteriormente a las habitaciones.
          </p>

          <Input
            label="Cantidad de códigos a generar"
            type="number"
            name="cantidad"
            value={cantidad}
            onChange={(e) => setCantidad(parseInt(e.target.value) || 1)}
            min="1"
            max="50"
            required
            module="gestion"
            placeholder="Ej: 10"
          />

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-800">
              💡 Los códigos QR se generarán en estado "Sin Asignar" y podrás asignarlos a habitaciones después.
            </p>
          </div>

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="secondary"
              module="gestion"
              onClick={() => {
                setShowGenerarModal(false)
                setCantidad(1)
              }}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              variant="primary"
              module="gestion"
              onClick={handleGenerarQr}
            >
              Generar {cantidad} QR
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal Asignar QR */}
      <Modal
        isOpen={showAsignarModal}
        onClose={() => {
          setShowAsignarModal(false)
          setSelectedQr(null)
          setHabitacionSeleccionada('')
        }}
        title="Asignar Código QR a Habitación"
        size="md"
      >
        {selectedQr && (
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-2">Código QR:</p>
              <code className="text-sm bg-white px-3 py-2 rounded border font-mono block">
                {selectedQr.codigo}
              </code>
            </div>

            <Select
              label="Seleccionar Habitación"
              name="habitacion"
              value={habitacionSeleccionada}
              onChange={(e) => setHabitacionSeleccionada(e.target.value)}
              options={[
                { value: '', label: 'Selecciona una habitación' },
                ...habitaciones
                  .filter(h => !h.tiene_qr_asignado)
                  .map(h => ({
                    value: h.id,
                    label: `Hab. ${h.numero} - ${h.tipo_habitacion}`
                  }))
              ]}
              required
              module="gestion"
            />

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <p className="text-sm text-yellow-800">
                ⚠️ Solo se muestran habitaciones que no tienen QR asignado.
                {habitaciones.filter(h => !h.tiene_qr_asignado).length === 0 && (
                  <span className="block mt-1 font-medium">
                    No hay habitaciones disponibles. Todas ya tienen QR asignado.
                  </span>
                )}
              </p>
            </div>

            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="secondary"
                module="gestion"
                onClick={() => {
                  setShowAsignarModal(false)
                  setSelectedQr(null)
                  setHabitacionSeleccionada('')
                }}
              >
                Cancelar
              </Button>
              <Button
                type="button"
                variant="primary"
                module="gestion"
                onClick={handleAsignarQr}
                disabled={!habitacionSeleccionada}
              >
                Asignar QR
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal Ver QR */}
      <Modal
        isOpen={showQrModal}
        onClose={() => {
          setShowQrModal(false)
          setSelectedQr(null)
        }}
        title="Vista Previa del Código QR"
        size="md"
      >
        {selectedQr && (
          <div className="space-y-4">
            <div className="bg-white border-2 border-gray-200 rounded-lg p-8 flex flex-col items-center">
              <div className="bg-white p-6 rounded-lg shadow-sm">
                {/* QR Code generado con qrcode.react */}
                <QRCodeSVG
                  id="qr-code-svg"
                  value={selectedQr.url_destino}
                  size={256}
                  level="H"
                  includeMargin={true}
                  imageSettings={
                    selectedQr.habitacion_numero ? {
                      src: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%233B82F6'%3E%3Cpath d='M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z'/%3E%3C/svg%3E",
                      height: 32,
                      width: 32,
                      excavate: true,
                    } : undefined
                  }
                />
              </div>
              <p className="text-sm text-gray-600 mt-4 text-center">
                Escanea este código QR con tu dispositivo móvil
              </p>

              {/* Botón de descarga */}
              <Button
                variant="primary"
                module="gestion"
                onClick={descargarQr}
                className="mt-4"
              >
                <Download size={16} className="mr-2" />
                Descargar QR (PNG)
              </Button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-600">Código:</label>
                <div className="flex items-center gap-2 mt-1">
                  <code className="flex-1 text-sm bg-gray-100 px-3 py-2 rounded font-mono">
                    {selectedQr.codigo}
                  </code>
                  <button
                    onClick={() => copiarCodigo(selectedQr.codigo)}
                    className="text-gestion-primary-600 hover:text-gestion-primary-700"
                  >
                    <Copy size={20} />
                  </button>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600">URL Destino:</label>
                <div className="flex items-center gap-2 mt-1">
                  <input
                    type="text"
                    value={selectedQr.url_destino}
                    readOnly
                    className="flex-1 text-sm bg-gray-100 px-3 py-2 rounded border-0"
                  />
                  <button
                    onClick={() => copiarUrl(selectedQr.url_destino)}
                    className="text-gestion-primary-600 hover:text-gestion-primary-700"
                  >
                    <Copy size={20} />
                  </button>
                </div>
              </div>

              {selectedQr.habitacion_numero && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Habitación:</label>
                  <p className="text-gray-900 mt-1">Habitación {selectedQr.habitacion_numero}</p>
                </div>
              )}

              <div>
                <label className="text-sm font-medium text-gray-600">Estadísticas:</label>
                <p className="text-gray-900 mt-1">
                  {selectedQr.total_lecturas || 0} lecturas totales
                </p>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-800">
                💡 Tip: Descarga el QR como imagen PNG para imprimirlo o compartirlo.
              </p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default CodigosQRPage
