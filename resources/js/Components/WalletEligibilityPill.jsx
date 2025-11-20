export default function WalletEligibilityPill({ eligibility }) {
    const isEligible = Boolean(eligibility);

    const cfg = isEligible
        ? {
              label: "Eligible",
              bg: "bg-green-100",
              text: "text-green-800",
              ring: "ring-green-200",
          }
        : {
              label: "Not Eligible",
              bg: "bg-red-100",
              text: "text-red-800",
              ring: "ring-red-200",
          };

    return (
        <span
            role="eligibility"
            aria-live="polite"
            className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${cfg.bg} ${cfg.text} ring-1 ${cfg.ring}`}
            title={cfg.label}
        >
            <span>{cfg.label}</span>
        </span>
    );
}
