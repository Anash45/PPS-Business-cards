export default function Button({
    variant = "primary",
    className = "",
    disabled = false,
    children,
    ...props
}) {
    const baseStyles =
        "inline-flex items-center justify-center font-medium rounded-md border px-4 py-[7px] text-sm leading-6 tracking-widest transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2";

    const variants = {
        primary:
            "bg-primary border-transparent text-white hover:bg-[#6CAC6A] focus:bg-[#6CAC6A] focus:ring-[#6CAC6A] active:bg-[#6CAC6A]",
        secondary:
            "bg-gray-200 border-transparent text-gray-800 hover:bg-gray-300 focus:ring-gray-300 active:bg-gray-400",
        danger: "bg-red-600 border-transparent text-white hover:bg-red-700 focus:ring-red-500 active:bg-red-800",
        outline:
            "bg-transparent border-gray-400 text-gray-800 hover:bg-gray-100 focus:ring-gray-300",
        // ✅ new variant
        light: "bg-[#F1F5F9] border border-[#DBE0E5] text-gray-700 hover:bg-[#DBE0E5] focus:ring-gray-200 active:bg-gray-100",
    };

    const disabledStyles = disabled ? "opacity-50 cursor-not-allowed" : "";

    return (
        <button
            {...props}
            className={`${baseStyles} ${variants[variant]} ${disabledStyles} ${className}`}
            disabled={disabled}
        >
            {children}
        </button>
    );
}
