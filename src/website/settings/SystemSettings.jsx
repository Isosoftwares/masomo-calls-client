import React from "react";
import Schools from "./Schools";
import PhoneCategories from "./PhoneCategories";

function SystemSettings() {
  return (
    <div className="py-2">
      <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
        <div className="w-full lg:w-1/2">
          <Schools />
        </div>
        <div className="w-full lg:w-1/2">
          <PhoneCategories />
        </div>
      </div>
    </div>
  );
}

export default SystemSettings;
