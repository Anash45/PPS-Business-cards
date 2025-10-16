import { useState, useEffect } from "react";
import StepsTitleSec from "./StepsTitleSec";
import {
    Accordion,
    AccordionBody,
    AccordionHeader,
} from "@material-tailwind/react";
import { ArrowLeft, ArrowRight, ChevronDown } from "lucide-react";
import { useGlobal } from "@/context/GlobalProvider";
import { csvFieldDefinitions } from "@/utils/csvFieldDefinitions";
import { formatFieldName } from "@/utils/formatFieldName";
import Button from "./Button";
import { useModal } from "@/context/ModalProvider";

export default function CsvStepValidation() {
    const [open, setOpen] = useState(1); // 0 = none open
    const handleOpen = (value) => setOpen(open === value ? 0 : value);
    const { openModal } = useModal();

    const {
        csvData,
        mapping,
        loadingImport,
        warnings,
        setWarnings,
        errors,
        setErrors,
        setCsvImportProgress,
    } = useGlobal();

    useEffect(() => {
        if (!csvData || csvData.length === 0) {
            setWarnings([]);
            setErrors([]);
            return;
        }

        const newWarnings = [];
        const newErrors = [];

        csvData.forEach((row, index) => {
            csvFieldDefinitions.forEach((fieldDef) => {
                const mappedColumn = mapping[fieldDef.name]; // mapped CSV column
                const value = mappedColumn ? row[mappedColumn] : "";

                // Required field missing (warning if column exists but empty)
                if (
                    fieldDef.required &&
                    (value === undefined || value === "")
                ) {
                    newWarnings.push({
                        row: index + 1,
                        name: `${row.first_name || ""} ${row.last_name || ""}`,
                        field: fieldDef.name,
                        issue: "Missing value",
                        value: value || "",
                    });
                }

                // Validation rules
                if (value) {
                    if (
                        fieldDef.validate === "nonEmpty" &&
                        value.trim() === ""
                    ) {
                        newErrors.push({
                            row: index + 1,
                            name: `${row.first_name || ""} ${
                                row.last_name || ""
                            }`,
                            field: fieldDef.name,
                            issue: "Value required",
                            value,
                        });
                    }

                    if (fieldDef.validate === "email") {
                        const emailRegex =
                            /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
                        if (!emailRegex.test(value)) {
                            newErrors.push({
                                row: index + 1,
                                name: `${row.first_name || ""} ${
                                    row.last_name || ""
                                }`,
                                field: fieldDef.name,
                                issue: "Invalid email",
                                value,
                            });
                        }
                    }

                    if (fieldDef.validate === "phone") {
                        const phoneRegex = /^\+?[0-9\s\-()]{6,20}$/;
                        if (!phoneRegex.test(value)) {
                            newErrors.push({
                                row: index + 1,
                                name: `${row.first_name || ""} ${
                                    row.last_name || ""
                                }`,
                                field: fieldDef.name,
                                issue: "Invalid phone",
                                value,
                            });
                        }
                    }

                    if (fieldDef.validate === "url") {
                        const pattern = /^(https?:\/\/)[^\s/$.?#].[^\s]*$/i; // only http or https
                        if (!pattern.test(value)) {
                            newErrors.push({
                                row: index + 1,
                                name: `${row.first_name || ""} ${
                                    row.last_name || ""
                                }`,
                                field: fieldDef.name,
                                issue: "Invalid URL",
                                value,
                            });
                        }
                    }
                }
            });
        });

        setWarnings(newWarnings);
        setErrors(newErrors);
    }, [csvData, mapping]);

    function getCsvRowData(rowNumber) {
        if (!csvData || csvData.length === 0) return null;

        const index = rowNumber - 1; // convert 1-based to 0-based
        if (index < 0 || index >= csvData.length) return null;

        const row = csvData[index];

        return {
            rowNumber: index + 1, // keep it 1-based
            data: row, // raw/unmapped row
        };
    }

    return (
        <div className="flex flex-col gap-5 p-5 bg-white rounded-xl border border-[#EAECF0]">
            <StepsTitleSec
                title="Validation Employee Data"
                description="Validating the fields in your CSV file to ensure data integrity before import."
            />

            <div className="space-y-5">
                {/* Accordion 1: Warnings */}
                <Accordion
                    className="border-0 rounded-0"
                    open={open === 1}
                    icon={
                        <ChevronDown
                            className={`${
                                open === 1 ? "rotate-180" : ""
                            } transition text-[#71717A]`}
                        />
                    }
                >
                    <AccordionHeader
                        className="rounded-lg p-3 border border-[#F2F4F7] bg-white transition duration-500"
                        onClick={() => handleOpen(1)}
                    >
                        <div className="flex flex-col gap-1.5 font-public-sans">
                            <h5 className="font-semibold text-sm text-[#3F3F46] flex items-center">
                                <img
                                    src="/assets/images/warning-icon.svg"
                                    alt="Icon"
                                    className="h-6 w-6 mr-2"
                                />
                                <span>
                                    {warnings.length} record
                                    {warnings.length > 1 ? "s" : ""} with
                                    warnings
                                </span>
                            </h5>
                        </div>
                    </AccordionHeader>
                    <AccordionBody className="overflow-visible p-0">
                        <div className="py-5">
                            <div className="max-w-full overflow-x-auto">
                                <table className="w-full border border-gray-200 rounded-lg overflow-hidden text-sm bg-gray-50">
                                    <thead className="bg-primary border-b border-primary">
                                        <tr>
                                            <th className="text-left p-3 font-medium text-white">
                                                Row#
                                            </th>
                                            <th className="text-left p-3 font-medium text-white">
                                                Employee
                                            </th>
                                            <th className="text-left p-3 font-medium text-white">
                                                Field
                                            </th>
                                            <th className="text-left p-3 font-medium text-white">
                                                Issue
                                            </th>
                                            <th className="text-left p-3 font-medium text-white">
                                                Action
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {warnings.length > 0 ? (
                                            warnings.map((warn, idx) => (
                                                <tr
                                                    key={idx}
                                                    className="border-b border-gray-200"
                                                >
                                                    <td className="p-3">
                                                        {warn.row}
                                                    </td>
                                                    <td className="p-3">
                                                        {warn.name || "-"}
                                                    </td>
                                                    <td className="p-3">
                                                        {formatFieldName(
                                                            warn.field
                                                        )}
                                                    </td>
                                                    <td className="p-3">
                                                        <div className="py-1 px-2 w-fit font-medium rounded-md bg-orange-100 text-orange-800">
                                                            {warn.issue}
                                                        </div>
                                                        <div className="text-sm text-gray-500">
                                                            {warn.value}
                                                        </div>
                                                    </td>
                                                    <td className="p-3">
                                                        <Button
                                                            variant="primary"
                                                            onClick={() => {
                                                                const rowData =
                                                                    getCsvRowData(
                                                                        warn.row
                                                                    );
                                                                console.log(
                                                                    "CSV Row Data:",
                                                                    rowData
                                                                );

                                                                openModal(
                                                                    "UpdateCsvRecordModal",
                                                                    {
                                                                        rowNumber:
                                                                            rowData?.rowNumber ??
                                                                            null,
                                                                        rowData:
                                                                            rowData?.data ??
                                                                            {},
                                                                    }
                                                                );
                                                            }}
                                                        >
                                                            Update
                                                        </Button>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td
                                                    colSpan={5}
                                                    className="p-3 text-gray-400 italic text-center"
                                                >
                                                    No warnings
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </AccordionBody>
                </Accordion>

                {/* Accordion 2: Errors */}
                <Accordion
                    className="border-0 rounded-0"
                    open={open === 2}
                    icon={
                        <ChevronDown
                            className={`${
                                open === 2 ? "rotate-180" : ""
                            } transition text-[#71717A]`}
                        />
                    }
                >
                    <AccordionHeader
                        className="rounded-lg p-3 border border-[#F2F4F7] bg-white transition duration-500"
                        onClick={() => handleOpen(2)}
                    >
                        <div className="flex flex-col gap-1.5 font-public-sans">
                            <h5 className="font-semibold text-sm text-[#3F3F46] flex items-center">
                                <img
                                    src="/assets/images/danger-icon.svg"
                                    alt="Icon"
                                    className="h-6 w-6 mr-2"
                                />
                                <span>
                                    {errors.length} record
                                    {errors.length > 1 ? "s" : ""} with errors
                                </span>
                            </h5>
                        </div>
                    </AccordionHeader>
                    <AccordionBody className="overflow-visible p-0">
                        <div className="py-5">
                            <div className="max-w-full overflow-x-auto">
                                <table className="w-full border border-gray-200 rounded-lg overflow-hidden text-sm bg-gray-50">
                                    <thead className="bg-primary border-b border-primary">
                                        <tr>
                                            <th className="text-left p-3 font-medium text-white">
                                                Row#
                                            </th>
                                            <th className="text-left p-3 font-medium text-white">
                                                Employee
                                            </th>
                                            <th className="text-left p-3 font-medium text-white">
                                                Field
                                            </th>
                                            <th className="text-left p-3 font-medium text-white">
                                                Issue
                                            </th>
                                            <th className="text-left p-3 font-medium text-white">
                                                Action
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {errors.length > 0 ? (
                                            errors.map((error, idx) => (
                                                <tr
                                                    key={idx}
                                                    className="border-b border-gray-200"
                                                >
                                                    <td className="p-3">
                                                        {error.row}
                                                    </td>
                                                    <td className="p-3">
                                                        {error.name || "-"}
                                                    </td>
                                                    <td className="p-3">
                                                        {formatFieldName(
                                                            error.field
                                                        )}
                                                    </td>
                                                    <td className="p-3">
                                                        <div className="py-1 px-2 w-fit font-medium rounded-md bg-red-100 text-red-800">
                                                            {error.issue}
                                                        </div>
                                                        <div className="text-sm text-gray-500">
                                                            {error.value}
                                                        </div>
                                                    </td>
                                                    <td className="p-3">
                                                        <Button
                                                            variant="primary"
                                                            onClick={() => {
                                                                const rowData =
                                                                    getCsvRowData(
                                                                        error.row
                                                                    );
                                                                console.log(
                                                                    "CSV Row Data:",
                                                                    rowData
                                                                );

                                                                openModal(
                                                                    "UpdateCsvRecordModal",
                                                                    {
                                                                        rowNumber:
                                                                            rowData?.rowNumber ??
                                                                            null,
                                                                        rowData:
                                                                            rowData?.data ??
                                                                            {},
                                                                    }
                                                                );
                                                            }}
                                                        >
                                                            Update
                                                        </Button>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td
                                                    colSpan={5}
                                                    className="p-3 text-gray-400 italic text-center"
                                                >
                                                    No errors
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </AccordionBody>
                </Accordion>
            </div>
            <div className="flex justify-between">
                <Button
                    onClick={() => {
                        setCsvImportProgress(2);
                    }}
                    variant="light"
                >
                    <ArrowLeft className="inline-block w-4 h-4 mr-1" />
                    Previous
                </Button>
                <Button
                    onClick={() => {
                        setCsvImportProgress(4);
                    }}
                    variant="light"
                >
                    Next <ArrowRight className="inline-block w-4 h-4 ml-1" />
                </Button>
            </div>
        </div>
    );
}
