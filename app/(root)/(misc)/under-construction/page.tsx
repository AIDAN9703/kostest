import React from "react";
import Image from "next/image";

const UnderConstructionPage = () => {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
      <div className="text-center">
        <Image
          src="/icons/transparent-logo.png"
          alt="KOS Boats Logo"
          width={200}
          height={100}
          className="mx-auto mb-8"
        />

        <h1 className="text-2xl font-bold text-gray-800">Under Construction</h1>
        <p className="text-gray-600 my-2">
          We're working on something great. Check back soon!
        </p>
      </div>
    </div>
  );
};

export default UnderConstructionPage;
