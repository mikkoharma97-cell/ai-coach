"use client";

import { FeedbackDebugClient } from "@/app/feedback/FeedbackDebugClient";
import { LocaleProvider } from "@/hooks/useTranslation";

export default function FeedbackPage() {
  return (
    <LocaleProvider>
      <FeedbackDebugClient />
    </LocaleProvider>
  );
}
