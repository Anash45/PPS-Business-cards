import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import TextInput from "@/Components/TextInput";
import SelectInput from "@/Components/SelectInput";
import Button from "./Button";
import Divider from "./Divider";
import InputError from "./InputError";
import InputLabel from "./InputLabel";

export default function ManageSubscriptionModal({
    onClose,
    user,
    plans,
    onSuccess,
    title = "Manage Subscription",
}) {
    const [show, setShow] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [data, setData] = useState({
        user_id: user.id,
        plan_id: user?.subscription?.plan_id || "",
        start_date: user?.subscription?.start_date || "",
        end_date: user?.subscription?.end_date || "",
        is_active:
            user?.subscription?.is_active !== undefined
                ? user.subscription.is_active
                : true,
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({});
        setLoading(true);

        try {
            const response = await axios.post(
                route("subscriptions.updateOrCreate", user.id),
                data
            );

            toast.success(
                response.data.message || "Subscription updated successfully!"
            );
            onSuccess();
            handleClose();
        } catch (error) {
            if (error.response) {
                if (error.response.status === 422) {
                    setErrors(error.response.data.errors || {});
                    toast.error(
                        error.response.data.message ||
                            "Please fix the validation errors."
                    );
                } else {
                    toast.error(
                        error.response.data.message ||
                            "Something went wrong. Try again later."
                    );
                }
            } else if (error.request) {
                toast.error("No response from server. Please try again.");
            } else {
                toast.error("Error while sending request.");
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

    // 🔹 Helper: update field + clear its own error
    const updateField = (field, value) => {
        setData((prev) => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors((prev) => {
                const updated = { ...prev };
                delete updated[field];
                return updated;
            });
        }
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
                    {!user.subscription && (
                        <p className="text-xs text-red-800 bg-red-100 rounded-full py-1 px-3 w-fit">
                            Not subscribed yet!
                        </p>
                    )}
                </div>

                <Divider />

                <form
                    onSubmit={handleSubmit}
                    className="grid sm:grid-cols-2 gap-4"
                >
                    {/* Plan */}
                    <div className="space-y-1 col-span-2">
                        <InputLabel value={"Plan"} />
                        <SelectInput
                            label="Plan"
                            value={data.plan_id}
                            onChange={(e) =>
                                updateField("plan_id", e.target.value)
                            }
                            options={[
                                { value: "", label: "Select a Plan" },
                                ...plans
                                    .filter((plan) => plan.active === 1)
                                    .map((plan) => ({
                                        value: plan.id,
                                        label: plan.name,
                                    })),
                            ]}
                            required
                        />
                        <InputError message={errors.plan_id} />
                    </div>

                    {/* Start Date */}
                    <div className="space-y-1">
                        <InputLabel value={"Start Date"} />
                        <TextInput
                            label="Start Date"
                            type="date"
                            value={data.start_date}
                            onChange={(e) =>
                                updateField("start_date", e.target.value)
                            }
                            placeholder="Start Date"
                            required
                        />
                        <InputError message={errors.start_date} />
                    </div>

                    {/* End Date */}
                    <div className="space-y-1">
                        <InputLabel value={"End Date"} />
                        <TextInput
                            label="End Date"
                            type="date"
                            placeholder="End Date"
                            value={data.end_date}
                            onChange={(e) =>
                                updateField("end_date", e.target.value)
                            }
                            required
                        />
                        <InputError message={errors.end_date} />
                    </div>

                    {/* Active Status */}
                    <div className="space-y-1">
                        <SelectInput
                            label="Status"
                            value={data.is_active ? "1" : "0"}
                            onChange={(e) =>
                                updateField("is_active", e.target.value === "1")
                            }
                            options={[
                                { value: "1", label: "Active" },
                                { value: "0", label: "Inactive" },
                            ]}
                        />
                        <InputError message={errors.is_active} />
                    </div>

                    {/* Buttons */}
                    <div className="flex justify-end gap-3 col-span-2 mt-2">
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
                            {loading ? "Saving..." : "Save"}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
