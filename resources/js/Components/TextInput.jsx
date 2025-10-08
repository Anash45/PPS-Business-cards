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

    // 🔹 Custom input renderer to keep your styles
    const CustomInput = forwardRef(({ value, onClick }, ref) => (
        <div className="relative w-full">
            <input
                type="text"
                onClick={onClick}
                ref={ref}
                value={value}
                readOnly
                className={
                    "w-full rounded-lg placeholder:text-[#64748B] text-grey900 text-sm leading-none px-[14px] py-[13px] border border-[#9CAADE] focus:outline-0 focus:border-primary hover:border-primary focus:shadow-none" +
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

    if (type === "date") {
        return (
            <ReactDatePicker className="w-full"
                selected={value ? new Date(value) : null}
                onChange={(date) =>
                    onChange({
                        target: {
                            name: props.name,          // 🔹 include the name
                            value: date ? format(date, "yyyy-MM-dd") : "", // 🔹 format for backend
                        },
                    })
                }

                dateFormat="dd.MM.yyyy" // German format
                locale={de}
                customInput={<CustomInput ref={localRef} />}
            />
        );
    }

    return (
        <input
            {...props}
            type={type}
            className={
                "rounded-lg placeholder:text-[#64748B] text-grey900 text-sm leading-none px-[14px] py-[13px] border border-[#9CAADE] focus:outline-0 focus:border-primary focus:shadow-none" +
                className
            }
            ref={localRef}
            value={value}
            onChange={onChange}
        />
    );
});