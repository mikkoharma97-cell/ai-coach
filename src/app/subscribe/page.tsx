import { PaywallV1Screen } from "@/components/paywall/PaywallV1Screen";
import { LocaleProvider } from "@/hooks/useTranslation";

export default function SubscribePage() {
  return (
    <LocaleProvider>
      <PaywallV1Screen />
    </LocaleProvider>
  );
}
