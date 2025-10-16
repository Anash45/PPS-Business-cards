"use client";

import { useState, useEffect, useCallback } from "react";
import { useGlobal } from "@/context/GlobalProvider";
import { X } from "lucide-react";
import toast from "react-hot-toast";
import FileDropzone from "./FileDropzone";
import StepsTitleSec from "./StepsTitleSec";

export default function CsvUploaderImages() {
    const { setCsvImages, csvData } = useGlobal();
    const [files, setFiles] = useState([]);
    const [matchedCount, setMatchedCount] = useState(0);

    // ✅ Sync global state
    useEffect(() => {
        setCsvImages(files);
    }, [files, setCsvImages]);

    // ✅ Match image names to CSV field
    useEffect(() => {
        if (!csvData?.length || !files.length) {
            setMatchedCount(0);
            return;
        }

        const csvImageNames = csvData
            .map((row) => (row.profile_image_name || "").trim().toLowerCase())
            .filter(Boolean);

        const uploadedNames = files.map((f) => f.name.trim().toLowerCase());
        const matched = uploadedNames.filter((name) =>
            csvImageNames.includes(name)
        );

        setMatchedCount(matched.length);
    }, [csvData, files]);

    // ✅ Remove a single image by key
    const removeImage = useCallback(
        (key) => {
            setFiles((prev) => {
                const filtered = prev.filter((f) => f.key !== key);
                toast.success("Image removed");
                return filtered;
            });
        },
        [setFiles]
    );

    console.log("📁 Current CSV Images:", files);
    console.log("📊 CSV Data:", csvData);
    console.log("✅ Matched Count:", matchedCount);

    return (
        <div className="flex flex-col gap-5 p-5 bg-white rounded-xl border border-[#EAECF0]">
            {/* ✅ Matched summary */}
            {csvData?.length > 0 && (
                <div className="text-sm font-medium text-green-600">
                    Matched Images: {matchedCount} / {csvData.length}{" "}
                    <span className="text-[10px] italic text-gray-500">
                        (Unmatched images will be ignored)
                    </span>
                </div>
            )}

            <StepsTitleSec
                title="Upload Photos"
                description='Upload multiple images matching the names listed in your CSV under the "profile_image_name" column.'
            />

            {/* Dropzone */}
            <FileDropzone
                title="Drag and drop images here or click to select."
                subtitle="Max size 5 MB each. Accepted formats: jpg, jpeg, png, webp, svg."
                type="images"
                files={files}
                setFiles={setFiles}
            />

            {files.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mt-3">
                    {files.map((file) => {
                        const fileName = file.name.trim().toLowerCase();
                        const csvImageNames =
                            csvData
                                ?.map((row) =>
                                    (row.profile_image_name || "")
                                        .trim()
                                        .toLowerCase()
                                )
                                .filter(Boolean) || [];
                        const isMatched = csvImageNames.includes(fileName);

                        return (
                            <div
                                key={file.key}
                                className={`relative border rounded-lg overflow-hidden group transition
                        ${
                            isMatched
                                ? "bg-green-50 border-green-400"
                                : "bg-white border-gray-200"
                        }`}
                            >
                                <img
                                    src={URL.createObjectURL(file)}
                                    alt={file.name}
                                    className="object-cover w-full h-32"
                                />
                                <button
                                    type="button"
                                    onClick={() => removeImage(file.key)}
                                    className="absolute top-1 right-1 bg-white/80 hover:bg-red-500 hover:text-white rounded-full p-1 transition"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                                <p
                                    className={`text-xs text-center truncate px-1 py-1 border-t transition
                            ${
                                isMatched
                                    ? "bg-green-100 text-green-700 border-green-300"
                                    : "bg-gray-50 text-gray-600 border-gray-200"
                            }`}
                                >
                                    {file.name}
                                </p>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
