import { GlobalProvider, useGlobal } from "@/context/GlobalProvider";
import { QRCodeCanvas } from "qrcode.react";

const getContrastColor = (hexColor) => {
    const hex = hexColor.replace("#", "");
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    console.log("Luminance:", luminance);
    return luminance > 0.5 ? "#000000" : "#ffffff";
};

export default function GoogleWalletPreview({ isReal }) {
    const { cardFormData } = useGlobal(GlobalProvider);
    return (
        <div
            className={`border ${
                isReal ? "border-transparent" : "border-[#e5e7eb]"
            } rounded-[28px] mx-auto w-[390px] max-w-full`}
            style={{
                backgroundColor: cardFormData?.wallet_bg_color ?? "#ffffff",
                color: getContrastColor(
                    cardFormData?.wallet_bg_color ?? "#ffffff"
                ),
            }}
        >
            <div className="pb-2">
                <div className="relative border-b border-gray-100/20 p-3 flex items-center gap-3">
                    <div className="h-7 w-7 rounded-full overflow-hidden bg-white flex items-center justify-center">
                        {cardFormData.google_wallet_logo_image_url ? (
                            <img
                                src={cardFormData.google_wallet_logo_image_url}
                                alt="Banner"
                                className="w-full h-6"
                            />
                        ) : (
                            <img
                                src={`/assets/images/sample-logo.svg`}
                                alt="Banner"
                                className="w-full h-6"
                            />
                        )}
                    </div>
                    <h5 className="text-base font-medium">{cardFormData?.wallet_company_name ?? ""}</h5>
                </div>
                <div className="flex flex-col gap-2 p-3">
                    <div className="flex items-center gap-2justify-between">
                        <div>
                            <p className="text-[26px] font-medium leading-[125%]">
                                {cardFormData?.wallet_title ?? ""}
                            </p>
                        </div>
                    </div>
                    <div className="space-y-0.5 mt-2.5">
                        <p
                            className="text-[10px] mb-0 tracking-[0.12em] uppercase"
                            style={{
                                color: getContrastColor(
                                    cardFormData?.wallet_bg_color ?? "#ffffff"
                                ),
                            }}
                        >
                                {cardFormData?.wallet_label_1 ?? ""}
                        </p>
                        <p className="text-sm leading-[125%]">
                                {cardFormData?.wallet_name ?? ""}
                        </p>
                    </div>
                    <div className="h-[50px]"></div>
                    <div>
                        <div className="mx-auto w-[152px] bg-white shadow-sm mb-2 p-0.5 rounded-[10px]">
                            <div className="h-[146px] w-[146px] mx-auto mb-1.5 flex items-center justify-center bg-white">
                                <QRCodeCanvas
                                    value={
                                        cardFormData?.wallet_qr_string ||
                                        "https://example.com"
                                    }
                                    size={126} // 146px total - 10px (5px margin each side)
                                    bgColor="#ffffff"
                                    fgColor="#000000"
                                    level="H"
                                    style={{
                                        padding: "10px",
                                        background: "#ffffff",
                                        borderRadius: "8px",
                                        height: "146px",
                                        width: "146px",
                                    }}
                                />
                            </div>
                        </div>
                        <p
                            className="text-center text-sm"
                            style={{
                                color: getContrastColor(
                                    cardFormData?.wallet_bg_color ?? "#ffffff"
                                ),
                            }}
                        >
                            {cardFormData?.wallet_qr_caption ??
                                "QR-Caption here"}
                        </p>
                    </div>
                </div>
                <div>
                    {cardFormData.profile_image_url ? (
                        <img
                            src={cardFormData.profile_image_url}
                            alt="Banner"
                            className="h-[130px] w-[130px] object-cover rounded-full mx-auto object-center"
                        />
                    ) : (
                        <img
                            src={`/assets/images/profile-placeholder.png`}
                            alt="Banner"
                            className="h-[130px] w-[130px] object-cover rounded-full mx-auto object-center"
                        />
                    )}
                </div>
            </div>
        </div>
    );
}
