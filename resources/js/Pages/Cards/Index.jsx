import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head } from "@inertiajs/react";
import { GlobalProvider, useGlobal } from "@/context/GlobalProvider";
import { useEffect, useState } from "react";
import AssociatedCards from "@/Components/AssociatedCards";
import IndependentCards from "@/Components/IndependentCards";

export default function Cards() {
    const { setHeaderTitle, setHeaderText } = useGlobal(GlobalProvider);

    useEffect(() => {
        setHeaderTitle("Cards Management");
        setHeaderText("");
    }, []);

    const tabs = [
        {
            name: "Associated Cards",
            content: <AssociatedCards />,
        },
        {
            name: "Independent Cards",
            content: <IndependentCards />,
        },
    ];
    const [activeTab, setActiveTab] = useState(tabs[0].name);

    return (
        <AuthenticatedLayout>
            <Head title="Cards" />

            <div className="py-4 md:px-6 px-4 flex flex-col gap-6">
                <div className="space-y-5">
                    <div className="flex gap-10">
                        {tabs.map((tab) => (
                            <button
                                key={tab.name}
                                onClick={() => setActiveTab(tab.name)}
                                className={`font-medium text-sm flex items-center justify-center gap-2 py-3 border-b-2 ${
                                    activeTab === tab.name
                                        ? "text-[#87B88C] border-b-primary"
                                        : "text-[#667085] border-b-transparent"
                                }`}
                            >
                                <span>{tab.name}</span>
                            </button>
                        ))}
                    </div>

                    <div>
                        {tabs.map(
                            (tab) =>
                                activeTab === tab.name && (
                                    <div key={tab.name}>{tab.content}</div>
                                )
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
