import { useState } from "react";
import { Smile, X } from "lucide-react";
import Picker from "emoji-picker-react";
import Button from "./Button";

export default function EmojiPickerButton({
    value = "",
    onChange = () => {},
    className = "w-10 h-10 flex items-center justify-center p-0 text-2xl",
    showPickerIndex,
    pickerIndex,
    onPickerToggle = () => {},
    disabled = false,
}) {
    const handleEmojiClick = (emojiData) => {
        onChange(emojiData.emoji);
        onPickerToggle(null);
    };

    const handleRemoveEmoji = (e) => {
        e.stopPropagation();
        onChange("");
    };

    return (
        <div className="relative">
            <div className="flex items-center gap-1 relative w-fit">
                <Button
                    variant="secondary"
                    type="button"
                    onClick={() =>
                        onPickerToggle(showPickerIndex === pickerIndex ? null : pickerIndex)
                    }
                    className={className}
                >
                    <span className="text-xl">
                        {value || <Smile className="h-8 w-8 shrink-0" />}
                    </span>
                </Button>
                {value && !disabled && (
                    <button
                        type="button"
                        onClick={handleRemoveEmoji}
                        className="absolute -top-2 -right-2 bg-red-500 rounded-full p-0.5 hover:bg-red-600 transition"
                        title="Remove emoji"
                    >
                        <X className="h-3 w-3 text-white" />
                    </button>
                )}
            </div>
            {showPickerIndex === pickerIndex && !disabled && (
                <div className="absolute z-50 mt-2">
                    <Picker
                        onEmojiClick={handleEmojiClick}
                        theme="light"
                    />
                </div>
            )}
        </div>
    );
}
