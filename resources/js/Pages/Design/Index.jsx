import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, usePage, router } from "@inertiajs/react";
import { GlobalProvider, useGlobal } from "@/context/GlobalProvider";
import { useEffect, useMemo, useState } from "react";
import { useModal } from "@/context/ModalProvider";
import Alert from "@/Components/Alert";
import { FileText, IdCard } from "lucide-react";
import LandingTab from "@/Components/LandingTab";
import WalletTab from "@/Components/WalletTab";

export default function Design() {
    const {
        company,
        isSubscriptionActive,
        selectedCard = null,
        wallet_status = null,
        pageType,
    } = usePage().props;
    const {
        setHeaderTitle,
        setHeaderText,
        isTemplate,
        setIsTemplate,
        isChanged,
        setIsChanged,
    } = useGlobal(GlobalProvider);
    const { openModal } = useModal();

    useEffect(() => {
        // ✅ Get current URL path from Inertia
        const currentUrl = window.location.pathname;

        // ✅ Define which routes should trigger the warning
        const shouldWarn =
            isChanged &&
            ((currentUrl.startsWith("/company/cards/") &&
                currentUrl.includes("/edit")) ||
                currentUrl === "/design");

        if (!shouldWarn) return; // Skip if not on the specified pages

        // Warn when closing the tab or refreshing
        const handleBeforeUnload = (event) => {
            console.log("Is Changed 1: ", isChanged);
            if (isChanged) {
                event.preventDefault();
                event.returnValue =
                    "You have unsaved changes. Are you sure you want to leave?";
            }
        };

        window.addEventListener("beforeunload", handleBeforeUnload);


        return () => {
            window.removeEventListener("beforeunload", handleBeforeUnload);
        };
    }, [isChanged, setIsChanged]);

    console.log("wallet_status:", wallet_status);

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
            content: <WalletTab />,
        },
    ];

    const [activeTab, setActiveTab] = useState(tabs[0].name);

    console.log("Design Data:", company, selectedCard, pageType, isTemplate);

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
