/**
 * Componente Textarea reutilizable
 */
const Textarea = ({
  label,
  name,
  value,
  onChange,
  onBlur,
  placeholder = '',
  error = '',
  required = false,
  disabled = false,
  rows = 4,
  module = 'gestion',
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

      <textarea
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        rows={rows}
        className={`${inputClasses} resize-none ${error ? 'border-red-500 focus:ring-red-500' : ''}`}
        {...props}
      />

      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  )
}

export default Textarea
