import { NextResponse } from "next/server";
import { auth } from "../../auth";
import Link from "next/link";

export default async function Home() {
  const session = await auth();
  console.log(session);

  if (!session) {
    NextResponse.redirect("/register");
  }

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <h1 className="text-4xl font-bold text-foreground">
          Welcome to Castify
        </h1>

        <div className="flex flex-col gap-4">
          <Link
            href="/new"
            className="bg-primary text-primary-foreground py-3 px-4 rounded-lg transition-all duration-200 font-medium"
          >
            Create new podcast
          </Link>
          <Link
            href="/playlist"
            className="bg-secondary text-secondary-foreground py-3 px-4 rounded-lg transition-all duration-200 font-medium"
          >
            Check your podcasts
          </Link>
        </div>
      </main>
    </div>
  );
}
