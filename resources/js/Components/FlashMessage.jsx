export default function FlashMessage({ message, type = "success", className="" }) {
    const colors = {
        success: "bg-green-100 text-green-700",
        error: "bg-red-100 text-red-700",
        info: "bg-blue-100 text-blue-700",
        warning: "bg-yellow-100 text-yellow-700",
    };

    if (!message) return null;

    return (
        <div className={`p-3 rounded-md ${colors[type] || colors.success} ${className}`}>
            {message}
        </div>
    );
}
