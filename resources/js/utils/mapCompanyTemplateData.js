export function mapCompanyTemplateData(
    selectedCompany,
    selectedCard,
    options = {}
) {
    if (!selectedCompany) return {};

    const template = selectedCompany?.card_template;

    return {
        company_id: template?.company_id ?? null,
        name_text_color: template?.name_text_color ?? "#000000",
        company_name: template?.company_name ?? selectedCompany?.name ?? "",
        contact_btn_text: template?.contact_btn_text ?? "Save contact details",
        contact_btn_text_de:
            template?.contact_btn_text_de ?? "Kontaktdaten speichern",
        company_text_color: template?.company_text_color ?? "#000000",
        card_bg_color: template?.card_bg_color ?? "#ffffff",
        btn_bg_color: template?.btn_bg_color ?? "#87B88C",
        btn_text_color: template?.btn_text_color ?? "#ffffff",
        phone_bg_color: template?.phone_bg_color ?? "#87B88C",
        phone_text_color: template?.phone_text_color ?? "#ffffff",
        email_bg_color: template?.email_bg_color ?? "#87B88C",
        email_text_color: template?.email_text_color ?? "#ffffff",
        address_bg_color: template?.address_bg_color ?? "#87B88C",
        address_text_color: template?.address_text_color ?? "#ffffff",
        website_bg_color: template?.website_bg_color ?? "#87B88C",
        website_text_color: template?.website_text_color ?? "#ffffff",
        contact_btn_text: template?.contact_btn_text ?? "Save card",
        vcard_btn_bg_color: template?.vcard_btn_bg_color ?? "#87B88C",
        vcard_btn_text_color: template?.vcard_btn_text_color ?? "#ffffff",
        buttons_size: template?.buttons_size ?? "14",
        banner_image: null,
        banner_image_url: template?.banner_image
            ? `/storage/${template.banner_image}`
            : null,

        // Wallet QR
        wallet_logo_image: null,
        wallet_logo_image_url: template?.wallet_logo_image
            ? `/storage/${template.wallet_logo_image}`
            : null,
        wallet_text_color: template?.wallet_text_color ?? "#000000",
        wallet_bg_color: template?.wallet_bg_color ?? "#c4f1c8",
        wallet_label_1: template?.wallet_label_1 ?? "Name",
        wallet_label_2: template?.wallet_label_2 ?? "Firmenname",
        wallet_label_3: template?.wallet_label_3 ?? "Titel",
        wallet_qr_caption: template?.wallet_qr_caption ?? "QR-Code scannen",
        wallet_title: template?.wallet_title ?? "Pass Name",

        wallet_name:
            template?.wallet_name ??
            [
                template?.title?.trim() || "",
                template?.first_name?.trim() || "John",
                template?.last_name?.trim() || "Doe"
            ]
                .filter(Boolean)
                .join(" "),
        wallet_company_name: template?.company_name ?? "Firmenname",
        wallet_position: template?.position ?? "Position",
        wallet_qr_string: "Hello there!",

        // Conditionally add selectedCard fields only if it exists
        ...(selectedCard
            ? {
                code: selectedCard.code ?? "",
                salutation: selectedCard.salutation ?? "",
                title: selectedCard.title ?? "",
                first_name: selectedCard.first_name ?? "",
                last_name: selectedCard.last_name ?? "",
                primary_email: selectedCard?.primary_email ?? "",
                degree: selectedCard.degree ?? "",
                degree_de: selectedCard.degree_de ?? "",
                position: selectedCard.position ?? "",
                position_de: selectedCard.position_de ?? "",
                department: selectedCard.department ?? "",
                department_de: selectedCard.department_de ?? "",
                profile_image_url: selectedCard?.profile_image
                    ? `/storage/${selectedCard.profile_image}`
                    : "/assets/images/profile-placeholder.png",
                profile_image: null,
                wallet_qr_string:
                    selectedCard?.card_wallet?.download_link ??
                    "Hello there!",
                wallet_name:
                    template?.wallet_name ??
                    [
                        selectedCard?.title?.trim() || "",
                        selectedCard?.first_name?.trim() || "John",
                        selectedCard?.last_name?.trim() || "Doe"
                    ]
                        .filter(Boolean) // removes empty strings
                        .join(" "),
                wallet_position: selectedCard?.position ?? "Position",
            }
            : {}),

        // ✅ Include card_social_links with IDs for updates/deletes
        card_social_links: Array.isArray(selectedCompany?.card_social_links)
            ? selectedCompany.card_social_links.map((link) => ({
                id: link.id || null,
                icon: link.icon || "",
                url: link.url || "",
                company_id: link.company_id || null,
                card_id: link.card_id || null,
            }))
            : [],

        // ✅ Include card_phone_numbers
        card_phone_numbers: Array.isArray(selectedCompany?.card_phone_numbers)
            ? selectedCompany.card_phone_numbers.map((phone) => ({
                id: phone.id || null,
                icon: phone.icon || "",
                phone_number: phone.phone_number || "",
                is_hidden: phone.is_hidden ?? false,
                type: phone.type ?? "Work",
                company_id: phone.company_id || null,
                card_id: phone.card_id || null,
                label: phone.label || "",
                label_de: phone.label_de || "",
            }))
            : [],

        // ✅ Include card_emails
        card_emails: Array.isArray(selectedCompany?.card_emails)
            ? selectedCompany.card_emails.map((email) => ({
                id: email.id || null,
                email: email.email || "",
                is_hidden: email.is_hidden ?? false,
                type: email.type ?? "Work",
                company_id: email.company_id || null,
                card_id: email.card_id || null,
                label: email.label || "",
                label_de: email.label_de || "",
            }))
            : [],

        // ✅ Include card_addresses
        card_addresses: Array.isArray(selectedCompany?.card_addresses)
            ? selectedCompany.card_addresses.map((addr) => ({
                id: addr.id || null,
                street: addr.street || "",
                house_number: addr.house_number || "",
                zip: addr.zip || "",
                city: addr.city || "",
                country: addr.country || "",
                is_hidden: addr.is_hidden ?? false,
                type: addr.type ?? "Work",
                company_id: addr.company_id || null,
                card_id: addr.card_id || null,
                label: addr.label || "",
                label_de: addr.label_de || "",
            }))
            : [],

        // ✅ Include card_buttons
        card_buttons: Array.isArray(selectedCompany?.card_buttons)
            ? selectedCompany.card_buttons.map((btn) => ({
                id: btn.id || null,
                button_text: btn.button_text || "",
                button_text_de: btn.button_text_de || "",
                button_link: btn.button_link || "",
                icon: btn.icon || "",
                company_id: btn.company_id || null,
                card_id: btn.card_id || null,
            }))
            : [],

        // ✅ Include card_websites
        card_websites: Array.isArray(selectedCompany?.card_websites)
            ? selectedCompany.card_websites.map((website) => ({
                id: website.id || null,
                url: website.url || "",
                icon: website.icon || null,
                is_hidden: website.is_hidden ?? false,
                company_id: website.company_id || null,
                card_id: website.card_id || null,
                label: website.label || "",
                label_de: website.label_de || "",
            }))
            : [],
    };
}
