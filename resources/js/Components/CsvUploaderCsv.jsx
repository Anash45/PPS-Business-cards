"use client";

import { useState, useCallback } from "react";
import Papa from "papaparse";
import toast from "react-hot-toast";
import FileDropzone from "./FileDropzone";
import StepsTitleSec from "./StepsTitleSec";
import { useGlobal } from "@/context/GlobalProvider";
import { X } from "lucide-react";
import { csvFieldDefinitions } from "@/utils/csvFieldDefinitions";

export default function CsvUploaderCsv() {
    const { setCsvFile, setCsvData } = useGlobal();
    const [files, setFiles] = useState([]);
    const [csvError, setCsvError] = useState(null);

    // ✅ Extract required fields from definitions
    const requiredFields = csvFieldDefinitions
        .filter((field) => field.required)
        .map((field) => field.name);
    console.log("Required CSV Fields:", requiredFields);

    // ✅ Remove uploaded CSV file
    const handleRemoveFile = useCallback(() => {
        setFiles([]);
        setCsvFile(null);
        setCsvData([]);
    }, [setCsvFile, setCsvData]);

    // ✅ Validate required CSV headers
    const validateCsvHeaders = useCallback(
        (headers) => {
            const missing = requiredFields.filter(
                (reqField) => !headers.includes(reqField)
            );

            console.log("CSV Headers:", headers, requiredFields, missing);

            if (missing.length > 0) {
                setCsvError(
                    `Missing required fields: ${missing.join(", ")}`
                );
                toast.error("Some required fields are missing in the CSV.");
                return false;
            }

            setCsvError(null);
            return true;
        },
        [requiredFields]
    );

    // ✅ Handle file change from dropzone
    const handleFileChange = useCallback(
        (newFiles) => {
            if (!newFiles || newFiles.length === 0) {
                handleRemoveFile();
                return;
            }

            const file = newFiles[0];
            const isCsv =
                file &&
                (file.type === "text/csv" ||
                    file.name?.toLowerCase().endsWith(".csv"));

            if (!isCsv) {
                toast.error("Please upload a valid CSV file.");
                handleRemoveFile();
                return;
            }

            setFiles([file]);
            setCsvFile(file);

            // Parse CSV headers first
            Papa.parse(file, {
                header: true,
                skipEmptyLines: true,
                preview: 2, // parse small part first to get headers
                complete: (headerResult) => {
                    const headers = headerResult.meta.fields || [];

                    if (!validateCsvHeaders(headers)) {
                        handleRemoveFile();
                        return;
                    }

                    // Parse fully now that headers are valid
                    Papa.parse(file, {
                        header: true,
                        skipEmptyLines: true,
                        complete: (result) => {
                            const data = result.data || [];
                            if (data.length === 0) {
                                toast.error("The CSV file appears to be empty.");
                                setCsvData([]);
                                return;
                            }

                            setCsvData(data);
                            console.log("Parsed CSV Data:", data.length);
                        },
                        error: (err) => {
                            console.error("CSV Parse Error:", err);
                            toast.error("Error parsing CSV file.");
                        },
                    });
                },
                error: (err) => {
                    console.error("CSV Header Parse Error:", err);
                    toast.error("Unable to read CSV headers.");
                },
            });
        },
        [handleRemoveFile, setCsvFile, setCsvData, validateCsvHeaders]
    );

    return (
        <div className="flex flex-col gap-5 p-5 bg-white rounded-xl border border-[#EAECF0]">
            {/* ✅ Show error message above title section */}
            {csvError && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-2 rounded-md">
                    {csvError}
                </div>
            )}

            <StepsTitleSec
                title="Import Employee Data"
                description="Follow these steps to import employee data via CSV file"
            />

            {/* ✅ Dropzone */}
            <FileDropzone
                title="Drag CSV here or click to select a file."
                subtitle="UTF-8, with header. Example: salutation, title, first_name, last_name, position, department, profile_image_name etc"
                type="csv"
                files={files}
                setFiles={handleFileChange}
            />

            {/* ✅ Uploaded file info with remove button */}
            {files.length > 0 && (
                <div className="border border-[#EAECF0] bg-white rounded-md p-3 text-sm text-[#101828] flex justify-between items-center">
                    <div>
                        <span className="font-medium">Uploaded file:</span>{" "}
                        <span className="text-[#475467]">{files[0].name}</span>
                    </div>
                    <X
                        onClick={handleRemoveFile}
                        className="h-4 w-4 text-[#98A2B3] cursor-pointer hover:text-red-500 transition-colors"
                    />
                </div>
            )}
        </div>
    );
}
