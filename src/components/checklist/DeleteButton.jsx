import React from "react";

export default function DeleteButton({ onClick, className = "", ariaLabel }) {
  return (
    <button
      onClick={onClick}
      className={`bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700 print:hidden ${className}`}
      aria-label={ariaLabel}
      type="button"
    >
      &#10006;
    </button>
  );
}
