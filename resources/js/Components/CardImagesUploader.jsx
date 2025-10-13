import React, { useCallback, useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, X } from "lucide-react";

export default function CardImageUploader({
    name,
    value,
    onChange,
    label,
    maxSizeMB = 5,
}) {
    const [preview, setPreview] = useState(null);

    // Update preview whenever value changes
    useEffect(() => {
        if (!value) {
            setPreview(null);
            return;
        }

        if (typeof value === "string") {
            setPreview(value);
        } else {
            const objectUrl = URL.createObjectURL(value);
            setPreview(objectUrl);

            return () => URL.revokeObjectURL(objectUrl); // cleanup
        }
    }, [value]);

    const onDrop = useCallback(
        (acceptedFiles) => {
            if (acceptedFiles.length === 0) return;

            const file = acceptedFiles[0];
            onChange({
                target: {
                    name,
                    value: file,
                },
            });
        },
        [name, onChange]
    );

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            "image/png": [],
            "image/jpeg": [],
            "image/jpg": [],
            "image/gif": [],
            "image/svg+xml": [],
        },
        maxFiles: 1,
        maxSize: maxSizeMB * 1024 * 1024,
    });

    const handleRemove = (e) => {
        e.stopPropagation();
        setPreview(null);
        onChange({
            target: {
                name,
                value: null,
            },
        });
    };

    return (
        <div className="flex flex-col gap-2">
            <div
                {...getRootProps()}
                className={`relative border-2 border-dashed rounded-lg px-[14px] py-4 cursor-pointer transition ${
                    isDragActive ? "border-primary" : "border-[#9CAADE]"
                }`}
            >
                <input {...getInputProps()} />

                {preview && (
                    <div className="relative inline-block mb-2">
                        <img
                            src={preview}
                            alt="Preview"
                            className="max-h-20 max-w-full rounded-md object-contain"
                        />
                        <button
                            type="button"
                            onClick={handleRemove}
                            className="absolute -top-2 -right-2 bg-white border border-gray-300 rounded-full p-1 shadow hover:bg-gray-100"
                        >
                            <X size={14} className="text-gray-600" />
                        </button>
                    </div>
                )}

                <div className="flex flex-col items-center justify-center gap-2 min-h-[150px]">
                    <Upload className="h-6 w-6" />
                    <p className="text-slate600 text-sm">
                        <span className="font-bold">Click to upload</span> or
                        drag and drop
                    </p>
                    <p className="text-slate600 text-xs">
                        File size should be less than {maxSizeMB}MB
                    </p>
                </div>
            </div>
        </div>
    );
}
