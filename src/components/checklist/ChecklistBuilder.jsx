import { useState, useEffect } from "react";
import HeaderSection from "./HeaderSection";
import FooterSection from "./FooterSection";
import { useChecklist } from "../../contexts/ChecklistContext";

import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "../ui/dropdown-menu";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ChecklistBuilder() {
  const [sections, setSections] = useState([]);
  const [sectionCount, setSectionCount] = useState(0);

  const [headerFields, setHeaderFields] = useState([
    "Name",
    "Designation",
    "Date",
    "Location of Visit",
    "Address",
    "Time In",
    "Time Out",
  ]);
  const [footerFields, setFooterFields] = useState([
    "Remarks",
    "Signature 1",
    "Signature 2",
    "Designation 1",
    "Designation 2",
    "Footer Date",
  ]);

  /* -----------------------------
     Update Header Field Value
  ------------------------------ */
  const updateHeaderField = (index, value) => {
    setHeaderFields((prev) =>
      prev.map((field, idx) => (idx === index ? value : field))
    );
  };

  /* -----------------------------
     Update Footer Field Value
  ------------------------------ */
  const updateFooterField = (index, value) => {
    setFooterFields((prev) =>
      prev.map((field, idx) => (idx === index ? value : field))
    );
  };


  const { addChecklist } = useChecklist();

  /* -----------------------------
     Add New Section
  ------------------------------ */
  const addSection = () => {
    const newId = sectionCount + 1;

    setSections((prev) => [
      ...prev,
      {
        id: newId,
        columns: ["Sl No", "Point to Check", "Status", "Action Required", "Remarks"],
        rows: [["", "", "", "", ""]],
      },
    ]);

    setSectionCount(newId);
  };

  /* -----------------------------
     Add Field in Header
  ------------------------------ */
  const addHeaderField = () => {
    const newField = prompt("Enter new header field name:");
    if (newField && newField.trim() !== "") {
      setHeaderFields((prev) => [...prev, newField.trim()]);
    }
  };

  /* -----------------------------
     Delete Last Field in Header
  ------------------------------ */
  const deleteHeaderField = () => {
    setHeaderFields((prev) => (prev.length > 0 ? prev.slice(0, -1) : prev));
  };

  /* -----------------------------
     Add Field in Footer
  ------------------------------ */
  const addFooterField = () => {
    const newField = prompt("Enter new footer field name:");
    if (newField && newField.trim() !== "") {
      setFooterFields((prev) => [...prev, newField.trim()]);
    }
  };

  /* -----------------------------
     Delete Last Field in Footer
  ------------------------------ */
  const deleteFooterField = () => {
    setFooterFields((prev) => (prev.length > 0 ? prev.slice(0, -1) : prev));
  };

  /* -----------------------------
     Add Row
  ------------------------------ */
  const addRow = (id) => {
    setSections((prev) =>
      prev.map((sec) => (sec.id === id ? { ...sec, rows: [...sec.rows, Array(sec.columns.length).fill("")] } : sec))
    );
  };

  /* -----------------------------
     Delete Row
  ------------------------------ */
  const deleteRow = (id) => {
    setSections((prev) => prev.map((sec) => (sec.id === id ? { ...sec, rows: sec.rows.slice(0, Math.max(0, sec.rows.length - 1)) } : sec)));
  };

  /* -----------------------------
     Add Column
  ------------------------------ */
  const addColumn = (id) => {
    const name = prompt("Column Name?");
    if (!name) return;

    setSections((prev) => prev.map((sec) => (sec.id === id ? { ...sec, columns: [...sec.columns, name], rows: sec.rows.map((r) => [...r, ""]) } : sec)));
  };

  /* -----------------------------
     Delete Section
  ------------------------------ */
  const deleteSection = (id) => {
    setSections((prev) => prev.filter((sec) => sec.id !== id));
  };

  /* -----------------------------
     Delete Last Section (for header/footer buttons)
  ------------------------------ */
  const deleteLastSection = () => {
    setSections((prev) => {
      if (!prev || prev.length === 0) return prev;
      const lastId = prev[prev.length - 1].id;
      return prev.filter((sec) => sec.id !== lastId);
    });
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
              rows: sec.rows.map((row, rIdx) => (rIdx === rowIndex ? row.map((col, cIdx) => (cIdx === colIndex ? value : col)) : row)),
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
    a.href = URL.createObjectURL(new Blob([data], { type: "application/json" }));
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
    const newChecklist = {
      name: `Checklist ${new Date().toLocaleString()}`,
      approved: false,
      metadata: {
        createdBy: "Unknown",
        approvedBy: "",
        effectiveDate: new Date().toISOString().split("T")[0],
      },
      headerFields: headerFields,
      footerFields: footerFields,
      sections: sections.map(({ id, columns, rows }) => ({ columns, rows })),
    };
    addChecklist(newChecklist);
    alert("Checklist submitted and added!");
    setSections([]);
    setSectionCount(0);
    addSection();
  };

  /* Add default section on load */
  useEffect(() => {
    addSection();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="max-w-7xl w-full mx-4 overflow-y-auto h-full">
      <Card className="p-4">
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-center justify-between w-full gap-4">
          <CardTitle className="text-2xl font-bold">Checklist Builder</CardTitle>
          <div className="flex flex-wrap items-center gap-2">
              <HeaderSection
                fields={headerFields}
                addSection={addHeaderField}
                deleteSection={deleteHeaderField}
                updateField={updateHeaderField}
              />
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-8">
          <div>
            <h2 className="text-xl font-semibold mb-4 border-b border-gray-300 pb-2">Checklist Sections</h2>
          </div>

          {sections.length === 0 && (
            <div className="text-center text-sm text-gray-500">No sections yet. Use the Add Section button to start.</div>
          )}

          {sections.map((sec) => (
            <Card key={sec.id} className="mb-6 shadow-md border border-gray-200 rounded-lg">
              <CardHeader className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-4 w-full sm:w-auto">
                  <span className="font-semibold text-lg whitespace-nowrap">Section</span>
                  <Input
                    value={sec.title || `Section ${sec.id}`}
                    onChange={(e) => {
                      const title = e.target.value;
                      setSections((prev) => prev.map((s) => (s.id === sec.id ? { ...s, title } : s)));
                    }}
                    className="w-full sm:w-80"
                    placeholder={`Section ${sec.id} title`}
                  />
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <Button variant="outline" size="sm" className="flex items-center justify-center gap-1" title="Add Column" onClick={() => addColumn(sec.id)}>
                    <span className="text-xl font-bold">+</span> Column
                  </Button>
                  <Button variant="secondary" size="sm" className="flex items-center justify-center gap-1" title="Add Row" onClick={() => addRow(sec.id)}>
                    <span className="text-xl font-bold">+</span> Row
                  </Button>
                  <Button variant="destructive" size="sm" className="flex items-center justify-center gap-1" title="Delete Row" onClick={() => deleteRow(sec.id)}>
                    <span className="font-bold">−</span> Row
                  </Button>
                  <Button variant="ghost" size="sm" className="flex items-center justify-center gap-1" title="Delete Section" onClick={() => deleteSection(sec.id)}>
                    🗑 Delete
                  </Button>
                </div>
              </CardHeader>

              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full table-fixed border-collapse border border-gray-300 rounded-md">
                    <thead>
                      <tr className="bg-gray-200">
                        {sec.columns.map((col, idx) => (
                          <th key={idx} className="border border-gray-300 px-4 py-2 text-left font-semibold text-gray-700">{col}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {sec.rows.map((row, rIdx) => (
                        <tr key={rIdx} className="odd:bg-white even:bg-gray-50">
                          {row.map((col, cIdx) => (
                            <td key={cIdx} className="border border-gray-300 p-2">
                              <Input value={col} onChange={(e) => updateCell(sec.id, rIdx, cIdx, e.target.value)} className="p-1" />
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          ))}

          <div className="flex items-center gap-3">
            <Button onClick={addSection} className="flex items-center gap-1">
              <span className="text-xl font-bold">+</span> Add Section
            </Button>
            <FooterSection
              fields={footerFields}
              addSection={addFooterField}
              deleteSection={deleteFooterField}
              updateField={updateFooterField}
            />
          </div>

          <div className="fixed bottom-4 right-4 flex gap-3 z-50">
            <Button variant="secondary" onClick={submitChecklist} title="Submit Checklist" className="flex items-center gap-1">
              💾 Submit
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="flex items-center gap-1">⬇ Download</Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => window.print()}>PDF</DropdownMenuItem>
                <DropdownMenuItem onClick={downloadJSON}>JSON</DropdownMenuItem>
                <DropdownMenuItem onClick={downloadHTML}>HTML</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardContent>
    </Card>
    </div>
  );
}
