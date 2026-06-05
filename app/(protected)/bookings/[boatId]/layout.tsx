import { ReactNode } from "react";
import { notFound } from "next/navigation";
import { getBoatById } from "@/features/boats/actions/boat-actions";
import BoatProvider from "@/features/bookings/components/BoatProvider";
import BookingNavbar from "@/features/bookings/components/BookingNavbar";

export const dynamic = 'force-dynamic';


interface BookingLayoutProps {
  children: ReactNode;
  auth: ReactNode;
  params: Promise<{ boatId: string }>;
}

export default async function BookingLayout({ children, auth, params }: BookingLayoutProps) {
  const { boatId } = await params;
  const boat = await getBoatById(boatId);
  if (!boat) {
    notFound();
  }

  return (
    <BoatProvider boat={boat}>
      <BookingNavbar />
      {children}
      {auth}
    </BoatProvider>
  );
}
