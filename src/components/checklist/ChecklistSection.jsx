import React from "react";
import ChecklistTable from "./ChecklistTable";
import SectionActions from "./SectionActions";
import { Card, CardContent } from "../ui/card";

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
    <Card className="mb-6 print:bg-white">
      <CardContent>
        <div className="flex justify-between items-center mb-4 print:hidden">
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
      </CardContent>
    </Card>
  );
}
