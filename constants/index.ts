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
  
// Booking Form Configuration
export const BOOKING_FIELD_NAMES = {
  startDate: "Date",
  startTime: "Start Time",
  endTime: "End Time",
  numberOfHours: "Duration",
  numberOfPassengers: "Passengers",
  specialRequests: "Special Requests",
  needsCaptain: "Captain",
};

export const BOOKING_FIELD_TYPES = {
  startDate: "date",
  startTime: "time",
  endTime: "time",
  numberOfHours: "select",
  numberOfPassengers: "select",
  specialRequests: "textarea",
  needsCaptain: "toggle",
};

export const BOOKING_FIELD_VISIBILITY = {
  startDate: "always",
  startTime: "always",
  endTime: "hidden", // Calculated automatically
  numberOfHours: "always",
  numberOfPassengers: "always",
  specialRequests: "always",
  needsCaptain: "conditional", // Only if not required by boat
};

export const BOOKING_FIELD_PLACEHOLDERS = {
  startDate: "Select date",
  startTime: "Select time",
  numberOfHours: "Select hours",
  numberOfPassengers: "Number of passengers",
  specialRequests: "Any special requests for the captain?",
};
  