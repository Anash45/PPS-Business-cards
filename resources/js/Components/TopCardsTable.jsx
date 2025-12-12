import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import { getDomain } from "@/utils/viteConfig";
import { usePage } from "@inertiajs/react";
import CustomDataTable from "@/Components/CustomDataTable";

export default function TopCardsTable({ duration }) {
    const { auth } = usePage().props;
    const [cards, setCards] = useState({ data: [] });
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
                if (res.data.success) setCards({ data: res.data.data });
            });
    }, [duration]);

    const columns = useMemo(() => {
        const cols = [
            {
                key: "rank",
                label: "Rank",
                render: (value, row, index) => index + 1,
            },
            {
                key: "user",
                label: "User",
                render: (value, row) => {
                    const fullName = [row.first_name, row.last_name]
                        .filter(Boolean)
                        .join(" ");
                    const profileImg = row.profile_image
                        ? `/storage/${row.profile_image}`
                        : "/assets/images/profile-placeholder.png";

                    return (
                        <div className="flex items-center gap-2">
                            <img
                                src={profileImg}
                                alt="Profile"
                                className="rounded-full border-2 bg-white border-white w-8 h-8 object-cover shrink-0"
                            />
                            <div className="space-y-0.5">
                                <p className="font-medium text-[#181D27] text-sm">
                                    {fullName}
                                </p>
                                {row.primary_email && (
                                    <p className="text-xs text-gray-600">
                                        {row.primary_email}
                                    </p>
                                )}
                            </div>
                        </div>
                    );
                },
            },
            { 
                key: "position", 
                label: "Position",
                render: (value) => value || "-",
            },
            { 
                key: "department", 
                label: "Department",
                render: (value) => value || "-",
            },
            { 
                key: "total_views", 
                label: "Views",
            },
            {
                key: "code",
                label: "Card",
                render: (value, row) => (
                    <a 
                        href={`${linkDomain}/card/${value}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-[#50bd5b] underline"
                    >
                        {value}
                    </a>
                ),
            },
        ];

        // 👇 Add company column only if user is admin
        if (authUser?.role === "admin" || authUser?.is_admin) {
            cols.splice(2, 0, {
                key: "company",
                label: "Company",
                render: (value, row) => row.company?.name || "-",
            });
        }

        return cols;
    }, [authUser, linkDomain]);

    console.log("Top cards data:", cards);

    return (
        <CustomDataTable
            key={duration}
            data={cards}
            columns={columns}
            searchable={false}
            perPageOptions={[10]}
        />
    );
}
