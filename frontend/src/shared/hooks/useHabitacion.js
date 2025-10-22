import { useState, useEffect } from 'react'

/**
 * Hook personalizado para manejar la sesión de habitación del huésped
 * Almacena y recupera información de la habitación desde sessionStorage
 *
 * sessionStorage se borra automáticamente al cerrar la pestaña/navegador.
 * El huésped debe escanear el QR nuevamente cada vez que quiera acceder.
 */
const useHabitacion = () => {
  const [habitacion, setHabitacion] = useState(null)
  const [loading, setLoading] = useState(true)

  // Cargar habitación desde sessionStorage al montar
  useEffect(() => {
    cargarHabitacion()
  }, [])

  const cargarHabitacion = () => {
    try {
      const habitacionGuardada = sessionStorage.getItem('habitacion_sesion')
      if (habitacionGuardada) {
        const data = JSON.parse(habitacionGuardada)
        setHabitacion(data)
      }
    } catch (error) {
      console.error('Error al cargar habitación desde sessionStorage:', error)
    } finally {
      setLoading(false)
    }
  }

  /**
   * Guardar información de la habitación en sessionStorage
   * @param {Object} habitacionData - Datos de la habitación (id, numero, tipo, capacidad_maxima)
   */
  const guardarHabitacion = (habitacionData) => {
    try {
      sessionStorage.setItem('habitacion_sesion', JSON.stringify(habitacionData))
      setHabitacion(habitacionData)
    } catch (error) {
      console.error('Error al guardar habitación en sessionStorage:', error)
    }
  }

  /**
   * Limpiar sesión de habitación
   */
  const limpiarHabitacion = () => {
    try {
      sessionStorage.removeItem('habitacion_sesion')
      setHabitacion(null)
    } catch (error) {
      console.error('Error al limpiar habitación:', error)
    }
  }

  /**
   * Verificar si hay una sesión de habitación activa
   */
  const tieneHabitacion = () => {
    return habitacion !== null && habitacion?.id
  }

  return {
    habitacion,
    loading,
    guardarHabitacion,
    limpiarHabitacion,
    tieneHabitacion,
    recargarHabitacion: cargarHabitacion
  }
}

export default useHabitacion
