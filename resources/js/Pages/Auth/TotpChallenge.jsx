import { Head, useForm } from "@inertiajs/react";
import InputLabel from "@/Components/InputLabel";
import TextInput from "@/Components/TextInput";
import InputError from "@/Components/InputError";
import GuestLayout from "@/Layouts/GuestLayout";
import Button from "@/Components/Button";
import ApplicationLogo from "@/Components/ApplicationLogo";

export default function TotpChallenge({ user }) {
    const { data, setData, post, processing, errors } = useForm({
        code: "",
    });

    const submit = (e) => {
        e.preventDefault();
        post(route("2fa.totp.challenge.post"));
    };

    return (
        <GuestLayout>
            <Head title="Verify Authenticator App" />
            <div>
                <div className="text-center flex justify-center py-6">
                    <ApplicationLogo className="h-[30px] mb-3" />
                </div>

                <div className="flex flex-col gap-1.5 mb-6 text-grey900">
                    <h2 className="font-semibold text-[30px] leading-9">
                        Two-Factor Authentication
                    </h2>
                    <p className="text-sm tracking-wide leading-6 text-[#64748B]">
                        Enter the 6-digit code from your authenticator app.
                    </p>
                </div>

                <form onSubmit={submit} className="flex flex-col gap-4">
                    <div>
                        <InputLabel
                            htmlFor="code"
                            value="Authentication Code"
                        />
                        <TextInput
                            id="code"
                            type="text"
                            value={data.code}
                            onChange={(e) => setData("code", e.target.value)}
                            className="mt-1 block w-full"
                            autoFocus
                        />
                        <InputError message={errors.code} className="mt-2" />
                    </div>

                    <Button
                        variant="primary"
                        className="mt-2"
                        disabled={processing}
                    >
                        Verify
                    </Button>
                </form>
            </div>
        </GuestLayout>
    );
}
