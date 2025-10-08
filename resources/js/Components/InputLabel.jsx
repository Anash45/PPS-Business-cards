export default function InputLabel({
    value,
    className = '',
    children,
    ...props
}) {
    return (
        <label
            {...props}
            className={
                `block text-[#475569] text-sm leading-none` +
                className
            }
        >
            {value ? value : children}
        </label>
    );
}