import { Bell } from "lucide-react";
import { usePage } from "@inertiajs/react";
import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useGlobal } from "@/context/GlobalProvider";

export default function Header() {
    const { props } = usePage();
    const { headerTitle, headerText, setIsPageLoading } = useGlobal();

    // Reactive state
    const [isImpersonating, setIsImpersonating] = useState(
        !!props?.auth?.user?.impersonated_by
    );

    // ✅ Keep state in sync with props in case user updates
    useEffect(() => {
        setIsImpersonating(!!props?.auth?.user?.impersonated_by);
    }, [props?.auth?.user?.impersonated_by]);

    const stopImpersonate = async () => {
        setIsPageLoading(true);
        try {
            await axios.post(route("users.stopImpersonate"));
            toast.success("Stopped impersonating.");

            setIsPageLoading(false);
            setTimeout(() => {
                // Refresh the page to reload auth and props
                window.location = route("users.index");
            }, 1000);
        } catch (err) {
            setIsPageLoading(false);
            toast.error("Failed to stop impersonation.");
        }
        setIsPageLoading(false);
    };
    // console.log(props?.auth, isImpersonating);

    return (
        <div className="flex h-[70px] border-b border-b-[#EAECF0] justify-between items-center px-6 shrink-0">
            <div className="space-y-0.5">
                {headerTitle && (
                    <h2 className="text-xl font-bold font-public-sans text-[#1C274C]">
                        {headerTitle}
                    </h2>
                )}
                {headerText && (
                    <p className="text-sm text-[#676E87]">{headerText}</p>
                )}
            </div>
            <div className="flex gap-3 items-center">
                {isImpersonating && (
                    <div className="flex items-center gap-2 px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
                        <span>Impersonating</span>
                        <button
                            onClick={stopImpersonate}
                            className="px-2 py-0.5 bg-yellow-300 rounded hover:bg-yellow-400 transition text-xs"
                        >
                            Stop
                        </button>
                    </div>
                )}

                <div className="h-10 w-10 rounded-lg border border-[#EEF2F6] flex items-center justify-center cursor-pointer">
                    <Bell className="h-5 w-5 text-[#697586]" strokeWidth={2} />
                </div>
            </div>
        </div>
    );
}
