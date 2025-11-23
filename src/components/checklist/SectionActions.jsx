import React from "react";
import AddButton from "./AddButton";
import DeleteButton from "./DeleteButton";

export default function SectionActions({
  onAddRow,
  onAddColumn,
  onDeleteSection,
}) {
  return (
    <div className="flex space-x-2 print:hidden">
      <AddButton onClick={onAddRow} label="Add Row" />
      <AddButton onClick={onAddColumn} label="Add Column" />
      <DeleteButton onClick={onDeleteSection} ariaLabel="Delete Section" />
    </div>
  );
}
