import ElementCard from './ElementCard';
import './TableElement.css';

let idCounter = 0;
const nextId = (prefix) => `${prefix}-${Date.now()}-${idCounter++}`;

function createColumn(name) {
  return { id: nextId('col'), name };
}

function createRow(columns) {
  return {
    id: nextId('row'),
    cells: columns.reduce((acc, column) => {
      acc[column.id] = '';
      return acc;
    }, {}),
  };
}

function getInitialTable() {
  const columns = [
    createColumn('Column 1'),
    createColumn('Column 2'),
    createColumn('Column 3'),
  ];
  const rows = [createRow(columns), createRow(columns), createRow(columns)];
  return { columns, rows };
}

function TableElement({ element, onChange, onDelete }) {
  const table = element.data?.columns
    ? { columns: element.data.columns, rows: element.data.rows || [] }
    : getInitialTable();

  const { columns, rows } = table;

  const commit = (next) => onChange({ columns: next.columns, rows: next.rows });

  const updateColumnName = (columnId, name) => {
    commit({
      columns: columns.map((column) =>
        column.id === columnId ? { ...column, name } : column
      ),
      rows,
    });
  };

  const deleteColumn = (columnId) => {
    if (columns.length <= 1) return;
    commit({
      columns: columns.filter((column) => column.id !== columnId),
      rows: rows.map((row) => {
        const { [columnId]: _removed, ...rest } = row.cells;
        return { ...row, cells: rest };
      }),
    });
  };

  const addColumn = () => {
    const newColumn = createColumn(`Column ${columns.length + 1}`);
    commit({
      columns: [...columns, newColumn],
      rows: rows.map((row) => ({
        ...row,
        cells: { ...row.cells, [newColumn.id]: '' },
      })),
    });
  };

  const updateCell = (rowId, columnId, value) => {
    commit({
      columns,
      rows: rows.map((row) =>
        row.id === rowId
          ? { ...row, cells: { ...row.cells, [columnId]: value } }
          : row
      ),
    });
  };

  const deleteRow = (rowId) => {
    if (rows.length <= 1) return;
    commit({ columns, rows: rows.filter((row) => row.id !== rowId) });
  };

  const addRow = () => {
    commit({ columns, rows: [...rows, createRow(columns)] });
  };

  return (
    <ElementCard title="Table" onDelete={onDelete}>
      <div className="table-element-scroll">
        <table className="table-element">
          <thead>
            <tr>
              <th className="table-element-gutter" aria-hidden="true" />
              {columns.map((column) => (
                <th key={column.id} className="table-element-col-header">
                  <input
                    type="text"
                    className="table-element-col-input"
                    value={column.name}
                    onChange={(e) => updateColumnName(column.id, e.target.value)}
                  />
                  <button
                    type="button"
                    className="table-element-icon-btn"
                    aria-label={`Delete ${column.name}`}
                    onClick={() => deleteColumn(column.id)}
                    disabled={columns.length <= 1}
                  >
                    <img src="/delete-icon.svg" alt="" width="13" height="13" />
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                <td className="table-element-gutter">
                  <span className="table-element-drag" aria-hidden="true">
                    <svg width="8" height="12" viewBox="0 0 8 12" fill="none">
                      <circle cx="2" cy="2" r="1" fill="#8a94a6" />
                      <circle cx="6" cy="2" r="1" fill="#8a94a6" />
                      <circle cx="2" cy="6" r="1" fill="#8a94a6" />
                      <circle cx="6" cy="6" r="1" fill="#8a94a6" />
                      <circle cx="2" cy="10" r="1" fill="#8a94a6" />
                      <circle cx="6" cy="10" r="1" fill="#8a94a6" />
                    </svg>
                  </span>
                  <button
                    type="button"
                    className="table-element-icon-btn"
                    aria-label="Delete row"
                    onClick={() => deleteRow(row.id)}
                    disabled={rows.length <= 1}
                  >
                    <img src="/delete-icon.svg" alt="" width="13" height="13" />
                  </button>
                </td>
                {columns.map((column) => (
                  <td key={column.id} className="table-element-cell">
                    <input
                      type="text"
                      className="table-element-cell-input"
                      value={row.cells[column.id] ?? ''}
                      onChange={(e) => updateCell(row.id, column.id, e.target.value)}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="table-element-footer">
        <button type="button" className="table-element-add" onClick={addRow}>
          + Add Row
        </button>
        <button type="button" className="table-element-add" onClick={addColumn}>
          + Add Column
        </button>
        <span className="table-element-size">
          {rows.length} × {columns.length}
        </span>
      </div>
    </ElementCard>
  );
}

export default TableElement;
