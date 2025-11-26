import React from "react";
import Checklists from "./Checklists";

// Wrapper page component for Checklist page to enable future enhancements/responsiveness
export default function ChecklistPage() {
  return (
    <div className="w-full h-full">
      <Checklists />
    </div>
  );
}
