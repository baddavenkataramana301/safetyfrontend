import { useState, useEffect } from "react";
import HeaderSection from "./HeaderSection";
import FooterSection from "./FooterSection";
import { useChecklist } from "../../contexts/ChecklistContext";

export default function ChecklistBuilder() {
  const [sections, setSections] = useState([]);
  const [sectionCount, setSectionCount] = useState(0);
  const { addChecklist } = useChecklist();

  /* -----------------------------
     Add New Section
  ------------------------------ */
  const addSection = () => {
    const newId = sectionCount + 1;

    setSections([
      ...sections,
      {
        id: newId,
        columns: [
          "Sl No",
          "Point to Check",
          "Status",
          "Action Required",
          "Remarks",
        ],
        rows: [["", "", "", "", ""]],
      },
    ]);

    setSectionCount(newId);
  };

  /* -----------------------------
     Add Row
  ------------------------------ */
  const addRow = (id) => {
    setSections((prev) =>
      prev.map((sec) =>
        sec.id === id
          ? { ...sec, rows: [...sec.rows, Array(sec.columns.length).fill("")] }
          : sec
      )
    );
  };

  /* -----------------------------
     Delete Row
  ------------------------------ */
  const deleteRow = (id) => {
    setSections((prev) =>
      prev.map((sec) =>
        sec.id === id
          ? { ...sec, rows: sec.rows.slice(0, sec.rows.length - 1) }
          : sec
      )
    );
  };

  /* -----------------------------
     Add Column
  ------------------------------ */
  const addColumn = (id) => {
    const name = prompt("Column Name?");
    if (!name) return;

    setSections((prev) =>
      prev.map((sec) =>
        sec.id === id
          ? {
              ...sec,
              columns: [...sec.columns, name],
              rows: sec.rows.map((r) => [...r, ""]),
            }
          : sec
      )
    );
  };

  /* -----------------------------
     Delete Section
  ------------------------------ */
  const deleteSection = (id) => {
    setSections((prev) => prev.filter((sec) => sec.id !== id));
  };

  /* -----------------------------
     Update Cell Value
  ------------------------------ */
  const updateCell = (secId, rowIndex, colIndex, value) => {
    setSections((prev) =>
      prev.map((sec) =>
        sec.id === secId
          ? {
              ...sec,
              rows: sec.rows.map((row, rIdx) =>
                rIdx === rowIndex
                  ? row.map((col, cIdx) => (cIdx === colIndex ? value : col))
                  : row
              ),
            }
          : sec
      )
    );
  };

  /* -----------------------------
     Download JSON
  ------------------------------ */
  const downloadJSON = () => {
    const data = JSON.stringify(sections, null, 2);
    const a = document.createElement("a");
    a.href = URL.createObjectURL(
      new Blob([data], { type: "application/json" })
    );
    a.download = "checklist.json";
    a.click();
  };

  /* -----------------------------
     Download HTML
  ------------------------------ */
  const downloadHTML = () => {
    const html = document.documentElement.outerHTML;
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([html], { type: "text/html" }));
    a.download = "checklist.html";
    a.click();
  };

  /* -----------------------------
     Submit Checklist
  ------------------------------ */
  const submitChecklist = () => {
    if (sections.length === 0) {
      alert("Add at least one section before submitting.");
      return;
    }
    // Create a new checklist object to add to context
    const newChecklist = {
      name: `Checklist ${new Date().toLocaleString()}`,
      approved: false,
      metadata: {
        createdBy: "Unknown", // Can be made dynamic
        approvedBy: "",
        effectiveDate: new Date().toISOString().split("T")[0],
      },
      sections: sections.map(({ id, columns, rows }) => ({
        columns,
        rows,
      })),
    };
    addChecklist(newChecklist);
    alert("Checklist submitted and added!");
    // Clear builder and add a fresh section
    setSections([]);
    setSectionCount(0);
    addSection();
  };

  /* Add default section on load */
  useEffect(() => {
    addSection();
  }, []);

  return (
    <div className="max-w-4xl mx-auto bg-white shadow-lg p-6 mt-4 rounded-xl">
      <HeaderSection />

      <h1 className="text-3xl font-semibold mb-6">Checklist Builder</h1>

      {/* Buttons */}
      <div className="flex flex-wrap gap-3 mb-5">
        <button
          onClick={() => window.print()}
          className="bg-gray-800 text-white px-4 py-2 rounded"
        >
          🖨 Print
        </button>
        <button
          onClick={downloadHTML}
          className="bg-teal-600 text-white px-4 py-2 rounded"
        >
          ⬇ Download HTML
        </button>
        <button
          onClick={downloadJSON}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          ⬇ Download JSON
        </button>
        <button
          onClick={submitChecklist}
          className="bg-orange-500 text-white px-4 py-2 rounded"
        >
          💾 Submit
        </button>
      </div>

      <hr className="my-6" />

      {/* Checklist Sections */}
      <h2 className="text-xl font-bold mb-3">Checklist Sections</h2>

      {sections.map((sec) => (
        <div
          key={sec.id}
          className="bg-gray-50 border p-4 rounded-xl mb-6 shadow-sm"
        >
          <h3 className="text-lg font-semibold mb-3">Section {sec.id}</h3>

          {/* Table */}
          <table className="w-full border mb-4">
            <thead>
              <tr>
                {sec.columns.map((col, idx) => (
                  <th key={idx} className="border p-2 bg-gray-200">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {sec.rows.map((row, rIdx) => (
                <tr key={rIdx}>
                  {row.map((col, cIdx) => (
                    <td key={cIdx} className="border p-1">
                      <input
                        value={col}
                        onChange={(e) =>
                          updateCell(sec.id, rIdx, cIdx, e.target.value)
                        }
                        className="w-full border p-1 rounded"
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>

          {/* Row & Column Buttons */}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => addColumn(sec.id)}
              className="bg-green-600 text-white px-3 py-1 rounded"
            >
              + Add Column
            </button>
            <button
              onClick={() => addRow(sec.id)}
              className="bg-green-500 text-white px-3 py-1 rounded"
            >
              + Add Row
            </button>
            <button
              onClick={() => deleteRow(sec.id)}
              className="bg-red-500 text-white px-3 py-1 rounded"
            >
              - Delete Row
            </button>
            <button
              onClick={() => deleteSection(sec.id)}
              className="bg-red-700 text-white px-3 py-1 rounded"
            >
              🗑 Delete Section
            </button>
          </div>
        </div>
      ))}

      <button
        onClick={addSection}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        + Add Section
      </button>

      <FooterSection />
    </div>
  );
}
