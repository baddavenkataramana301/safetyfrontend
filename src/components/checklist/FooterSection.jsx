import React, { useState } from "react";
import { Button } from "../ui/button";

export default function FooterSection({ fields = [], addSection, deleteSection, updateField }) {
  const [editingIndex, setEditingIndex] = useState(null);
  const [editValue, setEditValue] = useState("");

  const handleFieldClick = (index, value) => {
    // Do not allow editing for the "Footer Date" field
    if (value === "Footer Date") {
      return;
    }
    setEditingIndex(index);
    setEditValue(value);
  };

  const handleInputChange = (e) => {
    setEditValue(e.target.value);
  };

  const handleInputBlur = (index) => {
    updateField && updateField(index, editValue);
    setEditingIndex(null);
  };

  const handleInputKeyDown = (e, index) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleInputBlur(index);
    } else if (e.key === "Escape") {
      setEditingIndex(null);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Footer Fields</h3>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => addSection && addSection()}
            className="flex items-center gap-1"
            title="Add New Footer Field"
          >
            <span className="text-lg font-bold">+</span> Add Field
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => deleteSection && deleteSection()}
            className="flex items-center gap-1"
            title="Delete Last Footer Field"
          >
            <span className="font-bold">−</span> Delete
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {fields.map((field, index) => (
          <div key={index} className="border border-gray-300 rounded p-3 bg-gray-50">
            {editingIndex === index ? (
              <input
                type="text"
                value={editValue}
                onChange={handleInputChange}
                onBlur={() => handleInputBlur(index)}
                onKeyDown={(e) => handleInputKeyDown(e, index)}
                autoFocus
                className="w-full border border-gray-400 rounded px-2 py-1 text-sm"
              />
            ) : (
              <p
                className={`text-sm font-medium text-gray-700 cursor-pointer${field === "Footer Date" ? " cursor-default" : ""}`}
                onClick={() => handleFieldClick(index, field)}
                title={field === "Footer Date" ? "" : "Click to edit"}
              >
                {field}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
