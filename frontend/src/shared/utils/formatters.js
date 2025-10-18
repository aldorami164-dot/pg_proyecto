/**
 * Utilidades para formatear datos
 * Sistema de Gestión Hotelera - Hotel Casa Josefa
 */

/**
 * Formatea una fecha en formato DD/MM/YYYY sin problemas de zona horaria
 *
 * IMPORTANTE: El backend devuelve fechas en formato YYYY-MM-DD (sin hora)
 * NO usar new Date() porque convierte a UTC y causa desfase de 1 día en Guatemala (UTC-6)
 *
 * @param {string} dateString - Fecha en formato YYYY-MM-DD o YYYY-MM-DDTHH:mm:ss
 * @returns {string} Fecha formateada en DD/MM/YYYY
 *
 * @example
 * formatDate('2025-10-21') // '21/10/2025'
 * formatDate('2025-10-21T00:00:00') // '21/10/2025'
 */
export const formatDate = (dateString) => {
  if (!dateString) return 'N/A'

  // Obtener solo la parte de la fecha (por si viene con hora)
  const fechaSolo = dateString.includes('T') ? dateString.split('T')[0] : dateString

  // Dividir YYYY-MM-DD
  const [year, month, day] = fechaSolo.split('-')

  // Formatear manualmente DD/MM/YYYY sin usar Date()
  return `${day.padStart(2, '0')}/${month.padStart(2, '0')}/${year}`
}

/**
 * Formatea una fecha con hora en formato DD/MM/YYYY HH:mm
 *
 * @param {string} dateTimeString - Fecha con hora ISO
 * @returns {string} Fecha formateada en DD/MM/YYYY HH:mm
 */
export const formatDateTime = (dateTimeString) => {
  if (!dateTimeString) return 'N/A'

  const [datePart, timePart] = dateTimeString.split('T')
  const [year, month, day] = datePart.split('-')

  if (!timePart) {
    return `${day.padStart(2, '0')}/${month.padStart(2, '0')}/${year}`
  }

  const [hour, minute] = timePart.split(':')
  return `${day.padStart(2, '0')}/${month.padStart(2, '0')}/${year} ${hour}:${minute}`
}

/**
 * Formatea un monto en Quetzales (GTQ)
 *
 * @param {number} amount - Monto a formatear
 * @returns {string} Monto formateado (e.g., "Q250.00")
 */
export const formatCurrency = (amount) => {
  if (!amount && amount !== 0) return 'Q0.00'

  return new Intl.NumberFormat('es-GT', {
    style: 'currency',
    currency: 'GTQ',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount)
}

/**
 * Convierte una fecha en formato DD/MM/YYYY a YYYY-MM-DD
 * Útil para inputs type="date"
 *
 * @param {string} formattedDate - Fecha en formato DD/MM/YYYY
 * @returns {string} Fecha en formato YYYY-MM-DD
 */
export const toInputDate = (formattedDate) => {
  if (!formattedDate) return ''

  const [day, month, year] = formattedDate.split('/')
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
}

/**
 * Calcula el número de noches entre dos fechas
 *
 * @param {string} checkIn - Fecha check-in YYYY-MM-DD
 * @param {string} checkOut - Fecha check-out YYYY-MM-DD
 * @returns {number} Número de noches
 */
export const calcularNoches = (checkIn, checkOut) => {
  if (!checkIn || !checkOut) return 0

  const [yearIn, monthIn, dayIn] = checkIn.split('-').map(Number)
  const [yearOut, monthOut, dayOut] = checkOut.split('-').map(Number)

  const dateIn = new Date(yearIn, monthIn - 1, dayIn)
  const dateOut = new Date(yearOut, monthOut - 1, dayOut)

  const diferenciaMilisegundos = dateOut - dateIn
  const noches = Math.ceil(diferenciaMilisegundos / (1000 * 60 * 60 * 24))

  return noches > 0 ? noches : 0
}

/**
 * Formatea un número de teléfono guatemalteco
 *
 * @param {string} phone - Número de teléfono
 * @returns {string} Teléfono formateado (XXXX-XXXX)
 */
export const formatPhone = (phone) => {
  if (!phone) return 'N/A'

  const cleaned = phone.replace(/\D/g, '')

  if (cleaned.length === 8) {
    return `${cleaned.slice(0, 4)}-${cleaned.slice(4)}`
  }

  return phone
}

/**
 * Capitaliza la primera letra de cada palabra
 *
 * @param {string} str - Cadena a capitalizar
 * @returns {string} Cadena capitalizada
 */
export const capitalize = (str) => {
  if (!str) return ''

  return str
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

/**
 * Obtiene la fecha actual en formato YYYY-MM-DD usando hora LOCAL (Guatemala)
 *
 * IMPORTANTE: NO usar new Date().toISOString() porque convierte a UTC
 * y causa desfase de 1 día en Guatemala (UTC-6)
 *
 * @returns {string} Fecha actual en formato YYYY-MM-DD
 *
 * @example
 * getTodayLocalDate() // '2025-10-07' (si hoy es 7 de octubre en Guatemala)
 */
export const getTodayLocalDate = () => {
  const ahora = new Date()
  const año = ahora.getFullYear()
  const mes = String(ahora.getMonth() + 1).padStart(2, '0')
  const dia = String(ahora.getDate()).padStart(2, '0')
  return `${año}-${mes}-${dia}`
}
