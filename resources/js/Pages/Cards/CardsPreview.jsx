import { Link } from "@inertiajs/react";
import dayjs from "dayjs";
import { useMemo } from "react";
import CustomDataTable from "@/Components/CustomDataTable";

export default function CardsPreview({ previewCards, domain }) {
    const columns = useMemo(
        () => [
            {
                key: "company",
                label: "Company",
                sortable: false,
                render: (value, row) => row.company?.name || "-",
            },
            {
                key: "qr_code",
                label: "URL",
                sortable: false,
                render: (value, row) => (
                    <span className="text-xs text-body">
                        <a
                            target="_blank"
                            href={`${domain}/card/${row.qr_code}`}
                            className="underline break-all"
                        >
                            {domain}/card/{row.qr_code}
                        </a>
                    </span>
                ),
            },
            {
                key: "created_at",
                label: "Created at",
                sortable: false,
                render: (value, row) =>
                    dayjs(row.created_at).format("DD.MM.YYYY, HH:mm"),
            },
        ],
        [domain]
    );

    // Limit to 100 records and format for CustomDataTable
    const tableData = {
        data: previewCards.slice(0, 100),
        total: previewCards.length,
        per_page: 100,
        current_page: 1,
        last_page: 1,
    };

    return (
        <div className="mt-5">
            <h3 className="text-grey900 font-semibold text-lg">Preview URLs</h3>
            <p className="text-sm leading-5 font-medium text-[#475569]">
                Max 100 URLs are being shown.
            </p>
            <div className="mt-5 overflow-y-auto max-h-[500px]">
                <CustomDataTable
                    columns={columns}
                    data={tableData}
                    searchable={false}
                    paginated={false}
                    size="md"
                    className="text-xs"
                />
            </div>
        </div>
    );
}
