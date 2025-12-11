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
  

  
export const TIME_ZONE = Intl.DateTimeFormat().resolvedOptions().timeZone;

export const RESPONSE_MESSAGES = {
  success: "Operation completed successfully",
  error: "An error occurred. Please try again.",
  unauthorized: "You are not authorized to perform this action",
  notFound: "The requested resource was not found",
  validation: "Please check your input and try again"
};


// Admin Dashboard Color Themes
export const COLOR_THEMES = {
  blue: {
    border: "hover:border-blue-200",
    value: "text-blue-700",
  },
  emerald: {
    border: "hover:border-emerald-200",
    value: "text-emerald-700",
  },
  purple: {
    border: "hover:border-purple-200",
    value: "text-purple-700",
  },
  amber: {
    border: "hover:border-amber-200",
    value: "text-amber-700",
  },
} as const;

export type ColorTheme = keyof typeof COLOR_THEMES;


// Re-export fee constants for backward compatibility
export { TAX_RATE, SERVICE_FEE_RATE, calculateTaxAmount, calculateServiceFee, calculateTotalWithFees } from './fees-constants';