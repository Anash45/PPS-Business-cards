import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, usePage, router, Link } from "@inertiajs/react";
import { GlobalProvider, useGlobal } from "@/context/GlobalProvider";
import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { getDomain } from "@/utils/viteConfig";
import { Copy, DotIcon, Eye } from "lucide-react";
import SwaggerUI from "swagger-ui-react";
import "swagger-ui-react/swagger-ui.css";

export default function Settings() {
    const { apiKey: initialApiKey } = usePage().props;
    const { setHeaderTitle, setHeaderText } = useGlobal(GlobalProvider);

    const [apiKey, setApiKey] = useState(initialApiKey ?? "");
    const [showKey, setShowKey] = useState(false);
    const [loading, setLoading] = useState(false);
    const [showDocs, setShowDocs] = useState(false);

    const [linkDomain, setLinkDomain] = useState(
        "https://app.ppsbusinesscards.de"
    );

    // Initialize domain on mount
    useEffect(() => {
        (async () => {
            const domain = await getDomain();
            setLinkDomain(domain);
            setData((prev) => ({ ...prev, domain }));
        })();
    }, []);

    useEffect(() => {
        setHeaderTitle("API Documentation");
        setHeaderText("");
    }, []);

    const handleCopy = () => {
        navigator.clipboard.writeText(apiKey);
        toast.success("API key copied to clipboard!");
    };

    const handleToggleShow = () => setShowKey(!showKey);

    const handleRegenerate = async () => {
        if (
            !confirm(
                "Are you sure? This will generate a new API key and invalidate the old one."
            )
        )
            return;

        setLoading(true);
        try {
            const response = await axios.post(route("api.regenerateKey"));
            setApiKey(response.data.api_key);
            toast.success("API key regenerated successfully!");
            router.reload({ only: ["apiKey"] });
        } catch (err) {
            console.error(err);
            toast.error(
                err.response?.data?.message || "Failed to regenerate API key."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title="API Documentation" />

            <div className="py-4 md:px-6 px-4">
                <div className="border border-[#EAECF0] bg-white rounded-xl ">
                    <h2 className="text-xl font-semibold text-black px-5 py-4 border-b border-[#EAECF0]">
                        Your API Key
                    </h2>
                    <div className="px-5 py-4 space-y-3">
                        <p className="text-sm text-[#667085]">
                            Your personal API key:
                        </p>
                        <div className="flex items-center gap-2">
                            <div className="rounded p-2 font-medium bg-gray-50 font-mono flex items-center gap-1">
                                {showKey ? (
                                    apiKey
                                ) : (
                                    <>
                                        <span>pps_key_</span>
                                        {Array.from({ length: 45 }).map(
                                            (_, i) => (
                                                <span key={i}>•</span>
                                            )
                                        )}
                                    </>
                                )}
                            </div>
                            <button
                                onClick={handleToggleShow}
                                className="px-3 py-2 flex items-center gap-2 text-sm bg-gray-200 rounded hover:bg-gray-300"
                            >
                                <Eye className="h-4 w-4" />
                                <span>{showKey ? "Hide" : "Show"}</span>
                            </button>
                            <button
                                onClick={handleCopy}
                                className="px-3 py-2 flex items-center gap-2 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                            > 
                                <Copy className="h-4 w-4" />
                                <span>Copy</span>
                            </button>
                            <button
                                onClick={handleRegenerate}
                                className="px-3 py-2 flex items-center gap-2 text-sm bg-red-500 text-white rounded hover:bg-red-600"
                                disabled={loading}
                            >
                                {apiKey ? (loading ? "Regenerating..." : "Regenerate") : (loading ? "Generating..." : "Generate")}
                            </button>
                        </div>

                        {/* <pre className="bg-gray-100 p-4 rounded">
                            {`curl -H "Authorization: Bearer <Your_Api_Key> ${linkDomain}/api/endpoint`}
                        </pre> */}
                    </div>
                </div>
                <div className="border border-[#EAECF0] bg-white rounded-xl mt-6">
                    <div className="px-5 py-4 flex items-center justify-between border-b border-[#EAECF0]">
                        <h2 className="text-xl font-semibold text-black">
                            API Documentation
                        </h2>
                        <div className="flex items-center gap-2">
                            <a
                                href={`/api-docs/full`}
                                target="_blank"
                                className="px-3 py-2 text-sm bg-green-500 text-white rounded hover:bg-green-600"
                            >
                                Full Screen
                            </a>
                            <button
                                onClick={() => setShowDocs(!showDocs)}
                                className="px-3 py-2 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                            >
                                {showDocs ? "Hide Docs" : "View Docs"}
                            </button>
                        </div>
                    </div>
                    <div className="p-4">
                        {showDocs ? (
                            <div>
                                <SwaggerUI url="/swagger.json" />
                            </div>
                        ) : (
                            <p className="text-sm text-[#667085]">
                                Click "View Docs" to open the interactive API
                                documentation (powered by Swagger UI).
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
