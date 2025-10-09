import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link } from "@inertiajs/react";
import UserForm from "./UserForm";
import UserTitle from "./UserTitle";
import { ChevronLeft } from "lucide-react";

export default function Create() {
    return (
        <AuthenticatedLayout>
            <Head title="Create User" />
            <div className="py-4 md:px-6 px-4 flex flex-col gap-6">
                <div className="flex items-center justify-between">
                    <UserTitle title={"Create User"} />

                    <Link
                        href={route("users.index")}
                        className="px-4 py-2 bg-gray-600 text-white text-sm rounded-md shadow hover:bg-gray-700 flex items-center gap-1 justify-center transition"
                    >
                        <ChevronLeft className="h-4 w-4" strokeWidth={2} /> Back
                    </Link>
                </div>
                <UserForm />
            </div>
        </AuthenticatedLayout>
    );
}
