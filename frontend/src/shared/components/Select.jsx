/**
 * Componente Select reutilizable
 */
const Select = ({
  label,
  name,
  value,
  onChange,
  onBlur,
  options = [],
  error = '',
  required = false,
  disabled = false,
  module = 'gestion',
  placeholder = 'Seleccionar...',
  className = '',
  ...props
}) => {
  const inputClasses = module === 'gestion' ? 'input-gestion' : 'input-plataforma'

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        disabled={disabled}
        required={required}
        className={`${inputClasses} ${error ? 'border-red-500 focus:ring-red-500' : ''}`}
        {...props}
      >
        <option value="">{placeholder}</option>
        {options.map((option, index) => (
          <option key={index} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  )
}

export default Select
