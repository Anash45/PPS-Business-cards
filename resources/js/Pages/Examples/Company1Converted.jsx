import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, usePage } from "@inertiajs/react";
import { GlobalProvider, useGlobal } from "@/context/GlobalProvider";
import { useEffect, useState } from "react";
import CustomDataTable from "@/Components/CustomDataTable";
import { EditIcon, Trash2, Eye, Mail, Wallet } from "lucide-react";
import WalletStatusPill from "@/Components/WalletStatusPill";
import WalletEligibilityPill from "@/Components/WalletEligibilityPill";
import WalletSyncingPill from "@/Components/WalletSyncingPill";
import { getDomain } from "@/utils/viteConfig";
import { SyncingWarning } from "@/Components/SyncingWarning";
import CardSyncChecker from "@/Components/CardSyncChecker";
import { useWalletSyncMonitor, useEmailSendingMonitor } from "@/hooks/useJobMonitor";

/**
 * ✅ CONVERTED VERSION OF Company1.jsx
 * 
 * This demonstrates how to convert from datatables.net-react to CustomDataTable
 * with server-side processing for better performance with large datasets.
 * 
 * CHANGES FROM ORIGINAL:
 * 1. Removed: import DataTable from "datatables.net-react"
 * 2. Added: import CustomDataTable from "@/Components/CustomDataTable"
 * 3. Changed: cards prop is now paginated object instead of array
 * 4. Updated: Column definitions to new format
 * 5. Added: endpoint and tableKey props
 */

