import React, { createContext, useContext, useState } from "react";

const GlobalContext = createContext(undefined);

export const GlobalProvider = ({ children }) => {
    const [headerTitle, setHeaderTitle] = useState("Welcome!");
    const [headerText, setHeaderText] = useState("");
    const [isTemplate, setIsTemplate] = useState(null);
    const [isCardReal, setIsCardReal] = useState(false);
    const [csvImportProgress, setCsvImportProgress] = useState(1);
    const [csvFile, setCsvFile] = useState(null);
    const [csvData, setCsvData] = useState([]);
    const [csvImages, setCsvImages] = useState([]);
    const [loadingButton, setLoadingButton] = useState(null);
    const [loadingImport, setLoadingImport] = useState(null);
    const [isPageLoading, setIsPageLoading] = useState(false);
    const [mapping, setMapping] = useState({});
    const [warnings, setWarnings] = useState([]);
    const [errors, setErrors] = useState([]);
    const [cardSectionsOrder, setCardSectionsOrder] = useState([]);

    // 🔹 Card form state
    const [cardFormData, setCardFormData] = useState({
        salutation: "",
        title: "",
        first_name: "",
        last_name: "",
        degree: "",
        name_text_color: "#000000",
        company_name: "",
        position: "Sales Rep",
        department: "Sales",
        company_text_color: "#000000",
        profile_image: null,
        banner_image: null,
    });

    // 🔹 Handle changes
    const handleCardChange = (e) => {
        const { name, value } = e.target;

        setCardFormData((prev) => {
            const updates = { [name]: value };

            if (name === "profile_image") {
                updates.profile_image_url = value
                    ? typeof value === "string"
                        ? `/storage/${value}`
                        : URL.createObjectURL(value)
                    : null;
            }

            if (name === "banner_image") {
                updates.banner_image_url = value
                    ? typeof value === "string"
                        ? `/storage/${value}`
                        : URL.createObjectURL(value)
                    : null;
            }

            return { ...prev, ...updates };
        });
    };

    // 🔹 Steps
    const progressSteps = [
        { number: 1, label: "Upload" },
        { number: 2, label: "Mapping" },
        { number: 3, label: "Validation" },
        { number: 4, label: "Confirm" },
    ];

    return (
        <GlobalContext.Provider
            value={{
                headerTitle,
                headerText,
                setHeaderTitle,
                setHeaderText,
                cardFormData,
                handleCardChange,
                setCardFormData,
                isTemplate,
                setIsTemplate,
                isCardReal,
                setIsCardReal,
                csvImportProgress,
                setCsvImportProgress,
                progressSteps,
                csvFile,
                setCsvFile,
                csvData,
                setCsvData,
                csvImages,
                setCsvImages,
                loadingButton,
                setLoadingButton,
                mapping,
                setMapping,
                loadingImport,
                setLoadingImport,
                warnings,
                setWarnings,
                errors,
                setErrors,
                isPageLoading,
                setIsPageLoading,
                cardSectionsOrder,
                setCardSectionsOrder,
            }}
        >
            {children}
        </GlobalContext.Provider>
    );
};

// ✅ Custom hook (safe fallback)
export const useGlobal = () => {
    const context = useContext(GlobalContext);
    if (!context) {
        console.warn(
            "⚠️ useGlobal() called outside of <GlobalProvider>. Returning empty defaults to prevent crash."
        );
        return {
            headerTitle: "",
            headerText: "",
            setHeaderTitle: () => {},
            setHeaderText: () => {},
            cardFormData: {},
            handleCardChange: () => {},
            setCardFormData: () => {},
            isTemplate: null,
            setIsTemplate: () => {},
            isCardReal: false,
            setIsCardReal: () => {},
            csvImportProgress: 1,
            setCsvImportProgress: () => {},
            progressSteps: [],
            csvFile: null,
            setCsvFile: () => {},
            csvData: [],
            setCsvData: () => {},
            csvImages: [],
            setCsvImages: () => {},
            loadingButton: null,
            setLoadingButton: () => {},
            mapping: {},
            setMapping: () => {},
            isPageLoading: null,
            setIsPageLoading: () => {},
            cardSectionsOrder: null,
            setCardSectionsOrder: () => {},
        };
    }
    return context;
};
