import "../css/app.css";
import "./bootstrap";

import { createInertiaApp } from "@inertiajs/react";
import { resolvePageComponent } from "laravel-vite-plugin/inertia-helpers";
import { createRoot } from "react-dom/client";
import { Toaster } from "react-hot-toast";
import { GlobalProvider } from "./context/GlobalProvider";
import { ModalProvider } from "./context/ModalProvider";

const appName = import.meta.env.VITE_APP_NAME || "Laravel";

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
            <ModalProvider>
                <GlobalProvider>
                    <App {...props} />
                    <Toaster position="top-center" reverseOrder={false} />
                </GlobalProvider>
            </ModalProvider>
        );
    },
    progress: {
        color: "#4B5563",
    },
});
