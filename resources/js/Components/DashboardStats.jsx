export default function DashboardStats({ dashboardStats = [] }) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {dashboardStats.map((stat, index) => (
                <div
                    key={index}
                    className="bg-white p-4 rounded-[20px] stat-box shadow-sm"
                >
                    <div className="flex flex-col gap-2 text-[#242424]">
                        <span className="text-sm font-manrope font-medium leading-tight">
                            {stat.label}
                        </span>
                        <h4 className="text-3xl font-bold">{stat.value ?? 0}</h4>
                    </div>
                </div>
            ))}
        </div>
    );
}
