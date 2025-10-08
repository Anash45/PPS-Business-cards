import ApplicationLogo from "@/Components/ApplicationLogo";
import Button from "@/Components/Button";
import Checkbox from "@/Components/Checkbox";
import InputError from "@/Components/InputError";
import InputLabel from "@/Components/InputLabel";
import PrimaryButton from "@/Components/PrimaryButton";
import TextInput from "@/Components/TextInput";
import GuestLayout from "@/Layouts/GuestLayout";
import { Head, Link, useForm } from "@inertiajs/react";

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: "",
        password: "",
        remember: false,
    });

    const submit = (e) => {
        e.preventDefault();

        post(route("login"), {
            onFinish: () => reset("password"),
        });
    };

    return (
        <GuestLayout>
            <Head title="Log in" />

            <div className="text-center flex justify-center py-6">
                <Link href="/">
                    <ApplicationLogo className="h-[30px] mb-3" />
                </Link>
            </div>
            <div className="flex flex-col gap-1.5 mb-6 text-grey900">
                <h2 className="font-semibold text-[30px] leading-9">
                    Login to PPS Business Cards
                </h2>
                <p className="text-sm tracking-wide leading-6 text-[#64748B]">
                    Log in to continue accessing your PPS Business Cards and stay
                    connected to insights.
                </p>
            </div>

            {status && (
                <div className="mb-4 text-sm font-medium text-green-600">
                    {status}
                </div>
            )}

            <form onSubmit={submit} className="flex flex-col gap-6">
                <div className="flex flex-col gap-2">
                    <InputLabel htmlFor="email" value="Email" />

                    <TextInput
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        className="block w-full"
                        autoComplete="email"
                        placeholder="Enter your email"
                        isFocused={true}
                        onChange={(e) => setData("email", e.target.value)}
                    />

                    <InputError message={errors.email} className="mt-2" />
                </div>

                <div className="flex flex-col gap-2">
                    <InputLabel htmlFor="password" value="Password" />

                    <TextInput
                        id="password"
                        type="password"
                        name="password"
                        value={data.password}
                        className="block w-full"
                        placeholder="Enter your password"
                        autoComplete="current-password"
                        onChange={(e) => setData("password", e.target.value)}
                    />

                    <InputError message={errors.password} className="mt-2" />
                </div>

                <div className="flex justify-between items-center">
                    <label className="flex items-center">
                        <Checkbox
                            name="remember"
                            checked={data.remember}
                            onChange={(e) =>
                                setData("remember", e.target.checked)
                            }
                        />
                        <span className="ms-2 text-sm leading-6 text-[#475569] hover:text-grey900">
                            Keep me login
                        </span>
                    </label>

                    {canResetPassword && (
                        <Link
                            href={route("password.request")}
                            className="rounded-md text-sm leading-6 text-[#475569] underline hover:text-grey900 focus:outline-none"
                        >
                            Forgot password
                        </Link>
                    )}
                </div>

                <div className="flex items-center justify-end">
                    <Button variant="primary" className="w-full" disabled={processing}>
                        Log in
                    </Button>
                </div>
                {/* <div className="flex justify-center gap-4 items-center">
                    {canResetPassword && (
                        <Link
                            href={route("password.request")}
                            className="rounded-md text-sm leading-6 text-[#475569] underline hover:text-grey900 focus:outline-none"
                        >
                            Forgot password
                        </Link>
                    )}
                    {canResetPassword && (
                        <Link
                            href={route("password.request")}
                            className="rounded-md text-sm leading-6 text-[#475569] underline hover:text-grey900 focus:outline-none"
                        >
                            Forgot password
                        </Link>
                    )}
                    {canResetPassword && (
                        <Link
                            href={route("password.request")}
                            className="rounded-md text-sm leading-6 text-[#475569] underline hover:text-grey900 focus:outline-none"
                        >
                            Forgot password
                        </Link>
                    )}
                </div> */}
            </form>
        </GuestLayout>
    );
}