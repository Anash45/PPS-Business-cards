import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import DataTable from "datatables.net-react";
import DT from "datatables.net-dt";
import "datatables.net-dt/css/dataTables.dataTables.css";
import { getDomain } from "@/utils/viteConfig";
import { usePage } from "@inertiajs/react";

// Bind DataTables
DataTable.use(DT);

export default function TopCardsTable({ duration }) {
    const { auth } = usePage().props;
    const [cards, setCards] = useState([]);
    const [linkDomain, setLinkDomain] = useState(
        "https://app.ppsbusinesscards.de"
    );
    const authUser = auth?.user || null;

    // Fetch domain on mount
    useEffect(() => {
        (async () => {
            const domain = await getDomain();
            setLinkDomain(domain);
        })();
    }, []);

    useEffect(() => {
        axios
            .get(`/dashboard/top-cards`, { params: { duration } })
            .then((res) => {
                if (res.data.success) setCards(res.data.data);
            });
    }, [duration]);

    const columns = useMemo(() => {
        const cols = [
            {
                title: "Rank",
                data: null,
                render: (data, type, row, meta) => meta.row + 1,
            },
            {
                title: "User",
                data: null,
                render: (data, type, row) => {
                    const fullName = [row.first_name, row.last_name]
                        .filter(Boolean)
                        .join(" ");
                    const profileImg = row.profile_image
                        ? `/storage/${row.profile_image}`
                        : "/assets/images/profile-placeholder.png";

                    return `
                        <div class="flex items-center gap-2">
                            <img
                                src="${profileImg}"
                                alt="Profile"
                                class="rounded-full border-2 bg-white border-white w-8 h-8 object-cover shrink-0"
                            />
                            <div>
                                <p class="font-medium text-[#181D27] text-sm">${fullName}</p>
                            </div>
                        </div>
                    `;
                },
            },
            { title: "Position", data: "position" },
            { title: "Department", data: "department" },
            { title: "Views", data: "total_views" },
            {
                title: "Card",
                data: "code",
                render: (data, type, row) =>
                    `<a href="${linkDomain}/card/${data}" target="_blank" class="text-[#50bd5b] underline">${data}</a>`,
            },
        ];

        // 👇 Add company column only if user is admin
        if (authUser?.role === "admin" || authUser?.is_admin) {
            cols.splice(2, 0, {
                title: "Company",
                data: (row) => row.company?.name || "-",
            });
        }

        return cols;
    }, [authUser, linkDomain]);

    return (
        <DataTable
            key={duration}
            data={cards}
            columns={columns}
            className="display site-datatable"
            options={{
                responsive: true,
                pageLength: 10,
                dom:
                    "<'flex justify-between items-center mb-3 sd-top'<'flex items-center gap-2'l><'flex items-center gap-2'f>>" +
                    "rt" +
                    "<'flex justify-center mt-3 sd-bottom'p>",
            }}
        />
    );
}
