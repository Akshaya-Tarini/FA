import React from 'react';

const getValue = (item, accessor) => {
  if (typeof accessor === 'function') {
    return accessor(item);
  }

  if (!accessor) {
    return '';
  }

  return accessor.split('.').reduce((value, key) => {
    if (value === undefined || value === null) return '';
    return value[key];
  }, item);
};

const DataTable = ({ columns, data = [], rowKey = '_id', onRowClick, emptyMessage = 'No records found.' }) => {
  return (
    <div className="table-wrapper">
      <table className="data-table">
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.header}>{column.header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="empty-row">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((item) => (
              <tr
                key={item[rowKey] || item.id || Math.random()}
                onClick={() => onRowClick?.(item)}
                className={onRowClick ? 'clickable-row' : ''}
              >
                {columns.map((column) => (
                  <td key={`${item[rowKey]}-${column.header}`}>
                    {column.render ? column.render(item) : getValue(item, column.accessor)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default DataTable;
