export function mapCompanyTemplateData(selectedCompany, options = {}) {
    console.log(
        "Mapping company template data for:",
        selectedCompany,
        selectedCompany?.card_template?.name_text_color
    );

    if (!selectedCompany) return {};

    const template = selectedCompany?.card_template;

    return {
        name_text_color: template?.name_text_color ?? "#000000",
        company_name: template?.company_name ?? selectedCompany?.name ?? "",
        company_text_color: template?.company_text_color ?? "#000000",
        card_bg_color: template?.card_bg_color ?? "#000000",
        btn_bg_color: template?.btn_bg_color ?? "#87B88C",
        btn_text_color: template?.btn_text_color ?? "#ffffff",
        banner_image: null,
        banner_image_url: template?.banner_image
            ? `/storage/${template.banner_image}`
            : null,

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
                  text_color:
                      phone.text_color || template?.btn_text_color || "#ffffff",
                  bg_color:
                      phone.bg_color || template?.btn_bg_color || "#87B88C",
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
                  text_color:
                      email.text_color || template?.btn_text_color || "#ffffff",
                  bg_color:
                      email.bg_color || template?.btn_bg_color || "#87B88C",
                  company_id: email.company_id || null,
                  card_id: email.card_id || null,
              }))
            : [],

        // ✅ Include card_addresses
        card_addresses: Array.isArray(selectedCompany?.card_addresses)
            ? selectedCompany.card_addresses.map((addr) => ({
                  id: addr.id || null,
                  address: addr.address || "",
                  is_hidden: addr.is_hidden ?? false,
                  text_color:
                      addr.text_color || template?.btn_text_color || "#ffffff",
                  bg_color:
                      addr.bg_color || template?.btn_bg_color || "#87B88C",
                  company_id: addr.company_id || null,
                  card_id: addr.card_id || null,
              }))
            : [],

        profile_image: null,
        profile_image_url: template?.profile_image
            ? `/storage/${template.profile_image}`
            : null,
    };
}
