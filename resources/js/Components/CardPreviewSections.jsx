import React, { useEffect } from "react";
import axios from "axios";
import { useGlobal } from "@/context/GlobalProvider";

import CardPreviewPhones from "./CardPreviewPhones";
import CardPreviewEmails from "./CardPreviewEmails";
import CardPreviewWebsites from "./CardPreviewWebsites";
import CardPreviewAdresses from "./CardPreviewAdresses";
import CardPreviewButtons from "./CardPreviewButtons";

export default function CardPreviewSections() {
    const { cardFormData, cardSectionsOrder, setCardSectionsOrder } =
        useGlobal();

    const defaultOrder = [
        "phoneNumbers",
        "emails",
        "websites",
        "addresses",
        "buttons",
    ];

    // ✅ Fetch saved order only if not already loaded
    useEffect(() => {
        if (!cardFormData?.company_id) return;
        if (cardSectionsOrder && cardSectionsOrder.length > 0) return;

        axios
            .get(`/company/${cardFormData.company_id}/card-sections-order`)
            .then((res) => {
                if (res.data.order && Array.isArray(res.data.order)) {
                    setCardSectionsOrder(res.data.order);
                } else {
                    setCardSectionsOrder(defaultOrder); // fallback
                }
            })
            .catch((err) => {
                console.warn("⚠️ Failed to fetch card section order:", err);
                setCardSectionsOrder(defaultOrder);
            });
    }, [cardFormData?.company_id]);

    const componentMap = {
        phoneNumbers: (
            <CardPreviewPhones
                key="phoneNumbers"
                cardPhones={cardFormData?.card_phone_numbers ?? []}
            />
        ),
        emails: (
            <CardPreviewEmails
                key="emails"
                cardEmails={cardFormData?.card_emails ?? []}
            />
        ),
        websites: (
            <CardPreviewWebsites
                key="websites"
                cardWebsites={cardFormData?.card_websites ?? []}
            />
        ),
        addresses: (
            <CardPreviewAdresses
                key="addresses"
                cardAddresses={cardFormData?.card_addresses ?? []}
            />
        ),
        buttons: (
            <CardPreviewButtons
                key="buttons"
                cardButtons={cardFormData?.card_buttons ?? []}
            />
        ),
    };

    const renderOrder = cardSectionsOrder?.length
        ? cardSectionsOrder
        : defaultOrder;

    return (
        <div className="space-y-2">
            {renderOrder.map((sectionId) => componentMap[sectionId] ?? null)}
        </div>
    );
}
