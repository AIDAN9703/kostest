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
  
  export const adminSideBarLinks = [
    {
      img: "/icons/admin/home.svg",
      route: "/admin",
      text: "Home",
    },
    {
      img: "/icons/admin/users.svg",
      route: "/admin/users",
      text: "All Users",
    },
    {
      img: "/icons/admin/book.svg",
      route: "/admin/books",
      text: "All Books",
    },
    {
      img: "/icons/admin/bookmark.svg",
      route: "/admin/borrow-records",
      text: "Borrow Records",
    },
    {
      img: "/icons/admin/user.svg",
      route: "/admin/account-requests",
      text: "Account Requests",
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
  
  export const sampleBoats = [
    {
      id: 1,
      owner: "KOS Yachts",
      title: "The Midnight Dutchess",
      type: "Luxury Motoryacht",
      year: "2024",
      rating: 4.9,
      length: 32,
      features: 6,
      height: 5,
      description: "Experience ultimate luxury with our state-of-the-art motoryacht featuring panoramic views, premium amenities, and professional crew. Perfect for coastal exploration and private events.",
      coverColor: "#1c1f40",
      coverUrl: "https://images.yachtworld.com/resize/1/67/84/7226784_20190923073858032_1_XLARGE.jpg",
      videoUrl: "/sample-video.mp4",
      summary: "2024 model with cutting-edge navigation systems and eco-friendly engines",
      price: 4500,
      cabins: 4,
      guests: 10
    },
  ]
  
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
  
  export const borrowStatuses = [
    {
      value: "overdue",
      label: "Overdue",
      bgColor: "bg-[#FFF1F3]",
      textColor: "text-[#C01048]",
    },
    {
      value: "borrowed",
      label: "Borrowed",
      bgColor: "bg-[#F9F5FF]",
      textColor: "text-[#6941C6]",
    },
    {
      value: "returned",
      label: "Returned",
      bgColor: "bg-[#F0F9FF]",
      textColor: "text-[#026AA2]",
    },
  ];