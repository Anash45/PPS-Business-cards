import { useGlobal } from "@/context/GlobalProvider";
import StepsTitleSec from "./StepsTitleSec";
import Button from "./Button";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";

export default function CsvStepConfirm() {
    const {
        csvData,
        csvImages,
        mapping,
        warnings,
        errors,
        setCsvImportProgress,
    } = useGlobal();
    const [loading, setLoading] = useState(false);

    // Rows without errors/warnings
    const errorRows = errors.map((e) => e.row);
    const warningRows = warnings.map((w) => w.row);
    const totalRows = csvData?.length || 0;

    const validatedRowsCount =
        totalRows - new Set([...errorRows, ...warningRows]).size;
    const warningRowsCount = warnings.length;
    const errorRowsCount = errors.length;

    // Prepare backend payload (ignoring rows with errors)
    const dataToSend = csvData
        .map((row, index) => {
            const rowNumber = index + 1;
            if (errorRows.includes(rowNumber)) return null; // skip errors

            const mappedRow = {};
            Object.entries(mapping || {}).forEach(([fieldName, csvColumn]) => {
                mappedRow[fieldName] = row[csvColumn] ?? "";
            });

            // Attach matching image if profile_image_name exists
            const profileImageName = mappedRow["profile_image_name"];
            if (profileImageName && csvImages && csvImages.length > 0) {
                const matchingImage = csvImages.find(
                    (img) => img.name === profileImageName
                );
                if (matchingImage) {
                    mappedRow["profile_image_file"] = matchingImage; // attach the whole File object
                }
            }

            return mappedRow;
        })
        .filter(Boolean); // remove nulls

    console.log("✅ Records ready to send to backend:", dataToSend, csvImages);

    const handleSubmit = async () => {
        if (!dataToSend || dataToSend.length === 0) {
            toast.error("No data to submit.");
            return;
        }

        setLoading(true);

        try {
            // Convert files to base64 first
            const dataWithBase64 = await Promise.all(
                dataToSend.map(async (row) => {
                    let base64Image = null;
                    if (row.profile_image_file instanceof File) {
                        base64Image = await new Promise((resolve, reject) => {
                            const reader = new FileReader();
                            reader.readAsDataURL(row.profile_image_file);
                            reader.onload = () => resolve(reader.result);
                            reader.onerror = (err) => reject(err);
                        });
                    }
                    return {
                        ...row,
                        profile_image_base64: base64Image,
                    };
                })
            );

            console.log("📤 Data to send to backend:", dataWithBase64);

            // Send as JSON payload
            const response = await axios.post("/cards/bulk-update", {
                cards: dataWithBase64,
            });

            console.log("📦 Backend Response:", response.data);

            if (response.data.success) {
                toast.success(
                    response.data.message || "Cards updated successfully!"
                );
            } else {
                toast.error(response.data.message || "Something went wrong.");
            }
        } catch (error) {
            console.error("❌ Axios Error:", error);
            toast.error("Failed to submit card updates.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col gap-5 p-5 bg-white rounded-xl border border-[#EAECF0]">
            <StepsTitleSec
                title="Confirm Employee Data"
                description="Once confirmed the validated records will be inserted in the database."
            />

            <div className="flex flex-col gap-5 mb-1">
                <div className="rounded-lg p-3 bg-[#F9FAFB]">
                    <div className="flex items-center gap-3">
                        <img
                            src="/assets/images/success-icon.svg"
                            alt="Success"
                            className="h-6 w-6"
                        />
                        <div className="space-y-1">
                            <h4 className="font-semibold text-sm text-[#3F3F46]">
                                {validatedRowsCount} records validated
                                successfully
                            </h4>
                            <p className="text-sm text-[#667085]">
                                These records are ready for import
                            </p>
                        </div>
                    </div>
                </div>

                <div className="rounded-lg p-3 bg-[#F9FAFB]">
                    <div className="flex items-center gap-3">
                        <img
                            src="/assets/images/warning-icon.svg"
                            alt="Warning"
                            className="h-6 w-6"
                        />
                        <div className="space-y-1">
                            <h4 className="font-semibold text-sm text-[#3F3F46]">
                                {warningRowsCount} records with warnings
                            </h4>
                            <p className="text-sm text-[#667085]">
                                These records have issues but can still be
                                imported.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="rounded-lg p-3 bg-[#F9FAFB]">
                    <div className="flex items-center gap-3">
                        <img
                            src="/assets/images/danger-icon.svg"
                            alt="danger"
                            className="h-6 w-6"
                        />
                        <div className="space-y-1">
                            <h4 className="font-semibold text-sm text-[#3F3F46]">
                                {errorRowsCount} records with errors
                            </h4>
                            <p className="text-sm text-[#667085]">
                                These records will be ignored while importing.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex justify-between">
                <Button onClick={() => setCsvImportProgress(3)} variant="light">
                    <ArrowLeft className="inline-block w-4 h-4 mr-1" />
                    Previous
                </Button>

                <Button
                    onClick={handleSubmit}
                    variant="primary"
                    disabled={loading}
                >
                    {loading ? "Submitting..." : "Complete Import"}
                    <ArrowRight className="inline-block w-4 h-4 ml-1" />
                </Button>
            </div>
        </div>
    );
}
