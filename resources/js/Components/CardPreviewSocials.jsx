export default function CardPreviewSocials({ cardSocialsLinks }) {
    return cardSocialsLinks?.length ? (
        <div className="flex items-center gap-2 flex-wrap justify-center">
            {(cardSocialsLinks || []).map(
                (link, index) =>
                    link.url && link.icon !== "" && (
                        <a
                            key={index}
                            href={link.url || "#"}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-500 hover:text-gray-700 transition"
                        >
                            <img
                                src={`/assets/images/icons/${link.icon
                                    .replace(/^Fa/, "")
                                    .toLowerCase()}.png`}
                                alt={link.icon}
                                className="h-7"
                            />
                        </a>
                    )
            )}
        </div>
    ) : null;
}
