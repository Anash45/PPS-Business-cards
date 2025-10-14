import { createContext, useContext, useState } from "react";

// 1️⃣ Create context
const GlobalContext = createContext();

// 2️⃣ Provider component
export const GlobalProvider = ({ children }) => {
    const [headerTitle, setHeaderTitle] = useState("Welcome! 👋");
    const [headerText, setHeaderText] = useState("");
    const [isTemplate, setIsTemplate] = useState(null);
    const [isCardReal, setIsCardReal] = useState(false);

    const [cardFormData, setCardFormData] = useState({
        salutation: "",
        title: "",
        first_name: "",
        last_name: "",
        name_text_color: "#000000",
        company_name: "",
        position: "Sales Rep",
        department: "Sales",
        company_text_color: "#000000",
        profile_image: null,
        banner_image: null,
    });
    const [loadingButton, setLoadingButton] = useState(null);

    const handleCardChange = (e) => {
        const { name, value } = e.target;

        setCardFormData((prev) => {
            // Default: just update the field
            let updates = { [name]: value };

            // Special case: profile_image
            if (name === "profile_image") {
                updates.profile_image_url = value
                    ? typeof value === "string"
                        ? `/storage/${value}`
                        : URL.createObjectURL(value)
                    : null;
            }

            // Special case: banner_image
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
            }}
        >
            {children}
        </GlobalContext.Provider>
    );
};

// 3️⃣ Custom hook for easier usage
export const useGlobal = () => useContext(GlobalContext);
