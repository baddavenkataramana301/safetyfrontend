import React from "react";
import DeleteButton from "./DeleteButton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";

export default function ChecklistTable({
  rows,
  onDeleteRow,
  onDeleteColumn,
  onCellChange,
}) {
  // Static first columns headers
  const fixedHeaders = [
    "Sl No",
    "Point to Check",
    "Status",
    "Action Required",
    "Remarks",
  ];

  // Calculate dynamic columns count from first row length
  const dynamicColumnCount =
    rows.length > 0 ? rows[0].length - fixedHeaders.length : 0;

  return (
    <div className="overflow-x-auto rounded-md border border-gray-300 shadow-sm">
      <Table className="min-w-full">
        <TableHeader>
          <TableRow className="bg-gray-100">
            {fixedHeaders.map((header, idx) => (
              <TableHead key={idx} className="text-left px-3 py-2">
                {header}
              </TableHead>
            ))}
            {Array(dynamicColumnCount)
              .fill(null)
              .map((_, idx) => (
                <TableHead
                  key={idx + fixedHeaders.length}
                  className="text-center px-3 py-2 print:hidden"
                >
                  Dynamic Col {idx + 1}
                  <DeleteButton
                    onClick={() => onDeleteColumn(idx + fixedHeaders.length)}
                    className="ml-2"
                    ariaLabel={`Delete dynamic column ${idx + 1}`}
                  />
                </TableHead>
              ))}
            <TableHead className="print:hidden px-3 py-2">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row, rIdx) => (
            <TableRow
              key={rIdx}
              className="bg-white hover:bg-gray-50 transition-colors"
            >
              {row.map((cell, cIdx) => (
                <TableCell key={cIdx} className="p-1">
                  <input
                    type="text"
                    value={cell}
                    onChange={(e) => onCellChange(rIdx, cIdx, e.target.value)}
                    className="border border-gray-300 rounded p-2 w-full focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </TableCell>
              ))}
              <TableCell className="text-center p-1 print:hidden">
                <DeleteButton
                  onClick={() => onDeleteRow(rIdx)}
                  ariaLabel={`Delete row ${rIdx + 1}`}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
