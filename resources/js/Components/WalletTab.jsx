import { usePage } from "@inertiajs/react";
import CardPreview from "./CardPreview";
import { GlobalProvider, useGlobal } from "@/context/GlobalProvider";
import WalletFormInformation from "./WalletFormInformation";

export default function WalletTab() {
    const { company, selectedCard = null } = usePage().props;
    const { cardFormData, setCardFormData, isTemplate } =
        useGlobal(GlobalProvider);
    return (
        <div className="grid lg:grid-cols-11 grid-cols-1 gap-5 relative">
            <div className="lg:col-span-7 col-span-1 bg-white lg:p-6 p-5 rounded-[20px] shadow-box space-y-4 lg:order-1 order-2">
                <WalletFormInformation />
            </div>

            <div className="lg:col-span-4 col-span-1  lg:order-2 order-1">
                <div className="bg-white rounded-2xl shadow-box border border-[#EAECF0] sticky top-3">
                    <div className="p-5 border-b border-b-[#EAECF0]">
                        <h4 className="text-xl leading-tight font-semibold">
                            Live Wallet Preview
                        </h4>
                    </div>
                    <div className="px-5 pb-5 pt-4">
                        <CardPreview />
                    </div>
                </div>
            </div>
        </div>
    );
}
