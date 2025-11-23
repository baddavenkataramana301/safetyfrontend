import React from "react";

export default function FooterSection() {
  return (
    <footer className="mt-10 text-center text-gray-500 text-sm">
      <h2>Footer Section</h2>
      <div className="grid grid-cols-3 gap-4" id="footer-grid">
        <input placeholder="Remarks" className="border p-2 rounded" />
        <input placeholder="Signature 1" className="border p-2 rounded" />
        <input placeholder="Signature 2" className="border p-2 rounded" />
        <input placeholder="Designation 1" className="border p-2 rounded" />
        <input placeholder="Designation 2" className="border p-2 rounded" />
        <input placeholder="Footer Date" className="border p-2 rounded" />
      </div>
    </footer>
  );
}
