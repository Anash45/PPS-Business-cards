import React, { useState, useEffect } from "react";
import TextInput from "@/Components/TextInput";
import InputLabel from "@/Components/InputLabel";
import InputError from "@/Components/InputError";
import Button from "@/Components/Button";
import Divider from "@/Components/Divider";
import toast from "react-hot-toast";

export default function AddNfcCardModal({ onClose, onSuccess }) {
        // For showing/hiding detailed errors
        const [showDetails, setShowDetails] = useState(false);

    const [show, setShow] = useState(false);
    const [qrCode, setQrCode] = useState("");
    const [csvFile, setCsvFile] = useState(null);
    // Helper to clear error for a field
    const clearFieldError = (field) => {
        if (fieldErrors[field])
            setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
    };
    // Separate state for field errors and backend errors
    const [fieldErrors, setFieldErrors] = useState({});
    const [backendErrors, setBackendErrors] = useState([]); // array of strings
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        requestAnimationFrame(() => setShow(true));
    }, []);

    const handleClose = () => {
        setShow(false);
        setTimeout(onClose, 200);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setFieldErrors({});
        setBackendErrors([]);
        let newFieldErrors = {};
        let newBackendErrors = [];
        try {
            if (!csvFile && !qrCode) {
                newFieldErrors.qr_code = "Please enter a QR code or upload a CSV file.";
            }
            if (csvFile) {
                // CSV upload
                const formData = new FormData();
                formData.append("csv_file", csvFile);
                const res = await axios.post(
                    "/nfc-cards/addMultiple",
                    formData,
                    {
                        headers: { "Content-Type": "multipart/form-data" },
                    }
                );
                if ((res.status === 200 || res.status === 201) && (!res.data.errors || res.data.errors.length === 0)) {
                    toast.success("NFC cards added successfully!");
                    onSuccess();
                } else {
                    // Backend errors (array)
                    if (Array.isArray(res.data.errors)) {
                        newBackendErrors = res.data.errors;
                    } else if (typeof res.data.errors === 'object' && res.data.errors !== null) {
                        // Laravel validation errors as object
                        Object.entries(res.data.errors).forEach(([key, val]) => {
                            newFieldErrors[key] = Array.isArray(val) ? val.join(' ') : val;
                        });
                    } else if (res.data.message) {
                        newBackendErrors = [res.data.message];
                    }
                }
            } else if (qrCode) {
                // Single QR code
                const res = await axios.post("/nfc-cards/addSingle", {
                    qr_code: qrCode,
                });
                if ((res.status === 200 || res.status === 201) && (!res.data.errors || Object.keys(res.data.errors).length === 0)) {
                    toast.success("NFC card added successfully!");
                    onSuccess();
                } else {
                    if (Array.isArray(res.data.errors)) {
                        newBackendErrors = res.data.errors;
                    } else if (typeof res.data.errors === 'object' && res.data.errors !== null) {
                        Object.entries(res.data.errors).forEach(([key, val]) => {
                            newFieldErrors[key] = Array.isArray(val) ? val.join(' ') : val;
                        });
                    } else if (res.data.message) {
                        newBackendErrors = [res.data.message];
                    }
                }
            }
        } catch (err) {
            console.error("Error adding NFC card(s): ", err);
            if (err.response && err.response.status === 422) {
                // Laravel validation errors
                const errData = err.response.data.errors || {};
                Object.entries(errData).forEach(([key, val]) => {
                    newFieldErrors[key] = Array.isArray(val) ? val.join(' ') : val;
                });
            } else if (err.response && err.response.data && err.response.data.errors) {
                // Backend errors (array)
                if (Array.isArray(err.response.data.errors)) {
                    newBackendErrors = err.response.data.errors;
                } else if (typeof err.response.data.errors === 'object') {
                    Object.entries(err.response.data.errors).forEach(([key, val]) => {
                        newFieldErrors[key] = Array.isArray(val) ? val.join(' ') : val;
                    });
                }
            } else if (err.response && err.response.data && err.response.data.message) {
                newBackendErrors = [err.response.data.message];
            } else {
                newBackendErrors = ["An error occurred. Please try again."];
            }
        } finally {
            setFieldErrors(newFieldErrors);
            setBackendErrors(newBackendErrors);
            setLoading(false);
        }
    };



    return (
        <div
            className={`transform rounded-xl bg-white py-5 px-6 shadow-xl transition-all duration-200 w-[500px] max-w-full
                ${show ? "scale-100 opacity-100" : "scale-95 opacity-0"}`}
        >
            <div className="space-y-3">
                <div className="space-y-1">
                    <h2 className="text-lg text-[#201A20] font-semibold">
                        Add NFC Card
                    </h2>
                    <p className="text-xs text-gray-500">
                        Add a single NFC card by QR code or upload a CSV file.
                    </p>
                </div>

                <Divider />

                {/* Collapsible for backend errors (not field validation) */}
                {backendErrors.length > 0 && (
                    <div className="mb-3">
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
                            <div className="flex items-center justify-between">
                                <span className="font-semibold">There were errors with your submission.</span>
                                <button
                                    type="button"
                                    className="ml-2 text-xs underline"
                                    onClick={() => setShowDetails((prev) => !prev)}
                                >
                                    {showDetails ? "Hide details" : "Show details"}
                                </button>
                            </div>
                            <div
                                className={`transition-all duration-300 ease-in-out overflow-hidden text-xs ${showDetails ? 'max-h-40' : 'max-h-0'}`}
                                aria-hidden={!showDetails}
                            >
                                <ul className="list-disc pl-5 mt-2">
                                    {backendErrors.map((err, idx) => (
                                        <li key={idx} className="mb-1">{err}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                )}

                <form
                    onSubmit={handleSubmit}
                    className="space-y-6 pt-2"
                    encType="multipart/form-data"
                >
                    <div className="space-y-1">
                        <InputLabel htmlFor="qrCode" value="QR code" />
                        <TextInput
                            id="qrCode"
                            name="qrCode"
                            value={qrCode}
                            onChange={(e) => {
                                setQrCode(e.target.value);
                                clearFieldError("qrCode");
                            }}
                            className="w-full block"
                            placeholder="Enter QR code"
                        />
                        <InputError message={fieldErrors.qr_code} />
                    </div>
                    <div className="space-y-1">
                        <InputLabel htmlFor="csvFile" value="CSV file" />
                        <span className="block text-xs text-gray-500 mb-1">
                            Note: CSV file should have a column named{" "}
                            <b>QR_Code</b>
                        </span>
                        <TextInput
                            id="csvFile"
                            name="csvFile"
                            type="file"
                            accept=".csv"
                            onChange={(file) => {
                                setCsvFile(file);
                                clearFieldError("csvFile");
                            }}
                            className="w-full block"
                        />
                        <InputError message={fieldErrors.csvFile} />
                    </div>
                    <div className="flex justify-end gap-3 pt-3">
                        <Button
                            variant="light"
                            type="button"
                            onClick={handleClose}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="primary"
                            type="submit"
                            disabled={loading}
                        >
                            {loading ? "Adding..." : "Add NFC Card"}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
