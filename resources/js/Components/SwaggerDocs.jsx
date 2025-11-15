import { useAutoTranslate } from "@/context/AutoTranslateProvider";
import SwaggerUI from "swagger-ui-react";
import "swagger-ui-react/swagger-ui.css";

export default function SwaggerDocs() {
    const { setShowLanguageSelector } = useAutoTranslate();
    setShowLanguageSelector(false);
    return (
        <div className="h-screen">
            <div className="h-full bg-white">
                <div className="p-4 border-b bg-white">
                    <h1 className="text-2xl font-semibold">
                        API Documentation
                    </h1>
                </div>
                <div className="h-[calc(100vh-72px)] overflow-auto">
                    <SwaggerUI url="/swagger.json" />
                </div>
            </div>
        </div>
    );
}
