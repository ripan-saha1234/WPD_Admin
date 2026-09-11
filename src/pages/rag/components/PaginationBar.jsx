import CommonButton from '../../../components/common-button';

function PaginationBar({
  page,
  totalPages = 1,
  hasPrevPage,
  hasNextPage,
  onPrev,
  onNext,
  label,
}) {
  return (
    <div className="rag-pagination">
      <CommonButton
        text="Prev"
        onClick={onPrev}
        disabled={!hasPrevPage}
        backgroundColor="#fff"
        color="#0d0d0d"
        borderColor="#e8e8e8"
      />
      <span className="rag-pagination-label">
        {label || `Page ${page} of ${totalPages || 1}`}
      </span>
      <CommonButton
        text="Next"
        onClick={onNext}
        disabled={!hasNextPage}
        backgroundColor="#fff"
        color="#0d0d0d"
        borderColor="#e8e8e8"
      />
    </div>
  );
}

export default PaginationBar;
