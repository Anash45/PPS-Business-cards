import { Loader2 } from "lucide-react";

export default function WalletSyncingPill() {
    return (
        <span
            role="status"
            aria-live="polite"
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 ring-1 ring-blue-200"
            title="Syncing"
        >
            <Loader2 className="w-3 h-3 animate-spin" />
            <span>Syncing</span>
        </span>
    );
}
