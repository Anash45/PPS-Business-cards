"use client";

import { useState } from "react";
import Button from "./Button";
import { csvFieldDefinitions } from "@/utils/csvFieldDefinitions";

export default function SampleCsvDownload({ cards }) {
    const [saving, setSaving] = useState(false);

    const handleDownload = async () => {
        if (!cards?.length) return;

        setSaving(true);

        try {
            // Extract headers from csvFieldDefinitions
            const headers = csvFieldDefinitions.map((f) => f.name);

            // Prepare rows: first column = card_code, others empty
            const rows = cards.map((card) => {
                const row = headers.map((header, index) =>
                    index === 0 ? card.code || "" : ""
                );
                return row;
            });

            // Build CSV string
            const csvContent = [
                headers.join(","), // header row
                ...rows.map((r) => r.map((v) => `"${v}"`).join(",")), // data rows
            ].join("\n");

            // Create downloadable file
            const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = "base_sample.csv";
            link.click();
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error("CSV generation failed:", error);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="flex justify-end">
            <Button onClick={handleDownload} disabled={saving}>
                {saving ? "Saving..." : "Download Base CSV"}
            </Button>
        </div>
    );
}
