import { Link } from "@inertiajs/react";
import dayjs from "dayjs";

export default function CardsPreview({ previewCards, domain }) {
    return (
        <div className="mt-5">
            <h3 className="text-grey900 font-semibold text-lg">
                Preview URLs
            </h3>
            <p className="text-sm leading-5 font-medium text-[#475569]">
                Max 100 URLs are being shown.
            </p>
            <div className="overflow-auto w-full max-h-[400px] mt-5">
                <div className="xl:w-max min-w-full space-y-3">
                    {/* Header */}
                    <div className="hidden lg:flex border-b gap-4 border-gray-200 pb-2 px-4 text-xs font-semibold text-[#263238]">
                        <div className="w-32 shrink-0">Company</div>
                        <div className="flex-1 min-w-[180px] shrink-0">URL</div>
                        <div className="w-40 shrink-0">Created at</div>
                    </div>

                    {/* Rows */}
                    {previewCards.slice(0, 100).map((c, idx) => (
                        <div
                            key={idx}
                            className="border border-gray-400 rounded-lg py-2 px-3.5 flex flex-col sm:flex-row sm:items-center sm:justify-between hover:bg-gray-50 transition"
                        >
                            <div className="flex flex-col lg:flex-row lg:items-center lg:flex-1 lg:gap-4">
                                <div className="lg:w-32 shrink-0">
                                    <span className="lg:hidden text-[10px] text-gray-500">
                                        Company:{" "}
                                    </span>
                                    <span className="text-xs text-body">
                                        {c?.company?.name
                                            ? c?.company?.name
                                            : ""}
                                    </span>
                                </div>
                                <div className="lg:flex-1 min-w-[180px] shrink-0">
                                    <span className="lg:hidden text-[10px] text-gray-500">
                                        URL:{" "}
                                    </span>
                                    <span className="text-xs text-body">
                                        <a
                                            target="_blank"
                                            href={`${domain}/card/${c.code}`}
                                            className="underline break-all"
                                        >
                                            {domain}/card/{c.qr_code}
                                        </a>
                                    </span>
                                </div>
                                <div className="lg:w-40 shrink-0">
                                    <span className="lg:hidden text-[10px] text-gray-500">
                                        Created at:{" "}
                                    </span>
                                    <span className="text-xs text-body">
                                        {dayjs(c.created_at).format(
                                            "DD.MM.YYYY, HH:mm"
                                        )}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
