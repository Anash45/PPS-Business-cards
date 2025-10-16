import { useGlobal } from "@/context/GlobalProvider";
import { Check } from "lucide-react";

export default function CsvImportProgress() {
    const { csvImportProgress, progressSteps } = useGlobal();

    return (
        <div className="p-5 flex flex-col gap-4 font-public-sans bg-white border border-[#EAECF0] rounded-xl sticky top-4">
            {progressSteps.map((step, index) => {
                const isActive = step.number === csvImportProgress;
                const isPassed = step.number < csvImportProgress;
                const isLast = index === progressSteps.length - 1;

                return (
                    <div
                        key={step.number}
                        className={`flex gap-3 csv-progress-item transition-all cursor-pointer ${
                            isActive ? "cpi-active" : ""
                        }`}
                    >
                        {/* Left side (circle + line) */}
                        <div className="flex flex-col items-center">
                            <div
                                className={`h-6 w-6 relative rounded-full flex items-center justify-center 
                                    ${
                                        isActive || isPassed
                                            ? "bg-primary"
                                            : "bg-[#F2F4F7]"
                                    } 
                                    cpi-circle transition-colors`}
                            >
                                {!isPassed ? (
                                    <div className="h-2 w-2 rounded-full bg-white"></div>
                                ) : (
                                    <Check className="h-5 w-5 text-white" />
                                )}
                            </div>

                            {/* connector line (except for last step) */}
                            {!isLast && (
                                <div
                                    className={`cpi-line w-0.5 rounded-full h-9 my-1 transition-colors ${
                                        isPassed || isActive
                                            ? "bg-primary"
                                            : "bg-[#F2F4F7]"
                                    }`}
                                ></div>
                            )}
                        </div>

                        {/* Right side (labels) */}
                        <div className="flex flex-col pt-1">
                            <p
                                className={`text-xs leading-[18px] ${
                                    isActive || isPassed
                                        ? "text-primary"
                                        : "text-[#667085]"
                                }`}
                            >
                                Step {step.number}
                            </p>
                            <p className="font-semibold text-base text-black">
                                {step.label}
                            </p>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
