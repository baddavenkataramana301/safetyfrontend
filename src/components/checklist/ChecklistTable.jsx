import React from "react";
import DeleteButton from "./DeleteButton";

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
    <table className="w-full border border-gray-300 border-collapse">
      <thead>
        <tr className="bg-gray-200">
          {fixedHeaders.map((header, idx) => (
            <th
              key={idx}
              className="p-2 border border-gray-300 text-left"
              scope="col"
            >
              {header}
            </th>
          ))}
          {Array(dynamicColumnCount)
            .fill(null)
            .map((_, idx) => (
              <th
                key={idx + fixedHeaders.length}
                className="p-2 border border-gray-300 text-center print:hidden"
                scope="col"
              >
                Dynamic Col {idx + 1}
                <DeleteButton
                  onClick={() => onDeleteColumn(idx + fixedHeaders.length)}
                  className="ml-2"
                  ariaLabel={`Delete dynamic column ${idx + 1}`}
                />
              </th>
            ))}
          <th className="p-2 border border-gray-300 print:hidden">Actions</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row, rIdx) => (
          <tr key={rIdx} className="bg-white">
            {row.map((cell, cIdx) => (
              <td key={cIdx} className="border border-gray-300 p-1">
                <input
                  type="text"
                  value={cell}
                  onChange={(e) => onCellChange(rIdx, cIdx, e.target.value)}
                  className="border p-2 rounded w-full"
                />
              </td>
            ))}
            <td className="p-1 border border-gray-300 text-center print:hidden">
              <DeleteButton
                onClick={() => onDeleteRow(rIdx)}
                ariaLabel={`Delete row ${rIdx + 1}`}
              />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
