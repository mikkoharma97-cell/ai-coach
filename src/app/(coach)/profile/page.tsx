import { redirect } from "next/navigation";

/** Alias — preferences are the profile source of truth */
export default function ProfileRedirectPage() {
  redirect("/preferences");
}
