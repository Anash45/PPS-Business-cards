export const csvFieldDefinitions = [
    { name: "card_code", required: true },
    { name: "salutation", required: true },
    { name: "title", required: false },
    { name: "first_name", required: true, validate: "nonEmpty" },
    { name: "last_name", required: true, validate: "nonEmpty" },
    { name: "degree", required: false },
    { name: "position", required: true },
    { name: "department", required: true },
    { name: "profile_image_name", required: false },

    // Websites links
    { name: "website_url_1", required: false, validate: "url" },
    { name: "website_label_1", required: false },
    { name: "website_url_2", required: false, validate: "url" },
    { name: "website_label_2", required: false },
    { name: "website_url_3", required: false, validate: "url" },
    { name: "website_label_3", required: false },
    { name: "website_url_4", required: false, validate: "url" },
    { name: "website_label_4", required: false },
    // Email fields with labels
    { name: "card_email_1", required: false, validate: "email" },
    { name: "card_email_label_1", required: false },
    { name: "card_email_1_type", required: false },

    { name: "card_email_2", required: false, validate: "email" },
    { name: "card_email_label_2", required: false },
    { name: "card_email_2_type", required: false },

    { name: "card_email_3", required: false, validate: "email" },
    { name: "card_email_label_3", required: false },
    { name: "card_email_3_type", required: false },

    { name: "card_email_4", required: false, validate: "email" },
    { name: "card_email_label_4", required: false },
    { name: "card_email_4_type", required: false },

    // Phone fields with labels
    { name: "card_phone_1", required: false, validate: "phone" },
    { name: "card_phone_label_1", required: false },
    { name: "card_phone_1_type", required: false },

    { name: "card_phone_2", required: false, validate: "phone" },
    { name: "card_phone_label_2", required: false },
    { name: "card_phone_2_type", required: false },

    { name: "card_phone_3", required: false, validate: "phone" },
    { name: "card_phone_label_3", required: false },
    { name: "card_phone_3_type", required: false },

    { name: "card_phone_4", required: false, validate: "phone" },
    { name: "card_phone_label_4", required: false },
    { name: "card_phone_4_type", required: false },

    // Address 1 fields
    { name: "address_1_label", required: false },
    { name: "address_1_type", required: false },
    { name: "address_1_street", required: false },
    { name: "address_1_house_number", required: false },
    { name: "address_1_zip", required: false },
    { name: "address_1_city", required: false },
    { name: "address_1_country", required: false },

    // Address 2 fields
    { name: "address_2_label", required: false },
    { name: "address_2_type", required: false },
    { name: "address_2_street", required: false },
    { name: "address_2_house_number", required: false },
    { name: "address_2_zip", required: false },
    { name: "address_2_city", required: false },
    { name: "address_2_country", required: false },

    // Address 3 fields
    { name: "address_3_label", required: false },
    { name: "address_3_type", required: false },
    { name: "address_3_street", required: false },
    { name: "address_3_house_number", required: false },
    { name: "address_3_zip", required: false },
    { name: "address_3_city", required: false },
    { name: "address_3_country", required: false },

    // Address 4 fields
    { name: "address_4_label", required: false },
    { name: "address_4_type", required: false },
    { name: "address_4_street", required: false },
    { name: "address_4_house_number", required: false },
    { name: "address_4_zip", required: false },
    { name: "address_4_city", required: false },
    { name: "address_4_country", required: false },

    // Button fields
    { name: "card_button_text_1", required: false },
    { name: "card_button_link_1", required: false, validate: "url" },
    { name: "card_button_text_2", required: false },
    { name: "card_button_link_2", required: false, validate: "url" },
    { name: "card_button_text_3", required: false },
    { name: "card_button_link_3", required: false, validate: "url" },
    { name: "card_button_text_4", required: false },
    { name: "card_button_link_4", required: false, validate: "url" },

    // Social links
    { name: "social_link_1", required: false, validate: "url" },
    { name: "social_link_2", required: false, validate: "url" },
    { name: "social_link_3", required: false, validate: "url" },
    { name: "social_link_4", required: false, validate: "url" },
    { name: "social_link_5", required: false, validate: "url" },
];
