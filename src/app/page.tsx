import { EntryGate } from "@/components/EntryGate";
import { APP_DESCRIPTION, APP_DISPLAY_NAME } from "@/config/appInfo";
import { LocaleProvider } from "@/hooks/useTranslation";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: APP_DISPLAY_NAME,
  description: APP_DESCRIPTION,
  robots: { index: true, follow: true },
};

export default function RootPage() {
  return (
    <LocaleProvider>
      <EntryGate />
    </LocaleProvider>
  );
}
