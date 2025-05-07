import { redirect } from "next/navigation";
import { auth } from "../../auth";
import LandingPageClient from "@/components/LandingPageClient";

export default async function Home() {
  const session = await auth();

  if (!session) {
    redirect("/register");
  }

  return (
    <div className="min-h-screen bg-[#0a0118] bg-gradient-to-b from-gray-950 via-purple-950/30 to-gray-950 text-white overflow-hidden">
      <LandingPageClient session={session} />
    </div>
  );
}
