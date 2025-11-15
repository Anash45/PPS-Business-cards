import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

import InputError from "./InputError";
import InputLabel from "./InputLabel";
import TextInput from "./TextInput";
import Divider from "./Divider";
import Button from "./Button";
import SelectInput from "./SelectInput";
import { useModal } from "@/context/ModalProvider";

export default function CreatePlanModal({
    onClose,
    onSuccess,
    title = "Create Plan",
    existingPlan = null,
}) {
    const [show, setShow] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formErrors, setFormErrors] = useState({});

    const statusOptions = [
        { value: "true", label: "Active" },
        { value: "false", label: "Inactive" },
    ];

    // state
    const [formData, setFormData] = useState({
        name: existingPlan?.name || "",
        cards_included: existingPlan?.cards_included || "",
        nfc_cards_included: existingPlan?.nfc_cards_included || "",
        price_monthly: existingPlan?.price_monthly || "",
        price_annual: existingPlan?.price_annual || "",
        is_custom: existingPlan?.is_custom || false,
        active: existingPlan ? Boolean(Number(existingPlan.active)) : true,
    });

    useEffect(() => {
        requestAnimationFrame(() => setShow(true));
    }, []);

    const handleClose = () => {
        setShow(false);
        setTimeout(onClose, 200);
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));

        if (formErrors[name]) {
            setFormErrors((prev) => {
                const updated = { ...prev };
                delete updated[name];
                return updated;
            });
        }
    };

    const handleSelectChange = (name, value) => {
        setFormData((prev) => ({
            ...prev,
            [name]: value === "true" || value === true,
        }));

        console.log(name, value);

        if (formErrors[name]) {
            setFormErrors((prev) => {
                const updated = { ...prev };
                delete updated[name];
                return updated;
            });
        }
    };

    const handleSubmit = async () => {
        setLoading(true);
        setFormErrors({});
        try {
            const url = existingPlan
                ? route("plans.update", existingPlan.id)
                : route("plans.store");

            const method = existingPlan ? "put" : "post";

            const response = await axios[method](url, formData);

            // ✅ Log full server response
            console.log("Server response:", response.data);

            toast.success(
                existingPlan
                    ? "Plan updated successfully!"
                    : "Plan created successfully!"
            );

            onSuccess();
            handleClose();
        } catch (error) {
            if (error.response?.status === 422) {
                setFormErrors(error.response.data.errors || {});
                toast.error("Please fix the validation errors.");
            } else {
                toast.error("Something went wrong. Try again.");
            }
        } finally {
            setLoading(false);
        }
    };

    console.log("formData: ", formData);

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
                        {existingPlan
                            ? "Edit the plan details below."
                            : "Fill out the details to create a new subscription plan."}
                    </p>
                </div>

                <Divider />

                {/* --- Form Fields --- */}
                <div className="space-y-3">
                    <div className="grid sm:grid-cols-2 grid-cols-1 gap-3">
                        <div className="space-y-1">
                            <InputLabel
                                htmlFor="name"
                                value="Plan Name"
                                className="text-[#475569] text-xs font-medium"
                            />
                            <TextInput
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className="w-full block"
                                placeholder="e.g. Starter, Pro"
                            />
                            <InputError message={formErrors.name} />
                        </div>

                        <div className="space-y-1">
                            <InputLabel
                                htmlFor="cards_included"
                                value="Employees Included"
                                className="text-[#475569] text-xs font-medium"
                            />
                            <TextInput
                                id="cards_included"
                                name="cards_included"
                                type="number"
                                value={formData.cards_included}
                                onChange={handleChange}
                                className="w-full block"
                                placeholder="e.g. 50"
                            />
                            <InputError message={formErrors.cards_included} />
                        </div>

                        <div className="space-y-1">
                            <InputLabel
                                htmlFor="nfc_cards_included"
                                value="NFC Cards Included"
                                className="text-[#475569] text-xs font-medium"
                            />
                            <TextInput
                                id="nfc_cards_included"
                                name="nfc_cards_included"
                                type="number"
                                value={formData.nfc_cards_included}
                                onChange={handleChange}
                                className="w-full block"
                                placeholder="e.g. 150"
                            />
                            <InputError message={formErrors.nfc_cards_included} />
                        </div>

                        <div className="space-y-1">
                            <InputLabel
                                htmlFor="price_monthly"
                                value="Price per Month"
                                className="text-[#475569] text-xs font-medium"
                            />
                            <TextInput
                                id="price_monthly"
                                name="price_monthly"
                                type="number"
                                step="0.01"
                                value={formData.price_monthly}
                                onChange={handleChange}
                                className="w-full block"
                                placeholder="e.g. 9.99"
                            />
                            <InputError message={formErrors.price_monthly} />
                        </div>

                        <div className="space-y-1">
                            <InputLabel
                                htmlFor="price_annual"
                                value="Price per Month (Annual Plan)"
                                className="text-[#475569] text-xs font-medium"
                            />
                            <TextInput
                                id="price_annual"
                                name="price_annual"
                                type="number"
                                step="0.01"
                                value={formData.price_annual}
                                onChange={handleChange}
                                className="w-full block"
                                placeholder="e.g. 7.99"
                            />
                            <InputError message={formErrors.price_annual} />
                        </div>

                        {/* Active Select */}
                        <div className="space-y-1">
                            <InputLabel
                                htmlFor="active"
                                value="Status"
                                className="text-[#475569] text-xs font-medium"
                            />
                            <SelectInput
                                id="active"
                                value={formData.active.toString()} // ✅ convert boolean → string
                                onChange={(e) =>
                                    handleSelectChange("active", e.target.value)
                                }
                                className="w-full block"
                                placeholder="Select status"
                                options={statusOptions.map((opt) => ({
                                    label: opt.label,
                                    value: opt.value.toString(),
                                }))}
                            />
                            <InputError message={formErrors.active} />
                        </div>

                        {/* Custom Checkbox */}
                        <div className="space-y-1">
                            <InputLabel
                                htmlFor="is_custom"
                                value="Custom Plan"
                                className="text-[#475569] text-xs font-medium"
                            />
                            <label className="flex items-center gap-2 text-sm cursor-pointer">
                                <input
                                    type="checkbox"
                                    name="is_custom"
                                    checked={formData.is_custom}
                                    onChange={handleChange}
                                    className="accent-primary focus:ring-primary"
                                />
                                <span>Enable custom plan</span>
                            </label>
                        </div>
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
                            onClick={handleSubmit}
                        >
                            {existingPlan ? "Update Plan" : "Create Plan"}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
