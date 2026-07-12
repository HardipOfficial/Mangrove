import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({ page, pages, onPageChange }) {
  if (pages <= 1) return null;

  const getPages = () => {
    const arr = [];
    for (let i = 1; i <= pages; i++) {
      if (i === 1 || i === pages || (i >= page - 2 && i <= page + 2)) arr.push(i);
      else if (arr[arr.length - 1] !== '...') arr.push('...');
    }
    return arr;
  };

  return (
    <div className="pagination">
      <button
        className="pagination__btn"
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
        id="pagination-prev"
        aria-label="Previous page"
      >
        <ChevronLeft size={16} />
      </button>
      {getPages().map((p, i) =>
        p === '...' ? (
          <span key={`ellipsis-${i}`} style={{ color: 'var(--text-muted)', padding: '0 4px' }}>…</span>
        ) : (
          <button
            key={p}
            className={`pagination__btn ${p === page ? 'active' : ''}`}
            onClick={() => onPageChange(p)}
            id={`pagination-page-${p}`}
          >
            {p}
          </button>
        )
      )}
      <button
        className="pagination__btn"
        onClick={() => onPageChange(page + 1)}
        disabled={page === pages}
        id="pagination-next"
        aria-label="Next page"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
}
