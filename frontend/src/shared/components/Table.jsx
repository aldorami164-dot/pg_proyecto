/**
 * Componente Table reutilizable
 */
const Table = ({ columns = [], data = [], module = 'gestion', onRowClick = null, emptyMessage = 'No hay datos disponibles' }) => {
  const headerClass = module === 'gestion'
    ? 'bg-gestion-secondary-50 text-gestion-secondary-700'
    : 'bg-plataforma-primary-50 text-plataforma-primary-700'

  if (!columns || columns.length === 0) {
    return <div className="text-center text-gray-500 py-4">No se definieron columnas</div>
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className={headerClass}>
          <tr>
            {columns.map((column, index) => (
              <th
                key={index}
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
              >
                {column.label || column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {!data || data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-6 py-4 text-center text-gray-500"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                onClick={() => onRowClick && onRowClick(row)}
                className={onRowClick ? 'hover:bg-gray-50 cursor-pointer' : ''}
              >
                {columns.map((column, colIndex) => (
                  <td key={colIndex} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {column.render ? column.render(row) : (column.cell ? column.cell(row) : row[column.accessor || column.key])}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}

export default Table
