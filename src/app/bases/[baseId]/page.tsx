import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import BasePage from "./BasePage";

export default async function Base({ params }: {params: Promise<{ baseId: string }> }) {
  const { baseId } = await params;
  const userId = (await cookies()).get("userid")?.value;

  if (!userId) {
    redirect("/");
  }

  return <BasePage baseId={baseId} userId={userId} />;
}

