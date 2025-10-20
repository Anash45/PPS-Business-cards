import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, usePage, Link } from "@inertiajs/react";
import UserTitle from "./UserTitle";
import UserTable from "./UserTable";
import { Plus } from "lucide-react";
import FlashMessage from "@/Components/FlashMessage";
import toast from "react-hot-toast";
import { useEffect } from "react";
import { GlobalProvider, useGlobal } from "@/context/GlobalProvider";
import { useModal } from "@/context/ModalProvider";
import Button from "@/Components/Button";

export default function Users() {
    const { auth, users, plans, companies, flash } = usePage().props;
    const { openModal } = useModal();
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
        setHeaderTitle("Users");
        setHeaderText("");
    }, []);

    return (
        <AuthenticatedLayout>
            <Head title="Users" />

            <div className="py-4 md:px-6 px-4 flex flex-col gap-6">
                <div className="flex items-center justify-between">
                    <UserTitle title={"Users Management"} />

                    <Button
                        variant="primary"
                        onClick={() =>
                            openModal("ManageUserModal", {
                                companies: companies,
                                authUser: auth.user
                            })
                        }
                    >
                        <Plus className="h-4 w-4" strokeWidth={2} /> Add User
                    </Button>
                </div>

                <UserTable
                    authUser={auth.user}
                    users={users}
                    plans={plans}
                    companies={companies}
                />
            </div>
        </AuthenticatedLayout>
    );
}
