export const navigationLinks = [
    {
      href: "/library",
      label: "Library",
    },
  
    {
      img: "/icons/user.svg",
      selectedImg: "/icons/user-fill.svg",
      href: "/my-profile",
      label: "My Profile",
    },
  ];
  
  
  export const FIELD_NAMES = {
    firstName: "First Name",
    lastName: "Last Name",
    //username: "Username",
    email: "Email",
    phoneNumber: "Phone Number",
    birthday: "Birthday",
    password: "Password",
  };
  
  export const FIELD_TYPES = {
    firstName: "text",
    lastName: "text",
    //username: "text",
    email: "email",
    phoneNumber: "number",
    birthday: "date",
    password: "password",
  };
  
  
  export const sorts = [
    {
      value: "oldest",
      label: "Oldest",
    },
    {
      value: "newest",
      label: "Newest",
    },
    {
      value: "available",
      label: "Available",
    },
    {
      value: "highestRated",
      label: "Highest Rated",
    },
  ];
  
  export const userRoles = [
    {
      value: "user",
      label: "User",
      bgColor: "bg-[#FDF2FA]",
      textColor: "text-[#C11574]",
    },
    {
      value: "admin",
      label: "Admin",
      bgColor: "bg-[#ECFDF3]",
      textColor: "text-[#027A48]",
    },
  ];
  
export const TIME_ZONE = Intl.DateTimeFormat().resolvedOptions().timeZone;

export const RESPONSE_MESSAGES = {
  success: "Operation completed successfully",
  error: "An error occurred. Please try again.",
  unauthorized: "You are not authorized to perform this action",
  notFound: "The requested resource was not found",
  validation: "Please check your input and try again"
};

export const BOOKING_STATUS_COLORS = {
  PENDING: { bg: "#FEF3C7", text: "#92400E", border: "#F59E0B" },
  CONFIRMED: { bg: "#D1FAE5", text: "#065F46", border: "#10B981" },
  CANCELLED: { bg: "#FEE2E2", text: "#991B1B", border: "#EF4444" },
  COMPLETED: { bg: "#DBEAFE", text: "#1E40AF", border: "#3B82F6" },
  EXPIRED: { bg: "#F3F4F6", text: "#374151", border: "#6B7280" }
};

export const BOOKING_TIME_SLOTS = [
  { value: "09:00", label: "9:00 AM" },
  { value: "10:00", label: "10:00 AM" },
  { value: "11:00", label: "11:00 AM" },
  { value: "12:00", label: "12:00 PM" },
  { value: "13:00", label: "1:00 PM" },
  { value: "14:00", label: "2:00 PM" },
  { value: "15:00", label: "3:00 PM" },
  { value: "16:00", label: "4:00 PM" },
  { value: "17:00", label: "5:00 PM" }
];

export const BOOKING_VALIDATION_MESSAGES = {
  startDateTime: "Start date and time are required",
  pricingTierId: "Please select a duration option",
  numberOfPassengers: "At least one passenger is required",
  needsCaptain: "Please specify if you need a captain",
  specialRequests: "Special requests are optional"
};
  

// Re-export fee constants for backward compatibility
export { TAX_RATE, SERVICE_FEE_RATE, calculateTaxAmount, calculateServiceFee, calculateTotalWithFees } from './fees-constants';