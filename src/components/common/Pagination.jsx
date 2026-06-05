import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  const [pageInput, setPageInput] = useState(String(currentPage));

  useEffect(() => {
    setPageInput(String(currentPage));
  }, [currentPage]);

  const goToPage = (page) => {
    const safePage = Math.min(Math.max(Number(page) || 1, 1), totalPages);
    onPageChange(safePage);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    goToPage(pageInput);
  };

  const getPageNumbers = () => {
    const pages = new Set([1, totalPages, currentPage]);
    const siblingCount = 1;

    for (let page = currentPage - siblingCount; page <= currentPage + siblingCount; page += 1) {
      if (page > 1 && page < totalPages) {
        pages.add(page);
      }
    }

    return [...pages].sort((a, b) => a - b);
  };

  const pages = getPageNumbers();

  if (totalPages <= 1) return null;

  return (
    <nav className="mt-8 rounded-lg border border-slate-100 bg-white p-3 shadow-sm sm:p-4" aria-label="Product pagination">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <p className="text-center text-sm font-semibold text-slate-600 lg:text-left">
          Page <span className="text-slate-950">{currentPage}</span> of <span className="text-slate-950">{totalPages}</span>
        </p>

        <div className="flex items-center justify-center gap-1.5 sm:gap-2">
          <ArrowButton
            label="Previous page"
            disabled={currentPage === 1}
            onClick={() => goToPage(currentPage - 1)}
          >
            <ChevronLeft size={18} />
          </ArrowButton>

          <div className="flex items-center gap-1.5 sm:gap-2">
            {pages.map((page, index) => {
              const previousPage = pages[index - 1];
              const showGap = previousPage && page - previousPage > 1;

              return (
                <span key={page} className="flex items-center gap-1.5 sm:gap-2">
                  {showGap && <span className="hidden px-1 text-sm font-bold text-slate-400 sm:inline">...</span>}
                  <button
                    type="button"
                    onClick={() => goToPage(page)}
                    aria-current={currentPage === page ? 'page' : undefined}
                    className={`grid h-10 min-w-10 place-items-center rounded-lg border px-3 text-sm font-bold transition ${
                      currentPage === page
                        ? 'border-teal-700 bg-teal-700 text-white shadow-sm'
                        : 'border-slate-200 text-slate-700 hover:border-teal-300 hover:bg-teal-50 hover:text-teal-800'
                    }`}
                  >
                    {page}
                  </button>
                </span>
              );
            })}
          </div>

          <ArrowButton
            label="Next page"
            disabled={currentPage === totalPages}
            onClick={() => goToPage(currentPage + 1)}
          >
            <ChevronRight size={18} />
          </ArrowButton>
        </div>

        <form onSubmit={handleSubmit} className="flex items-center justify-center gap-2 lg:justify-end">
          <label htmlFor="go-to-page" className="text-sm font-semibold text-slate-600">
            Go to
          </label>
          <input
            id="go-to-page"
            type="number"
            min="1"
            max={totalPages}
            inputMode="numeric"
            value={pageInput}
            onChange={event => setPageInput(event.target.value)}
            className="h-10 w-20 rounded-lg border border-slate-200 bg-white px-3 text-center text-sm font-bold text-slate-900 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
          />
          <button
            type="submit"
            className="h-10 rounded-lg bg-slate-950 px-4 text-sm font-bold text-white transition hover:bg-teal-800"
          >
            Go
          </button>
        </form>
      </div>
    </nav>
  );
};

const ArrowButton = ({ label, disabled, onClick, children }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    aria-label={label}
    title={label}
    className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-slate-200 text-slate-700 transition hover:border-teal-300 hover:bg-teal-50 hover:text-teal-800 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-slate-200 disabled:hover:bg-white disabled:hover:text-slate-700"
  >
    {children}
  </button>
);

export default Pagination;
