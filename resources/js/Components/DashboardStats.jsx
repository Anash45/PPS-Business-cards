import { Download, Eye, User } from "lucide-react";

export default function DashboardStats({ dashboardStats = [] }) {
    console.log("DashboardStats dashboardStats:", dashboardStats);
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <div className="bg-white px-4 py-5 rounded-[16px] border border-[#EAECF0] stat-box shadow-sm">
                <div className="flex items-center gap-2 justify-between">
                    <div className="flex flex-col gap-2 text-[#242424]">
                        <span className="text-sm text-[#71717A] font-manrope leading-tight">
                            Cards
                        </span>
                        <h4 className="text-2xl font-semibold flex gap-2 items-end">
                            <span>{dashboardStats?.total_cards ?? 0}</span>
                            <span className="text-xl">
                                (
                                <span className="text-green-500">
                                    {dashboardStats?.active_cards ?? 0}
                                </span>
                                /
                                <span className="text-red-500">
                                    {dashboardStats?.inactive_cards ?? 0}
                                </span>
                                )
                            </span>
                        </h4>
                    </div>
                    <div className="h-[56px] w-[56px] rounded-xl flex items-center justify-center bg-primary">
                        <User className="h-8 w-8 text-white" />
                    </div>
                </div>
            </div>
            <div className="bg-white px-4 py-5 rounded-[16px] border border-[#EAECF0] stat-box shadow-sm">
                <div className="flex items-center gap-2 justify-between">
                    <div className="flex flex-col gap-2 text-[#242424]">
                        <span className="text-sm text-[#71717A] font-manrope leading-tight">
                            Total views
                        </span>
                        <h4 className="text-2xl font-semibold flex gap-2 items-end">
                            <span>{dashboardStats?.total_views ?? 0}</span>
                        </h4>
                    </div>
                    <div className="h-[56px] w-[56px] rounded-xl flex items-center justify-center bg-primary">
                        <Eye className="h-8 w-8 text-white" />
                    </div>
                </div>
            </div>
            <div className="bg-white px-4 py-5 rounded-[16px] border border-[#EAECF0] stat-box shadow-sm">
                <div className="flex items-center gap-2 justify-between">
                    <div className="flex flex-col gap-2 text-[#242424]">
                        <span className="text-sm text-[#71717A] font-manrope leading-tight">
                            Total downloads
                        </span>
                        <h4 className="text-2xl font-semibold flex gap-2 items-end">
                            <span>{dashboardStats?.total_downloads ?? 0}</span>
                        </h4>
                    </div>
                    <div className="h-[56px] w-[56px] rounded-xl flex items-center justify-center bg-primary">
                        <Download className="h-8 w-8 text-white" />
                    </div>
                </div>
            </div>
        </div>
    );
}
