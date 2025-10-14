export default function InputLabel({
    value,
    className = '',
    children,
    isDemo = false,
    ...props
}) {
    return (
        <label
            {...props}
            className={
                `block text-[#475569] text-sm leading-none ` +
                className
            }
        >
            {value ? value : children}
            {isDemo ? <span className="text-xs text-gray-400 italic"> (Demo Field)</span> : null}
        </label>
    );
}