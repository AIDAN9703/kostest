import Header from '@/components/Header';
import { ReactNode } from 'react'
import { auth } from "@/auth";
import { db } from "@/database/db";
import { users } from "@/database/schema";
import { eq } from "drizzle-orm";
import { after } from "next/server";

const Layout = async ({ children }: { children: ReactNode }) => {
  const session = await auth();

  after(async () => {
    if (!session?.user?.id) return;

    const user = await db
    .select()
    .from(users)
    .where(eq(users.id, session?.user?.id))
    .limit(1);
  });

  return (
    <>
      <Header session={session}/>
      <main>
        {children}
      </main>
    </>
  );
};

export default Layout;
