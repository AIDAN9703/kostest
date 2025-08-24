import BookingNavbar from "@/features/bookings/components/BookingNavbar";
import { ReactNode } from "react";

interface BookingDetailsLayoutProps {
  children: ReactNode;
  auth: ReactNode;
}

export default function BookingDetailsLayout({ 
  children, 
  auth 
}: BookingDetailsLayoutProps) {
  return (
    <>
      <BookingNavbar />
      {children}
      {auth}
    </>
  );
}
