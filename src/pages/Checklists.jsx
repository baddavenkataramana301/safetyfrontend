import { Link } from "lucide-react";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const initialChecklists = [
  {
    name: "Fire Safety Inspection – Block A",
    approved: false,
    metadata: {
      createdBy: "Ramesh Kumar",
      approvedBy: "",
      effectiveDate: "2025-01-18",
    },
    sections: [
      {
        rows: [
          ["1", "Extinguishers mounted properly", "OK", "No action", "Good"],
          [
            "2",
            "Smoke detectors working",
            "NOT OK",
            "Replace",
            "2 faulty units",
          ],
        ],
      },
    ],
  },
  {
    name: "Electrical Audit – Floor 2",
    approved: true,
    metadata: {
      createdBy: "Suresh",
      approvedBy: "HSE Manager",
      effectiveDate: "2025-01-10",
    },
    sections: [
      {
        rows: [
          ["1", "MCB labeling correct", "OK", "-", "-"],
          ["2", "Loose wiring found", "OK", "-", "-"],
        ],
      },
    ],
  },
];

export default function Checklists() {
  const [checklists, setChecklists] = useState(initialChecklists);
  const [viewIndex, setViewIndex] = useState(null);
  const [fillIndex, setFillIndex] = useState(null);
  const [fillData, setFillData] = useState(null);

  // Open view modal
  const openView = (index) => {
    setViewIndex(index);
  };

  // Close view modal
  const closeView = () => {
    setViewIndex(null);
  };

  // Open fill modal and init fillData
  const openFill = (index) => {
    setFillIndex(index);
    // Deep copy item to fillData to allow editing
    const item = checklists[index];
    setFillData(JSON.parse(JSON.stringify(item)));
  };

  // Close fill modal
  const closeFill = () => {
    setFillIndex(null);
    setFillData(null);
  };

  // Handle metadata change in fill modal
  const handleMetadataChange = (field, value) => {
    setFillData((prev) => ({
      ...prev,
      metadata: {
        ...prev.metadata,
        [field]: value,
      },
    }));
  };

  // Handle cell change in fill modal (sectionIndex, rowIndex, colIndex)
  const handleCellChange = (sectionIndex, rowIndex, colIndex, value) => {
    setFillData((prev) => {
      const newSections = [...prev.sections];
      newSections[sectionIndex].rows[rowIndex][colIndex] = value;
      return { ...prev, sections: newSections };
    });
  };

  // Save filled updates (update existing)
  const saveFilled = () => {
    if (fillIndex === null) return;
    const newChecklists = [...checklists];
    newChecklists[fillIndex] = fillData;
    setChecklists(newChecklists);
    closeFill();
    alert("Checklist updated successfully!");
  };

  // Save as new version
  const saveAsNew = () => {
    if (fillIndex === null) return;
    const newItem = JSON.parse(JSON.stringify(fillData));
    newItem.name = newItem.name + " (Updated)";
    newItem.approved = false;
    const newChecklists = [...checklists, newItem];
    setChecklists(newChecklists);
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

  // Delete checklist with confirmation
  const deleteItem = (index) => {
    if (!window.confirm("Delete this checklist?")) return;
    const newChecklists = [...checklists];
    newChecklists.splice(index, 1);
    setChecklists(newChecklists);
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="max-w-6xl mx-auto bg-white p-6 rounded-xl shadow-md">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold">
            Checklist Document Manager – POC
          </h1>

          <button
            onClick={() => navigate("/create-list")}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded"
          >
            Create List
          </button>
        </div>
        <p className="mb-6 text-gray-700">
          Preview, fill, approve and manage your checklists.
        </p>

        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-200">
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
              <tr key={index} className="even:bg-gray-50">
                <td className="border border-gray-300 px-4 py-2">
                  {item.name}
                </td>
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
            ))}
          </tbody>
        </table>
      </div>

      {/* View Modal */}
      {viewIndex !== null && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex justify-center items-start pt-10 z-50">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[85vh] overflow-y-auto p-6 relative">
            <button
              className="absolute top-4 right-4 text-gray-700 hover:text-gray-900"
              onClick={closeView}
            >
              Close ✖
            </button>
            <h2 className="text-2xl font-semibold mb-4">
              {checklists[viewIndex].name}
            </h2>
            <div className="bg-gray-100 p-4 rounded-lg mb-6">
              <p>
                <strong>Created By:</strong>{" "}
                {checklists[viewIndex].metadata.createdBy}
              </p>
              <p>
                <strong>Approved By:</strong>{" "}
                {checklists[viewIndex].metadata.approvedBy || "Not approved"}
              </p>
              <p>
                <strong>Effective Date:</strong>{" "}
                {checklists[viewIndex].metadata.effectiveDate}
              </p>
            </div>
            {checklists[viewIndex].sections.map((section, i) => (
              <div key={i} className="mb-6">
                <h3 className="text-xl font-semibold mb-2">Section {i + 1}</h3>
                <table className="w-full border-collapse border border-gray-300">
                  <tbody>
                    {section.rows.map((row, ri) => (
                      <tr key={ri} className="bg-white">
                        {row.map((col, ci) => (
                          <td key={ci} className="border border-gray-300 p-2">
                            {col}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Fill Modal */}
      {fillIndex !== null && fillData && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex justify-center items-start pt-10 z-50">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[85vh] overflow-y-auto p-6 relative">
            <button
              className="absolute top-4 right-4 text-gray-700 hover:text-gray-900"
              onClick={closeFill}
            >
              Close ✖
            </button>
            <h2 className="text-2xl font-semibold mb-4">
              Fill: {fillData.name}
            </h2>

            <div className="bg-gray-100 p-4 rounded-lg mb-6 space-y-4">
              <div>
                <label className="block font-semibold mb-1">Created By</label>
                <input
                  type="text"
                  className="w-full p-2 border border-gray-300 rounded"
                  value={fillData.metadata.createdBy}
                  onChange={(e) =>
                    handleMetadataChange("createdBy", e.target.value)
                  }
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Approved By</label>
                <input
                  type="text"
                  className="w-full p-2 border border-gray-300 rounded"
                  value={fillData.metadata.approvedBy}
                  onChange={(e) =>
                    handleMetadataChange("approvedBy", e.target.value)
                  }
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">
                  Effective Date
                </label>
                <input
                  type="date"
                  className="w-full p-2 border border-gray-300 rounded"
                  value={fillData.metadata.effectiveDate}
                  onChange={(e) =>
                    handleMetadataChange("effectiveDate", e.target.value)
                  }
                />
              </div>
            </div>

            {fillData.sections.map((section, si) => (
              <div key={si} className="mb-6">
                <h3 className="text-xl font-semibold mb-2">Section {si + 1}</h3>
                <table className="w-full border-collapse border border-gray-300">
                  <tbody>
                    {section.rows.map((row, ri) => (
                      <tr key={ri} className="bg-white">
                        {row.map((col, ci) => (
                          <td key={ci} className="border border-gray-300 p-1">
                            <input
                              type="text"
                              className="w-full p-1 border border-gray-300 rounded"
                              value={fillData.sections[si].rows[ri][ci]}
                              onChange={(e) =>
                                handleCellChange(si, ri, ci, e.target.value)
                              }
                            />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}

            <div className="flex space-x-2">
              <button
                onClick={saveFilled}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                💾 Save Changes
              </button>
              <button
                onClick={saveAsNew}
                className="bg-gray-700 text-white px-4 py-2 rounded hover:bg-gray-800"
              >
                📘 Save As New Version
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
