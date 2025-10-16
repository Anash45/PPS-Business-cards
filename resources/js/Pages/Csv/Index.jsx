import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, usePage, router } from "@inertiajs/react";
import { GlobalProvider, useGlobal } from "@/context/GlobalProvider";
import { useEffect, useMemo, useState } from "react";
import CsvImportProgress from "@/Components/CsvImportProgress";
import CsvStepUpload from "@/Components/CsvStepUpload";
import CsvStepMapping from "@/Components/CsvStepMapping";
import CsvStepValidation from "@/Components/CsvStepValidation";
import CsvStepConfirm from "@/Components/CsvStepConfirm";

export default function Csv() {
    const { setHeaderTitle, setHeaderText, csvImportProgress, progressSteps } =
        useGlobal(GlobalProvider);

    useEffect(() => {
        setHeaderTitle("Bulk Import");
        setHeaderText("");
    }, []);

    return (
        <AuthenticatedLayout>
            <Head title="Bulk Import" />

            <div className="py-4 md:px-6 px-4 flex flex-col gap-6">
                <div className="md:p-6 p-4 rounded-xl bg-white border border-[#EAECF0]">
                    <div className="flex xl:flex-row flex-col md:gap-6 gap-4">
                        <div className="xl:w-[236px] w-full shrink-0">
                            <CsvImportProgress />
                        </div>
                        <div className="grow">
                            {csvImportProgress === 1 ? (
                                <CsvStepUpload />
                            ) : csvImportProgress === 2 ? (
                                <CsvStepMapping />
                            ) : csvImportProgress === 3 ? (
                                <CsvStepValidation />
                            ) : csvImportProgress === 4 ? (
                                <CsvStepConfirm />
                            ) : (
                                <div>Refresh Page</div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
