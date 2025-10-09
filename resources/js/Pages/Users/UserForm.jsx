import { router, useForm, usePage } from "@inertiajs/react";
import InputLabel from "@/Components/InputLabel";
import TextInput from "@/Components/TextInput";
import InputError from "@/Components/InputError";
import SelectInput from "@/Components/SelectInput";
import Button from "@/Components/Button";
import toast from "react-hot-toast";
import { useEffect, useState } from "react";

export default function UserForm({ user = null }) {
    const { flash } = usePage().props;
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const {
        data,
        setData,
        post,
        put,
        processing,
        clearErrors: inertiaClearErrors,
    } = useForm({
        company_name: user?.company?.name || "",
        name: user?.name || "",
        email: user?.email || "",
        password: "",
        password_confirmation: "",
        role: user?.role || "company",
    });

    // 🔹 Handles input change and clears error for that field
    const handleChange = (field, value) => {
        setData(field, value);

        // Clear local error for this field
        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: null }));
        }

        // Clear Inertia error for this field
        inertiaClearErrors(field);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrors({}); // clear all local errors before submit

        try {
            let res;

            if (user) {
                // Update existing user
                res = await axios.put(route("users.update", user.id), data);
            } else {
                // Create new user
                res = await axios.post(route("users.store"), data);
            }

            if (res.data.success) {
                setLoading(false);
                toast.success(res.data.message);

                if (!user) {
                    // For create: reset form data and redirect after 2s
                    setData({
                        company_name: "",
                        name: "",
                        email: "",
                        password: "",
                        password_confirmation: "",
                        role: "company",
                    });

                    setTimeout(() => {
                        router.visit(route("users.index"));
                    }, 2000);
                }
            } else {
                setLoading(false);
                toast.error(res.data.message || "Something went wrong");
            }
        } catch (err) {
            setLoading(false);
            if (err.response?.status === 422) {
                // Validation errors
                setErrors(err.response.data.errors || {});
                toast.error("Please fix validation errors.");
            } else {
                toast.error(
                    err.response?.data?.message || "An error occurred."
                );
            }
        }
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="space-y-5 bg-white p-6 rounded-lg shadow"
        >
            <div className="grid md:grid-cols-2 grid-cols-1 gap-5">
                {/* Company Name */}
                <div>
                    {data.role === "company" && (
                        <div className="space-y-1">
                            <InputLabel
                                htmlFor="company_name"
                                value="Company Name"
                                className="text-[#344054] font-medium"
                            />
                            <TextInput
                                id="company_name"
                                name="company_name"
                                value={data.company_name}
                                onChange={(e) =>
                                    handleChange("company_name", e.target.value)
                                }
                                className="block w-full"
                            />
                            <InputError
                                message={errors.company_name}
                                className="mt-1"
                            />
                        </div>
                    )}
                </div>

                {/* Name */}
                <div className="space-y-1">
                    <InputLabel
                        htmlFor="name"
                        value="Name"
                        className="text-[#344054] font-medium"
                    />
                    <TextInput
                        id="name"
                        name="name"
                        value={data.name}
                        onChange={(e) => handleChange("name", e.target.value)}
                        className="block w-full"
                    />
                    <InputError message={errors.name} className="mt-1" />
                </div>
            </div>

            <div className="grid md:grid-cols-2 grid-cols-1 gap-5">
                {/* Email */}
                <div className="space-y-1">
                    <InputLabel
                        htmlFor="email"
                        value="Email"
                        className="text-[#344054] font-medium"
                    />
                    <TextInput
                        id="email"
                        name="email"
                        type="text"
                        value={data.email}
                        onChange={(e) => handleChange("email", e.target.value)}
                        className="block w-full"
                    />
                    <InputError message={errors.email} className="mt-1" />
                </div>

                {/* Role */}
                <div className="space-y-1">
                    <InputLabel
                        htmlFor="role"
                        value="Role"
                        className="text-[#344054] font-medium"
                    />
                    {user ? (
                        <TextInput
                            id="role"
                            readOnly
                            type="role"
                            defaultValue={data.role}
                            className="block w-full capitalize"
                        />
                    ) : (
                        <SelectInput
                            id="role"
                            name="role"
                            value={data.role}
                            onChange={(e) => {
                                handleChange("role", e.target.value);
                                if (e.target.value !== "company") {
                                    handleChange("company_name", "");
                                    clearErrors("company_name");
                                }
                            }}
                            className="w-full block"
                            options={[
                                { value: "admin", label: "Admin" },
                                { value: "company", label: "Company" },
                            ]}
                        />
                    )}
                    <InputError message={errors.role} className="mt-1" />
                </div>
            </div>

            <div className="grid md:grid-cols-2 grid-cols-1 gap-5">
                {/* Password */}
                <div className="space-y-1">
                    <InputLabel
                        htmlFor="password"
                        value={`Password${
                            user ? " (leave blank to keep current)" : ""
                        }`}
                        className="text-[#344054] font-medium"
                    />
                    <TextInput
                        id="password"
                        name="password"
                        type="password"
                        value={data.password}
                        onChange={(e) =>
                            handleChange("password", e.target.value)
                        }
                        className="block w-full"
                    />
                    <InputError message={errors.password} className="mt-1" />
                </div>

                {/* Password Confirmation */}
                <div className="space-y-1">
                    <InputLabel
                        htmlFor="password_confirmation"
                        value="Confirm Password"
                        className="text-[#344054] font-medium"
                    />
                    <TextInput
                        id="password_confirmation"
                        name="password_confirmation"
                        type="password"
                        value={data.password_confirmation}
                        onChange={(e) =>
                            handleChange(
                                "password_confirmation",
                                e.target.value
                            )
                        }
                        className="block w-full"
                    />
                </div>
            </div>

            {/* Submit */}
            <div className="flex justify-end">
                <Button variant="primary" type="submit" disabled={processing}>
                    {loading
                        ? "Saving..."
                        : user
                        ? "Update User"
                        : "Create User"}
                </Button>
            </div>
        </form>
    );
}
