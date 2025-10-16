import { useGlobal } from "@/context/GlobalProvider";
import Button from "./Button";
import CsvUploaderCsv from "./CsvUploaderCsv";
import CsvUploaderImages from "./CsvUploaderImages";
import { ArrowRight } from "lucide-react";

export default function CsvStepUpload() {
    const { setCsvImportProgress, csvData } = useGlobal();

    return (
        <div className="flex flex-col lg:gap-6 gap-5">
            <CsvUploaderCsv />
            <CsvUploaderImages />
            <div className="flex items-center justify-end">
                <Button variant="light" disabled={csvData.length === 0} onClick={()=> setCsvImportProgress(2)}>Next <ArrowRight className="inline-block w-4 h-4 ml-1" /></Button>
            </div>
        </div>
    );
}
