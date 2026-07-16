function Pagination({ currentPage, totalItems, itemsPerPage, onPageChange }) {
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  if (totalPages <= 1) return null;

  return (
    <div className="flex justify-between items-center mt-4 text-sm">
      <p className="text-slate-500">
        Menampilkan {(currentPage - 1) * itemsPerPage + 1}-
        {Math.min(currentPage * itemsPerPage, totalItems)} dari {totalItems} data
      </p>
      <div className="flex gap-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-3 py-1.5 border border-slate-300 rounded-md disabled:opacity-40 hover:bg-slate-50"
        >
          Sebelumnya
        </button>
        <span className="px-3 py-1.5 text-slate-600">
          Halaman {currentPage} dari {totalPages}
        </span>
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-3 py-1.5 border border-slate-300 rounded-md disabled:opacity-40 hover:bg-slate-50"
        >
          Berikutnya
        </button>
      </div>
    </div>
  );
}

export default Pagination;