import { PaywallScreen } from "@/components/paywall/PaywallScreen";
import { LocaleProvider } from "@/hooks/useTranslation";

/** Alias route — same premium screen as /subscribe */
export default function PremiumPage() {
  return (
    <LocaleProvider>
      <PaywallScreen />
    </LocaleProvider>
  );
}
