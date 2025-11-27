import { useCallback, useEffect, useMemo, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "../ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
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
} from "../ui/table";
import AddButton from "./AddButton";
import { Edit } from "lucide-react";

const DEFAULT_HEADER_FIELDS = [
  "Name",
  "Designation",
  "Date",
  "Location of Visit",
  "Address",
  "Time In",
  "Time Out",
];

const DEFAULT_FOOTER_FIELDS = [
  "Remarks",
  "Signature 1",
  "Signature 2",
  "Designation 1",
  "Designation 2",
  "Footer Date",
];

const DEFAULT_SECTION_TEMPLATE = {
  columns: ["Sl No", "Point to Check", "Status", "Action Required", "Remarks"],
  rows: [["", "", "", "", ""]],
};

const isSlNoColumnName = (name = "") => name.trim().toLowerCase() === "sl no";

const ensureRowLength = (row, targetLength) => {
  const nextRow = [...row];
  while (nextRow.length < targetLength) {
    nextRow.push("");
  }
  return nextRow.slice(0, targetLength);
};

const renumberSectionRows = (section) => {
  const slIndex = section.columns.findIndex((col) => isSlNoColumnName(col));
  if (slIndex === -1) return section;
  const rows = section.rows.map((row, rowIdx) => {
    const updatedRow = ensureRowLength(row, section.columns.length);
    updatedRow[slIndex] = String(rowIdx + 1);
    return updatedRow;
  });
  return { ...section, rows };
};

const createSection = (id, overrides = {}) => {
  const columns =
    overrides.columns && overrides.columns.length
      ? [...overrides.columns]
      : [...DEFAULT_SECTION_TEMPLATE.columns];
  const rowsSource =
    overrides.rows && overrides.rows.length
      ? overrides.rows
      : DEFAULT_SECTION_TEMPLATE.rows;
  const rows = rowsSource.map((row) => ensureRowLength(row, columns.length));
  return renumberSectionRows({
    id,
    title: overrides.title || `Section ${id}`,
    columns,
    rows,
  });
};

const buildInitialState = (initialData) => {
  const headerFields =
    initialData?.headerFields?.length > 0
      ? [...initialData.headerFields]
      : [...DEFAULT_HEADER_FIELDS];
  const headerValues = headerFields.map(
    (field, idx) =>
      initialData?.headerValues?.[idx] ??
      initialData?.headerData?.[field] ??
      ""
  );

  const footerFields =
    initialData?.footerFields?.length > 0
      ? [...initialData.footerFields]
      : [...DEFAULT_FOOTER_FIELDS];
  const footerValues = footerFields.map(
    (field, idx) =>
      initialData?.footerValues?.[idx] ??
      initialData?.footerData?.[field] ??
      ""
  );

  const sectionsSource =
    initialData?.sections?.length > 0
      ? initialData.sections
      : [DEFAULT_SECTION_TEMPLATE];

  const sections = sectionsSource.map((section, idx) =>
    createSection(section.id ?? idx + 1, section)
  );

  const sectionCount = sections.reduce(
    (max, section) => Math.max(max, section.id ?? 0),
    sections.length
  );

  return {
    headerFields,
    headerValues,
    footerFields,
    footerValues,
    sections,
    sectionCount,
  };
};

