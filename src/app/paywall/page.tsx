import { PaywallV1Screen } from "@/components/paywall/PaywallV1Screen";
import { LocaleProvider } from "@/hooks/useTranslation";

/** Alias route — same premium screen as /subscribe */
export default function PaywallAliasPage() {
  return (
    <LocaleProvider>
      <PaywallV1Screen />
    </LocaleProvider>
  );
}
