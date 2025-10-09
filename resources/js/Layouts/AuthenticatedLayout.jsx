import Header from '@/Components/Header';
import Sidebar from '@/Components/Sidebar';
import { usePage } from '@inertiajs/react';
import { useState } from 'react';

export default function AuthenticatedLayout({ children }) {
    const user = usePage().props.auth.user;

    const [showingNavigationDropdown, setShowingNavigationDropdown] =
        useState(false);

    return (
        <div className="h-screen max-w-[2500px] mx-auto flex lg:flex-row flex-col bg-[#FCFCFD]">
            <Sidebar />
            <main className="grow rounded-lg flex flex-col">
                <div className="overflow-y-auto grow">
                    <Header />
                    {children}
                </div>
            </main>
        </div>
    );
}