export default function ChecklistBuilderForm({
  initialData = null,
  onSubmit,
  submitLabel = "Submit",
  renderActions,
  showDownloadActions = true,
  floatingActionBar = true,
  title = "Checklist Builder",
  stateKey = 0,
}) {
  const memoizedInitial = useMemo(
    () => buildInitialState(initialData),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [stateKey]
  );

  const [sections, setSections] = useState(memoizedInitial.sections);
  const [sectionCount, setSectionCount] = useState(memoizedInitial.sectionCount);
  const [headerFields, setHeaderFields] = useState(memoizedInitial.headerFields);
  const [headerValues, setHeaderValues] = useState(memoizedInitial.headerValues);
  const [footerFields, setFooterFields] = useState(memoizedInitial.footerFields);
  const [footerValues, setFooterValues] = useState(memoizedInitial.footerValues);

  const [headerEditingIndex, setHeaderEditingIndex] = useState(null);
  const [headerEditValue, setHeaderEditValue] = useState("");
  const [footerEditingIndex, setFooterEditingIndex] = useState(null);
  const [footerEditValue, setFooterEditValue] = useState("");

  const [editHeaderOpen, setEditHeaderOpen] = useState(false);
  const [editFooterOpen, setEditFooterOpen] = useState(false);
  const [editSectionOpen, setEditSectionOpen] = useState(null);

  const [editingColumn, setEditingColumn] = useState(null);
  const [columnEditValue, setColumnEditValue] = useState("");

  const [editingHeaderKey, setEditingHeaderKey] = useState(null);
  const [headerKeyEditValue, setHeaderKeyEditValue] = useState("");
  const [editingFooterKey, setEditingFooterKey] = useState(null);
  const [footerKeyEditValue, setFooterKeyEditValue] = useState("");

  useEffect(() => {
    setSections(memoizedInitial.sections);
    setSectionCount(memoizedInitial.sectionCount);
    setHeaderFields(memoizedInitial.headerFields);
    setHeaderValues(memoizedInitial.headerValues);
    setFooterFields(memoizedInitial.footerFields);
    setFooterValues(memoizedInitial.footerValues);
  }, [memoizedInitial]);

  const resetForm = useCallback(() => {
    setSections(memoizedInitial.sections);
    setSectionCount(memoizedInitial.sectionCount);
    setHeaderFields(memoizedInitial.headerFields);
    setHeaderValues(memoizedInitial.headerValues);
    setFooterFields(memoizedInitial.footerFields);
    setFooterValues(memoizedInitial.footerValues);
  }, [memoizedInitial]);

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

  const addSection = () => {
    const newId = sectionCount + 1;
    const baseSection = createSection(newId);
    setSections((prev) => [...prev, baseSection]);
    setSectionCount(newId);
  };

  const deleteSection = (id) => {
    setSections((prev) => prev.filter((sec) => sec.id !== id));
  };

  const addRow = (id) => {
    setSections((prev) =>
      prev.map((sec) =>
        sec.id === id
          ? renumberSectionRows({
              ...sec,
              rows: [...sec.rows, Array(sec.columns.length).fill("")],
            })
          : sec
      )
    );
  };

  const deleteRow = (id) => {
    setSections((prev) =>
      prev.map((sec) =>
        sec.id === id
          ? renumberSectionRows({
              ...sec,
              rows: sec.rows.slice(0, Math.max(0, sec.rows.length - 1)),
            })
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
          ? renumberSectionRows({
              ...sec,
              columns: [...sec.columns, name],
              rows: sec.rows.map((r) => [...r, ""]),
            })
          : sec
      )
    );
  };

  const updateCell = (secId, rowIndex, colIndex, value) => {
    setSections((prev) =>
      prev.map((sec) =>
        sec.id === secId
          ? isSlNoColumnName(sec.columns[colIndex])
            ? sec
            : renumberSectionRows({
                ...sec,
                rows: sec.rows.map((row, rIdx) =>
                  rIdx === rowIndex
                    ? row.map((col, cIdx) => (cIdx === colIndex ? value : col))
                    : row
                ),
              })
          : sec
      )
    );
  };

  const updateColumnName = (secId, colIndex, newName) => {
    setSections((prev) =>
      prev.map((sec) =>
        sec.id === secId
          ? renumberSectionRows({
              ...sec,
              columns: sec.columns.map((col, idx) =>
                idx === colIndex ? newName : col
              ),
            })
          : sec
      )
    );
  };

  const handleColumnDoubleClick = (secId, colIndex, currentName) => {
    setEditingColumn({ sectionId: secId, columnIndex: colIndex });
    setColumnEditValue(currentName);
  };

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

  const handleColumnNameCancel = () => {
    setEditingColumn(null);
    setColumnEditValue("");
  };

  const handleHeaderKeyDoubleClick = (index, currentName) => {
    setEditingHeaderKey(index);
    setHeaderKeyEditValue(currentName);
  };

  const handleHeaderKeySave = () => {
    if (editingHeaderKey !== null && headerKeyEditValue.trim() !== "") {
      updateHeaderField(editingHeaderKey, headerKeyEditValue.trim());
    }
    setEditingHeaderKey(null);
    setHeaderKeyEditValue("");
  };

  const handleHeaderKeyCancel = () => {
    setEditingHeaderKey(null);
    setHeaderKeyEditValue("");
  };

  const handleFooterKeyDoubleClick = (index, currentName) => {
    if (currentName === "Footer Date") return;
    setEditingFooterKey(index);
    setFooterKeyEditValue(currentName);
  };

  const handleFooterKeySave = () => {
    if (editingFooterKey !== null && footerKeyEditValue.trim() !== "") {
      updateFooterField(editingFooterKey, footerKeyEditValue.trim());
    }
    setEditingFooterKey(null);
    setFooterKeyEditValue("");
  };

  const handleFooterKeyCancel = () => {
    setEditingFooterKey(null);
    setFooterKeyEditValue("");
  };

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

  const handleFooterClick = (index, value) => {
    if (value === "Footer Date") return;
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

  const handleSubmit = () => {
    if (!onSubmit) return;
    if (sections.length === 0) {
      alert("Add at least one section before submitting.");
      return;
    }

    const payload = {
      headerFields,
      headerData: headerValues.reduce((acc, value, index) => {
        acc[headerFields[index]] = value;
        return acc;
      }, {}),
      footerFields,
      footerData: footerValues.reduce((acc, value, index) => {
        acc[footerFields[index]] = value;
        return acc;
      }, {}),
      sections: sections.map(({ title, columns, rows }) => ({
        title,
        columns,
        rows: rows.map((row, rowIdx) =>
          ensureRowLength(row, columns.length).map((cell, colIdx) =>
            isSlNoColumnName(columns[colIdx]) ? String(rowIdx + 1) : cell
          )
        ),
      })),
    };

    onSubmit(payload, { resetForm });
  };

  const renderActionsSection = () => {
    if (renderActions) {
      return renderActions({ handleSubmit, resetForm });
    }

    if (!floatingActionBar) {
      return (
        <div className="flex justify-end gap-2 mt-6">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleSubmit}
            className="flex items-center gap-1"
          >
            {submitLabel}
          </Button>
        </div>
      );
    }

    return (
      <div className="z-50 print:hidden fixed bottom-4 right-4 overflow-visible">
        <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 bg-white shadow-md rounded-md p-2 ring-1 ring-gray-200">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleSubmit}
            title="Submit Checklist"
            aria-label="Submit checklist"
            className="flex items-center gap-1"
          >
            {submitLabel}
          </Button>

          {showDownloadActions && (
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
          )}
        </div>
      </div>
    );
  };

  return (
    <div>
      <CardHeader>
        <div>
          <CardTitle className="text-3xl font-bold items-center flex gap-2 mb-4 justify-center">
            {title}
          </CardTitle>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-8">
          <div>
            <Card className="mb-6 print:bg-white">
              <CardContent>
                <div className="flex justify-between items-center mb-4 print:hidden">
                  <h3 className="text-xl font-semibold">Header Fields</h3>
                  <div className="flex gap-2">
                    <Dialog open={editHeaderOpen} onOpenChange={setEditHeaderOpen}>
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
                              <span className="text-lg font-bold">+</span> Add Field
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
                                          className="w-full border border-blue-400 rounded px-2 py-1 text-sm font-semibold"
                                          onClick={(e) => e.stopPropagation()}
                                        />
                                      ) : (
                                        <p
                                          className="text-sm font-semibold text-gray-700 cursor-pointer"
                                          onDoubleClick={() =>
                                            handleHeaderKeyDoubleClick(index, field)
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
                                          updateHeaderValue(index, e.target.value)
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
                                onChange={(e) => setHeaderKeyEditValue(e.target.value)}
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
                          <TableCell key={index} className="border border-gray-300 p-2">
                            <Input
                              value={headerValues[index] || ""}
                              onChange={(e) => updateHeaderValue(index, e.target.value)}
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
                  <h3 className="text-xl font-semibold">Checklist Sections</h3>
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
                                    <DialogTitle>Edit Section: {sec.title}</DialogTitle>
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
                                              s.id === sec.id ? { ...s, title } : s
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
                                        <span className="text-sm font-bold">+</span> Column
                                      </Button>
                                      <Button
                                        variant="secondary"
                                        size="sm"
                                        onClick={() => addRow(sec.id)}
                                      >
                                        <span className="text-sm font-bold">+</span> Row
                                      </Button>
                                      <Button
                                        variant="destructive"
                                        size="sm"
                                        onClick={() => deleteRow(sec.id)}
                                      >
                                        <span className="font-bold">−</span> Row
                                      </Button>
                                    </div>
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
                                                style={{
                                                  cursor: "pointer",
                                                }}
                                                title="Double-click to edit column name"
                                              >
                                                {editingColumn?.sectionId === sec.id &&
                                                editingColumn?.columnIndex === cIdx ? (
                                                  <input
                                                    type="text"
                                                    value={columnEditValue}
                                                    onChange={(e) =>
                                                      setColumnEditValue(e.target.value)
                                                    }
                                                    onBlur={handleColumnNameSave}
                                                    onKeyDown={(e) => {
                                                      if (e.key === "Enter") {
                                                        e.preventDefault();
                                                        handleColumnNameSave();
                                                      } else if (e.key === "Escape") {
                                                        handleColumnNameCancel();
                                                      }
                                                    }}
                                                    autoFocus
                                                    className="w-full border border-blue-400 rounded px-2 py-1 text-sm font-semibold"
                                                    onClick={(e) => e.stopPropagation()}
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
                                                    value={
                                                      isSlNoColumnName(sec.columns[cIdx])
                                                        ? String(rIdx + 1)
                                                        : col
                                                    }
                                                    disabled={isSlNoColumnName(
                                                      sec.columns[cIdx]
                                                    )}
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
                                <span className="text-sm font-bold">+</span> Column
                              </Button>
                              <Button
                                variant="secondary"
                                size="sm"
                                className="flex items-center gap-1 text-xs h-8"
                                title="Add Row"
                                onClick={() => addRow(sec.id)}
                              >
                                <span className="text-sm font-bold">+</span> Row
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
                                        {editingColumn?.sectionId === sec.id &&
                                        editingColumn?.columnIndex === cIdx ? (
                                          <input
                                            type="text"
                                            value={columnEditValue}
                                            onChange={(e) =>
                                              setColumnEditValue(e.target.value)
                                            }
                                            onBlur={handleColumnNameSave}
                                            onKeyDown={(e) => {
                                              if (e.key === "Enter") {
                                                e.preventDefault();
                                                handleColumnNameSave();
                                              } else if (e.key === "Escape") {
                                                handleColumnNameCancel();
                                              }
                                            }}
                                            autoFocus
                                            className="w-full border border-blue-400 rounded px-2 py-1 text-sm font-semibold"
                                            onClick={(e) => e.stopPropagation()}
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
                                            value={
                                              isSlNoColumnName(sec.columns[cIdx])
                                                ? String(rIdx + 1)
                                                : col
                                            }
                                            disabled={isSlNoColumnName(sec.columns[cIdx])}
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

          <div>
            <Card className="mb-6 print:bg-white">
              <CardContent>
                <div className="flex justify-between items-center mb-4 print:hidden">
                  <h3 className="text-xl font-semibold">Footer Fields</h3>
                  <div className="flex gap-2">
                    <Dialog open={editFooterOpen} onOpenChange={setEditFooterOpen}>
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
                              <span className="text-lg font-bold">+</span> Add Field
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
                                          className="w-full border border-blue-400 rounded px-2 py-1 text-sm font-semibold"
                                          onClick={(e) => e.stopPropagation()}
                                        />
                                      ) : (
                                        <p
                                          className={`text-sm font-semibold text-gray-700 ${
                                            field === "Footer Date"
                                              ? "cursor-default"
                                              : "cursor-pointer"
                                          }`}
                                          onDoubleClick={() =>
                                            handleFooterKeyDoubleClick(index, field)
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
                                          updateFooterValue(index, e.target.value)
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
                              cursor: field === "Footer Date" ? "default" : "pointer",
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
                                onChange={(e) => setFooterKeyEditValue(e.target.value)}
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
                          <TableCell key={index} className="border border-gray-300 p-2">
                            <Input
                              value={footerValues[index] || ""}
                              onChange={(e) => updateFooterValue(index, e.target.value)}
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

      {renderActionsSection()}
    </div>
  );
}

