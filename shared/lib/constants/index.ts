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


// Re-export fee constants for backward compatibility
export * from './navigation-data';
export * from './map-constants';