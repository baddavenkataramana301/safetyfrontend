import React from "react";

export default function HeaderSection() {
  return (
    <header className="mb-6">
      <h2>Header Section</h2>
      <div className="grid grid-cols-3 gap-4" id="header-grid">
        <input placeholder="Name" className="border p-2 rounded" />
        <input placeholder="Designation" className="border p-2 rounded" />
        <input placeholder="Date" className="border p-2 rounded" />
        <input placeholder="Location of Visit" className="border p-2 rounded" />
        <input placeholder="Address" className="border p-2 rounded" />
        <input placeholder="Time In" className="border p-2 rounded" />
        <input placeholder="Time Out" className="border p-2 rounded" />
      </div>
    </header>
  );
}
