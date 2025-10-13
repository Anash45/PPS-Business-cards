
import CardFormGeneralInformation from "./CardFormGeneralInformation";

export default function LandingTab() {
    return (
        <div className="grid grid-cols-11 gap-5">
            <div className="col-span-7 bg-white lg:p-6 p-5 rounded-[20px] shadow-box">
                <CardFormGeneralInformation />
            </div>

            <div className="col-span-4 bg-gray-700 p-4 rounded-lg">
                {/* Right side (4 columns) */}
                <h2 className="text-white text-lg font-semibold">
                    Right Section (4 cols)
                </h2>
            </div>
        </div>
    );
}
