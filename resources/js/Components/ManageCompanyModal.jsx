import { useForm } from "@inertiajs/react";
import InputLabel from "@/Components/InputLabel";
import TextInput from "@/Components/TextInput";
import InputError from "@/Components/InputError";
import Button from "@/Components/Button";
import Divider from "@/Components/Divider";
import toast from "react-hot-toast";
import { useState, useEffect } from "react";
import axios from "axios";

export default function ManageCompanyModal({ onClose, company, onSuccess }) {
    const [show, setShow] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    const { data, setData, clearErrors } = useForm({
        company_id: company?.id || "",
        name: company?.name || "",
        billing_email: company?.billing_email || "",
        street_address: company?.street_address || "",
        postal_code: company?.postal_code || "",
        city: company?.city || "",
        country: company?.country || "",
        vat_id: company?.vat_id || "",
    });

    const handleChange = (field, value) => {
        setData(field, value);
        if (errors[field]) setErrors((prev) => ({ ...prev, [field]: null }));
        clearErrors(field);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrors({});

        try {
            const res = await axios.put(
                route("settings.company.update"),
                data
            );

            console.log("Response:", res.data);

            if (res.data.success) {
                toast.success(
                    res.data.message || "Company updated successfully!"
                );
                onSuccess();
                handleClose();
            } else {
                toast.error(res.data.message || "Something went wrong.");
            }
        } catch (err) {
            if (err.response?.status === 422) {
                setErrors(err.response.data.errors || {});
                toast.error("Please fix the highlighted errors.");
            } else {
                toast.error(
                    err.response?.data?.message || "An error occurred."
                );
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        requestAnimationFrame(() => setShow(true));
    }, []);

    const handleClose = () => {
        setShow(false);
        setTimeout(onClose, 200);
    };

    return (
        <div
            className={`transform rounded-xl bg-white py-5 px-6 shadow-xl transition-all duration-200 w-[700px] max-w-full
                ${show ? "scale-100 opacity-100" : "scale-95 opacity-0"}`}
        >
            <div className="space-y-3">
                <div className="space-y-1">
                    <h2 className="text-lg text-[#201A20] font-semibold">
                        Edit Company Details
                    </h2>
                    <p className="text-xs text-gray-500">
                        Update your company information below.
                    </p>
                </div>

                <Divider />

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
                        {[
                            { name: "name", label: "Company Name" },
                            { name: "billing_email", label: "Billing Email" },
                            { name: "street_address", label: "Street Address" },
                            { name: "postal_code", label: "Postal Code" },
                            { name: "city", label: "City" },
                            { name: "country", label: "Country" },
                            { name: "vat_id", label: "VAT ID" },
                        ].map(({ name, label }) => (
                            <div key={name} className="space-y-1">
                                <InputLabel htmlFor={name} value={label} />
                                <TextInput
                                    id={name}
                                    name={name}
                                    value={data[name] ?? ""}
                                    onChange={(e) =>
                                        handleChange(name, e.target.value)
                                    }
                                    className="w-full block"
                                />
                                <InputError message={errors[name]} />
                            </div>
                        ))}
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
                            {loading ? "Saving..." : "Save Changes"}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
