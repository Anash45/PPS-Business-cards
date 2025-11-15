import SwaggerDocs from "@/Components/SwaggerDocs";
import CardLayout from "@/Layouts/CardLayout";
import { Head } from "@inertiajs/react";

export default function Docs() {
    return (
        <CardLayout>
            <Head title="API Documentation - Full" />
            <SwaggerDocs />
        </CardLayout>
    );
}
