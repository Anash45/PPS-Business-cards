export function mapCompanyTemplateData(
    selectedCompany,
    selectedCard,
    options = {}
) {
    console.log(
        "Mapping company template data for:",
        selectedCompany,
        selectedCard
    );

    if (!selectedCompany) return {};

    const template = selectedCompany?.card_template;

    return {
        name_text_color: template?.name_text_color ?? "#000000",
        company_name: template?.company_name ?? selectedCompany?.name ?? "",
        contact_btn_text: template?.contact_btn_text ?? "Save contact details",
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
        contact_btn_text: template?.contact_btn_text ?? "Save card",
        vcard_btn_bg_color: template.vcard_btn_bg_color,
        vcard_btn_text_color: template.vcard_btn_text_color,
        banner_image: null,
        banner_image_url: template?.banner_image
            ? `/storage/${template.banner_image}`
            : null,

        // Conditionally add selectedCard fields only if it exists
        ...(selectedCard
            ? {
                  code: selectedCard.code ?? "",
                  salutation: selectedCard.salutation ?? "",
                  title: selectedCard.title ?? "",
                  first_name: selectedCard.first_name ?? "",
                  last_name: selectedCard.last_name ?? "",
                  degree: selectedCard.degree ?? "",
                  position: selectedCard.position ?? "",
                  department: selectedCard.department ?? "",
                  profile_image_url: selectedCard?.profile_image
                      ? `/storage/${selectedCard.profile_image}`
                      : "/assets/images/profile-placeholder.png",
                  profile_image: null,
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
                  phone_number: phone.phone_number || "",
                  is_hidden: phone.is_hidden ?? false,
                  type: phone.type ?? "Work",
                  company_id: phone.company_id || null,
                  card_id: phone.card_id || null,
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
              }))
            : [],

        // ✅ Include card_buttons
        card_buttons: Array.isArray(selectedCompany?.card_buttons)
            ? selectedCompany.card_buttons.map((btn) => ({
                  id: btn.id || null,
                  button_text: btn.button_text || "",
                  button_link: btn.button_link || "",
                  icon: btn.icon || "",
                  company_id: btn.company_id || null,
                  card_id: btn.card_id || null,
              }))
            : [],
    };
}
