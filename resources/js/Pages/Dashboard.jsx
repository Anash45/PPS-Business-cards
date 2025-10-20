import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { useEffect, useState } from "react";
import { useGlobal } from "@/context/GlobalProvider";
import DashboardStats from "@/Components/DashboardStats";
import { Head, router, usePage } from "@inertiajs/react";
import DashboardChart from "@/Components/DashboardChart";

export default function Dashboard() {
    const { auth, dashboardStats, chartData } = usePage().props;
    const { setHeaderTitle, setHeaderText } = useGlobal();

    const [durations, setDurations] = useState([
        "7_days",
        "30_days",
        "90_days",
    ]);
    const [selectedDuration, setSelectedDuration] = useState(durations[0]);

    const isAdmin = auth.user.role === "admin";
    const isCompany = auth.user.role === "company";

    console.log("dashboardStats:", auth);

    useEffect(() => {
        setHeaderTitle("Dashboard");
        setHeaderText("");
    }, []);

    console.log("chartData", chartData);

    const statsList = isAdmin
        ? [
              { label: "Total Users", value: dashboardStats.total_users },
              { label: "Admins", value: dashboardStats.total_admins },
              { label: "Editors", value: dashboardStats.total_editors },
              { label: "Companies", value: dashboardStats.total_companies },
              { label: "Cards Generated", value: dashboardStats.total_cards },
          ]
        : [
              { label: "Total Cards", value: dashboardStats.total_cards },
              { label: "Active Cards", value: dashboardStats.active_cards },
              { label: "Inactive Cards", value: dashboardStats.inactive_cards },
              { label: "Total Views", value: dashboardStats.total_views },
              { label: "Unique Views", value: dashboardStats.unique_views },
          ];

    return (
        <AuthenticatedLayout>
            <Head title="Dashboard" />
            <div className="py-4 md:px-6 px-4 flex flex-col gap-6">
                {/* <div className="flex items-center gap-3 flex-wrap justify-end">
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
                </div> */}

                <DashboardStats dashboardStats={statsList} />
                {/* <DashboardChart
                    data={chartData} // backend sends chart data
                    title={isAdmin ? "Company Performance" : "Your Card Views"}
                    description={
                        isAdmin
                            ? "Total and unique views per company"
                            : "Total and unique views of your cards"
                    }
                    color="#85AF84"
                /> */}
            </div>
        </AuthenticatedLayout>
    );
}
