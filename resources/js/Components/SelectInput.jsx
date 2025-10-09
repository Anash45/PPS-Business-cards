import { forwardRef, useImperativeHandle, useRef, useEffect } from "react";
import Select, { components as defaultComponents } from "react-select";
import AsyncSelect from "react-select/async";

export default forwardRef(function SelectInput(
    {
        className = "",
        isFocused = false,
        isSearchable = false,
        value,
        onChange,
        options = [], // for small dataset
        async = false, // new prop to enable async
        loadOptions, // function for async loading
        placeholder = "Select...",
        ...props
    },
    ref
) {
    const localRef = useRef(null);

    useImperativeHandle(ref, () => ({
        focus: () => localRef.current?.focus(),
    }));

    useEffect(() => {
        if (isFocused && localRef.current) {
            localRef.current.focus();
        }
    }, [isFocused]);

    const customStyles = {
        control: (base) => ({
            ...base,
            borderColor: "#9CAADE",
            borderRadius: "0.5rem",
            minHeight: "42px",
            boxShadow: "none",
            "&:hover": { borderColor: "#84af83" },
        }),
        dropdownIndicator: (base) => ({
            ...base,
            color: "#64748B",
            "&:hover": { color: "#1f1f1f" },
        }),
        indicatorSeparator: () => ({
            display: "none",
        }),
        option: (base, state) => ({
            ...base,
            display: "flex",
            alignItems: "center",
            gap: "8px",
            backgroundColor: state.isSelected ? "#84af83" : "#fff",
            color: state.isSelected ? "#ffffff" : "#1f1f1f",
            "&:hover": { backgroundColor: "#84af832a", color: "#1f1f1f" },
        }),
        menu: (base) => ({
            ...base,
            borderRadius: "0.5rem",
            overflow: "hidden",
            boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
        }),
        singleValue: (base) => ({
            ...base,
            display: "flex",
            color: "#1f1f1f",
            alignItems: "center",
            gap: "8px",
        }),
    };

    // Custom Option with icon
    const Option = (props) => (
        <defaultComponents.Option {...props}>
            {props.data.icon && <props.data.icon size={16} />}
            {props.data.label}
        </defaultComponents.Option>
    );

    // Custom SingleValue with icon
    const SingleValue = (props) => (
        <defaultComponents.SingleValue {...props}>
            {props.data.icon && <props.data.icon size={16} />}
            {props.data.label}
        </defaultComponents.SingleValue>
    );

    const components = { Option, SingleValue };

    if (async) {
        return (
            <AsyncSelect
                {...props}
                cacheOptions
                defaultOptions
                loadOptions={loadOptions}
                inputRef={localRef}
                className={className}
                classNamePrefix="custom-select"
                placeholder={placeholder}
                styles={customStyles}
                components={components}
                onChange={(option) =>
                    onChange({
                        target: {
                            name: props.name,
                            value: option?.value ?? "",
                        },
                    })
                }
            />
        );
    }

    return (
        <Select
            {...props}
            inputRef={localRef}
            className={className}
            classNamePrefix="custom-select"
            options={options}
            isSearchable={isSearchable}
            placeholder={placeholder}
            styles={customStyles}
            components={components}
            value={options.find((opt) => opt.value === value) || null}
            onChange={(option) =>
                onChange({
                    target: {
                        name: props.name,
                        value: option?.value ?? "",
                    },
                })
            }
        />
    );
});
