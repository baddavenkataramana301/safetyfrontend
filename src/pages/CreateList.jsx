import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "../components/ui/dropdown-menu";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { useChecklist } from "../contexts/ChecklistContext";

import AddButton from "../components/checklist/AddButton";

export default function CreateList() {
  // State for sections, headerFields, footerFields
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

  const { addChecklist } = useChecklist();

  // Header field editing state
  const [headerEditingIndex, setHeaderEditingIndex] = useState(null);
  const [headerEditValue, setHeaderEditValue] = useState("");

  // Footer field editing state
  const [footerEditingIndex, setFooterEditingIndex] = useState(null);
  const [footerEditValue, setFooterEditValue] = useState("");

  /* Header field handlers */
  const updateHeaderField = (index, value) => {
    setHeaderFields((prev) =>
      prev.map((field, idx) => (idx === index ? value : field))
    );
  };
  const addHeaderField = () => {
    const newField = prompt("Enter new header field name:");
    if (newField && newField.trim() !== "") {
      setHeaderFields((prev) => [...prev, newField.trim()]);
    }
  };
  const deleteHeaderField = () => {
    setHeaderFields((prev) => (prev.length > 0 ? prev.slice(0, -1) : prev));
  };

  /* Footer field handlers */
  const updateFooterField = (index, value) => {
    setFooterFields((prev) =>
      prev.map((field, idx) => (idx === index ? value : field))
    );
  };
  const addFooterField = () => {
    const newField = prompt("Enter new footer field name:");
    if (newField && newField.trim() !== "") {
      setFooterFields((prev) => [...prev, newField.trim()]);
    }
  };
  const deleteFooterField = () => {
    setFooterFields((prev) => (prev.length > 0 ? prev.slice(0, -1) : prev));
  };

  /* Section management */
  const addSection = () => {
    const newId = sectionCount + 1;
    setSections((prev) => [
      ...prev,
      {
        id: newId,
        title: `Section ${newId}`,
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
  const deleteSection = (id) => {
    setSections((prev) => prev.filter((sec) => sec.id !== id));
  };
  const addRow = (id) => {
    setSections((prev) =>
      prev.map((sec) =>
        sec.id === id
          ? { ...sec, rows: [...sec.rows, Array(sec.columns.length).fill("")] }
          : sec
      )
    );
  };
  const deleteRow = (id) => {
    setSections((prev) =>
      prev.map((sec) =>
        sec.id === id
          ? {
              ...sec,
              rows: sec.rows.slice(0, Math.max(0, sec.rows.length - 1)),
            }
          : sec
      )
    );
  };
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

  /* Submit */
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

  /* Downloads */
  const downloadJSON = () => {
    const data = JSON.stringify(sections, null, 2);
    const a = document.createElement("a");
    a.href = URL.createObjectURL(
      new Blob([data], { type: "application/json" })
    );
    a.download = "checklist.json";
    a.click();
  };
  const downloadHTML = () => {
    const html = document.documentElement.outerHTML;
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([html], { type: "text/html" }));
    a.download = "checklist.html";
    a.click();
  };

  /* Handle header field edit */
  const handleHeaderClick = (index, value) => {
    setHeaderEditingIndex(index);
    setHeaderEditValue(value);
  };
  const handleHeaderInputChange = (e) => setHeaderEditValue(e.target.value);
  const handleHeaderInputBlur = (index) => {
    updateHeaderField(index, headerEditValue);
    setHeaderEditingIndex(null);
  };
  const handleHeaderInputKeyDown = (e, index) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleHeaderInputBlur(index);
    } else if (e.key === "Escape") {
      setHeaderEditingIndex(null);
    }
  };

  /* Handle footer field edit */
  const handleFooterClick = (index, value) => {
    if (value === "Footer Date") return; // disallow editing
    setFooterEditingIndex(index);
    setFooterEditValue(value);
  };
  const handleFooterInputChange = (e) => setFooterEditValue(e.target.value);
  const handleFooterInputBlur = (index) => {
    updateFooterField(index, footerEditValue);
    setFooterEditingIndex(null);
  };
  const handleFooterInputKeyDown = (e, index) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleFooterInputBlur(index);
    } else if (e.key === "Escape") {
      setFooterEditingIndex(null);
    }
  };

  useEffect(() => {
    addSection();
  }, []);

  return (
    <>
      <div className="max-w-7xl w-full  overflow-y-auto h-full">
        <Card className="p-4">
          <CardHeader>
            <div className="">
              <CardTitle className="text-3xl font-bold items-center flex gap-2 mb-4 justify-center">
                Checklist Builder
              </CardTitle>
              <div>
                <Card className="mb-6 print:bg-white">
                  <CardContent>
                    <div className="flex justify-between items-center mb-4 print:hidden">
                      <h3 className="text-xl font-semibold">Header Fields</h3>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={addHeaderField}
                          className="flex items-center gap-1"
                          title="Add New Header Field"
                        >
                          <span className="text-lg font-bold">+</span> Add Field
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={deleteHeaderField}
                          className="flex items-center gap-1"
                          title="Delete Last Header Field"
                        >
                          <span className="font-bold">−</span> Delete
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {headerFields.map((field, index) => (
                        <div
                          key={index}
                          className="border border-gray-300 rounded p-3 bg-gray-50"
                        >
                          {headerEditingIndex === index ? (
                            <input
                              type="text"
                              value={headerEditValue}
                              onChange={handleHeaderInputChange}
                              onBlur={() => handleHeaderInputBlur(index)}
                              onKeyDown={(e) =>
                                handleHeaderInputKeyDown(e, index)
                              }
                              autoFocus
                              className="w-full border border-gray-400 rounded px-2 py-1 text-sm"
                            />
                          ) : (
                            <p
                              className="text-sm font-medium text-gray-700 cursor-pointer"
                              onClick={() => handleHeaderClick(index, field)}
                              title="Click to edit"
                            >
                              {field}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <div className="space-y-8">
              <div>
                <Card className="mb-6 print:bg-white">
                  <CardContent>
                    <div className="flex justify-between items-center mb-6 print:hidden">
                      <h3 className="text-xl font-semibold">
                        Checklist Sections
                      </h3>
                      <AddButton label="Add Section" onClick={addSection} />
                    </div>

                    {sections.length === 0 ? (
                      <div className="text-center text-sm text-gray-500 py-8">
                        <p className="mb-2">
                          No sections yet. Use the Add Section button to start.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {sections.map((sec) => (
                          <Card
                            key={sec.id}
                            className="rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
                          >
                            <CardHeader className="pb-4 border-b border-gray-100">
                              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                <div className="flex items-center gap-3 w-full sm:w-auto">
                                  <span className="font-semibold text-sm text-gray-600 whitespace-nowrap">
                                    Section Title:
                                  </span>
                                  <Input
                                    value={sec.title}
                                    onChange={(e) => {
                                      const title = e.target.value;
                                      setSections((prev) =>
                                        prev.map((s) =>
                                          s.id === sec.id ? { ...s, title } : s
                                        )
                                      );
                                    }}
                                    className="w-full sm:w-64 h-8 text-sm"
                                    placeholder={`Section ${sec.id} title`}
                                  />
                                </div>

                                <div className="flex flex-wrap items-center gap-1">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="flex items-center gap-1 text-xs h-8"
                                    title="Add Column"
                                    onClick={() => addColumn(sec.id)}
                                  >
                                    <span className="text-sm font-bold">+</span>{" "}
                                    Column
                                  </Button>
                                  <Button
                                    variant="secondary"
                                    size="sm"
                                    className="flex items-center gap-1 text-xs h-8"
                                    title="Add Row"
                                    onClick={() => addRow(sec.id)}
                                  >
                                    <span className="text-sm font-bold">+</span>{" "}
                                    Row
                                  </Button>
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    className="flex items-center gap-1 text-xs h-8"
                                    title="Delete Row"
                                    onClick={() => deleteRow(sec.id)}
                                  >
                                    <span className="font-bold">−</span> Row
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="flex items-center gap-1 text-xs h-8"
                                    title="Delete Section"
                                    onClick={() => deleteSection(sec.id)}
                                  >
                                    🗑 Delete
                                  </Button>
                                </div>
                              </div>
                            </CardHeader>

                            <CardContent className="pt-4">
                              {sec.rows.length === 0 ? (
                                <div className="text-center text-sm text-gray-400 py-6">
                                  No rows added yet. Click "+ Row" to add data.
                                </div>
                              ) : (
                                <div className="space-y-3">
                                  {sec.rows.map((row, rIdx) => (
                                    <div
                                      key={rIdx}
                                      className="bg-gray-50 rounded-md p-3 border border-gray-100 hover:bg-gray-100 transition-colors"
                                    >
                                      <div className="space-y-2">
                                        {row.map((col, cIdx) => (
                                          <div
                                            key={cIdx}
                                            className="flex flex-col sm:flex-row sm:items-center gap-2"
                                          >
                                            <label className="font-semibold text-gray-700 text-xs w-full sm:w-40 whitespace-nowrap">
                                              {sec.columns[cIdx]}:
                                            </label>
                                            <Input
                                              value={col}
                                              onChange={(e) =>
                                                updateCell(
                                                  sec.id,
                                                  rIdx,
                                                  cIdx,
                                                  e.target.value
                                                )
                                              }
                                              className="p-2 w-full flex-1 text-sm h-8"
                                              placeholder={`Enter ${sec.columns[cIdx]}`}
                                            />
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              <div>
                <Card className="mb-6 print:bg-white">
                  <CardContent>
                    <div className="flex justify-between items-center mb-4 print:hidden">
                      <h3 className="text-xl font-semibold">Footer Fields</h3>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={addFooterField}
                          className="flex items-center gap-1"
                          title="Add New Footer Field"
                        >
                          <span className="text-lg font-bold">+</span> Add Field
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={deleteFooterField}
                          className="flex items-center gap-1"
                          title="Delete Last Footer Field"
                        >
                          <span className="font-bold">−</span> Delete
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {footerFields.map((field, index) => (
                        <div
                          key={index}
                          className="border border-gray-300 rounded p-3 bg-gray-50"
                        >
                          {footerEditingIndex === index ? (
                            <input
                              type="text"
                              value={footerEditValue}
                              onChange={handleFooterInputChange}
                              onBlur={() => handleFooterInputBlur(index)}
                              onKeyDown={(e) =>
                                handleFooterInputKeyDown(e, index)
                              }
                              autoFocus
                              className="w-full border border-gray-400 rounded px-2 py-1 text-sm"
                            />
                          ) : (
                            <p
                              className={`text-sm font-medium text-gray-700 cursor-pointer${
                                field === "Footer Date" ? " cursor-default" : ""
                              }`}
                              onClick={() => handleFooterClick(index, field)}
                              title={
                                field === "Footer Date" ? "" : "Click to edit"
                              }
                            >
                              {field}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </CardContent>
          {/* Submit and Download buttons (adjusted to fix scroll float issue) */}
          <div className="z-50 print:hidden fixed bottom-4 right-4 overflow-visible">
            <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 bg-white shadow-md rounded-md p-2 ring-1 ring-gray-200">
              <Button
                variant="secondary"
                size="sm"
                onClick={submitChecklist}
                title="Submit Checklist"
                aria-label="Submit checklist"
                className="flex items-center gap-1"
              >
                Submit
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="sm" className="flex items-center gap-1">
                    Download
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => window.print()}>
                    PDF
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={downloadJSON}>
                    JSON
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={downloadHTML}>
                    HTML
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </Card>
      </div>
    </>
  );
}
