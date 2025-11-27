import React from "react";
import { useNavigate } from "react-router-dom";
import { useChecklist } from "../contexts/ChecklistContext";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { Button } from "../components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import ChecklistBuilderForm from "@/components/checklist/ChecklistBuilderForm";

const DEFAULT_COLUMNS = [
  "Sl No",
  "Point to Check",
  "Status",
  "Action Required",
  "Remarks",
];

const padRow = (row, targetLength) => {
  const next = [...row];
  while (next.length < targetLength) {
    next.push("");
  }
  return next.slice(0, targetLength);
};

const ensureSectionShape = (section, index) => {
  const columns =
    section.columns && section.columns.length
      ? [...section.columns]
      : Array.from(
          { length: section.rows?.[0]?.length || DEFAULT_COLUMNS.length },
          (_, idx) => DEFAULT_COLUMNS[idx] || `Column ${idx + 1}`
        );

  const rows = (section.rows || []).map((row) => padRow(row, columns.length));

  return {
    id: section.id ?? index + 1,
    title: section.title || `Section ${index + 1}`,
    columns,
    rows,
  };
};

const prepareBuilderInitialData = (checklist) => ({
  headerFields: checklist.headerFields || [],
  headerData: checklist.headerData || {},
  footerFields: checklist.footerFields || [],
  footerData: checklist.footerData || {},
  sections: checklist.sections
    ? checklist.sections.map((section, index) =>
        ensureSectionShape(section, index)
      )
    : [],
});

