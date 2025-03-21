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
    username: "Username",
    email: "Email",
    phoneNumber: "Phone Number",
    birthday: "Birthday",
    password: "Password",
  };
  
  export const FIELD_TYPES = {
    firstName: "text",
    lastName: "text",
    username: "text",
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
  