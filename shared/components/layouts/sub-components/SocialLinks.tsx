"use client";

import React from "react";
import {
  FaYoutube,
  FaTiktok,
  FaInstagram,
  FaInstagramSquare,
} from "react-icons/fa";

const SocialLinks: React.FC = () => {
  // Unified styling system - consistent with navigation
  const styles = {
    container: "hidden md:flex items-center gap-3",
    link: "transition-colors focus:outline-hidden focus-visible:ring-2 focus-visible:ring-primary/50 rounded-md p-1.5 text-gray-600 hover:text-primary",
    icon: "w-5 h-5",
  };

  const socialLinks = [
    {
      href: "https://instagram.com/kosyachts",
      icon: FaInstagramSquare,
      label: "Instagram",
    },
    {
      href: "https://www.tiktok.com/@kosyachts",
      icon: FaTiktok,
      label: "TikTok",
    },
    {
      href: "https://www.youtube.com/@Kosyachts",
      icon: FaYoutube,
      label: "YouTube",
    },
  ];

  return (
    <div className={styles.container}>
      {socialLinks.map(({ href, icon: Icon, label }) => (
        <a
          key={label}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.link}
        >
          <Icon className={styles.icon} />
          <span className="sr-only">{label}</span>
        </a>
      ))}
    </div>
  );
};

export default React.memo(SocialLinks);