// Main Checklists Component
export default function Checklists() {
  // Initialize navigate for programmatic navigation
  const navigate = useNavigate();

  // Use checklist context
  const {
    checklists,
    updateChecklist,
    deleteChecklist,
    approveChecklist,
    addChecklist,
  } = useChecklist();

  const [viewIndex, setViewIndex] = React.useState(null);
  const [fillIndex, setFillIndex] = React.useState(null);
  const [fillData, setFillData] = React.useState(null);
  const [editIndex, setEditIndex] = React.useState(null);
  const [editMeta, setEditMeta] = React.useState(null);
  const [editBuilderInitial, setEditBuilderInitial] = React.useState(null);
  const [editBuilderKey, setEditBuilderKey] = React.useState(0);

  // New state for search text
  const [searchText, setSearchText] = React.useState("");

  // Handlers for modals
  const openView = (index) => setViewIndex(index);
  const closeView = () => setViewIndex(null);

  const openEdit = (index) => {
    const checklist = checklists[index];
    setEditIndex(index);
    setEditMeta({
      name: checklist.name || "",
      metadata: {
        createdBy: checklist.metadata?.createdBy || "",
        approvedBy: checklist.metadata?.approvedBy || "",
        effectiveDate: checklist.metadata?.effectiveDate || "",
      },
    });
    setEditBuilderInitial(prepareBuilderInitialData(checklist));
    setEditBuilderKey(Date.now());
  };
  const closeEdit = () => {
    setEditIndex(null);
    setEditMeta(null);
    setEditBuilderInitial(null);
  };

  const openFill = (index) => {
    const checklist = checklists[index];
    setFillIndex(index);
    setFillData({
      ...JSON.parse(JSON.stringify(checklist)),
      headerData: checklist.headerData || {},
      footerData: checklist.footerData || {},
    });
  };
  const closeFill = () => {
    setFillIndex(null);
    setFillData(null);
  };

  // Metadata change handler for fill modal
  const handleMetadataChange = (field, value) => {
    setFillData((prev) => ({
      ...prev,
      metadata: {
        ...prev.metadata,
        [field]: value,
      },
    }));
  };

  // Cell change handler for fill modal
  const handleCellChange = (sectionIndex, rowIndex, colIndex, value) => {
    setFillData((prev) => {
      const newSections = [...prev.sections];
      newSections[sectionIndex].rows[rowIndex][colIndex] = value;
      return { ...prev, sections: newSections };
    });
  };

  const handleFillHeaderChange = (field, value) => {
    setFillData((prev) => ({
      ...prev,
      headerData: {
        ...(prev?.headerData || {}),
        [field]: value,
      },
    }));
  };

  const handleFillFooterChange = (field, value) => {
    setFillData((prev) => ({
      ...prev,
      footerData: {
        ...(prev?.footerData || {}),
        [field]: value,
      },
    }));
  };

  // Save updated checklist
  const saveFilled = () => {
    if (fillIndex === null) return;
    // use context updateChecklist to persist changes
    updateChecklist(fillIndex, fillData);
    closeFill();
    alert("Checklist updated successfully!");
  };

  // Save as a new version
  const saveAsNew = () => {
    if (fillIndex === null) return;
    const newItem = JSON.parse(JSON.stringify(fillData));
    newItem.name = newItem.name + " (Updated)";
    newItem.approved = false;
    addChecklist(newItem);
    closeFill();
    alert("New version created!");
  };

  // Filtered checklists based on searchText
  const filteredChecklists = checklists.filter((item) => {
    const lowerSearch = searchText.toLowerCase();
    return (
      item.name.toLowerCase().includes(lowerSearch) ||
      (item.metadata.createdBy &&
        item.metadata.createdBy.toLowerCase().includes(lowerSearch))
    );
  });

  // Approve checklist
  const approveItem = (index) => {
    // use context approveChecklist for consistency
    approveChecklist(index);
  };

  // Delete checklist after confirmation
  const deleteItem = (index) => {
    if (!window.confirm("Delete this checklist?")) return;
    deleteChecklist(index);
  };

  // Open edit/update modal (uses Edit functionality)
  const openUpdate = (index) => {
    openEdit(index);
  };

  const handleEditNameChange = (value) => {
    setEditMeta((prev) => (prev ? { ...prev, name: value } : prev));
  };

  const handleEditMetadataChange = (field, value) => {
    setEditMeta((prev) =>
      prev
        ? {
            ...prev,
            metadata: {
              ...prev.metadata,
              [field]: value,
            },
          }
        : prev
    );
  };

  const handleEditSubmit = (builderPayload) => {
    if (editIndex === null || !editMeta) return;
    const original = checklists[editIndex];
    const updated = {
      ...original,
      ...builderPayload,
      name: editMeta.name,
      metadata: {
        ...(original.metadata || {}),
        ...(editMeta.metadata || {}),
      },
    };
    updateChecklist(editIndex, updated);
    closeEdit();
    alert("Checklist updated successfully!");
  };

  // Internal reusable component: ChecklistRow for main list
  function ChecklistRow({ item, index }) {
    return (
      <TableRow>
        <TableCell className="font-semibold whitespace-nowrap text-sm">
          {item.name}
        </TableCell>
        <TableCell className="whitespace-nowrap text-sm">
          {item.metadata.createdBy}
        </TableCell>
        <TableCell className="whitespace-nowrap text-sm">
          {item.metadata.approvedBy || "-"}
        </TableCell>
        <TableCell className="whitespace-nowrap text-sm">
          {item.metadata.effectiveDate}
        </TableCell>
        <TableCell className="whitespace-nowrap text-sm">
          <Badge
            variant={item.approved ? "default" : "secondary"}
            className={item.approved ? "" : "bg-amber-500 text-white"}
          >
            {item.approved ? "Approved" : "Pending"}
          </Badge>
        </TableCell>
        <TableCell className="whitespace-nowrap text-sm">
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => approveItem(index)}
            >
              Approve
            </Button>
            <Button
              size="sm"
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
              onClick={() => openFill(index)}
            >
              Fill
            </Button>
          </div>
        </TableCell>
        <TableCell className="text-right whitespace-nowrap">
          <div className="flex justify-end gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => openView(index)}
            >
              View
            </Button>
            <Button size="sm" variant="outline" onClick={() => openEdit(index)}>
              Edit
            </Button>
            {/* <Button
              size="sm"
              variant="outline"
              onClick={() => openUpdate(index)}
            >
              Update
            </Button> */}
            <Button
              size="sm"
              variant="destructive"
              onClick={() => deleteItem(index)}
            >
              Delete
            </Button>
          </div>
        </TableCell>
      </TableRow>
    );
  }

  // Internal reusable component: ChecklistTable for sections inside modals
  // editable: if true, text inputs appear; else plain text display
  // dataSource: 'fill' or 'edit' to determine which data source to use
  function ChecklistTable({
    section,
    sectionIndex,
    editable,
    dataSource = "fill",
  }) {
    return (
      <table className="w-full border-collapse border border-gray-300">
        <tbody>
          {section.rows.map((row, rowIndex) => (
            <tr key={rowIndex} className="bg-white">
              {row.map((col, colIndex) => {
                const getCellValue = () => {
                  if (dataSource === "fill" && fillData) {
                    return fillData.sections[sectionIndex].rows[rowIndex][
                      colIndex
                    ];
                  }
                  return col;
                };

                const handleCellValueChange = (value) => {
                  handleCellChange(sectionIndex, rowIndex, colIndex, value);
                };

                return (
                  <td key={colIndex} className="border border-gray-300 p-2">
                    {editable ? (
                      <input
                        type="text"
                        className="w-full p-1 border border-gray-300 rounded"
                        value={getCellValue()}
                        onChange={(e) => handleCellValueChange(e.target.value)}
                      />
                    ) : (
                      col
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    );
  }

  // Tailwind modal wrapper for consistent style and scroll lock handling
  function Modal({ children, closeHandler }) {
    return (
      <div
        className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex justify-center items-start pt-10 z-50"
        role="dialog"
        aria-modal="true"
      >
        <div className="bg-white rounded-xl max-w-4xl w-full max-h-[85vh] overflow-y-auto p-6 relative shadow-lg">
          <button
            onClick={closeHandler}
            className="absolute top-4 right-4 text-gray-700 hover:text-gray-900 focus:outline-none"
            aria-label="Close modal"
          >
            ✖
          </button>
          {children}
        </div>
      </div>
    );
  }

  // View Modal component
  function ViewModal() {
    if (viewIndex === null) return null;
    const item = checklists[viewIndex];

    return (
      <Modal closeHandler={closeView}>
        <h2 className="text-2xl font-semibold mb-4">{item.name}</h2>

        <div className="bg-gray-100 p-4 rounded-lg mb-6 space-y-2">
          <p>
            <strong>Created By:</strong> {item.metadata.createdBy}
          </p>
          <p>
            <strong>Approved By:</strong>{" "}
            {item.metadata.approvedBy || "Not approved"}
          </p>
          <p>
            <strong>Effective Date:</strong> {item.metadata.effectiveDate}
          </p>
        </div>

        {item.headerFields && item.headerFields.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Header Fields</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-blue-50 p-4 rounded-lg">
              {item.headerFields.map((field, idx) => (
                <div
                  key={idx}
                  className="border border-blue-300 rounded p-2 bg-white"
                >
                  <p className="text-sm font-semibold text-gray-700">{field}</p>
                  <p className="text-xs text-gray-600">
                    {item.headerData?.[field] || "—"}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {item.sections.map((section, i) => (
          <section key={i} className="mb-6">
            <h3 className="text-xl font-semibold mb-2">
              {section.title || `Section ${i + 1}`}
            </h3>
            <ChecklistTable
              section={section}
              sectionIndex={i}
              editable={false}
            />
          </section>
        ))}

        {item.footerFields &&
          item.footerFields.length > 0 &&
          (() => {
            // Separate signature fields and non-signature footer fields
            const signatureFields = item.footerFields.filter((field) =>
              field.toLowerCase().includes("signature")
            );
            const otherFooterFields = item.footerFields.filter(
              (field) => !field.toLowerCase().includes("signature")
            );

            return (
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-3">Footer Fields</h3>

                {signatureFields.length > 0 && (
                  <div className="mb-4 p-4 bg-green-100 rounded border border-green-400">
                    <h4 className="font-semibold mb-2">Signature(s)</h4>
                    <div className="flex flex-wrap gap-4">
                      {signatureFields.map((field, idx) => (
                        <div
                          key={idx}
                          className="border border-green-500 rounded p-3 bg-white min-w-[120px]"
                        >
                          <p className="text-sm font-semibold text-gray-700">
                            {field}
                          </p>
                          <p className="text-xs text-gray-600 break-words">
                            {item.footerData?.[field] || "—"}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {otherFooterFields.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-green-50 p-4 rounded-lg">
                    {otherFooterFields.map((field, idx) => (
                      <div
                        key={idx}
                        className="border border-green-300 rounded p-2 bg-white"
                      >
                        <p className="text-sm font-semibold text-gray-700">
                          {field}
                        </p>
                        <p className="text-xs text-gray-600">
                          {item.footerData?.[field] || "—"}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })()}
      </Modal>
    );
  }

  // Edit Modal component
  function EditModal() {
    if (editIndex === null || !editMeta || !editBuilderInitial) return null;

    return (
      <Modal closeHandler={closeEdit}>
        <h2 className="text-2xl font-semibold mb-4">Edit: {editMeta.name}</h2>

        <div className="mb-6">
          <Label htmlFor="edit-name" className="block font-semibold mb-2">
            Checklist Name
          </Label>
          <Input
            id="edit-name"
            type="text"
            value={editMeta.name || ""}
            onChange={(e) => handleEditNameChange(e.target.value)}
            className="w-full"
          />
        </div>

        <div className="bg-gray-100 p-4 rounded-lg mb-6 space-y-4">
          <MetadataInput
            label="Created By"
            value={editMeta.metadata?.createdBy || ""}
            onChange={(val) => handleEditMetadataChange("createdBy", val)}
          />
          <MetadataInput
            label="Approved By"
            value={editMeta.metadata?.approvedBy || ""}
            onChange={(val) => handleEditMetadataChange("approvedBy", val)}
          />
          <MetadataInput
            label="Effective Date"
            type="date"
            value={editMeta.metadata?.effectiveDate || ""}
            onChange={(val) => handleEditMetadataChange("effectiveDate", val)}
          />
        </div>

        <ChecklistBuilderForm
          initialData={editBuilderInitial}
          onSubmit={handleEditSubmit}
          submitLabel="Save Changes"
          showDownloadActions={false}
          floatingActionBar={false}
          title=""
          stateKey={editBuilderKey}
          renderActions={({ handleSubmit }) => (
            <div className="flex justify-end gap-2 mt-6">
              <Button onClick={closeEdit} variant="outline" className="px-4 py-2">
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2"
              >
                Save Changes
              </Button>
            </div>
          )}
        />
      </Modal>
    );
  }

  // Fill Modal component
  function FillModal() {
    if (fillIndex === null || !fillData) return null;

    return (
      <Modal closeHandler={closeFill}>
        <h2 className="text-2xl font-semibold mb-4">Fill: {fillData.name}</h2>

        <div className="bg-gray-100 p-4 rounded-lg mb-6 space-y-4">
          <MetadataInput
            label="Created By"
            value={fillData.metadata.createdBy}
            onChange={(val) => handleMetadataChange("createdBy", val)}
          />
          <MetadataInput
            label="Approved By"
            value={fillData.metadata.approvedBy}
            onChange={(val) => handleMetadataChange("approvedBy", val)}
          />
          <MetadataInput
            label="Effective Date"
            type="date"
            value={fillData.metadata.effectiveDate}
            onChange={(val) => handleMetadataChange("effectiveDate", val)}
          />
        </div>

        {fillData.headerFields && fillData.headerFields.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Header Fields</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-blue-50 p-4 rounded-lg">
              {fillData.headerFields.map((field, idx) => (
                <div
                  key={idx}
                  className="flex flex-col gap-2 border border-blue-200 rounded p-3 bg-white"
                >
                  <Label className="text-sm font-semibold text-gray-700">
                    {field}
                  </Label>
                  <Input
                    value={fillData.headerData?.[field] || ""}
                    onChange={(e) => handleFillHeaderChange(field, e.target.value)}
                    placeholder={`Enter ${field}`}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {fillData.sections.map((section, i) => (
          <section key={i} className="mb-6">
            <h3 className="text-xl font-semibold mb-2">
              {section.title || `Section ${i + 1}`}
            </h3>
            <ChecklistTable
              section={section}
              sectionIndex={i}
              editable={true}
            />
          </section>
        ))}

        {fillData.footerFields && fillData.footerFields.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Footer Fields</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-green-50 p-4 rounded-lg">
              {fillData.footerFields.map((field, idx) => (
                <div
                  key={idx}
                  className="flex flex-col gap-2 border border-green-200 rounded p-3 bg-white"
                >
                  <Label className="text-sm font-semibold text-gray-700">
                    {field}
                  </Label>
                  <Input
                    value={fillData.footerData?.[field] || ""}
                    onChange={(e) => handleFillFooterChange(field, e.target.value)}
                    placeholder={`Enter ${field}`}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex space-x-2">
          <button
            onClick={saveFilled}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 focus:outline-none"
          >
            💾 Save Changes
          </button>
          {/* <button
            onClick={saveAsNew}
            className="bg-gray-700 text-white px-4 py-2 rounded hover:bg-gray-800 focus:outline-none"
          >
            📘 Save As New Version
          </button> */}
        </div>
      </Modal>
    );
  }

  // Metadata Input small reusable component for fill modal inputs
  function MetadataInput({ label, value, onChange, type = "text" }) {
    return (
      <div>
        <label className="block font-semibold mb-1">{label}</label>
        <input
          type={type}
          className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Checklist Workspace</h1>
            <p className="text-muted-foreground text-sm md:text-base">
              Review, fill, approve and manage every safety checklist.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate("/create-list")}>
              Create Checklist
            </Button>
          </div>
        </div>

        <Card>
          <CardContent className="flex flex-col gap-4 p-4 md:flex-row md:items-end">
            <div className="flex-1 space-y-2">
              <Label htmlFor="search-input" className="text-sm font-semibold">
                Search Checklists
              </Label>
              <Input
                id="search-input"
                type="text"
                placeholder="Search by document name or created by..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="approved" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="approved">Approved</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
          </TabsList>

          <TabsContent value="approved" className="space-y-6">
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Document Name</TableHead>
                        <TableHead>Created By</TableHead>
                        <TableHead>Approved By</TableHead>
                        <TableHead>Effective Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Workflow</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredChecklists
                        .filter((item) => item.approved)
                        .map((item) => {
                          const originalIndex = checklists.findIndex(
                            (c) => c === item
                          );
                          return (
                            <ChecklistRow
                              key={originalIndex}
                              item={item}
                              index={originalIndex}
                            />
                          );
                        })}
                    </TableBody>
                  </Table>
                  {filteredChecklists.filter((item) => item.approved).length === 0 && (
                    <div className="py-8 text-center text-muted-foreground">
                      No approved checklists found.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pending" className="space-y-6">
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Document Name</TableHead>
                        <TableHead>Created By</TableHead>
                        <TableHead>Approved By</TableHead>
                        <TableHead>Effective Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Workflow</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredChecklists
                        .filter((item) => !item.approved)
                        .map((item) => {
                          const originalIndex = checklists.findIndex(
                            (c) => c === item
                          );
                          return (
                            <ChecklistRow
                              key={originalIndex}
                              item={item}
                              index={originalIndex}
                            />
                          );
                        })}
                    </TableBody>
                  </Table>
                  {filteredChecklists.filter((item) => !item.approved).length === 0 && (
                    <div className="py-8 text-center text-muted-foreground">
                      All checklists are approved. ✅
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <ViewModal />
        <EditModal />
        <FillModal />
      </div>
    </>
  );
}
