import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, usePage, Link } from "@inertiajs/react";
import UserTitle from "./UserTitle";
import UserTable from "./UserTable";
import { Plus } from "lucide-react";
import FlashMessage from "@/Components/FlashMessage";
import toast from "react-hot-toast";
import { useEffect } from "react";
import { GlobalProvider, useGlobal } from "@/context/GlobalProvider";

export default function Users() {
    const { users, flash } = usePage().props;
    // Show flash message if present
    useEffect(() => {
        if (flash?.success) {
            toast.success(flash.success);
        } else if (flash?.error) {
            toast.error(flash.error);
        } else if (flash?.info) {
            toast(flash.info);
        }
    }, [flash]);

    const { setHeaderTitle, setHeaderText } = useGlobal(GlobalProvider);

    useEffect(() => {
        setHeaderTitle("Users Management");
        setHeaderText("");
    }, []);

    return (
        <AuthenticatedLayout>
            <Head title="Users" />

            <div className="py-4 md:px-6 px-4 flex flex-col gap-6">
                <div className="flex items-center justify-between">
                    <UserTitle title={"Users Management"} />

                    <Link
                        href={route("users.create")}
                        className="px-4 py-2 text-white text-sm rounded-md shadow bg-primary hover:bg-[#60ae68] flex items-center gap-1 justify-center transition"
                    >
                        <Plus className="h-4 w-4" strokeWidth={2} /> Add User
                    </Link>
                </div>

                <UserTable users={users} />
            </div>
        </AuthenticatedLayout>
    );
}
