import InputError from "@/Components/InputError";
import InputLabel from "@/Components/InputLabel";
import PrimaryButton from "@/Components/PrimaryButton";
import TextInput from "@/Components/TextInput";
import GuestLayout from "@/Layouts/GuestLayout";
import { Head, Link, useForm } from "@inertiajs/react";

export default function ResetLinkSuccess() {

    return (
        <GuestLayout>
            <Head title="Password Reset Link Sent" />

            <div className="flex flex-col gap-1.5 mb-8 text-grey900">
                <h2 className="font-semibold text-[30px] leading-9">
                    Check Your Email
                </h2>
                <p className="text-sm tracking-wide leading-6 text-[#64748B]">
                    If an account is associated with this email, you will receive a password reset link shortly. Please check your inbox and spam folder.
                </p>
            </div>

            <div className="flex flex-col gap-6 mt-3">

                <div className="gap-3 flex flex-col items-center justify-center">
                    <Link href={route("login")} className="w-full inline-flex items-center justify-center font-normal rounded-md border border-transparent bg-primary px-4 py-[7px] text-sm leading-6 tracking-widest text-white transition duration-150 ease-in-out hover:bg-[#6CAC6A] focus:bg-[#6CAC6A] focus:outline-none focus:ring-2 focus:ring-[#6CAC6A] focus:ring-offset-2 active:bg-[#6CAC6A]">
                        Back to Login
                    </Link>
                    <Link
                        href={route("password.request")}
                        className="text-sm leading-6 text-slate600 block text-center"
                    >
                        Didn't receive the email? <span className="underline">Resend</span>
                    </Link>
                </div>
            </div>
        </GuestLayout>
    );
}