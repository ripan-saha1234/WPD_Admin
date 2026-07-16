import { useState, useRef, useEffect } from 'react';
import '../css/common-table.css';

const CommonTable = ({
  tableData,
  headers,
  handleActionClick = () => { },
  index = 0,
  multipleReturn = false,
  multipleReturnIntex1 = 0,
  multipleReturnIntex2 = 0,
  specificReturn = '',
  actionButtons = [
    { label: 'Edit', action: 'edit' },
    { label: 'View', action: 'view' },
    { label: 'Delete', action: 'delete' }
  ]
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [actionMenu, setActionMenu] = useState({ isOpen: false, rowIndex: null });
  const itemsPerPage = 10;
  const menuRef = useRef(null);
  const tableRef = useRef(null);

  // Click outside handler to close dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setActionMenu({ isOpen: false, rowIndex: null });
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Pagination calculations
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = tableData?.slice(indexOfFirstItem, indexOfLastItem);

  const totalPages = Math.ceil(tableData?.length / itemsPerPage);
  const totalItems = tableData?.length || 0;

  // Function to handle page change
  const handlePageChange = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  // Calculate the range text (e.g., "1-10 of 25")
  const startRange = indexOfFirstItem + 1;
  const endRange = Math.min(indexOfLastItem, totalItems);
  const rangeText = `${startRange}-${endRange} of ${totalItems}`;

  // Toggle action menu with position calculation
  const toggleActionMenu = (rowIndex, event) => {
    event.stopPropagation();
    setActionMenu(prev => ({
      isOpen: prev.rowIndex === rowIndex ? !prev.isOpen : true,
      rowIndex: prev.rowIndex === rowIndex && prev.isOpen ? null : rowIndex
    }));
  };

  // Generate pagination numbers
  const getPaginationNumbers = () => {
    const numbers = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        numbers.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          numbers.push(i);
        }
        numbers.push('...');
        numbers.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        numbers.push(1);
        numbers.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          numbers.push(i);
        }
      } else {
        numbers.push(1);
        numbers.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          numbers.push(i);
        }
        numbers.push('...');
        numbers.push(totalPages);
      }
    }

    return numbers;
  };

  const renderCellContent = (item, header, rowIndex) => {
    let idValue;
    if (specificReturn && specificReturn !== '') {
      idValue = item[specificReturn];
    } else if (multipleReturn) {
      idValue = [item[headers[multipleReturnIntex1]?.value], item[headers[multipleReturnIntex2]?.value]];
    } else {
      idValue = item[headers[index]?.value];
    }

    if (header?.value === 'action') {
      return (
        <div className="table1-action-container">
          <button className="table1-three-dots-button" onClick={(e) => toggleActionMenu(rowIndex, e)}>
            <svg width="16" height="4" viewBox="0 0 16 4" fill="none">
              <circle cx="2" cy="2" r="2" fill="#0690fd" />
              <circle cx="8" cy="2" r="2" fill="#0690fd" />
              <circle cx="14" cy="2" r="2" fill="#0690fd" />
            </svg>
          </button>

          {actionMenu.isOpen && actionMenu.rowIndex === rowIndex && (
            <div
              className="table1-action-dropdown"
              ref={menuRef}
            >
              {actionButtons.map((button, btnIndex) => (
                <button
                  key={btnIndex}
                  className="table1-action-button"
                  onClick={() => {
                    handleActionClick(button.action, idValue);
                    setActionMenu({ isOpen: false, rowIndex: null });
                  }}
                >
                  {button.label}
                </button>
              ))}
            </div>
          )}
        </div>
      );
    }

    if (header?.value === 'action2') {
      return (
        <div className="table-action2-container" onClick={() => handleActionClick('view', idValue)}>
          <img src="/eye-icon-table.svg" alt="" />
        </div>
      )
    }
    if (header?.value === 'status') {
      return (
        <div
          className={`table1-status-container ${(item[header?.value] === 'Active' || item[header?.value] === 'Completed')
            ? 'status-success'
            : item[header?.value] === 'Upcoming' || item[header?.value] === 'New'
              ? 'status-upcoming'
              : (item[header?.value] === 'Inactive' || item[header?.value] === 'Canceled' || item[header?.value] === 'Pending')
                ? 'status-inactive'
                : item[header?.value] === 'In Progress' || item[header?.value] === 'Ongoing'
                  ? 'status-progress'
                  : ''
            }`}
        >
          {item[header?.value]}
        </div>
      )
    }

    if (header?.value === 'customerName' || header?.value === 'companyName' || header?.value === 'expertName' || header?.value === 'raisedBy' || header?.value === 'against' || header?.value === 'projectName') {
      return (
        <div className='table1-customer-container'>
          {item[header?.value]?.image && <div className='table1-customer-image-container'><img src={item[header?.value]?.image} alt="" /></div>}
          <div className='table1-customer-name-container'>
            <h2>{item[header?.value]?.name}</h2>
            <p>{item[header?.value]?.id}</p>
          </div>
        </div>
      )
    }

    if (header?.value === 'message') {
      return (
        <div className='table-message-container'>
          <p className='table-message'>{item[header?.value]}</p>
        </div>
      )
    }

    return item[header?.value];
  };

  return (
    <div className="table1-container">
      <div className='table1-table-container' ref={tableRef}>
        <table className="table1">
          <thead>
            <tr>
              {
                headers?.map((header, index) => (
                  <th key={index} className={header?.value === 'action' || header?.value === 'action2' || header?.value === 'action3' ? 'table1-action-header' : ''}>
                    {header?.title.toUpperCase()}
                  </th>
                ))
              }
            </tr>
          </thead>
          <tbody>
            {currentItems?.length > 0 && currentItems?.map((item, rowIndex) => (
              <tr key={rowIndex}>
                {headers?.map((header, colIndex) => (
                  <td key={`${rowIndex}-${colIndex}`}>
                    {renderCellContent(item, header, rowIndex)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        {currentItems?.length === 0 && (
          <div className='table1-no-data-container'>
            <p>No data found</p>
          </div>
        )}
      </div>

      {totalItems > 0 && (
        <div className="modern-pagination">
          <div className="pagination-controls">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              className="pagination-nav-button"
              disabled={currentPage === 1}
            >
              <svg width="6" height="10" viewBox="0 0 6 10" fill="none">
                <path d="M5 1L1 5L5 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            <div className="pagination-numbers">
              {getPaginationNumbers().map((number, index) => (
                <button
                  key={index}
                  onClick={() => typeof number === 'number' ? handlePageChange(number) : null}
                  className={`pagination-number ${currentPage === number ? 'active' : ''} ${typeof number !== 'number' ? 'ellipsis' : ''}`}
                  disabled={typeof number !== 'number'}
                >
                  {number}
                </button>
              ))}
            </div>

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              className="pagination-nav-button"
              disabled={currentPage === totalPages}
            >
              <svg width="6" height="10" viewBox="0 0 6 10" fill="none">
                <path d="M1 1L5 5L1 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default CommonTable;