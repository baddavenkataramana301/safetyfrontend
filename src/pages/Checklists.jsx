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

  // Handlers for modals
  const openView = (index) => setViewIndex(index);
  const closeView = () => setViewIndex(null);

  const openFill = (index) => {
    setFillIndex(index);
    setFillData(JSON.parse(JSON.stringify(checklists[index])));
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
    const newChecklists = [...checklists];
    newChecklists[fillIndex] = fillData;
    setChecklists(newChecklists);
    closeFill();
    alert("Checklist updated successfully!");
  };

  // Save as a new version
  const saveAsNew = () => {
    if (fillIndex === null) return;
    const newItem = JSON.parse(JSON.stringify(fillData));
    newItem.name = newItem.name + " (Updated)";
    newItem.approved = false;
    setChecklists((prev) => [...prev, newItem]);
    closeFill();
    alert("New version created!");
  };

  // Approve checklist
  const approveItem = (index) => {
    const newChecklists = [...checklists];
    newChecklists[index].approved = true;
    newChecklists[index].metadata.approvedBy = "Approved Internally ✔";
    setChecklists(newChecklists);
  };

  // Delete checklist after confirmation
  const deleteItem = (index) => {
    if (!window.confirm("Delete this checklist?")) return;
    const newChecklists = [...checklists];
    newChecklists.splice(index, 1);
    setChecklists(newChecklists);
  };

  // Internal reusable component: ChecklistRow for main list
  function ChecklistRow({ item, index }) {
    return (
      <tr className="even:bg-gray-50">
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
        <td className="border border-gray-300 px-4 py-2 space-x-2">
          <button
            onClick={() => openView(index)}
            className="bg-blue-700 hover:bg-blue-800 text-white text-sm rounded px-3 py-1"
          >
            View
          </button>
          <button
            onClick={() => openFill(index)}
            className="bg-teal-600 hover:bg-teal-700 text-white text-sm rounded px-3 py-1"
          >
            Fill
          </button>
          <button
            onClick={() => approveItem(index)}
            className="bg-green-600 hover:bg-green-700 text-white text-sm rounded px-3 py-1"
          >
            Approve
          </button>
          <button
            onClick={() => deleteItem(index)}
            className="bg-red-600 hover:bg-red-700 text-white text-sm rounded px-3 py-1"
          >
            Delete
          </button>
        </td>
      </tr>
    );
  }

  // Internal reusable component: ChecklistTable for sections inside modals
  // editable: if true, text inputs appear; else plain text display
  function ChecklistTable({ section, sectionIndex, editable }) {
    return (
      <table className="w-full border-collapse border border-gray-300">
        <tbody>
          {section.rows.map((row, rowIndex) => (
            <tr key={rowIndex} className="bg-white">
              {row.map((col, colIndex) => (
                <td key={colIndex} className="border border-gray-300 p-2">
                  {editable ? (
                    <input
                      type="text"
                      className="w-full p-1 border border-gray-300 rounded"
                      value={
                        fillData.sections[sectionIndex].rows[rowIndex][colIndex]
                      }
                      onChange={(e) =>
                        handleCellChange(
                          sectionIndex,
                          rowIndex,
                          colIndex,
                          e.target.value
                        )
                      }
                    />
                  ) : (
                    col
                  )}
                </td>
              ))}
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
      <div className="max-w-6xl mx-auto bg-white p-6 rounded-xl shadow-md">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold">
            Checklist Document Manager – POC
          </h1>
          <button
            onClick={() => navigate("/create-list")}
            className="bg-blue-700 hover:bg-blue-800 text-white text-sm rounded px-3 py-1"
          >
            Create List
          </button>
        </div>
        <p className="mb-6 text-gray-700">
          Preview, fill, approve and manage your checklists.
        </p>

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
              {checklists.map((item, index) => (
                <ChecklistRow key={index} item={item} index={index} />
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <ViewModal />
      <FillModal />
    </div>
  );
}
