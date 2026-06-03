import React from 'react';

const Pagination = ({ page, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  return (
    <div className="pagination">
      <button
        className="btn-secondary"
        type="button"
        onClick={() => onPageChange(Math.max(page - 1, 1))}
        disabled={page <= 1}
      >
        Previous
      </button>
      <span>
        Page {page} of {totalPages}
      </span>
      <button
        className="btn-secondary"
        type="button"
        onClick={() => onPageChange(Math.min(page + 1, totalPages))}
        disabled={page >= totalPages}
      >
        Next
      </button>
    </div>
  );
};

export default Pagination;
