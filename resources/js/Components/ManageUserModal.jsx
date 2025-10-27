import { useForm, router, usePage } from "@inertiajs/react";
import InputLabel from "@/Components/InputLabel";
import TextInput from "@/Components/TextInput";
import InputError from "@/Components/InputError";
import SelectInput from "@/Components/SelectInput";
import Button from "@/Components/Button";
import Divider from "@/Components/Divider";
import toast from "react-hot-toast";
import { useState, useEffect } from "react";

export default function ManageUserModal({
    onClose,
    user = null,
    authUser,
    companies = {},
    title = "Manage User",
}) {
    const [show, setShow] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    const {
        data,
        setData,
        clearErrors: inertiaClearErrors,
    } = useForm({
        company_name: user?.company?.name || "",
        company_id: user?.company?.id || null,
        name: user?.name || "",
        email: user?.email || "",
        password: "",
        password_confirmation: "",
        role: user?.role || "team",
    });

    const handleChange = (field, value) => {
        setData(field, value);
        if (errors[field]) setErrors((prev) => ({ ...prev, [field]: null }));
        inertiaClearErrors(field);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrors({});

        try {
            let res;
            if (user)
                res = await axios.put(route("users.update", user.id), data);
            else res = await axios.post(route("users.store"), data);

            if (res.data.success) {
                toast.success(res.data.message || "User saved successfully!");
                handleClose();
                router.visit(route("users.index"), { preserveScroll: true });
            } else toast.error(res.data.message || "Something went wrong.");
        } catch (err) {
            if (err.response?.status === 422) {
                setErrors(err.response.data.errors || {});
                toast.error("Please fix validation errors.");
            } else {
                toast.error(err.response?.data?.message || "Error occurred.");
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

    // ✅ Determine role-based permissions
    const isAdmin = authUser?.role === "admin";
    const isCompany = authUser?.role === "company";

    // ✅ Role options (based on who is editing)
    const roleOptions = isAdmin
        ? [
              { value: "admin", label: "Admin" },
              // Only allow creating company if this is a new user (not editing)
              ...(!user ? [{ value: "company", label: "Company Owner" }] : []),
              { value: "editor", label: "Editor" },
              { value: "template_editor", label: "Template Editor" },
              //   { value: "team", label: "Team Member" },
          ]
        : isCompany
        ? [
              { value: "editor", label: "Editor" },
              { value: "template_editor", label: "Template Editor" },
              //   { value: "team", label: "Team Member" },
          ]
        : [];

    console.log("User Modal:", authUser?.role);

    return (
        <div
            className={`transform rounded-xl bg-white py-5 px-6 shadow-xl transition-all duration-200 w-[650px] max-w-full 
            ${show ? "scale-100 opacity-100" : "scale-95 opacity-0"}`}
        >
            <div className="space-y-3">
                <div className="space-y-1">
                    <h2 className="text-lg text-[#201A20] font-semibold">
                        {title}
                    </h2>
                    {!user && (
                        <p className="text-xs text-blue-800 bg-blue-100 rounded-full py-1 px-3 w-fit">
                            Creating new user
                        </p>
                    )}
                </div>

                <Divider />

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                        {/* ✅ Only Admin can edit company_name */}
                        {isAdmin && data.role === "company" && (
                            <div className="space-y-1 sm:col-span-2">
                                <InputLabel
                                    htmlFor="company_name"
                                    value="Company Name"
                                />
                                <TextInput
                                    id="company_name"
                                    name="company_name"
                                    value={data.company_name}
                                    onChange={(e) =>
                                        handleChange(
                                            "company_name",
                                            e.target.value
                                        )
                                    }
                                    className="w-full block"
                                />
                                <InputError message={errors.company_name} />
                            </div>
                        )}

                        {/* ✅ Only Admin can assign company_id (for editors/team) */}
                        {isAdmin &&
                            (data.role === "editor" ||
                                data.role === "template_editor" ||
                                data.role === "team") && (
                                <div className="space-y-1 sm:col-span-2">
                                    <InputLabel
                                        htmlFor="company_id"
                                        value="Company"
                                    />
                                    <SelectInput
                                        id="company_id"
                                        name="company_id"
                                        value={data.company_id}
                                        onChange={(e) =>
                                            handleChange(
                                                "company_id",
                                                e.target.value
                                            )
                                        }
                                        options={companies.map((company) => ({
                                            value: company.id,
                                            label: company.name,
                                        }))}
                                    />
                                    <InputError message={errors.company_id} />
                                </div>
                            )}

                        {/* Name */}
                        <div className="space-y-1">
                            <InputLabel htmlFor="name" value="Name" />
                            <TextInput
                                id="name"
                                name="name"
                                value={data.name}
                                onChange={(e) =>
                                    handleChange("name", e.target.value)
                                }
                                className="w-full block"
                            />
                            <InputError message={errors.name} />
                        </div>

                        {/* Email */}
                        <div className="space-y-1">
                            <InputLabel htmlFor="email" value="Email" />
                            <TextInput
                                id="email"
                                name="email"
                                type="text"
                                value={data.email}
                                onChange={(e) =>
                                    handleChange("email", e.target.value)
                                }
                                className="w-full block"
                            />
                            <InputError message={errors.email} />
                        </div>

                        {/* Role */}
                        <div className="space-y-1">
                            <InputLabel htmlFor="role" value="Role" />
                            {user && user.role === "company" ? (
                                <TextInput
                                    id="role"
                                    readOnly
                                    value={data.role}
                                    className="block w-full capitalize bg-gray-100"
                                />
                            ) : (
                                <SelectInput
                                    id="role"
                                    name="role"
                                    value={data.role}
                                    onChange={(e) =>
                                        handleChange("role", e.target.value)
                                    }
                                    options={roleOptions}
                                />
                            )}
                            <InputError message={errors.role} />
                        </div>

                        {/* Password */}
                        <div className="space-y-1">
                            <InputLabel
                                htmlFor="password"
                                value={`Password${
                                    user ? " (leave blank to keep current)" : ""
                                }`}
                            />
                            <TextInput
                                id="password"
                                name="password"
                                type="password"
                                value={data.password}
                                onChange={(e) =>
                                    handleChange("password", e.target.value)
                                }
                                className="w-full block"
                            />
                            <InputError message={errors.password} />
                        </div>

                        {/* Confirm Password */}
                        <div className="space-y-1">
                            <InputLabel
                                htmlFor="password_confirmation"
                                value="Confirm Password"
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
                                className="w-full block"
                            />
                        </div>
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
                            {loading
                                ? "Saving..."
                                : user
                                ? "Update User"
                                : "Create User"}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
