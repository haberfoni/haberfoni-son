import React from 'react';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';

const Pagination = ({ currentPage, totalCount, pageSize, onPageChange, className = "" }) => {
    const totalPages = Math.ceil(totalCount / pageSize);

    if (totalPages <= 1) return null;

    const getPageNumbers = () => {
        const pages = [];
        const showMax = 5;

        if (totalPages <= showMax + 2) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            pages.push(1);
            if (currentPage > 3) pages.push('...');

            const start = Math.max(2, currentPage - 1);
            const end = Math.min(totalPages - 1, currentPage + 1);

            for (let i = start; i <= end; i++) {
                if (!pages.includes(i)) pages.push(i);
            }

            if (currentPage < totalPages - 2) pages.push('...');
            if (!pages.includes(totalPages)) pages.push(totalPages);
        }
        return pages;
    };

    return (
        <nav className={`flex items-center justify-center space-x-1 mt-8 mb-4 ${className}`} aria-label="Pagination">
            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title="Önceki Sayfa"
            >
                <ChevronLeft size={20} />
            </button>

            <div className="flex items-center space-x-1">
                {getPageNumbers().map((page, index) => (
                    <React.Fragment key={index}>
                        {page === '...' ? (
                            <span className="px-3 py-2 text-gray-400">
                                <MoreHorizontal size={16} />
                            </span>
                        ) : (
                            <button
                                onClick={() => onPageChange(page)}
                                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                                    currentPage === page
                                        ? 'bg-primary text-white shadow-md'
                                        : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300'
                                }`}
                            >
                                {page}
                            </button>
                        )}
                    </React.Fragment>
                ))}
            </div>

            <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title="Sonraki Sayfa"
            >
                <ChevronRight size={20} />
            </button>
        </nav>
    );
};

export default Pagination;
