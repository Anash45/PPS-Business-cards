export default function WalletStatusPill({ status }) {
    const s = (status || "").toString();

    const map = {
        missing: {
            label: "Missing",
            bg: "bg-red-100",
            text: "text-red-800",
            ring: "ring-red-200",
        },
        out_of_sync: {
            label: "Out of sync",
            bg: "bg-yellow-100",
            text: "text-yellow-800",
            ring: "ring-yellow-200",
        },
        synced: {
            label: "Synced",
            bg: "bg-green-100",
            text: "text-green-800",
            ring: "ring-green-200",
        },
        default: {
            label: s || "Unknown",
            bg: "bg-gray-100",
            text: "text-gray-800",
            ring: "ring-gray-200",
        },
    };

    const cfg = map[s] ?? map.default;

    return (
        <span
            role="status"
            aria-live="polite"
            className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${cfg.bg} ${cfg.text} ring-1 ${cfg.ring}`}
            title={cfg.label}
        >
            <span>{cfg.label}</span>
        </span>
    );
}
