import { Head, Link, useForm } from "@inertiajs/react";
import Button from "@/Components/Button";
import GuestLayout from "@/Layouts/GuestLayout";
import ApplicationLogo from "@/Components/ApplicationLogo";

export default function TwoFactorSelect({ user }) {
    const { data, setData, post, processing } = useForm({
        method: "", // "email" | "totp"
    });

    const submit = (e) => {
        e.preventDefault();
        post(route("2fa.send"));
    };

    return (
        <GuestLayout>
            <Head title="Select 2FA method" />
            <div>
                <div className="text-center flex justify-center py-6">
                    <Link href="/">
                        <ApplicationLogo className="h-[30px] mb-3" />
                    </Link>
                </div>
                <div className="flex flex-col gap-1.5 mb-6 text-grey900">
                    <h2 className="font-semibold text-[30px] leading-9">
                        Two-Factor Authentication
                    </h2>
                    <p className="text-sm tracking-wide leading-6 text-[#64748B]">
                        Select the method you want to use to login:
                    </p>
                </div>

                <form onSubmit={submit} className="flex flex-col gap-4">
                    {user.is_email_2fa_enabled && (
                        <label className="flex items-center gap-2">
                            <input
                                type="radio"
                                name="method"
                                value="email"
                                checked={data.method === "email"}
                                onChange={(e) =>
                                    setData("method", e.target.value)
                                }
                            />
                            Email
                        </label>
                    )}

                    {user.is_totp_2fa_enabled && (
                        <label className="flex items-center gap-2">
                            <input
                                type="radio"
                                name="method"
                                value="totp"
                                checked={data.method === "totp"}
                                onChange={(e) =>
                                    setData("method", e.target.value)
                                }
                            />
                            Authenticator App
                        </label>
                    )}

                    <Button
                        variant="primary"
                        disabled={processing || !data.method}
                    >
                        Continue
                    </Button>
                </form>
            </div>
        </GuestLayout>
    );
}
