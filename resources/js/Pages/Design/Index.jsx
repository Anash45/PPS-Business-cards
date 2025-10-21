import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, usePage, router } from "@inertiajs/react";
import { GlobalProvider, useGlobal } from "@/context/GlobalProvider";
import { useEffect, useMemo, useState } from "react";
import { useModal } from "@/context/ModalProvider";
import Alert from "@/Components/Alert";
import { FileText, IdCard } from "lucide-react";
import LandingTab from "@/Components/LandingTab";

export default function Design() {
    const {
        company,
        isSubscriptionActive,
        selectedCard = null,
        pageType,
    } = usePage().props;
    const { setHeaderTitle, setHeaderText, isTemplate, setIsTemplate } =
        useGlobal(GlobalProvider);
    const { openModal } = useModal();

    useEffect(() => {
        if (pageType === "template") {
            setIsTemplate(true);
        } else {
            setIsTemplate(false);
        }
    }, [pageType]);

    useEffect(() => {
        setHeaderTitle(selectedCard ? "Card Editing" : "Design Template");
        setHeaderText("");
    }, []);

    const tabs = [
        {
            icon: <FileText className="h-6 w-6" />,
            name: "Landing Page",
            content: <LandingTab />,
        },
        {
            icon: <IdCard className="h-6 w-6" />,
            name: "Wallet",
            content: <div>Wallet Content</div>,
        },
    ];

    const [activeTab, setActiveTab] = useState(tabs[0].name);

    console.log("Page Data:", company, selectedCard, pageType, isTemplate);

    return (
        <AuthenticatedLayout>
            <Head title={selectedCard ? "Card Editing" : "Design Template"} />

            <div className="py-4 md:px-6 px-4 flex flex-col gap-6">
                {!isSubscriptionActive ? (
                    <Alert
                        type="danger"
                        message={`You can only access this page with a valid subscription. Contact Admin for more information.`}
                    />
                ) : (
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
                                    {tab.icon}
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
                )}
            </div>
        </AuthenticatedLayout>
    );
}