export default function Company1Converted() {
    const { cards, isSubscriptionActive, hasRunningJob, hasRunningEmailJob } = usePage().props;
    const { setHeaderTitle, setHeaderText } = useGlobal(GlobalProvider);

    const [linkDomain, setLinkDomain] = useState("https://app.ppsbusinesscards.de");

    // Monitor running jobs
    useWalletSyncMonitor(hasRunningJob);
    useEmailSendingMonitor(hasRunningEmailJob);

    // Fetch domain on mount
    useEffect(() => {
        (async () => {
            const domain = await getDomain();
            setLinkDomain(domain);
        })();
    }, []);

    useEffect(() => {
        setHeaderTitle("Employees Management");
        setHeaderText("");
    }, []);

    // ✅ Define columns in new format
    const columns = [
        {
            key: 'id',
            label: 'ID',
            sortable: true,
            className: 'font-semibold',
            render: (id) => `#${id}`,
        },
        {
            key: 'code',
            label: 'Code',
            sortable: true,
            render: (code, row) => (
                <a
                    href={`${linkDomain}/card/${code}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#50bd5b] underline hover:text-[#3da147]"
                >
                    {code}
                </a>
            ),
        },
        {
            key: 'first_name',
            label: 'User',
            sortable: true,
            render: (firstName, row) => {
                const nameParts = [
                    row.salutation,
                    row.title,
                    row.first_name,
                    row.last_name
                ].filter(Boolean);
                const fullName = nameParts.join(' ') || 'N/A';
                
                return (
                    <div className="flex flex-col">
                        <span className="font-medium text-gray-900">{fullName}</span>
                        {row.position && (
                            <span className="text-xs text-gray-500">{row.position}</span>
                        )}
                    </div>
                );
            },
        },
        {
            key: 'email',
            label: 'Email',
            sortable: true,
            render: (email, row) => {
                const displayEmail = email || row.primary_email || 'N/A';
                return displayEmail !== 'N/A' ? (
                    <a href={`mailto:${displayEmail}`} className="text-blue-600 hover:underline">
                        {displayEmail}
                    </a>
                ) : (
                    <span className="text-gray-400">N/A</span>
                );
            },
        },
        {
            key: 'department',
            label: 'Department',
            sortable: true,
            render: (dept) => dept || <span className="text-gray-400">N/A</span>,
        },
        {
            key: 'wallet_status',
            label: 'Wallet Status',
            sortable: true,
            render: (status, row) => (
                <div className="flex flex-col gap-1">
                    <WalletStatusPill status={status} />
                    <CardSyncChecker card={row} />
                </div>
            ),
        },
        {
            key: 'wallet_eligibility',
            label: 'Eligibility',
            sortable: true,
            render: (eligibility) => <WalletEligibilityPill status={eligibility} />,
        },
        {
            key: 'status',
            label: 'Status',
            sortable: true,
            render: (status) => (
                <span
                    className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        status === 'active'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                    }`}
                >
                    {status}
                </span>
            ),
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
            headerClassName: 'text-right',
            render: (_, row) => (
                <div className="flex items-center justify-end gap-2">
                    <button
                        onClick={() => handleView(row.id)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        title="View Card"
                    >
                        <Eye className="h-4 w-4" />
                    </button>
                    <button
                        onClick={() => handleEdit(row.id)}
                        className="p-2 text-gray-600 hover:bg-gray-50 rounded transition-colors"
                        title="Edit Card"
                    >
                        <EditIcon className="h-4 w-4" />
                    </button>
                    <button
                        onClick={() => handleSendWallet(row.id)}
                        className="p-2 text-purple-600 hover:bg-purple-50 rounded transition-colors"
                        title="Send Wallet"
                        disabled={row.wallet_status === 'added'}
                    >
                        <Wallet className="h-4 w-4" />
                    </button>
                    <button
                        onClick={() => handleSendEmail(row.id)}
                        className="p-2 text-green-600 hover:bg-green-50 rounded transition-colors"
                        title="Send Email"
                    >
                        <Mail className="h-4 w-4" />
                    </button>
                    <button
                        onClick={() => handleDelete(row.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="Delete Card"
                    >
                        <Trash2 className="h-4 w-4" />
                    </button>
                </div>
            ),
        },
    ];

    // Action handlers
    const handleView = (id) => {
        console.log('View card:', id);
        // Navigate to card detail page
        // router.visit(route('cards.show', id));
    };

    const handleEdit = (id) => {
        console.log('Edit card:', id);
        // Navigate to edit page
        // router.visit(route('cards.edit', id));
    };

    const handleSendWallet = (id) => {
        console.log('Send wallet:', id);
        // Implement wallet sending logic
    };

    const handleSendEmail = (id) => {
        console.log('Send email:', id);
        // Implement email sending logic
    };

    const handleDelete = (id) => {
        if (confirm('Are you sure you want to delete this card?')) {
            console.log('Delete card:', id);
            // Implement delete logic via Inertia
            // router.delete(route('cards.destroy', id));
        }
    };

    const handleRowClick = (row) => {
        // Optional: Navigate to detail page on row click
        // router.visit(route('cards.show', row.id));
    };

    return (
        <AuthenticatedLayout>
            <Head title="Employee Cards - Fast DataTable" />

            <div className="py-6">
                <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
                    
                    {/* Syncing Warning */}
                    {(hasRunningJob || hasRunningEmailJob) && (
                        <div className="mb-6">
                            <SyncingWarning
                                hasWalletSync={hasRunningJob}
                                hasEmailSync={hasRunningEmailJob}
                            />
                        </div>
                    )}

                    {/* Main Card */}
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900">
                                        Employee Cards
                                    </h2>
                                    <p className="mt-1 text-sm text-gray-600">
                                        Manage your company's employee business cards with fast server-side processing
                                    </p>
                                </div>
                                
                                {!isSubscriptionActive && (
                                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-2">
                                        <p className="text-sm text-yellow-800 font-medium">
                                            ⚠️ Subscription inactive
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* ✅ NEW: CustomDataTable Component */}
                            <CustomDataTable
                                columns={columns}
                                data={cards}
                                endpoint={route('company.cards.index')}
                                tableKey="cards"
                                searchable={true}
                                paginated={true}
                                perPageOptions={[10, 25, 50, 100]}
                                onRowClick={null} // or handleRowClick if you want clickable rows
                                emptyMessage="No employee cards found. Create your first card to get started."
                                className="shadow-sm"
                            />
                        </div>
                    </div>

                    {/* Info Box */}
                    <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h3 className="text-sm font-semibold text-blue-900 mb-2">
                            💡 Performance Tip
                        </h3>
                        <p className="text-sm text-blue-800">
                            This table uses server-side processing. Only {cards.per_page} records are loaded at a time,
                            making it blazing fast even with thousands of cards!
                        </p>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

/**
 * IMPORTANT NOTES:
 * 
 * 1. Backend Setup Required:
 *    - Update CardsController to use DataTableTrait (see CardsControllerExample.php)
 *    - The 'cards' prop must now be paginated data: { data: [], total, per_page, current_page, last_page }
 * 
 * 2. Performance Improvements:
 *    - Before: Loading ALL cards at once (slow with 1000+ records)
 *    - After: Loading only 25-100 cards per page (always fast)
 * 
 * 3. Features:
 *    - ✅ Server-side search
 *    - ✅ Server-side sorting
 *    - ✅ Server-side pagination
 *    - ✅ Configurable results per page
 *    - ✅ Custom column rendering
 *    - ✅ Action buttons
 *    - ✅ Loading states
 * 
 * 4. Multiple Tables:
 *    - To use multiple tables on one page, give each a unique 'tableKey'
 *    - Example: tableKey="cards" and tableKey="nfcCards"
 */
