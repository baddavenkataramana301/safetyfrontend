import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "../components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";

import { useChecklist } from "../contexts/ChecklistContext";

import AddButton from "../components/checklist/AddButton";
import { Edit } from "lucide-react";

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
  const [headerValues, setHeaderValues] = useState(
    Array(7).fill("") // Initialize with empty values
  );
  const [footerFields, setFooterFields] = useState([
    "Remarks",
    "Signature 1",
    "Signature 2",
    "Designation 1",
    "Designation 2",
    "Footer Date",
  ]);
  const [footerValues, setFooterValues] = useState(
    Array(6).fill("") // Initialize with empty values
  );

  const { addChecklist } = useChecklist();

  // Header field editing state
  const [headerEditingIndex, setHeaderEditingIndex] = useState(null);
  const [headerEditValue, setHeaderEditValue] = useState("");

  // Footer field editing state
  const [footerEditingIndex, setFooterEditingIndex] = useState(null);
  const [footerEditValue, setFooterEditValue] = useState("");

  // Edit modal states
  const [editHeaderOpen, setEditHeaderOpen] = useState(false);
  const [editFooterOpen, setEditFooterOpen] = useState(false);
  const [editSectionOpen, setEditSectionOpen] = useState(null); // section ID

  // Column name editing state
  const [editingColumn, setEditingColumn] = useState(null); // { sectionId, columnIndex }
  const [columnEditValue, setColumnEditValue] = useState("");

  // Header/Footer key editing state
  const [editingHeaderKey, setEditingHeaderKey] = useState(null);
  const [headerKeyEditValue, setHeaderKeyEditValue] = useState("");
  const [editingFooterKey, setEditingFooterKey] = useState(null);
  const [footerKeyEditValue, setFooterKeyEditValue] = useState("");

  /* Header field handlers */
  const updateHeaderField = (index, value) => {
    setHeaderFields((prev) =>
      prev.map((field, idx) => (idx === index ? value : field))
    );
  };
  const updateHeaderValue = (index, value) => {
    setHeaderValues((prev) =>
      prev.map((val, idx) => (idx === index ? value : val))
    );
  };
  const addHeaderField = () => {
    const newField = prompt("Enter new header field name:");
    if (newField && newField.trim() !== "") {
      setHeaderFields((prev) => [...prev, newField.trim()]);
      setHeaderValues((prev) => [...prev, ""]);
    }
  };
  const deleteHeaderField = () => {
    setHeaderFields((prev) => (prev.length > 0 ? prev.slice(0, -1) : prev));
    setHeaderValues((prev) => (prev.length > 0 ? prev.slice(0, -1) : prev));
  };

  /* Footer field handlers */
  const updateFooterField = (index, value) => {
    setFooterFields((prev) =>
      prev.map((field, idx) => (idx === index ? value : field))
    );
  };
  const updateFooterValue = (index, value) => {
    setFooterValues((prev) =>
      prev.map((val, idx) => (idx === index ? value : val))
    );
  };
  const addFooterField = () => {
    const newField = prompt("Enter new footer field name:");
    if (newField && newField.trim() !== "") {
      setFooterFields((prev) => [...prev, newField.trim()]);
      setFooterValues((prev) => [...prev, ""]);
    }
  };
  const deleteFooterField = () => {
    setFooterFields((prev) => (prev.length > 0 ? prev.slice(0, -1) : prev));
    setFooterValues((prev) => (prev.length > 0 ? prev.slice(0, -1) : prev));
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

  // Update column name
  const updateColumnName = (secId, colIndex, newName) => {
    setSections((prev) =>
      prev.map((sec) =>
        sec.id === secId
          ? {
              ...sec,
              columns: sec.columns.map((col, idx) =>
                idx === colIndex ? newName : col
              ),
            }
          : sec
      )
    );
  };

  // Handle column name double-click
  const handleColumnDoubleClick = (secId, colIndex, currentName) => {
    setEditingColumn({ sectionId: secId, columnIndex: colIndex });
    setColumnEditValue(currentName);
  };

  // Handle column name edit save
  const handleColumnNameSave = () => {
    if (editingColumn && columnEditValue.trim() !== "") {
      updateColumnName(
        editingColumn.sectionId,
        editingColumn.columnIndex,
        columnEditValue.trim()
      );
    }
    setEditingColumn(null);
    setColumnEditValue("");
  };

  // Handle column name edit cancel
  const handleColumnNameCancel = () => {
    setEditingColumn(null);
    setColumnEditValue("");
  };

  // Handle header key double-click
  const handleHeaderKeyDoubleClick = (index, currentName) => {
    setEditingHeaderKey(index);
    setHeaderKeyEditValue(currentName);
  };

  // Handle header key edit save
  const handleHeaderKeySave = () => {
    if (editingHeaderKey !== null && headerKeyEditValue.trim() !== "") {
      updateHeaderField(editingHeaderKey, headerKeyEditValue.trim());
    }
    setEditingHeaderKey(null);
    setHeaderKeyEditValue("");
  };

  // Handle header key edit cancel
  const handleHeaderKeyCancel = () => {
    setEditingHeaderKey(null);
    setHeaderKeyEditValue("");
  };

  // Handle footer key double-click
  const handleFooterKeyDoubleClick = (index, currentName) => {
    if (currentName === "Footer Date") return; // disallow editing Footer Date
    setEditingFooterKey(index);
    setFooterKeyEditValue(currentName);
  };

  // Handle footer key edit save
  const handleFooterKeySave = () => {
    if (editingFooterKey !== null && footerKeyEditValue.trim() !== "") {
      updateFooterField(editingFooterKey, footerKeyEditValue.trim());
    }
    setEditingFooterKey(null);
    setFooterKeyEditValue("");
  };

  // Handle footer key edit cancel
  const handleFooterKeyCancel = () => {
    setEditingFooterKey(null);
    setFooterKeyEditValue("");
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
      headerData: headerValues.reduce((acc, value, index) => {
        acc[headerFields[index]] = value;
        return acc;
      }, {}),
      footerFields: footerFields,
      footerData: footerValues.reduce((acc, value, index) => {
        acc[footerFields[index]] = value;
        return acc;
      }, {}),
      sections: sections.map(({ id, columns, rows }) => ({ columns, rows })),
    };
    addChecklist(newChecklist);
    alert("Checklist submitted and added!");
    setSections([]);
    setSectionCount(0);
    setHeaderValues(Array(headerFields.length).fill(""));
    setFooterValues(Array(footerFields.length).fill(""));
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
            </div>
          </CardHeader>

          <CardContent>
            <div className="space-y-8">
              {/* Header Fields Section */}
              <div>
                <Card className="mb-6 print:bg-white">
                  <CardContent>
                    <div className="flex justify-between items-center mb-4 print:hidden">
                      <h3 className="text-xl font-semibold">Header Fields</h3>
                      <div className="flex gap-2">
                        <Dialog
                          open={editHeaderOpen}
                          onOpenChange={setEditHeaderOpen}
                        >
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex items-center gap-1"
                              title="Edit Header Fields"
                            >
                              <Edit className="h-4 w-4" />
                              Edit
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>Edit Header Fields</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="flex gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={addHeaderField}
                                  className="flex items-center gap-1"
                                >
                                  <span className="text-lg font-bold">+</span>{" "}
                                  Add Field
                                </Button>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={deleteHeaderField}
                                  className="flex items-center gap-1"
                                >
                                  <span className="font-bold">−</span> Delete
                                </Button>
                              </div>
                              <div className="overflow-x-auto">
                                <Table>
                                  <TableHeader>
                                    <TableRow>
                                      <TableHead className="border border-gray-300 bg-gray-100 font-semibold w-1/3">
                                        Key
                                      </TableHead>
                                      <TableHead className="border border-gray-300 bg-gray-100 font-semibold w-2/3">
                                        Value
                                      </TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {headerFields.map((field, index) => (
                                      <TableRow key={index}>
                                        <TableCell className="border border-gray-300 p-2">
                                          {editingHeaderKey === index ? (
                                            <input
                                              type="text"
                                              value={headerKeyEditValue}
                                              onChange={(e) =>
                                                setHeaderKeyEditValue(
                                                  e.target.value
                                                )
                                              }
                                              onBlur={handleHeaderKeySave}
                                              onKeyDown={(e) => {
                                                if (e.key === "Enter") {
                                                  e.preventDefault();
                                                  handleHeaderKeySave();
                                                } else if (e.key === "Escape") {
                                                  handleHeaderKeyCancel();
                                                }
                                              }}
                                              autoFocus
                                              className="w-full border border-blue-400 rounded px-2 py-1 text-sm font-semibold"
                                              onClick={(e) =>
                                                e.stopPropagation()
                                              }
                                            />
                                          ) : (
                                            <p
                                              className="text-sm font-semibold text-gray-700 cursor-pointer"
                                              onDoubleClick={() =>
                                                handleHeaderKeyDoubleClick(
                                                  index,
                                                  field
                                                )
                                              }
                                              title="Double-click to edit key"
                                            >
                                              {field}
                                            </p>
                                          )}
                                        </TableCell>
                                        <TableCell className="border border-gray-300 p-2">
                                          <Input
                                            value={headerValues[index] || ""}
                                            onChange={(e) =>
                                              updateHeaderValue(
                                                index,
                                                e.target.value
                                              )
                                            }
                                            className="w-full text-sm h-8"
                                            placeholder={`Enter ${field} value`}
                                          />
                                        </TableCell>
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
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

                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            {headerFields.map((field, index) => (
                              <TableHead
                                key={index}
                                className="border border-gray-300 bg-gray-100 font-semibold text-center"
                                onDoubleClick={() =>
                                  handleHeaderKeyDoubleClick(index, field)
                                }
                                style={{ cursor: "pointer" }}
                                title="Double-click to edit header name"
                              >
                                {editingHeaderKey === index ? (
                                  <input
                                    type="text"
                                    value={headerKeyEditValue}
                                    onChange={(e) =>
                                      setHeaderKeyEditValue(e.target.value)
                                    }
                                    onBlur={handleHeaderKeySave}
                                    onKeyDown={(e) => {
                                      if (e.key === "Enter") {
                                        e.preventDefault();
                                        handleHeaderKeySave();
                                      } else if (e.key === "Escape") {
                                        handleHeaderKeyCancel();
                                      }
                                    }}
                                    autoFocus
                                    className="w-full border border-blue-400 rounded px-2 py-1 text-sm font-semibold text-center"
                                    onClick={(e) => e.stopPropagation()}
                                  />
                                ) : (
                                  field
                                )}
                              </TableHead>
                            ))}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          <TableRow>
                            {headerFields.map((field, index) => (
                              <TableCell
                                key={index}
                                className="border border-gray-300 p-2"
                              >
                                <Input
                                  value={headerValues[index] || ""}
                                  onChange={(e) =>
                                    updateHeaderValue(index, e.target.value)
                                  }
                                  className="w-full text-sm h-8"
                                  placeholder={`Enter ${field} value`}
                                />
                              </TableCell>
                            ))}
                          </TableRow>
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              </div>

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
                                  <Dialog
                                    open={editSectionOpen === sec.id}
                                    onOpenChange={(open) =>
                                      setEditSectionOpen(open ? sec.id : null)
                                    }
                                  >
                                    <DialogTrigger asChild>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        className="flex items-center gap-1 text-xs h-8"
                                        title="Edit Section"
                                      >
                                        <Edit className="h-3 w-3" />
                                        Edit
                                      </Button>
                                    </DialogTrigger>
                                    <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                                      <DialogHeader>
                                        <DialogTitle>
                                          Edit Section: {sec.title}
                                        </DialogTitle>
                                      </DialogHeader>
                                      <div className="space-y-4">
                                        <div>
                                          <label className="block font-semibold mb-2">
                                            Section Title
                                          </label>
                                          <Input
                                            value={sec.title}
                                            onChange={(e) => {
                                              const title = e.target.value;
                                              setSections((prev) =>
                                                prev.map((s) =>
                                                  s.id === sec.id
                                                    ? { ...s, title }
                                                    : s
                                                )
                                              );
                                            }}
                                            className="w-full"
                                          />
                                        </div>
                                        <div className="flex gap-2">
                                          <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => addColumn(sec.id)}
                                          >
                                            <span className="text-sm font-bold">
                                              +
                                            </span>{" "}
                                            Column
                                          </Button>
                                          <Button
                                            variant="secondary"
                                            size="sm"
                                            onClick={() => addRow(sec.id)}
                                          >
                                            <span className="text-sm font-bold">
                                              +
                                            </span>{" "}
                                            Row
                                          </Button>
                                          <Button
                                            variant="destructive"
                                            size="sm"
                                            onClick={() => deleteRow(sec.id)}
                                          >
                                            <span className="font-bold">−</span>{" "}
                                            Row
                                          </Button>
                                        </div>
                                        <div className="overflow-x-auto">
                                          <Table>
                                            <TableHeader>
                                              <TableRow>
                                                {sec.columns.map(
                                                  (colName, cIdx) => (
                                                    <TableHead
                                                      key={cIdx}
                                                      className="border border-gray-300 bg-gray-100 font-semibold"
                                                      onDoubleClick={() =>
                                                        handleColumnDoubleClick(
                                                          sec.id,
                                                          cIdx,
                                                          colName
                                                        )
                                                      }
                                                      style={{
                                                        cursor: "pointer",
                                                      }}
                                                      title="Double-click to edit column name"
                                                    >
                                                      {editingColumn?.sectionId ===
                                                        sec.id &&
                                                      editingColumn?.columnIndex ===
                                                        cIdx ? (
                                                        <input
                                                          type="text"
                                                          value={
                                                            columnEditValue
                                                          }
                                                          onChange={(e) =>
                                                            setColumnEditValue(
                                                              e.target.value
                                                            )
                                                          }
                                                          onBlur={
                                                            handleColumnNameSave
                                                          }
                                                          onKeyDown={(e) => {
                                                            if (
                                                              e.key === "Enter"
                                                            ) {
                                                              e.preventDefault();
                                                              handleColumnNameSave();
                                                            } else if (
                                                              e.key === "Escape"
                                                            ) {
                                                              handleColumnNameCancel();
                                                            }
                                                          }}
                                                          autoFocus
                                                          className="w-full border border-blue-400 rounded px-2 py-1 text-sm font-semibold"
                                                          onClick={(e) =>
                                                            e.stopPropagation()
                                                          }
                                                        />
                                                      ) : (
                                                        colName
                                                      )}
                                                    </TableHead>
                                                  )
                                                )}
                                              </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                              {sec.rows.map((row, rIdx) => (
                                                <TableRow key={rIdx}>
                                                  {row.map((col, cIdx) => (
                                                    <TableCell
                                                      key={cIdx}
                                                      className="border border-gray-300 p-2"
                                                    >
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
                                                        className="w-full text-sm h-8"
                                                        placeholder={`Enter ${sec.columns[cIdx]}`}
                                                      />
                                                    </TableCell>
                                                  ))}
                                                </TableRow>
                                              ))}
                                            </TableBody>
                                          </Table>
                                        </div>
                                      </div>
                                    </DialogContent>
                                  </Dialog>
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
                                <div className="overflow-x-auto">
                                  <Table>
                                    <TableHeader>
                                      <TableRow>
                                        {sec.columns.map((colName, cIdx) => (
                                          <TableHead
                                            key={cIdx}
                                            className="border border-gray-300 bg-gray-100 font-semibold"
                                            onDoubleClick={() =>
                                              handleColumnDoubleClick(
                                                sec.id,
                                                cIdx,
                                                colName
                                              )
                                            }
                                            style={{ cursor: "pointer" }}
                                            title="Double-click to edit column name"
                                          >
                                            {editingColumn?.sectionId ===
                                              sec.id &&
                                            editingColumn?.columnIndex ===
                                              cIdx ? (
                                              <input
                                                type="text"
                                                value={columnEditValue}
                                                onChange={(e) =>
                                                  setColumnEditValue(
                                                    e.target.value
                                                  )
                                                }
                                                onBlur={handleColumnNameSave}
                                                onKeyDown={(e) => {
                                                  if (e.key === "Enter") {
                                                    e.preventDefault();
                                                    handleColumnNameSave();
                                                  } else if (
                                                    e.key === "Escape"
                                                  ) {
                                                    handleColumnNameCancel();
                                                  }
                                                }}
                                                autoFocus
                                                className="w-full border border-blue-400 rounded px-2 py-1 text-sm font-semibold"
                                                onClick={(e) =>
                                                  e.stopPropagation()
                                                }
                                              />
                                            ) : (
                                              colName
                                            )}
                                          </TableHead>
                                        ))}
                                      </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                      {sec.rows.map((row, rIdx) => (
                                        <TableRow key={rIdx}>
                                          {row.map((col, cIdx) => (
                                            <TableCell
                                              key={cIdx}
                                              className="border border-gray-300 p-2"
                                            >
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
                                                className="w-full text-sm h-8"
                                                placeholder={`Enter ${sec.columns[cIdx]}`}
                                              />
                                            </TableCell>
                                          ))}
                                        </TableRow>
                                      ))}
                                    </TableBody>
                                  </Table>
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

              {/* Footer Fields Section */}
              <div>
                <Card className="mb-6 print:bg-white">
                  <CardContent>
                    <div className="flex justify-between items-center mb-4 print:hidden">
                      <h3 className="text-xl font-semibold">Footer Fields</h3>
                      <div className="flex gap-2">
                        <Dialog
                          open={editFooterOpen}
                          onOpenChange={setEditFooterOpen}
                        >
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex items-center gap-1"
                              title="Edit Footer Fields"
                            >
                              <Edit className="h-4 w-4" />
                              Edit
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>Edit Footer Fields</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="flex gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={addFooterField}
                                  className="flex items-center gap-1"
                                >
                                  <span className="text-lg font-bold">+</span>{" "}
                                  Add Field
                                </Button>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={deleteFooterField}
                                  className="flex items-center gap-1"
                                >
                                  <span className="font-bold">−</span> Delete
                                </Button>
                              </div>
                              <div className="overflow-x-auto">
                                <Table>
                                  <TableHeader>
                                    <TableRow>
                                      <TableHead className="border border-gray-300 bg-gray-100 font-semibold w-1/3">
                                        Key
                                      </TableHead>
                                      <TableHead className="border border-gray-300 bg-gray-100 font-semibold w-2/3">
                                        Value
                                      </TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {footerFields.map((field, index) => (
                                      <TableRow key={index}>
                                        <TableCell className="border border-gray-300 p-2">
                                          {editingFooterKey === index ? (
                                            <input
                                              type="text"
                                              value={footerKeyEditValue}
                                              onChange={(e) =>
                                                setFooterKeyEditValue(
                                                  e.target.value
                                                )
                                              }
                                              onBlur={handleFooterKeySave}
                                              onKeyDown={(e) => {
                                                if (e.key === "Enter") {
                                                  e.preventDefault();
                                                  handleFooterKeySave();
                                                } else if (e.key === "Escape") {
                                                  handleFooterKeyCancel();
                                                }
                                              }}
                                              autoFocus
                                              className="w-full border border-blue-400 rounded px-2 py-1 text-sm font-semibold"
                                              onClick={(e) =>
                                                e.stopPropagation()
                                              }
                                            />
                                          ) : (
                                            <p
                                              className={`text-sm font-semibold text-gray-700 ${
                                                field === "Footer Date"
                                                  ? "cursor-default"
                                                  : "cursor-pointer"
                                              }`}
                                              onDoubleClick={() =>
                                                handleFooterKeyDoubleClick(
                                                  index,
                                                  field
                                                )
                                              }
                                              title={
                                                field === "Footer Date"
                                                  ? ""
                                                  : "Double-click to edit key"
                                              }
                                            >
                                              {field}
                                            </p>
                                          )}
                                        </TableCell>
                                        <TableCell className="border border-gray-300 p-2">
                                          <Input
                                            value={footerValues[index] || ""}
                                            onChange={(e) =>
                                              updateFooterValue(
                                                index,
                                                e.target.value
                                              )
                                            }
                                            className="w-full text-sm h-8"
                                            placeholder={`Enter ${field} value`}
                                            disabled={field === "Footer Date"}
                                          />
                                        </TableCell>
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
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

                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            {footerFields.map((field, index) => (
                              <TableHead
                                key={index}
                                className="border border-gray-300 bg-gray-100 font-semibold text-center"
                                onDoubleClick={() =>
                                  handleFooterKeyDoubleClick(index, field)
                                }
                                style={{
                                  cursor:
                                    field === "Footer Date"
                                      ? "default"
                                      : "pointer",
                                }}
                                title={
                                  field === "Footer Date"
                                    ? ""
                                    : "Double-click to edit footer name"
                                }
                              >
                                {editingFooterKey === index ? (
                                  <input
                                    type="text"
                                    value={footerKeyEditValue}
                                    onChange={(e) =>
                                      setFooterKeyEditValue(e.target.value)
                                    }
                                    onBlur={handleFooterKeySave}
                                    onKeyDown={(e) => {
                                      if (e.key === "Enter") {
                                        e.preventDefault();
                                        handleFooterKeySave();
                                      } else if (e.key === "Escape") {
                                        handleFooterKeyCancel();
                                      }
                                    }}
                                    autoFocus
                                    className="w-full border border-blue-400 rounded px-2 py-1 text-sm font-semibold text-center"
                                    onClick={(e) => e.stopPropagation()}
                                  />
                                ) : (
                                  field
                                )}
                              </TableHead>
                            ))}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          <TableRow>
                            {footerFields.map((field, index) => (
                              <TableCell
                                key={index}
                                className="border border-gray-300 p-2"
                              >
                                <Input
                                  value={footerValues[index] || ""}
                                  onChange={(e) =>
                                    updateFooterValue(index, e.target.value)
                                  }
                                  className="w-full text-sm h-8"
                                  placeholder={`Enter ${field} value`}
                                  disabled={field === "Footer Date"}
                                />
                              </TableCell>
                            ))}
                          </TableRow>
                        </TableBody>
                      </Table>
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
