import { AutoTranslateProvider } from "@/context/AutoTranslateProvider";

export default function CardLayout({ children }) {
    return (
        <AutoTranslateProvider>
            <div className="font-jakarta-sans bg-[#fbfbfb] min-h-screen">
                {children}
            </div>
        </AutoTranslateProvider>
    );
}
