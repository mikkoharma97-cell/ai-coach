import { PaywallV1Screen } from "@/components/paywall/PaywallV1Screen";
import { LocaleProvider } from "@/hooks/useTranslation";

/** Täysi paywall (trial loppu / suora URL). /subscribe ja /premium → redirect tänne. */
export default function PaywallAliasPage() {
  return (
    <LocaleProvider>
      <PaywallV1Screen />
    </LocaleProvider>
  );
}
