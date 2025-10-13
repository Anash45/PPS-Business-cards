import React, { useState, useEffect, useRef } from "react";
import { ChromePicker } from "react-color";

let activePicker = null;

const ColorInput = ({
    id,
    name,
    value = "#000000",
    onChange,
    className = "",
    placeholder = "",
    required = false,
}) => {
    const [showPicker, setShowPicker] = useState(false);
    const [color, setColor] = useState(value || "#ffffff");
    const [format, setFormat] = useState(detectFormat(value));
    const [openAbove, setOpenAbove] = useState(false);
    const pickerRef = useRef(null);
    const triggerRef = useRef(null);

    // ✅ Sync when DB data changes
    useEffect(() => {
        if (value !== color) {
            setColor(value || "#ffffff");
            setFormat(detectFormat(value));
        }
    }, [value]);

    function detectFormat(val) {
        if (val?.startsWith("rgba")) return "rgba";
        if (val?.startsWith("rgb")) return "rgb";
        if (val?.startsWith("hsl")) return "hsl";
        return "hex";
    }

    useEffect(() => {
        const handleCloseOthers = () => {
            if (activePicker !== id) setShowPicker(false);
        };
        window.addEventListener("colorinput-open", handleCloseOthers);
        return () =>
            window.removeEventListener("colorinput-open", handleCloseOthers);
    }, [id]);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (
                pickerRef.current &&
                !pickerRef.current.contains(e.target) &&
                !triggerRef.current.contains(e.target)
            ) {
                setShowPicker(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const togglePicker = () => {
        if (!showPicker) {
            activePicker = id;
            window.dispatchEvent(new Event("colorinput-open"));
            decidePickerPosition();
        }
        setShowPicker((prev) => !prev);
    };

    const formatColor = (newColor) => {
        const { r, g, b, a } = newColor.rgb;
        if (format === "rgba") return `rgba(${r}, ${g}, ${b}, ${a})`;
        if (format === "rgb")
            return a < 1
                ? `rgba(${r}, ${g}, ${b}, ${a})`
                : `rgb(${r}, ${g}, ${b})`;
        return a < 1 ? `rgba(${r}, ${g}, ${b}, ${a})` : newColor.hex;
    };

    const handleColorChange = (newColor) => {
        const formatted = formatColor(newColor);
        setColor(formatted);
        onChange?.({ target: { name, value: formatted } });
    };

    const handleManualInput = (e) => {
        const val = e.target.value;
        setColor(val);
        setFormat(detectFormat(val));
        onChange?.({ target: { name, value: val } });
    };

    const decidePickerPosition = () => {
        const rect = triggerRef.current?.getBoundingClientRect();
        if (!rect) return;
        const spaceBelow = window.innerHeight - rect.bottom;
        const spaceAbove = rect.top;
        setOpenAbove(spaceBelow < 350 && spaceAbove > spaceBelow);
    };

    return (
        <div className="relative inline-block w-full">
            <div className="flex items-center gap-3">
                <div
                    ref={triggerRef}
                    onClick={togglePicker}
                    className="w-9 h-9 rounded-md border border-gray-300 cursor-pointer"
                    style={{ backgroundColor: color }}
                />

                <input
                    id={id}
                    name={name}
                    type="text"
                    value={color}
                    onChange={handleManualInput}
                    className={`flex-1 border border-gray-300 rounded-md px-2 py-1 text-sm ${className}`}
                    placeholder={placeholder}
                    required={required}
                />
            </div>

            {showPicker && (
                <div
                    ref={pickerRef}
                    className={`absolute z-50 ${
                        openAbove ? "bottom-12" : "top-12"
                    } left-0 shadow-lg`}
                >
                    <ChromePicker
                        color={color}
                        disableAlpha={false}
                        onChange={handleColorChange}
                    />
                </div>
            )}
        </div>
    );
};

export default ColorInput;
