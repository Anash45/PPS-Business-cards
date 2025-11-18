import { router, useForm, usePage } from "@inertiajs/react";
import Button from "@/Components/Button";
import InputLabel from "@/Components/InputLabel";
import TextInput from "@/Components/TextInput";
import InputError from "@/Components/InputError";
import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

export default function TwoFactorSettings({ className = "" }) {
    const user = usePage().props.auth.user;
    const [qrCode, setQrCode] = useState(usePage().props.totp_qr || null);
    const [loading, setLoading] = useState(false); // disables all buttons
    const [secretKey, setSecretKey] = useState(null);

    const { data, setData, errors, setError, reset } = useForm({
        code: "",
    });

    console.log(user);

    const handleEnableEmail = async () => {
        setLoading(true);
        try {
            await axios.post("/two-factor/email/enable");
            toast.success("Email 2FA enabled.");
            router.reload({ only: ["auth"] });
        } catch (err) {
            console.error(err);
            toast.error("Failed to enable Email 2FA.");
        } finally {
            setLoading(false);
        }
    };

    const handleDisableEmail = async () => {
        setLoading(true);
        try {
            await axios.post("/two-factor/email/disable");
            toast.success("Email 2FA disabled.");
            router.reload({ only: ["auth"] });
        } catch (err) {
            console.error(err);
            toast.error("Failed to disable Email 2FA.");
        } finally {
            setLoading(false);
        }
    };

    const handleStartTotp = async () => {
        setLoading(true);
        try {
            const res = await axios.post("/two-factor/totp/start");
            setQrCode(res.data.totp_qr);
            toast.success(res.data.message);
            setSecretKey(res.data.secret);
        } catch (err) {
            console.error(err);
            toast.error("Failed to start TOTP setup.");
        } finally {
            setLoading(false);
        }
    };

    const handleDisableTotp = async () => {
        setLoading(true);
        try {
            await axios.post("/two-factor/totp/disable");
            setQrCode(null);
            toast.success("Authenticator App 2FA disabled.");
            router.reload({ only: ["auth"] });
        } catch (err) {
            console.error(err);
            toast.error("Failed to disable TOTP.");
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyTotp = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("code", null);

        try {
            const res = await axios.post("/two-factor/totp/verify", {
                code: data.code,
            });
            toast.success(res.data.message);
            setQrCode(null);
            reset("code");
            router.reload({ only: ["auth"] });
        } catch (err) {
            if (err.response?.data?.message) {
                setError("code", err.response.data.message);
                toast.error(err.response.data.message);
            } else {
                setError("code", "Something went wrong.");
                toast.error("Something went wrong.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className={className}>
            <header>
                <h2 className="text-lg font-medium text-gray-900">
                    Two-Factor Authentication
                </h2>
                <p className="mt-1 text-sm text-gray-600">
                    Improve your account security by enabling 2FA.
                </p>
            </header>

            <div className="mt-6 space-y-6">
                {/* EMAIL 2FA */}
                <div className="border p-4 rounded-md">
                    <h3 className="font-semibold">Email Authentication</h3>
                    <p className="text-sm text-gray-600">
                        A 6-digit code will be emailed to you at login.
                    </p>
                    {user.is_email_2fa_enabled ? (
                        <Button
                            variant="danger"
                            className="mt-3"
                            onClick={handleDisableEmail}
                            disabled={loading}
                        >
                            {loading ? "Processing..." : "Disable Email 2FA"}
                        </Button>
                    ) : (
                        <Button
                            className="mt-3"
                            onClick={handleEnableEmail}
                            disabled={loading}
                        >
                            {loading ? "Processing..." : "Enable Email 2FA"}
                        </Button>
                    )}
                </div>

                {/* TOTP 2FA */}
                <div className="border p-4 rounded-md">
                    <h3 className="font-semibold">Authenticator App</h3>
                    <p className="text-sm text-gray-600">
                        Use Google Authenticator or Microsoft Authenticator.
                    </p>
                    {user.is_totp_2fa_enabled ? (
                        <Button
                            variant="danger"
                            className="mt-3"
                            onClick={handleDisableTotp}
                            disabled={loading}
                        >
                            {loading
                                ? "Processing..."
                                : "Disable Authenticator App"}
                        </Button>
                    ) : (
                        <Button
                            className="mt-3"
                            onClick={handleStartTotp}
                            disabled={loading}
                        >
                            {loading
                                ? "Generating QR..."
                                : "Enable Authenticator App"}
                        </Button>
                    )}

                    {/* VERIFY TOTP SETUP */}
                    {qrCode && (
                        <div className="mt-4">
                            <img
                                src={qrCode}
                                alt="QR Code"
                                className="w-48 h-48"
                            />

                            {/* Show secret key for manual entry */}
                            {secretKey && (
                                <p className="mt-2 text-sm text-gray-700">
                                    Or enter this key manually in your
                                    authenticator app: <br />
                                    <span className="font-mono bg-gray-100 px-2 py-1 rounded">
                                        {secretKey}
                                    </span>
                                </p>
                            )}

                            <form onSubmit={handleVerifyTotp} className="mt-4">
                                <InputLabel value="Enter code from your app" />
                                <TextInput
                                    value={data.code}
                                    onChange={(e) =>
                                        setData("code", e.target.value)
                                    }
                                    className="mt-2 block w-full"
                                />
                                <InputError message={errors.code} />
                                <Button className="mt-3" disabled={loading}>
                                    {loading ? "Verifying..." : "Verify"}
                                </Button>
                            </form>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}
