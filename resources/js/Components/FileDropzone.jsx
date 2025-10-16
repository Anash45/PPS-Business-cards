"use client";

import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, X } from "lucide-react";
import toast from "react-hot-toast";

export default function FileDropzone({
    type = "csv", // "csv" or "images"
    files = [],
    setFiles,
    title = "Upload Files",
    subtitle = "Drag and drop or click to upload",
}) {
    const onDrop = useCallback(
        (acceptedFiles) => {
            if (!Array.isArray(acceptedFiles) || acceptedFiles.length === 0) {
                toast.error("No valid file uploaded.");
                return;
            }

            if (type === "csv") {
                const file = acceptedFiles[0];
                const isCsv =
                    !!file &&
                    (file.type === "text/csv" ||
                        file.name?.toLowerCase().endsWith(".csv"));

                if (!isCsv) {
                    toast.error("Please upload a valid CSV file.");
                    setFiles([]);
                    return;
                }

                file.key = `${file.name}-${file.lastModified}-${Math.random()}`;
                setFiles([file]);
                toast.success("CSV file uploaded successfully!");
            } else {
                // ✅ Validate images and keep File prototype
                const validImages = acceptedFiles.filter((file) => {
                    if (file.size > 5 * 1024 * 1024) {
                        toast.error(`${file.name} exceeds 5 MB limit.`);
                        return false;
                    }
                    return true;
                });

                if (validImages.length === 0) {
                    toast.error("No valid images uploaded.");
                    return;
                }

                // ✅ Check for duplicates by file name
                const existingNames = new Set(files.map((f) => f.name.toLowerCase()));
                const duplicates = validImages.filter((f) =>
                    existingNames.has(f.name.toLowerCase())
                );

                if (duplicates.length > 0) {
                    toast.error(
                        `${duplicates.length} duplicate image${
                            duplicates.length > 1 ? "s" : ""
                        } skipped: ${duplicates.map((f) => f.name).join(", ")}`
                    );
                }

                // ✅ Only add unique files
                const uniqueFiles = validImages.filter(
                    (f) => !existingNames.has(f.name.toLowerCase())
                );

                if (uniqueFiles.length === 0) return;

                // Assign keys safely
                uniqueFiles.forEach((file) => {
                    file.key = `${file.name}-${file.lastModified}-${Math.random()}`;
                });

                const merged = [...files, ...uniqueFiles];
                setFiles(merged);

                toast.success(`${uniqueFiles.length} image(s) added!`);
            }
        },
        [type, files, setFiles]
    );

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        multiple: type === "images",
        accept:
            type === "csv"
                ? { "text/csv": [".csv"] }
                : { "image/*": [".jpg", ".jpeg", ".png", ".webp", ".svg"] },
    });

    return (
        <div className="flex flex-col gap-3 w-full">
            {/* Dropzone Box */}
            <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all
                    ${
                        isDragActive
                            ? "border-primary bg-[#F9FAFB]"
                            : "border-[#D0D5DD]"
                    }
                    w-full h-48 text-center p-3
                `}
            >
                <input {...getInputProps()} />
                <div className="flex flex-col gap-1 items-center justify-center font-public-sans max-w-[420px]">
                    <Upload className="h-5 w-5 text-[#27272A]" />
                    <p className="text-sm font-semibold text-black">{title}</p>
                    <p className="text-sm text-[#667085]">{subtitle}</p>
                </div>
            </div>
        </div>
    );
}
