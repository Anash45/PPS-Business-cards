import React, { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import axios from "axios";
import { toast } from "react-hot-toast";

import CardFormPhoneNumbers from "./CardFormPhoneNumbers";
import CardFormEmails from "./CardFormEmails";
import CardFormWebsites from "./CardFormWebsites";
import CardFormAddresses from "./CardFormAddresses";
import CardFormButtons from "./CardFormButtons";
import { useGlobal } from "@/context/GlobalProvider";
import { GripVertical } from "lucide-react";

const cardComponentMap = {
    phoneNumbers: <CardFormPhoneNumbers />,
    emails: <CardFormEmails />,
    websites: <CardFormWebsites />,
    addresses: <CardFormAddresses />,
    buttons: <CardFormButtons />,
};

export default function CardFormSections() {
    const { cardFormData, cardSectionsOrder, setCardSectionsOrder, isTemplate } =
        useGlobal();

    const [sections, setSections] = useState([
        { id: "phoneNumbers", label: "Phone Numbers" },
        { id: "emails", label: "Emails" },
        { id: "websites", label: "Websites" },
        { id: "addresses", label: "Addresses" },
        { id: "buttons", label: "Buttons" },
    ]);

    // ✅ Fetch saved order
    useEffect(() => {
        axios
            .get(`/company/${cardFormData.company_id}/card-sections-order`)
            .then((res) => {
                if (res.data.order && Array.isArray(res.data.order)) {
                    setCardSectionsOrder(res.data.order);
                    setSections((prev) =>
                        res.data.order
                            .map((id) => prev.find((item) => item.id === id))
                            .filter(Boolean)
                    );
                }
            })
            .catch((err) => console.warn("⚠️ Failed to load saved order", err));
    }, [cardFormData]);

    // ✅ Handle reorder (only when template)
    const handleDragEnd = async (result) => {
        if (!isTemplate || !result.destination) return;

        const reordered = Array.from(sections);
        const [moved] = reordered.splice(result.source.index, 1);
        reordered.splice(result.destination.index, 0, moved);

        const newOrder = reordered.map((s) => s.id);

        if (JSON.stringify(newOrder) === JSON.stringify(cardSectionsOrder)) {
            console.log("ℹ️ Order unchanged — skipping update");
            return;
        }

        setSections(reordered);
        setCardSectionsOrder(newOrder);

        try {
            const response = await axios.post(
                `/company/${cardFormData.company_id}/card-sections-order`,
                { order: newOrder }
            );
            console.log("✅ Order saved response:", response.data);
            toast.success("Order saved!");
        } catch (error) {
            console.error("❌ Failed to save order:", error);
            toast.error("Failed to save order");
        }
    };

    return (
        <div>
            <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="sections">
                    {(provided) => (
                        <div
                            {...provided.droppableProps}
                            ref={provided.innerRef}
                            className="space-y-4"
                        >
                            {sections.map((section, index) => (
                                <Draggable
                                    key={section.id}
                                    draggableId={section.id}
                                    index={index}
                                    isDragDisabled={!isTemplate} // 🔒 disable dragging if not template
                                >
                                    {(provided) => (
                                        <div
                                            ref={provided.innerRef}
                                            {...provided.draggableProps}
                                            {...(isTemplate
                                                ? provided.dragHandleProps
                                                : {})}
                                            className="relative"
                                        >
                                            <span
                                                className={`absolute left-1 top-1 z-10 ${
                                                    isTemplate
                                                        ? "cursor-grab text-gray-700"
                                                        : "cursor-not-allowed text-gray-400 opacity-50"
                                                }`}
                                            >
                                                <GripVertical className="h-5 w-5" />
                                            </span>
                                            {cardComponentMap[section.id]}
                                        </div>
                                    )}
                                </Draggable>
                            ))}
                            {provided.placeholder}
                        </div>
                    )}
                </Droppable>
            </DragDropContext>
        </div>
    );
}
