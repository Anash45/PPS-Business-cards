import AppleWalletPreview from "./AppleWalletPreview";
import GoogleWalletPreview from "./GoogleWalletPreview";

export default function WalletPreview({ walletType = "apple", isReal = false, isTemplate = false }) {
    // If isTemplate, apply wallet type filter; otherwise show both
    const showApple = isTemplate ? walletType === "apple" : true;
    const showGoogle = isTemplate ? walletType === "google" : true;

    return (
        <div className="flex gap-10 flex-wrap justify-center items-start">
            {showApple && (
                <div className="bg-white basis-[390px] rounded-[28px] border border-gray-300">
                    <h4 className="text-main p-3 font-semibold text-center">Apple Wallet</h4>
                    <AppleWalletPreview isReal={isReal} />
                </div>
            )}
            {showGoogle && (
                <div className="bg-white basis-[390px] rounded-[28px] border border-gray-300">
                    <h4 className="text-main p-3 font-semibold text-center">Google Wallet</h4>
                    <GoogleWalletPreview isReal={isReal} />
                </div>
            )}
        </div>
    );
}
