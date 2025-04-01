import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import BasePage from "./BasePage";

export default async function Page(props: any) {

  const baseId = (await props.params).baseId;

  const userId = (await cookies()).get("userid")?.value;

  if (!userId) {
    redirect("/");
  }

  return <BasePage baseId={baseId} userId={userId} />;
}

