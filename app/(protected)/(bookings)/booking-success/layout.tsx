import BookingNavbar from "@/features/bookings/components/BookingNavbar";
import { ReactNode } from "react";

interface BookingSuccessLayoutProps {
  children: ReactNode;
}

export default function BookingSuccessLayout({ 
  children
}: BookingSuccessLayoutProps) {
  return (
    <>
      <BookingNavbar />
      {children}
    </>
  );
}
