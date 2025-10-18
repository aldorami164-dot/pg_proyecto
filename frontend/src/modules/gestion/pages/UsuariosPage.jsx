import { useState, useEffect } from 'react'
import { useAuth } from '@shared/context/AuthContext'
import usuariosService from '@shared/services/usuariosService'
import Card from '@shared/components/Card'
import Button from '@shared/components/Button'
import Modal from '@shared/components/Modal'
import Input from '@shared/components/Input'
import Select from '@shared/components/Select'
import Badge from '@shared/components/Badge'
import Table from '@shared/components/Table'
import Loader from '@shared/components/Loader'
import { Users, Plus, Edit, Power, Shield, User } from 'lucide-react'
import { toast } from 'react-hot-toast'

const UsuariosPage = () => {
  const { user: currentUser } = useAuth()
  const [usuarios, setUsuarios] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [selectedUsuario, setSelectedUsuario] = useState(null)
  const [filters, setFilters] = useState({
    activo: '',
    rol_id: ''
  })

  // Estado del formulario
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    password: '',
    rol_id: '',
    activo: true
  })

  const roles = [
    { value: '', label: 'Todos los roles' },
    { value: '1', label: 'Administrador' },
    { value: '2', label: 'Recepcionista' }
  ]

  const rolesForm = [
    { value: '1', label: 'Administrador' },
    { value: '2', label: 'Recepcionista' }
  ]

  const estadosUsuario = [
    { value: '', label: 'Todos los estados' },
    { value: 'true', label: 'Activos' },
    { value: 'false', label: 'Inactivos' }
  ]

  useEffect(() => {
    cargarUsuarios()
  }, [filters])

  const cargarUsuarios = async () => {
    try {
      setLoading(true)
      const params = {}
      if (filters.activo !== '') params.activo = filters.activo
      if (filters.rol_id) params.rol_id = filters.rol_id

      const response = await usuariosService.listar(params)
      setUsuarios(response.usuarios || [])
    } catch (error) {
      console.error('Error al cargar usuarios:', error)
      toast.error('Error al cargar los usuarios')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const dataToSend = {
      ...formData,
      rol_id: parseInt(formData.rol_id)
    }

    // Si es edición y no se ingresó nueva contraseña, eliminarla del objeto
    if (selectedUsuario && !formData.password) {
      delete dataToSend.password
    }

    try {
      if (selectedUsuario) {
        await usuariosService.actualizar(selectedUsuario.id, dataToSend)
        toast.success('Usuario actualizado exitosamente')
      } else {
        if (!formData.password) {
          toast.error('La contraseña es requerida para nuevos usuarios')
          return
        }
        await usuariosService.crear(dataToSend)
        toast.success('Usuario creado exitosamente')
      }

      setShowModal(false)
      resetForm()
      cargarUsuarios()
    } catch (error) {
      console.error('❌ Error al guardar usuario:', error)
      console.error('❌ Response data:', JSON.stringify(error.response?.data, null, 2))
      console.error('❌ Datos enviados:', JSON.stringify(dataToSend, null, 2))
      toast.error(error.response?.data?.message || 'Error al guardar el usuario')
    }
  }

  const handleToggleActivo = async (usuarioId) => {
    // Evitar que el admin se desactive a sí mismo
    if (usuarioId === currentUser.id) {
      toast.error('No puedes desactivar tu propio usuario')
      return
    }

    try {
      await usuariosService.toggleActivo(usuarioId)
      toast.success('Estado del usuario actualizado')
      cargarUsuarios()
    } catch (error) {
      console.error('Error al cambiar estado:', error)
      toast.error('Error al cambiar el estado del usuario')
    }
  }

  const resetForm = () => {
    setFormData({
      nombre: '',
      apellido: '',
      email: '',
      password: '',
      rol_id: '',
      activo: true
    })
    setSelectedUsuario(null)
  }

  const handleEdit = (usuario) => {
    setSelectedUsuario(usuario)
    setFormData({
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      email: usuario.email,
      password: '', // No cargar la contraseña
      rol_id: usuario.rol_id.toString(),
      activo: usuario.activo
    })
    setShowModal(true)
  }

  const getRolBadgeVariant = (rol) => {
    return rol === 'administrador' ? 'success' : 'info'
  }

  const columns = [
    {
      key: 'nombre',
      label: 'Usuario',
      render: (usuario) => (
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-full ${usuario.rol === 'administrador' ? 'bg-green-100' : 'bg-blue-100'}`}>
            {usuario.rol === 'administrador' ? (
              <Shield className={usuario.rol === 'administrador' ? 'text-green-600' : 'text-blue-600'} size={20} />
            ) : (
              <User className="text-blue-600" size={20} />
            )}
          </div>
          <div>
            <div className="font-medium text-gray-900">
              {usuario.nombre} {usuario.apellido}
            </div>
            <div className="text-sm text-gray-500">{usuario.email}</div>
          </div>
        </div>
      )
    },
    {
      key: 'rol',
      label: 'Rol',
      render: (usuario) => (
        <Badge variant={getRolBadgeVariant(usuario.rol)}>
          {usuario.rol.toUpperCase()}
        </Badge>
      )
    },
    {
      key: 'estado',
      label: 'Estado',
      render: (usuario) => (
        <Badge variant={usuario.activo ? 'success' : 'default'}>
          {usuario.activo ? 'ACTIVO' : 'INACTIVO'}
        </Badge>
      )
    },
    {
      key: 'ultimo_acceso',
      label: 'Último Acceso',
      render: (usuario) => (
        <div className="text-sm">
          {usuario.ultimo_acceso ? (
            <>
              <div>{new Date(usuario.ultimo_acceso).toLocaleDateString()}</div>
              <div className="text-gray-500">
                {new Date(usuario.ultimo_acceso).toLocaleTimeString('es-GT', {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </div>
            </>
          ) : (
            <span className="text-gray-400">Nunca</span>
          )}
        </div>
      )
    },
    {
      key: 'creado',
      label: 'Creado',
      render: (usuario) => (
        <div className="text-sm text-gray-600">
          {new Date(usuario.creado_en).toLocaleDateString()}
        </div>
      )
    },
    {
      key: 'acciones',
      label: 'Acciones',
      render: (usuario) => (
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            module="gestion"
            onClick={() => handleEdit(usuario)}
            title="Editar usuario"
          >
            <Edit size={16} />
          </Button>

          {usuario.id !== currentUser.id && (
            <Button
              variant={usuario.activo ? 'danger' : 'success'}
              size="sm"
              onClick={() => handleToggleActivo(usuario.id)}
              title={usuario.activo ? 'Desactivar' : 'Activar'}
            >
              <Power size={16} />
            </Button>
          )}

          {usuario.id === currentUser.id && (
            <span className="text-xs text-gray-500 px-2">(Tú)</span>
          )}
        </div>
      )
    }
  ]

  // Estadísticas
  const usuariosActivos = usuarios.filter(u => u.activo).length
  const usuariosInactivos = usuarios.filter(u => !u.activo).length
  const administradores = usuarios.filter(u => u.rol === 'administrador').length

  if (loading && usuarios.length === 0) {
    return <Loader />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Usuarios</h1>
          <p className="text-gray-600 mt-1">Gestiona los usuarios del sistema (Solo Administradores)</p>
        </div>
        <Button
          variant="primary"
          module="gestion"
          onClick={() => {
            resetForm()
            setShowModal(true)
          }}
        >
          <Plus size={20} className="mr-2" />
          Nuevo Usuario
        </Button>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card module="gestion">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Usuarios Activos</p>
              <p className="text-3xl font-bold text-green-600 mt-2">{usuariosActivos}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <Users className="text-green-600" size={24} />
            </div>
          </div>
        </Card>

        <Card module="gestion">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Administradores</p>
              <p className="text-3xl font-bold text-blue-600 mt-2">{administradores}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <Shield className="text-blue-600" size={24} />
            </div>
          </div>
        </Card>

        <Card module="gestion">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Inactivos</p>
              <p className="text-3xl font-bold text-gray-600 mt-2">{usuariosInactivos}</p>
            </div>
            <div className="p-3 bg-gray-100 rounded-full">
              <Power className="text-gray-600" size={24} />
            </div>
          </div>
        </Card>
      </div>

      {/* Filtros */}
      <Card module="gestion">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label="Estado"
            name="activo"
            value={filters.activo}
            onChange={(e) => setFilters({ ...filters, activo: e.target.value })}
            options={estadosUsuario}
            module="gestion"
          />

          <Select
            label="Rol"
            name="rol_id"
            value={filters.rol_id}
            onChange={(e) => setFilters({ ...filters, rol_id: e.target.value })}
            options={roles}
            module="gestion"
          />
        </div>
      </Card>

      {/* Tabla */}
      <Card title="Listado de Usuarios" module="gestion">
        <Table
          columns={columns}
          data={usuarios}
          emptyMessage="No hay usuarios registrados"
        />
      </Card>

      {/* Modal Crear/Editar */}
      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false)
          resetForm()
        }}
        title={selectedUsuario ? 'Editar Usuario' : 'Nuevo Usuario'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Nombre"
              type="text"
              name="nombre"
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              required
              module="gestion"
              placeholder="Ej: Juan"
            />

            <Input
              label="Apellido"
              type="text"
              name="apellido"
              value={formData.apellido}
              onChange={(e) => setFormData({ ...formData, apellido: e.target.value })}
              required
              module="gestion"
              placeholder="Ej: Pérez"
            />
          </div>

          <Input
            label="Correo Electrónico"
            type="email"
            name="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
            module="gestion"
            placeholder="usuario@ejemplo.com"
          />

          <Input
            label={selectedUsuario ? 'Nueva Contraseña (dejar en blanco para no cambiar)' : 'Contraseña'}
            type="password"
            name="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required={!selectedUsuario}
            module="gestion"
            placeholder="••••••••"
          />

          <Select
            label="Rol"
            name="rol_id"
            value={formData.rol_id}
            onChange={(e) => setFormData({ ...formData, rol_id: e.target.value })}
            options={rolesForm}
            required
            module="gestion"
          />

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 className="text-sm font-medium text-yellow-900 mb-2">⚠️ Información sobre Roles:</h4>
            <ul className="text-sm text-yellow-800 space-y-1">
              <li>• <strong>Administrador:</strong> Acceso completo al sistema (crear usuarios, habitaciones, reportes)</li>
              <li>• <strong>Recepcionista:</strong> Gestión de reservas, solicitudes y cambio de estados</li>
            </ul>
          </div>

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
              {selectedUsuario ? 'Actualizar' : 'Crear'} Usuario
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default UsuariosPage
