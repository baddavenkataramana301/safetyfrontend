import React from "react";

export default function AddButton({ onClick, label }) {
  return (
    <button
      onClick={onClick}
      className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 print:hidden"
      aria-label={label}
      type="button"
    >
      {label}
    </button>
  );
}
