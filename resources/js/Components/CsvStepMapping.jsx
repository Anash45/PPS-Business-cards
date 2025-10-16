"use client";

import { useState, useEffect } from "react";
import { useGlobal } from "@/context/GlobalProvider";
import toast from "react-hot-toast";
import { csvFieldDefinitions } from "@/utils/csvFieldDefinitions";
import { ArrowRight } from "lucide-react";
import Button from "./Button";
import { formatFieldName } from "@/utils/formatFieldName";
import StepsTitleSec from "./StepsTitleSec";

export default function CsvStepMapping() {
    const { csvData, setCsvImportProgress, mapping, setMapping } = useGlobal();

    // Extract headers from CSV
    const csvHeaders = csvData?.length > 0 ? Object.keys(csvData[0]) : [];

    // Default mapping: auto-match headers that exist in csvFieldDefinitions
    useEffect(() => {
        if (!csvData?.length || !csvFieldDefinitions?.length) return;

        // Only initialize if mapping is empty
        setMapping((prev) => {
            if (Object.keys(prev).length > 0) return prev; // already initialized

            const initial = {};
            Object.keys(csvData[0]).forEach((header) => {
                const match = csvFieldDefinitions.find(
                    (field) => field.name.toLowerCase() === header.toLowerCase()
                );
                initial[header] = match ? match.name : "";
            });
            return initial;
        });
    }, [csvData, csvFieldDefinitions]);

    // Handle dropdown change
    const handleSelectChange = (csvHeader, selectedField) => {
        setMapping((prev) => ({ ...prev, [csvHeader]: selectedField }));
    };

    if (!csvData?.length) {
        return (
            <div className="text-center text-gray-500 p-5">
                ⚠️ Please upload a CSV file first.
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-5 p-5 bg-white rounded-xl border border-[#EAECF0]">
            <StepsTitleSec
                title="Mapping Employee Data"
                description="Map your CSV columns to the appropriate fields in our system."
            />

            <div className="max-w-full overflow-x-auto">
                <table className="w-full border border-gray-200 rounded-lg overflow-hidden text-sm bg-gray-50">
                    <thead className="bg-primary border-b border-primary">
                        <tr>
                            <th className="text-left p-3 font-medium  text-white w-1/4">
                                CSV Column
                            </th>
                            <th className="text-left p-3 font-medium  text-white w-1/3">
                                Map To
                            </th>
                            <th className="text-left p-3 font-medium  text-white">
                                Sample Data
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {csvHeaders.map((header) => {
                            const samples = Array.from(
                                { length: 5 },
                                (_, i) => csvData[i]?.[header] || ""
                            );

                            return (
                                <tr
                                    key={header}
                                    className="border-b border-gray-100 hover:bg-green-50 transition-colors"
                                >
                                    {/* CSV field name */}
                                    <td className="p-3 font-medium text-gray-800">
                                        {formatFieldName(header)}
                                    </td>

                                    {/* Dropdown for mapping */}
                                    <td className="p-3">
                                        <select
                                            value={mapping[header] || ""}
                                            onChange={(e) =>
                                                handleSelectChange(
                                                    header,
                                                    e.target.value
                                                )
                                            }
                                            className="border border-gray-300 rounded-md p-2 text-sm w-full focus:ring-2 focus:ring-primary focus:outline-none"
                                        >
                                            <option value="">
                                                -- Select Field --
                                            </option>
                                            {csvFieldDefinitions.map(
                                                (field) => (
                                                    <option
                                                        key={field.name}
                                                        value={field.name}
                                                    >
                                                        {formatFieldName(
                                                            field.name
                                                        )}
                                                        {field.required
                                                            ? " *"
                                                            : ""}
                                                    </option>
                                                )
                                            )}
                                        </select>
                                    </td>

                                    {/* Sample values */}
                                    <td className="p-3 text-gray-600 text-xs">
                                        <div className="flex flex-col gap-0.5">
                                            {samples.map((val, i) => (
                                                <div
                                                    key={i}
                                                    className="truncate max-w-[250px]"
                                                >
                                                    {val?.toString().trim()
                                                        ? val
                                                        : "-"}
                                                </div>
                                            ))}
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            <div className="flex justify-end">
                <Button
                    onClick={() => {
                        // ✅ Check for duplicate mappings
                        const mappedValues =
                            Object.values(mapping).filter(Boolean); // remove empty
                        const duplicates = mappedValues.filter(
                            (item, index) =>
                                mappedValues.indexOf(item) !== index
                        );

                        if (duplicates.length > 0) {
                            toast.error(
                                `Duplicate mapping detected: "${[
                                    ...new Set(duplicates),
                                ].join(
                                    '", "'
                                )}" are assigned to multiple CSV columns.`
                            );
                            console.log("❌ Duplicate mappings:", duplicates);
                            return; // prevent moving to next step
                        }

                        // ✅ Optional: Check required fields are mapped
                        const missingRequired = csvFieldDefinitions
                            .filter((f) => f.required)
                            .filter((f) => !mappedValues.includes(f.name));

                        if (missingRequired.length > 0) {
                            toast.error(
                                `Required fields missing: ${missingRequired
                                    .map((f) => formatFieldName(f.name))
                                    .join(", ")}`
                            );
                            console.log(
                                "❌ Missing required fields:",
                                missingRequired
                            );
                            return;
                        }

                        // ✅ All good: move to next step
                        setCsvImportProgress(3);
                        console.log("✅ Final Mapping:", mapping);
                    }}
                    variant="light"
                >
                    Next <ArrowRight className="inline-block w-4 h-4 ml-1" />
                </Button>
            </div>
        </div>
    );
}
