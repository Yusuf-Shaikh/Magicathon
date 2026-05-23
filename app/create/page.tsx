import { redirect } from "next/navigation";

// /create was merged into /. Anyone hitting this URL (bookmarks, old links)
// gets redirected to the homepage where the create flow now lives.
export default function CreateRedirect() {
  redirect("/");
}
