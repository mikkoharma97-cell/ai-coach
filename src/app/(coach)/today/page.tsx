import { redirect } from "next/navigation";

/** Alias reitti — Today on `/app` (onboarding ohjaa suoraan `/app`). */
export default function TodayAliasPage() {
  redirect("/app");
}
