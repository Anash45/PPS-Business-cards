import { GlobalProvider, useGlobal } from "@/context/GlobalProvider";
import { QRCodeCanvas } from "qrcode.react";

export default function AppleWalletPreview({ isReal }) {
    const { cardFormData } = useGlobal(GlobalProvider);
    return (
        <div
            className={`border ${
                isReal ? "border-transparent" : "border-[#e5e7eb]"
            } rounded-[28px] p-6 mx-auto w-[390px] max-w-full`}
            style={{
                backgroundColor: cardFormData?.wallet_bg_color ?? "#ffffff",
                color: cardFormData?.wallet_text_color ?? "#000000",
            }}
        >
            <div className="flex flex-col gap-1">
                <div className="relative">
                    {cardFormData.wallet_logo_image_url ? (
                        <img
                            src={cardFormData.wallet_logo_image_url}
                            alt="Banner"
                            className="w-auto max-w-full h-10 object-contain object-center"
                        />
                    ) : (
                        <img
                            src={`/assets/images/sample-logo.svg`}
                            alt="Banner"
                            className="w-auto max-w-full h-10 object-contain object-center"
                        />
                    )}
                </div>
                <div className="flex items-center gap-2 mt-1.5 justify-between">
                    <div className="space-y-1 mt-2.5">
                        <p
                            className="text-xs mb-0.5 tracking-[0.12em] opacity-85 uppercase"
                            style={{
                                color:
                                    cardFormData?.wallet_text_color ??
                                    "#000000",
                            }}
                        >
                            {cardFormData?.wallet_label_1 ?? ""}
                        </p>
                        <p className="text-[26px] leading-[125%]">
                            {cardFormData?.wallet_name ?? ""}
                        </p>
                    </div>
                    {cardFormData.profile_image_url ? (
                        <img
                            src={cardFormData.profile_image_url}
                            alt="Banner"
                            className="w-20 h-20 object-cover rounded-full bg-white object-center"
                        />
                    ) : (
                        <img
                            src={`/assets/images/profile-placeholder.png`}
                            alt="Banner"
                            className="w-20 h-20 object-cover rounded-full bg-white object-center"
                        />
                    )}
                </div>
                <div className="space-y-1 mt-2.5">
                    <p
                        className="text-xs mb-0.5 tracking-[0.12em] opacity-85 uppercase"
                        style={{
                            color: cardFormData?.wallet_text_color ?? "#000000",
                        }}
                    >
                        {cardFormData?.wallet_label_2 ?? ""}
                    </p>
                    <p className="text-[18px] leading-[125%]">
                        {cardFormData?.wallet_company_name ?? ""}
                    </p>
                </div>
                <div className="space-y-1 mt-2.5">
                    <p
                        className="text-xs mb-0.5 tracking-[0.12em] opacity-85 uppercase"
                        style={{
                            color: cardFormData?.wallet_text_color ?? "#000000",
                        }}
                    >
                        {cardFormData?.wallet_label_3 ?? ""}
                    </p>
                    <p className="text-[16px] leading-[125%]">
                        {cardFormData?.wallet_position ?? ""}
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
                        <p className="text-center text-black text-sm">
                            {cardFormData?.wallet_qr_caption ??
                                "QR-Caption here"}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
