"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Divider from "./Divider";
import Button from "./Button";
import InputLabel from "./InputLabel";
import TextInput from "./TextInput";
import InputError from "./InputError";
import { useGlobal } from "@/context/GlobalProvider";
import { formatFieldName } from "@/utils/formatFieldName";

export default function UpdateCsvRecordModal({
    onClose,
    rowNumber,
    rowData, // mapped row data
    title = "Update CSV Record",
}) {
    const { csvData, setCsvData, csvMapping: mapping } = useGlobal();
    const [show, setShow] = useState(false);
    const [formData, setFormData] = useState(rowData || {});
    const [formErrors, setFormErrors] = useState({});
    const [loading, setLoading] = useState(false);

    // Animate modal open
    useEffect(() => {
        requestAnimationFrame(() => setShow(true));
    }, []);

    const handleClose = () => {
        setShow(false);
        setTimeout(onClose, 200);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));

        if (formErrors[name]) {
            setFormErrors((prev) => {
                const updated = { ...prev };
                delete updated[name];
                return updated;
            });
        }
    };

    const handleUpdate = () => {
        setLoading(true);

        const index = rowNumber - 1; // 1-based to 0-based
        if (index < 0 || index >= csvData.length) {
            toast.error("Invalid row number: " + index);
            setLoading(false);
            return;
        }

        // Original CSV row
        const originalRow = csvData[index];
        console.log("⚡ Original Row Data:", originalRow);
        console.log("⚡ Form Data:", formData);

        // Update the CSV row directly with formData
        const updatedRow = { ...originalRow, ...formData };
        console.log("⚡ Updated Row Data:", updatedRow);

        // Replace row in CSV data
        const updatedCsvData = [...csvData];
        updatedCsvData[index] = updatedRow;

        setCsvData(updatedCsvData);

        console.log("✅ CSV Data updated successfully for row:", index + 1);

        setLoading(false);
        toast.success("Record updated successfully!");
        handleClose();
    };

    return (
        <div
            className={`transform rounded-xl bg-white py-4 px-6 shadow-xl transition-all duration-200 w-[624px] max-w-full 
            ${show ? "scale-100 opacity-100" : "scale-95 opacity-0"}`}
        >
            <div className="space-y-3">
                <div className="space-y-1">
                    <h2 className="text-lg text-[#201A20] font-semibold">
                        {title}
                    </h2>
                    <p className="text-xs font-medium text-[#475569]">
                        Update the record below
                    </p>
                </div>

                <Divider />

                {/* --- Form Fields --- */}
                <div className="space-y-3">
                    <div className="grid sm:grid-cols-2 grid-cols-1 gap-3">
                        {Object.entries(formData).map(([fieldName, value]) => (
                            <div key={fieldName} className="space-y-1">
                                <InputLabel
                                    htmlFor={fieldName}
                                    value={formatFieldName(fieldName)}
                                    className="text-[#475569] text-xs font-medium"
                                />
                                <TextInput
                                    id={fieldName}
                                    name={fieldName}
                                    value={value}
                                    onChange={handleChange}
                                    className="w-full block"
                                />
                                <InputError message={formErrors[fieldName]} />
                            </div>
                        ))}
                    </div>

                    {/* Buttons */}
                    <div className="flex items-center gap-2 justify-end flex-wrap mt-4">
                        {loading && (
                            <p className="text-sm text-gray-500">Saving...</p>
                        )}
                        <Button variant="light" onClick={handleClose}>
                            Cancel
                        </Button>
                        <Button
                            variant="primary"
                            disabled={loading}
                            onClick={handleUpdate}
                        >
                            Update Record
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
