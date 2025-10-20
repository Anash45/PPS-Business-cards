import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    CartesianGrid,
} from "recharts";

export default function DashboardChart({ data, title, description, color = "#85AF84" }) {
    return (
        <div className="p-4 rounded-xl bg-white flex flex-col gap-6 shadow-sm">
            {/* Header */}
            <div className="flex justify-between">
                <div className="flex flex-col gap-1">
                    <h5 className="font-semibold text-grey900 text-[18px] leading-[28px]">
                        {title}
                    </h5>
                    <p className="text-xs text-[#544854]">{description}</p>
                </div>
                <div className="flex items-center gap-1">
                    <div className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: color }}></div>
                    <span className="text-[#334155] font-medium text-xs leading-5">
                        Line Page views/day
                    </span>
                </div>
            </div>

            {/* Chart */}
            <div className="w-full h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data}>
                        <CartesianGrid stroke="#f0f0f0" strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Line
                            type="monotone"
                            dataKey="totalViews"
                            stroke={color}
                            strokeWidth={3}
                            dot={{ r: 3 }}
                        />
                        <Line
                            type="monotone"
                            dataKey="uniqueViews"
                            stroke="#FFA500" // secondary color for unique views
                            strokeWidth={3}
                            dot={{ r: 3 }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
