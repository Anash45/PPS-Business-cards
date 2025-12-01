import { Loader2 } from "lucide-react";

export function SyncingWarning({ isSyncing, syncType = "normal" }) {
    if (!isSyncing) return null;

    return (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 text-yellow-700 p-4 mb-2 flex items-start gap-3">
            {/* Spinner */}
            <Loader2 className="h-5 w-5 animate-spin flex-shrink-0 mt-1" />

            {syncType == "background" ? (
                <div>
                    <p className="font-bold">Wallets cards syncing...</p>
                    <p className="mt-1 text-sm">
                        ⚠️ Syncing in background. You can keep doing your work.
                    </p>
                </div>
            ) : syncType == "emailSending" ? (
                <div>
                    <p className="font-bold">Wallets cards sending emails...</p>
                    <p className="mt-1 text-sm">
                        ⚠️ E-mails sending in background. You can keep doing your work.
                    </p>
                </div>
            ) : (
                <div>
                    <p className="font-bold">Card Wallets syncing...</p>
                    <p className="mt-1 text-sm">
                        ⚠️ Keep the page open until it finishes. It may take
                        some time.
                    </p>
                </div>
            )}
        </div>
    );
}
