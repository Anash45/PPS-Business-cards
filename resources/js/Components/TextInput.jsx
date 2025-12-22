import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import ReactDatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { CalendarDays } from "lucide-react";

export default forwardRef(function TextInput(
    {
        type = "text",
        className = "",
        isFocused = false,
        value,
        onChange,
        ...props
    },
    ref
) {
    const localRef = useRef(null);

    useImperativeHandle(ref, () => ({
        focus: () => localRef.current?.focus(),
    }));

    useEffect(() => {
        if (isFocused) {
            localRef.current?.focus();
        }
    }, [isFocused]);

    // 🔹 Custom input for date picker
    const CustomInput = forwardRef(({ value, onClick }, ref) => (
        <div className="relative w-full">
            <input
                type="text"
                onClick={onClick}
                ref={ref}
                value={value}
                readOnly
                className={
                    "w-full rounded-lg placeholder:text-[#64748B] text-grey900 text-sm leading-none px-[14px] py-[13px] border border-[#9CAADE] disabled:bg-gray-50 focus:outline-0 focus:border-primary hover:border-primary " +
                    className
                }
                {...props}
            />
            <CalendarDays
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                size={20}
            />
        </div>
    ));

    // 🔹 If type is "date" → Use datepicker
    if (type === "date") {
        return (
            <ReactDatePicker
                className="w-full"
                selected={value ? new Date(value) : null}
                onChange={(date) =>
                    onChange({
                        target: {
                            name: props.name,
                            value: date ? format(date, "yyyy-MM-dd") : "",
                        },
                    })
                }
                dateFormat="dd.MM.yyyy"
                locale={de}
                customInput={<CustomInput ref={localRef} />}
            />
        );
    }

    if (type === "file") {
        return (
            <input
                {...props}
                type="file"
                className={
                    "block w-full text-gray-900 file:mr-4 file:py-2 file:px-4 " +
                    "file:rounded-md file:border-0 file:text-sm file:font-semibold " +
                    "file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 " +
                    className
                }
                ref={localRef}
                onChange={e => {
                    if (onChange) {
                        onChange(e.target.files && e.target.files.length > 0 ? e.target.files[0] : null, e);
                    }
                }}
            />
        );
    }

    // 🔹 If type is "textarea" → Render textarea
    if (type === "textarea") {
        return (
            <textarea
                rows={3}
                {...props}
                ref={localRef}
                value={value}
                onChange={onChange}
                className={
                    "rounded-lg placeholder:text-[#64748B] text-grey900 text-sm leading-none px-[14px] py-[11.5px] border border-[#9CAADE] disabled:bg-gray-50 focus:outline-0 focus:border-primary focus:shadow-none " +
                    className
                }
            />
        );
    }

    // 🔹 Default → Render normal input
    return (
        <input
            {...props}
            type={type}
            className={
                "rounded-lg placeholder:text-[#64748B] text-grey900 text-sm leading-none px-[14px] py-[11.5px] border border-[#9CAADE] disabled:bg-gray-50 focus:outline-0 focus:border-primary focus:shadow-none " +
                className
            }
            ref={localRef}
            value={value}
            onChange={onChange}
        />
    );
});
