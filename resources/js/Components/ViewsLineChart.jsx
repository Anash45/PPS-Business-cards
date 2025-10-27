import React from "react";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    CartesianGrid,
} from "recharts";
import dayjs from "dayjs";

export default function ViewsLineChart({ data = [], duration = "7_days" }) {
    // Format the X-axis labels like "27.10"
    const formatDate = (dateString) => dayjs(dateString).format("DD.MM");

    return (
        <div className="w-full">
            <div className="mb-4 flex items-center justify-between gap-2">
                <h3 className="text-xl font-bold">Page View</h3>
                <h4 className="text-lg font-semibold mb-3">
                    Views in last{" "}
                    {duration === "7_days"
                        ? "7 days"
                        : duration === "30_days"
                        ? "30 days"
                        : "90 days"}
                </h4>
            </div>

            <ResponsiveContainer width="100%" height={500}>
                <LineChart
                    data={data}
                    margin={{
                        top: 10,
                        right: 0, // ✅ remove right padding
                        left: 0, // ✅ remove left padding
                        bottom: 0,
                    }}
                >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis
                        dataKey="date"
                        tickFormatter={formatDate}
                        stroke="#888"
                        tickMargin={8} // optional: spacing between ticks and axis line
                    />
                    <YAxis allowDecimals={false} stroke="#888" />
                    <Tooltip
                        labelFormatter={(label) => `Date: ${formatDate(label)}`}
                        formatter={(value) => [`${value} views`, "Views"]}
                    />
                    <Line
                        type="monotone"
                        dataKey="views"
                        stroke="#87b88c"
                        strokeWidth={2}
                        dot={{ r: 3 }}
                        activeDot={{ r: 5 }}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}
