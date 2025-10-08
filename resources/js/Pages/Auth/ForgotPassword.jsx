import InputError from "@/Components/InputError";
import InputLabel from "@/Components/InputLabel";
import Button from "@/Components/Button";
import TextInput from "@/Components/TextInput";
import GuestLayout from "@/Layouts/GuestLayout";
import { Head, Link, useForm } from "@inertiajs/react";

export default function ForgotPassword({ status }) {
    const { data, setData, post, processing, errors } = useForm({
        email: "",
    });

    const submit = (e) => {
        e.preventDefault();

        post(route("password.email"));
    };

    if(status){
        window.location.href = route("password.resetLinkSuccess");
    }

    return (
        <GuestLayout>
            <Head title="Forgot Password" />

            <div className="flex flex-col gap-1.5 mb-6 text-grey900">
                <h2 className="font-semibold text-[30px] leading-9">
                    Reset Your Password
                </h2>
                <p className="text-sm tracking-wide leading-6 text-[#64748B]">
                    Enter your registered email address, and we will send you a
                    link to reset your password.
                </p>
            </div>

            <form onSubmit={submit} className="flex flex-col gap-6">
                <div className="flex flex-col gap-1">
                    <InputLabel htmlFor="email" value="Email" />
                    <TextInput
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        className="block"
                        placeholder="Enter company email"
                        isFocused={true}
                        onChange={(e) => setData("email", e.target.value)}
                    />

                    {status && (
                        <div className="mb-4 text-sm font-medium text-green-600">
                            {status}
                        </div>
                    )}
                    <InputError message={errors.email} />
                </div>

                <div className="gap-3 flex flex-col items-center justify-center">
                    <Button variant="primary" className="w-full" disabled={processing}>
                        Send Reset Link
                    </Button>
                    <Link
                        href={route("login")}
                        className="text-sm leading-6 text-slate600 block text-center"
                    >
                        Back to Login
                    </Link>
                </div>
            </form>
        </GuestLayout>
    );
}