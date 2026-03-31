import { PaywallScreen } from "@/components/paywall/PaywallScreen";
import { LocaleProvider } from "@/hooks/useTranslation";

export default function SubscribePage() {
  return (
    <LocaleProvider>
      <PaywallScreen />
    </LocaleProvider>
  );
}
