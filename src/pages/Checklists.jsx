import React from "react";
import { useNavigate } from "react-router-dom";
import { useChecklist } from "../contexts/ChecklistContext";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
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
  const [editData, setEditData] = React.useState(null);

  // New state for search text
  const [searchText, setSearchText] = React.useState("");

  // Handlers for modals
  const openView = (index) => setViewIndex(index);
  const closeView = () => setViewIndex(null);

  const openEdit = (index) => {
    const checklist = checklists[index];
    setEditIndex(index);
    setEditData({
      ...JSON.parse(JSON.stringify(checklist)),
      headerFields: checklist.headerFields || [],
      footerFields: checklist.footerFields || [],
    });
  };
  const closeEdit = () => {
    setEditIndex(null);
    setEditData(null);
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

  // Handle edit data changes
  const handleEditChange = (field, value) => {
    setEditData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Handle edit metadata changes
  const handleEditMetadataChange = (field, value) => {
    setEditData((prev) => ({
      ...prev,
      metadata: {
        ...prev.metadata,
        [field]: value,
      },
    }));
  };

  // Handle edit cell changes
  const handleEditCellChange = (sectionIndex, rowIndex, colIndex, value) => {
    setEditData((prev) => {
      const newSections = [...prev.sections];
      newSections[sectionIndex].rows[rowIndex][colIndex] = value;
      return { ...prev, sections: newSections };
    });
  };

  // Handle edit header field changes
  const handleEditHeaderFieldChange = (index, value) => {
    setEditData((prev) => {
      const newHeaderFields = [...prev.headerFields];
      newHeaderFields[index] = value;
      return { ...prev, headerFields: newHeaderFields };
    });
  };

  // Handle edit footer field changes
  const handleEditFooterFieldChange = (index, value) => {
    setEditData((prev) => {
      const newFooterFields = [...prev.footerFields];
      newFooterFields[index] = value;
      return { ...prev, footerFields: newFooterFields };
    });
  };

  // Save edited checklist
  const saveEdit = () => {
    if (editIndex === null || !editData) return;
    updateChecklist(editIndex, editData);
    closeEdit();
    alert("Checklist updated successfully!");
  };

  // Internal reusable component: ChecklistRow for main list
  function ChecklistRow({ item, index }) {
    return (
      <tr className="">
        <td className="border border-gray-300 px-4 py-2">{item.name}</td>
        <td className="border border-gray-300 px-4 py-2">
          {item.metadata.createdBy}
        </td>
        <td className="border border-gray-300 px-4 py-2">
          {item.metadata.approvedBy || "-"}
        </td>
        <td className="border border-gray-300 px-4 py-2">
          {item.metadata.effectiveDate}
        </td>
        <td className="border border-gray-300 px-4 py-2">
          {item.approved ? "Approved" : "Pending"}
        </td>
        <td className="border border-gray-300 px-4 py-2">
          <div className="space-y-2">
            {/* CRUD Operations Section */}
            <div className="flex flex-wrap gap-1 items-center">
              <span className="text-xs font-semibold text-gray-600 mr-1 whitespace-nowrap">
                Actions:
              </span>
              <Button
                onClick={() => openEdit(index)}
                className="bg-purple-600 hover:bg-purple-700 text-white text-xs rounded px-2 py-1"
                title="Edit checklist"
              >
                Edit
              </Button>
              <Button
                onClick={() => openView(index)}
                className="bg-blue-700 hover:bg-blue-800 text-white text-xs rounded px-2 py-1"
                title="View (Read) checklist"
              >
                View
              </Button>
              <Button
                onClick={() => openUpdate(index)}
                className="bg-yellow-600 hover:bg-yellow-700 text-white text-xs rounded px-2 py-1"
                title="Update checklist"
              >
                Update
              </Button>
              <Button
                onClick={() => deleteItem(index)}
                className="bg-red-600 hover:bg-red-700 text-white text-xs rounded px-2 py-1"
                title="Delete checklist"
              >
                Delete
              </Button>
            </div>
            {/* Workflow Actions Section */}
            <div className="flex flex-wrap gap-1 items-center">
              <span className="text-xs font-semibold text-gray-600 mr-1 whitespace-nowrap">
                Other:
              </span>
              <Button
                onClick={() => approveItem(index)}
                className="bg-green-600 hover:bg-green-700 text-white text-xs rounded px-2 py-1"
                title="Approve checklist"
              >
                Approve
              </Button>
              <Button
                onClick={() => openFill(index)}
                className="bg-teal-600 hover:bg-teal-700 text-white text-xs rounded px-2 py-1"
                title="Fill checklist"
              >
                Fill
              </Button>
            </div>
          </div>
        </td>
      </tr>
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
                  if (dataSource === "edit" && editData) {
                    return editData.sections[sectionIndex].rows[rowIndex][
                      colIndex
                    ];
                  } else if (dataSource === "fill" && fillData) {
                    return fillData.sections[sectionIndex].rows[rowIndex][
                      colIndex
                    ];
                  }
                  return col;
                };

                const handleCellValueChange = (value) => {
                  if (dataSource === "edit") {
                    handleEditCellChange(
                      sectionIndex,
                      rowIndex,
                      colIndex,
                      value
                    );
                  } else {
                    handleCellChange(sectionIndex, rowIndex, colIndex, value);
                  }
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
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-blue-50 p-4 rounded-lg">
              {item.headerFields.map((field, idx) => (
                <div
                  key={idx}
                  className="border border-blue-300 rounded p-2 bg-white"
                >
                  <p className="text-sm font-medium text-gray-700">{field}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {item.sections.map((section, i) => (
          <section key={i} className="mb-6">
            <h3 className="text-xl font-semibold mb-2">Section {i + 1}</h3>
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
                          <p className="text-sm font-medium text-gray-700">
                            {field}
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
                        <p className="text-sm font-medium text-gray-700">
                          {field}
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
    if (editIndex === null || !editData) return null;

    return (
      <Modal closeHandler={closeEdit}>
        <h2 className="text-2xl font-semibold mb-4">Edit: {editData.name}</h2>

        {/* Checklist Name */}
        <div className="mb-6">
          <Label htmlFor="edit-name" className="block font-semibold mb-2">
            Checklist Name
          </Label>
          <Input
            id="edit-name"
            type="text"
            value={editData.name || ""}
            onChange={(e) => handleEditChange("name", e.target.value)}
            className="w-full"
          />
        </div>

        {/* Metadata */}
        <div className="bg-gray-100 p-4 rounded-lg mb-6 space-y-4">
          <MetadataInput
            label="Created By"
            value={editData.metadata?.createdBy || ""}
            onChange={(val) => handleEditMetadataChange("createdBy", val)}
          />
          <MetadataInput
            label="Approved By"
            value={editData.metadata?.approvedBy || ""}
            onChange={(val) => handleEditMetadataChange("approvedBy", val)}
          />
          <MetadataInput
            label="Effective Date"
            type="date"
            value={editData.metadata?.effectiveDate || ""}
            onChange={(val) => handleEditMetadataChange("effectiveDate", val)}
          />
        </div>

        {/* Header Fields */}
        {editData.headerFields && editData.headerFields.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Header Fields</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-blue-50 p-4 rounded-lg">
              {editData.headerFields.map((field, idx) => (
                <div
                  key={idx}
                  className="border border-blue-300 rounded p-2 bg-white"
                >
                  <input
                    type="text"
                    className="w-full p-1 border border-gray-300 rounded text-sm"
                    value={field}
                    onChange={(e) =>
                      handleEditHeaderFieldChange(idx, e.target.value)
                    }
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Sections */}
        {editData.sections.map((section, i) => (
          <section key={i} className="mb-6">
            <h3 className="text-xl font-semibold mb-2">Section {i + 1}</h3>
            <ChecklistTable
              section={section}
              sectionIndex={i}
              editable={true}
              dataSource="edit"
            />
          </section>
        ))}

        {/* Footer Fields */}
        {editData.footerFields && editData.footerFields.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-3">Footer Fields</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-green-50 p-4 rounded-lg">
              {editData.footerFields.map((field, idx) => (
                <div
                  key={idx}
                  className="border border-green-300 rounded p-2 bg-white"
                >
                  <input
                    type="text"
                    className="w-full p-1 border border-gray-300 rounded text-sm"
                    value={field}
                    onChange={(e) =>
                      handleEditFooterFieldChange(idx, e.target.value)
                    }
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Save Button */}
        <div className="flex justify-end space-x-2 mt-6">
          <Button onClick={closeEdit} variant="outline" className="px-4 py-2">
            Cancel
          </Button>
          <Button
            onClick={saveEdit}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2"
          >
            Save Changes
          </Button>
        </div>
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

        {fillData.sections.map((section, i) => (
          <section key={i} className="mb-6">
            <h3 className="text-xl font-semibold mb-2">Section {i + 1}</h3>
            <ChecklistTable
              section={section}
              sectionIndex={i}
              editable={true}
            />
          </section>
        ))}

        <div className="flex space-x-2">
          <button
            onClick={saveFilled}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 focus:outline-none"
          >
            💾 Save Changes
          </button>
          <button
            onClick={saveAsNew}
            className="bg-gray-700 text-white px-4 py-2 rounded hover:bg-gray-800 focus:outline-none"
          >
            📘 Save As New Version
          </button>
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
    <div className="p-6 bg-gray-100 min-h-screen">
      <Card className="max-w-6xl mx-auto">
        <CardHeader>
          <div className="flex justify-between items-center w-full">
            <div>
              <CardTitle>Checklist Document Manager – POC</CardTitle>
              <CardDescription>
                Preview, fill, approve and manage your checklists.
              </CardDescription>
            </div>
            <div>
              <Button
                onClick={() => navigate("/create-list")}
                className="bg-blue-700 hover:bg-blue-800 text-white text-sm rounded px-3 py-1"
              >
                Create List
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="mb-4">
            <Label htmlFor="search-input" className="font-semibold mb-1 block">
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

          <Tabs defaultValue="approved" className="w-full">
            {/* Tabs: Approved/Pending views for checklist documents. Search applies across both tabs. */}
            <TabsList className="grid w-full max-w-md grid-cols-2 items-center">
              <TabsTrigger value="approved">Approved</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
            </TabsList>

            <TabsContent value="approved" className="space-y-6">
              <div className="overflow-x-auto rounded shadow border border-gray-300">
                <table className="w-full border-collapse border border-gray-300 min-w-[700px]">
                  <thead>
                    <tr className="bg-gray-200 sticky top-0">
                      <th className="border border-gray-300 px-4 py-2 text-left">
                        Document Name
                      </th>
                      <th className="border border-gray-300 px-4 py-2 text-left">
                        Created By
                      </th>
                      <th className="border border-gray-300 px-4 py-2 text-left">
                        Approved By
                      </th>
                      <th className="border border-gray-300 px-4 py-2 text-left">
                        Effective Date
                      </th>
                      <th className="border border-gray-300 px-4 py-2 text-left">
                        Status
                      </th>
                      <th className="border border-gray-300 px-4 py-2 text-left">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
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
                  </tbody>
                </table>
              </div>
            </TabsContent>

            <TabsContent value="pending" className="space-y-6">
              <div className="overflow-x-auto rounded shadow border border-gray-300">
                <table className="w-full border-collapse border border-gray-300 min-w-[700px]">
                  <thead>
                    <tr className="bg-gray-200 sticky top-0">
                      <th className="border border-gray-300 px-4 py-2 text-left">
                        Document Name
                      </th>
                      <th className="border border-gray-300 px-4 py-2 text-left">
                        Created By
                      </th>
                      <th className="border border-gray-300 px-4 py-2 text-left">
                        Approved By
                      </th>
                      <th className="border border-gray-300 px-4 py-2 text-left">
                        Effective Date
                      </th>
                      <th className="border border-gray-300 px-4 py-2 text-left">
                        Status
                      </th>
                      <th className="border border-gray-300 px-4 py-2 text-left">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
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
                  </tbody>
                </table>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <ViewModal />
      <EditModal />
      <FillModal />
    </div>
  );
}
