import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head } from "@inertiajs/react";
import CustomDataTable from "@/Components/CustomDataTable";
import { EditIcon, Trash2, Eye } from "lucide-react";
import WalletStatusPill from "@/Components/WalletStatusPill";

/**
 * Example page demonstrating CustomDataTable usage with multiple tables
 * 
 * Backend Controller should return data in this format:
 * {
 *   cards: {
 *     data: [...],
 *     total: 100,
 *     per_page: 10,
 *     current_page: 1,
 *     last_page: 10
 *   },
 *   users: {
 *     data: [...],
 *     total: 50,
 *     per_page: 10,
 *     current_page: 1,
 *     last_page: 5
 *   }
 * }
 */
export default function CustomDataTableExample({ cards, users }) {
    // Define columns for Cards table
    const cardColumns = [
        {
            key: 'id',
            label: 'ID',
            sortable: true,
            className: 'font-semibold',
        },
        {
            key: 'code',
            label: 'Code',
            sortable: true,
            render: (code, row) => (
                <a
                    href={`/card/${code}`}
                    target="_blank"
                    className="text-blue-600 hover:underline"
                >
                    {code}
                </a>
            ),
        },
        {
            key: 'first_name',
            label: 'Name',
            sortable: true,
            render: (firstName, row) => (
                <div className="flex flex-col">
                    <span className="font-medium">
                        {row.first_name} {row.last_name}
                    </span>
                    <span className="text-xs text-gray-500">{row.email}</span>
                </div>
            ),
        },
        {
            key: 'company',
            label: 'Company',
            sortable: true,
            render: (company, row) => row.company?.name || 'N/A',
        },
        {
            key: 'wallet_status',
            label: 'Wallet Status',
            sortable: true,
            render: (status, row) => <WalletStatusPill status={status} />,
        },
        {
            key: 'created_at',
            label: 'Created',
            sortable: true,
            render: (date) => new Date(date).toLocaleDateString(),
        },
        {
            key: 'actions',
            label: 'Actions',
            sortable: false,
            className: 'text-right',
            render: (_, row) => (
                <div className="flex items-center justify-end gap-2">
                    <button
                        onClick={() => handleView(row.id)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                        title="View"
                    >
                        <Eye className="h-4 w-4" />
                    </button>
                    <button
                        onClick={() => handleEdit(row.id)}
                        className="p-2 text-gray-600 hover:bg-gray-50 rounded"
                        title="Edit"
                    >
                        <EditIcon className="h-4 w-4" />
                    </button>
                    <button
                        onClick={() => handleDelete(row.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded"
                        title="Delete"
                    >
                        <Trash2 className="h-4 w-4" />
                    </button>
                </div>
            ),
        },
    ];

    // Define columns for Users table
    const userColumns = [
        {
            key: 'id',
            label: 'ID',
            sortable: true,
        },
        {
            key: 'name',
            label: 'Name',
            sortable: true,
        },
        {
            key: 'email',
            label: 'Email',
            sortable: true,
        },
        {
            key: 'role',
            label: 'Role',
            sortable: true,
            render: (role) => (
                <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                    {role}
                </span>
            ),
        },
        {
            key: 'created_at',
            label: 'Joined',
            sortable: true,
            render: (date) => new Date(date).toLocaleDateString(),
        },
    ];

    // Action handlers
    const handleView = (id) => {
        console.log('View card:', id);
        // Implement view logic
    };

    const handleEdit = (id) => {
        console.log('Edit card:', id);
        // Implement edit logic
    };

    const handleDelete = (id) => {
        if (confirm('Are you sure you want to delete this card?')) {
            // Implement delete logic
            console.log('Delete card:', id);
        }
    };

    const handleRowClick = (row) => {
        console.log('Row clicked:', row);
        // Optional: navigate to detail page
        // router.visit(`/cards/${row.id}`);
    };

    return (
        <AuthenticatedLayout>
            <Head title="Custom DataTable Example" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-8">
                    
                    {/* Cards Table */}
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                        <h2 className="text-2xl font-bold mb-4">Employee Cards</h2>
                        
                        <CustomDataTable
                            columns={cardColumns}
                            data={cards}
                            endpoint={route('cards.index')}
                            tableKey="cards"
                            searchable={true}
                            paginated={true}
                            perPageOptions={[10, 25, 50, 100]}
                            onRowClick={handleRowClick}
                            emptyMessage="No cards found"
                            className="mb-4"
                        />
                    </div>

                    {/* Users Table */}
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                        <h2 className="text-2xl font-bold mb-4">Users</h2>
                        
                        <CustomDataTable
                            columns={userColumns}
                            data={users}
                            endpoint={route('users.index')}
                            tableKey="users"
                            searchable={true}
                            paginated={true}
                            perPageOptions={[5, 10, 25]}
                            emptyMessage="No users found"
                        />
                    </div>

                    {/* Static Data Example (No Server-Side Processing) */}
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                        <h2 className="text-2xl font-bold mb-4">Static Data Table</h2>
                        <p className="text-gray-600 mb-4">
                            This table uses static data without server-side processing.
                            Search and sorting happen on frontend only.
                        </p>
                        
                        <CustomDataTable
                            columns={[
                                { key: 'id', label: 'ID', sortable: false },
                                { key: 'name', label: 'Name', sortable: false },
                                { key: 'status', label: 'Status', sortable: false },
                            ]}
                            data={{
                                data: [
                                    { id: 1, name: 'Item 1', status: 'Active' },
                                    { id: 2, name: 'Item 2', status: 'Inactive' },
                                    { id: 3, name: 'Item 3', status: 'Active' },
                                ],
                                total: 3,
                                per_page: 10,
                                current_page: 1,
                                last_page: 1,
                            }}
                            searchable={false}
                            paginated={false}
                            emptyMessage="No items found"
                        />
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
