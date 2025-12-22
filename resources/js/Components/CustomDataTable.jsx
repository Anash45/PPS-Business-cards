import { useState, useEffect, useCallback } from "react";
import { router } from "@inertiajs/react";
import {
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
    ChevronUp,
    ChevronDown,
    Search,
} from "lucide-react";
import TextInput from "./TextInput";

/**
 * CustomDataTable - Server-side DataTable Component for Laravel + Inertia.js
 *
 * Features:
 * - Server-side pagination
 * - Server-side search
 * - Column sorting
 * - Configurable results per page
 * - Multiple tables on one page support
 * - Fully customizable columns with render functions
 *
 * @param {Object} props
 * @param {Array} props.columns - Column definitions [{ key, label, sortable, render, className }]
 * @param {Object} props.data - Data object from Laravel { data: [], total, per_page, current_page, last_page }
 * @param {string} props.endpoint - API endpoint for fetching data
 * @param {boolean} props.searchable - Enable search functionality (default: true)
 * @param {boolean} props.paginated - Enable pagination (default: true)
 * @param {Array} props.perPageOptions - Options for results per page (default: [10, 25, 50, 100])
 * @param {string} props.tableKey - Unique key for multiple tables on same page
 * @param {Object} props.additionalFilters - Additional filters to send with requests
 * @param {Function} props.onRowClick - Callback for row click
 * @param {string} props.emptyMessage - Message when no data
 * @param {string} props.className - Additional table classes
 */
