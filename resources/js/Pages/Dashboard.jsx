import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { useEffect, useState } from "react";
import { useGlobal } from "@/context/GlobalProvider";
import DashboardStats from "@/Components/DashboardStats";
import { Head, Link, router, usePage } from "@inertiajs/react";
import DashboardChart from "@/Components/DashboardChart";
import CardPreview from "@/Components/CardPreview";
import { PenBoxIcon } from "lucide-react";
import { mapCompanyTemplateData } from "@/utils/mapCompanyTemplateData";
import ViewsLineChart from "@/Components/ViewsLineChart";
import TopCardsTable from "@/Components/TopCardsTable";

export default function Dashboard() {
    const { auth, dashboardStats, company } = usePage().props;
    const {
        setHeaderTitle,
        setHeaderText,
        cardFormData,
        setCardFormData,
        isTemplate,
        setIsTemplate,
    } = useGlobal();

    const [durations, setDurations] = useState([
        "7_days",
        "30_days",
        "90_days",
    ]);
    const [selectedDuration, setSelectedDuration] = useState(durations[0]);

    useEffect(() => {
        setIsTemplate(true);
    }, []);

    useEffect(() => {
        if (company) {
            const mappedData = mapCompanyTemplateData(company, null);
            setCardFormData((prev) => ({
                ...prev,
                ...mappedData,
            }));
        }
    }, [company]);

    const isAdmin = auth.user.role === "admin";
    const isCompany = auth.user.role === "company";

    console.log("Dashboard data:", dashboardStats, company);

    useEffect(() => {
        setHeaderTitle("Dashboard");
        setHeaderText("");
    }, []);

    const [viewsData, setViewsData] = useState([]);

    useEffect(() => {
        axios
            .get(`/dashboard/views?duration=${selectedDuration}`)
            .then((res) => setViewsData(res.data))
            .catch((err) => console.error("Error fetching chart data", err));
    }, [selectedDuration]);

    return (
        <AuthenticatedLayout>
            <Head title="Dashboard" />
            <div className="py-4 md:px-6 px-4 flex flex-col gap-6">
                <DashboardStats dashboardStats={dashboardStats} />

                <div className="flex items-center gap-3 flex-wrap justify-end">
                    <div className="flex items-center p-1 rounded-lg text-sm font-medium bg-[#F1F5F9]">
                        {durations.map((duration) => (
                            <button
                                key={duration}
                                className={`px-3 py-1.5 rounded-lg ${
                                    selectedDuration === duration
                                        ? "bg-[#85AF84] text-white"
                                        : ""
                                }`}
                                onClick={() => {
                                    setSelectedDuration(duration);
                                    router.get(
                                        route("dashboard"),
                                        { duration },
                                        { preserveState: true, replace: true }
                                    );
                                }}
                            >
                                {duration.replace(/_/g, " ")}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="grid lg:grid-cols-11 grid-cols-1 gap-5 relative items-start">
                    <div
                        className={`${
                            company ? "xl:col-span-7" : "xl:col-span-11"
                        } col-span-1 bg-white xl:p-6 p-5 rounded-[20px] shadow-box space-y-4 xl:order-1 order-2 border border-[#EAECF0]`}
                    >
                        <ViewsLineChart
                            data={viewsData}
                            duration={selectedDuration}
                        />
                    </div>

                    {company && (
                        <div className="xl:col-span-4 col-span-1 xl:order-2 order-1">
                            <div className="bg-white rounded-2xl shadow-box border border-[#EAECF0] sticky top-3">
                                <div className="p-5 border-b flex items-center justify-between gap-3 border-b-[#EAECF0]">
                                    <h4 className="text-xl leading-tight font-semibold">
                                        Active template
                                    </h4>
                                    <Link>
                                        <PenBoxIcon
                                            className="h-5 w-5"
                                            strokeWidth={2}
                                        />
                                    </Link>
                                </div>
                                <div className="px-5 pb-5 pt-4">
                                    <CardPreview />
                                </div>
                            </div>
                        </div>
                    )}
                </div>
                <div className="bg-white xl:p-6 p-5 rounded-[20px] shadow-box space-y-4 xl:order-1 order-2 border border-[#EAECF0]">
                    <TopCardsTable duration={selectedDuration} />
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
