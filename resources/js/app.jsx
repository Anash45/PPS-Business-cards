import "../css/app.css";
import "./bootstrap";

import { createInertiaApp } from "@inertiajs/react";
import { resolvePageComponent } from "laravel-vite-plugin/inertia-helpers";
import { createRoot } from "react-dom/client";
import { Toaster } from "react-hot-toast";
import { GlobalProvider, useGlobal } from "./context/GlobalProvider";
import { ModalProvider } from "./context/ModalProvider";
import Loader from "./Components/Loader";

const appName = import.meta.env.VITE_APP_NAME || "Laravel";
function GlobalWrapper({ children }) {
    const { isPageLoading } = useGlobal();
    return (
        <>
            {children}
            <Loader show={isPageLoading} />
        </>
    );
}

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) =>
        resolvePageComponent(
            `./Pages/${name}.jsx`,
            import.meta.glob("./Pages/**/*.jsx")
        ),
    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(
            <GlobalProvider>
                <ModalProvider>
                    <GlobalWrapper>
                        <App {...props} />
                        <Toaster position="top-center" reverseOrder={false} />
                    </GlobalWrapper>
                </ModalProvider>
            </GlobalProvider>
        );
    },
    progress: {
        color: "#4B5563",
    },
});
