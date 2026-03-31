import { EntryGate } from "@/components/EntryGate";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Coach",
  description: "Opening your coach…",
  robots: { index: true, follow: true },
};

export default function RootPage() {
  return <EntryGate />;
}