export default function CustomDataTable({
    columns = [],
    data = { data: [], total: 0, per_page: 10, current_page: 1, last_page: 1 },
    endpoint,
    searchable = true,
    showPerPageOptions = true,
    paginated = true,
    perPageOptions = [10, 25, 50, 100],
    tableKey = "default",
    additionalFilters = {},
    onRowClick = null,
    emptyMessage = "No records found",
    className = "",
    size = "lg",
}) {
    const [tableData, setTableData] = useState(data);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(data.current_page || 1);
    const [perPage, setPerPage] = useState(data.per_page || perPageOptions[0]);
    const [sortColumn, setSortColumn] = useState(null);
    const [sortDirection, setSortDirection] = useState("asc");

    // Debounce search input
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchTerm);
            setCurrentPage(1); // Reset to first page on search
        }, 500);

        return () => clearTimeout(timer);
    }, [searchTerm]);

    // Fetch data when filters change
    useEffect(() => {
        if (endpoint) {
            fetchData();
        }
    }, [
        debouncedSearch,
        currentPage,
        perPage,
        sortColumn,
        sortDirection,
        JSON.stringify(additionalFilters),
    ]);

    // Update local state when props change
    useEffect(() => {
        if (!endpoint) {
            setTableData(data);
        } else {
            // Even with endpoint, update if data prop changes (from router.reload)
            if (data && data !== tableData) {
                setTableData(data);
            }
        }
    }, [data, endpoint]);

    const fetchData = useCallback(() => {
        if (!endpoint) return;

        setLoading(true);

        const params = {
            page: currentPage,
            per_page: perPage,
            search: debouncedSearch,
            sort_by: sortColumn,
            sort_direction: sortDirection,
            ...additionalFilters,
        };

        // Use Inertia for navigation or you can use axios for pure API calls
        router.get(endpoint, params, {
            preserveState: true,
            preserveScroll: true,
            only: [tableKey], // Only reload table data
            onSuccess: (page) => {
                const newData = page.props[tableKey];
                if (newData) {
                    setTableData(newData);
                }
                setLoading(false);
            },
            onError: () => {
                setLoading(false);
            },
        });
    }, [
        endpoint,
        currentPage,
        perPage,
        debouncedSearch,
        sortColumn,
        sortDirection,
        additionalFilters,
        tableKey,
    ]);

    const handleSort = (column) => {
        if (!column.sortable) return;

        if (sortColumn === column.key) {
            // Toggle direction
            setSortDirection(sortDirection === "asc" ? "desc" : "asc");
        } else {
            // New column
            setSortColumn(column.key);
            setSortDirection("asc");
        }
    };

    const handlePageChange = (page) => {
        if (page < 1 || page > tableData.last_page) return;
        setCurrentPage(page);
    };

    const handlePerPageChange = (newPerPage) => {
        setPerPage(newPerPage);
        setCurrentPage(1); // Reset to first page
    };

    // Calculate pagination range
    const getPaginationRange = () => {
        const delta = 2;
        const range = [];
        const rangeWithDots = [];
        let l;

        for (let i = 1; i <= tableData.last_page; i++) {
            if (
                i === 1 ||
                i === tableData.last_page ||
                (i >= currentPage - delta && i <= currentPage + delta)
            ) {
                range.push(i);
            }
        }

        range.forEach((i) => {
            if (l) {
                if (i - l === 2) {
                    rangeWithDots.push(l + 1);
                } else if (i - l !== 1) {
                    rangeWithDots.push("...");
                }
            }
            rangeWithDots.push(i);
            l = i;
        });

        return rangeWithDots;
    };

    const tableRows = tableData.data || [];
    const total = tableData.total || 0;
    const from = tableRows.length > 0 ? (currentPage - 1) * perPage + 1 : 0;
    const to = Math.min(currentPage * perPage, total);

    // Define padding based on size
    const sizeClasses = {
        sm: { header: "px-3 py-1.5", cell: "px-3 py-1.5" },
        md: { header: "px-4 py-2", cell: "px-4 py-2" },
        lg: { header: "px-6 py-3", cell: "px-6 py-3" },
    };
    const paddingClasses = sizeClasses[size] || sizeClasses.md;

    return (
        <div className={`custom-datatable ${className}`}>
            {/* Top Controls */}
            <div className="datatable-header flex flex-wrap items-center justify-between gap-4 mb-4">
                {/* Per Page Selector */}
                {showPerPageOptions && (
                    <div className="flex items-center gap-2">
                        <label className="text-sm text-gray-600">Show</label>
                        <select
                            value={perPage}
                            onChange={(e) =>
                                handlePerPageChange(Number(e.target.value))
                            }
                            className="w-20 border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary shadow-none focus:shadow-none"
                        >
                            {perPageOptions.map((option) => (
                                <option key={option} value={option}>
                                    {option}
                                </option>
                            ))}
                        </select>
                        <label className="text-sm text-gray-600">entries</label>
                    </div>
                )}

                {/* Search Box */}
                {searchable && (
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <TextInput
                            type="text"
                            placeholder="Search..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                )}
            </div>

            {/* Table */}
            <div className="overflow-x-auto border border-gray-200 rounded-lg cdt-table">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-primary">
                        <tr>
                            {columns.map((column, index) => (
                                <th
                                    key={`${column.key}-${index}`}
                                    onClick={() => handleSort(column)}
                                    className={`${
                                        paddingClasses.header
                                    } text-left text-xs font-medium text-white uppercase tracking-wider ${
                                        column.sortable
                                            ? "cursor-pointer hover:bg-[#76a87b]"
                                            : ""
                                    } ${column.headerClassName || ""}`}
                                >
                                    <div className="flex items-center gap-2">
                                        <span>{column.label}</span>
                                        {column.sortable && (
                                            <span className="flex flex-col">
                                                {sortColumn === column.key ? (
                                                    sortDirection === "asc" ? (
                                                        <ChevronUp className="h-4 w-4" />
                                                    ) : (
                                                        <ChevronDown className="h-4 w-4" />
                                                    )
                                                ) : (
                                                    <div className="flex flex-col opacity-30">
                                                        <ChevronUp className="h-3 w-3 -mb-1" />
                                                        <ChevronDown className="h-3 w-3" />
                                                    </div>
                                                )}
                                            </span>
                                        )}
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200 cdt-table-body">
                        {loading ? (
                            <tr>
                                <td
                                    colSpan={columns.length}
                                    className="px-6 py-12 text-center text-gray-500"
                                >
                                    <div className="flex items-center justify-center gap-2">
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
                                        <span>Loading...</span>
                                    </div>
                                </td>
                            </tr>
                        ) : tableRows.length === 0 ? (
                            <tr>
                                <td
                                    colSpan={columns.length}
                                    className="px-6 py-12 text-center text-gray-500"
                                >
                                    {emptyMessage}
                                </td>
                            </tr>
                        ) : (
                            tableRows.map((row, rowIndex) => (
                                <tr
                                    key={row.id || rowIndex}
                                    onClick={() =>
                                        onRowClick && onRowClick(row)
                                    }
                                    className={`hover:bg-gray-50 ${
                                        onRowClick ? "cursor-pointer" : ""
                                    }`}
                                >
                                    {columns.map((column, colIndex) => (
                                        <td
                                            key={`${column.key}-${colIndex}`}
                                            className={`${
                                                paddingClasses.cell
                                            } whitespace-nowrap text-sm text-gray-900 ${
                                                column.className || ""
                                            }`}
                                        >
                                            {column.render
                                                ? column.render(
                                                      row[column.key],
                                                      row,
                                                      rowIndex
                                                  )
                                                : row[column.key]}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <div className="datatable-footer flex flex-wrap items-center justify-between gap-4 mt-4">
                {/* Info */}
                <div className="text-sm text-gray-600">
                    Showing {from} to {to} of {total} entries
                </div>

                {paginated && tableData.last_page > 1 && (
                    /* Pagination Controls */
                    <div className="flex items-center gap-1">
                        {/* First Page */}
                        <button
                            onClick={() => handlePageChange(1)}
                            disabled={currentPage === 1}
                            className="p-2 rounded border border-primary hover:bg-[#76a87b] hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                            title="First page"
                        >
                            <ChevronsLeft className="h-4 w-4" />
                        </button>

                        {/* Previous Page */}
                        <button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="p-2 rounded border border-primary hover:bg-[#76a87b] hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Previous page"
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </button>

                        {/* Page Numbers */}
                        {getPaginationRange().map((page, index) => (
                            <button
                                key={index}
                                onClick={() =>
                                    typeof page === "number" &&
                                    handlePageChange(page)
                                }
                                disabled={page === "..."}
                                className={`px-3 py-1.5 rounded border text-sm ${
                                    page === currentPage
                                        ? "bg-primary text-white border-primary"
                                        : "border-[#76a87b] hover:bg-[#76a87b] hover:text-white"
                                } ${
                                    page === "..."
                                        ? "cursor-default border-0"
                                        : ""
                                }`}
                            >
                                {page}
                            </button>
                        ))}

                        {/* Next Page */}
                        <button
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === tableData.last_page}
                            className="p-2 rounded border border-primary hover:bg-[#76a87b] hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Next page"
                        >
                            <ChevronRight className="h-4 w-4" />
                        </button>

                        {/* Last Page */}
                        <button
                            onClick={() =>
                                handlePageChange(tableData.last_page)
                            }
                            disabled={currentPage === tableData.last_page}
                            className="p-2 rounded border border-primary hover:bg-[#76a87b] hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Last page"
                        >
                            <ChevronsRight className="h-4 w-4" />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
