export default function StepsTitleSec({title = "", description = ""}) {
    return (
        <div className="space-y-2 font-jakarta-sans">
            {title && (
                <h2 className="text-xl font-semibold text-black leading-[120%]">{title}</h2>
            )}
            {description && (
                <p className="text-base text-[#667085] leading-[22px]">{description}</p>
            )}
        </div>
    );
}
