import React from "react";
import ChecklistTable from "./ChecklistTable";
import SectionActions from "./SectionActions";

export default function ChecklistSection({
  sectionIndex,
  section,
  onAddRow,
  onDeleteRow,
  onAddColumn,
  onDeleteColumn,
  onDeleteSection,
  onCellChange,
}) {
  return (
    <section className="section bg-gray-100 p-5 rounded-xl border mb-6">
      <div className="flex justify-between items-center mb-3 print:hidden">
        <h3 className="text-xl font-semibold">Section {sectionIndex + 1}</h3>
        <SectionActions
          onAddRow={() => onAddRow(sectionIndex)}
          onAddColumn={() => onAddColumn(sectionIndex)}
          onDeleteSection={() => onDeleteSection(sectionIndex)}
        />
      </div>
      <ChecklistTable
        rows={section.rows}
        onDeleteRow={(rowIndex) => onDeleteRow(sectionIndex, rowIndex)}
        onDeleteColumn={(colIndex) => onDeleteColumn(sectionIndex, colIndex)}
        onCellChange={(rowIndex, colIndex, value) =>
          onCellChange(sectionIndex, rowIndex, colIndex, value)
        }
      />
    </section>
  );
}
