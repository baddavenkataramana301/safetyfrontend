import React, { useState, useEffect } from "react";

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

export default function CreateList() {
  const [savedChecklists, setSavedChecklists] = useState(initialChecklists);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [fillViewerOpen, setFillViewerOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(null);
  const [editMetadata, setEditMetadata] = useState({
    createdBy: "",
    approvedBy: "",
    effectiveDate: "",
  });
  const [editSections, setEditSections] = useState([]);

  useEffect(() => {
    // close modals when no active index
    if (activeIndex === null) {
      setViewerOpen(false);
      setFillViewerOpen(false);
    }
  }, [activeIndex]);

  // Load list equivalent is handled by rendering from state

  function openItem(index) {
    setActiveIndex(index);
    setViewerOpen(true);
    setFillViewerOpen(false);
  }

  function closeViewer() {
    setViewerOpen(false);
    setActiveIndex(null);
  }

  function fillItem(index) {
    setActiveIndex(index);
    const item = savedChecklists[index];
    setEditMetadata({
      createdBy: item.metadata.createdBy,
      approvedBy: item.metadata.approvedBy,
      effectiveDate: item.metadata.effectiveDate,
    });
    // clone rows deeply
    const sectionsClone = item.sections.map((section) => ({
      rows: section.rows.map((row) => [...row]),
    }));
    setEditSections(sectionsClone);
    setFillViewerOpen(true);
    setViewerOpen(false);
  }

  function closeFill() {
    setFillViewerOpen(false);
    setActiveIndex(null);
  }

  function saveFilled() {
    if (activeIndex === null) return;
    setSavedChecklists((prev) => {
      const updated = [...prev];
      updated[activeIndex] = {
        ...updated[activeIndex],
        metadata: { ...editMetadata },
        sections: editSections,
      };
      return updated;
    });
    closeFill();
    alert("Checklist updated successfully!");
  }

  function saveAsNew() {
    if (activeIndex === null) return;
    setSavedChecklists((prev) => {
      const original = prev[activeIndex];
      const newItem = {
        ...JSON.parse(JSON.stringify(original)),
        name: original.name + " (Updated)",
        approved: false,
        metadata: { ...editMetadata },
        sections: editSections,
      };
      return [...prev, newItem];
    });
    closeFill();
    alert("New version created!");
  }

  function approveItem(index) {
    setSavedChecklists((prev) => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        approved: true,
        metadata: {
          ...updated[index].metadata,
          approvedBy: "Approved Internally ✔",
        },
      };
      return updated;
    });
  }

  function deleteItem(index) {
    if (!window.confirm("Delete this checklist?")) return;
    setSavedChecklists((prev) => {
      const updated = [...prev];
      updated.splice(index, 1);
      return updated;
    });
  }

  // Controlled input change handlers for fill modal
  function handleMetadataChange(e) {
    const { id, value } = e.target;
    setEditMetadata((prev) => ({ ...prev, [id]: value }));
  }

  function handleSectionInputChange(sectionIdx, rowIdx, colIdx, value) {
    setEditSections((prev) => {
      const newSections = [...prev];
      newSections[sectionIdx].rows[rowIdx][colIdx] = value;
      return newSections;
    });
  }

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white rounded-lg shadow-md mt-6">
      <h1 className="text-3xl font-bold mb-2">
        Checklist Document Manager – POC
      </h1>
      <p className="mb-6">Preview, fill, approve and manage your checklists.</p>

      <table className="w-full border border-gray-300 border-collapse mb-6">
        <thead>
          <tr className="bg-gray-200">
            <th className="p-3 border border-gray-300 text-left">
              Document Name
            </th>
            <th className="p-3 border border-gray-300 text-left">Created By</th>
            <th className="p-3 border border-gray-300 text-left">
              Approved By
            </th>
            <th className="p-3 border border-gray-300 text-left">
              Effective Date
            </th>
            <th className="p-3 border border-gray-300 text-left">Status</th>
            <th className="p-3 border border-gray-300 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {savedChecklists.map((item, index) => (
            <tr key={index} className="odd:bg-white even:bg-gray-50">
              <td className="p-3 border border-gray-300">{item.name}</td>
              <td className="p-3 border border-gray-300">
                {item.metadata.createdBy}
              </td>
              <td className="p-3 border border-gray-300">
                {item.metadata.approvedBy || "-"}
              </td>
              <td className="p-3 border border-gray-300">
                {item.metadata.effectiveDate}
              </td>
              <td className="p-3 border border-gray-300">
                {item.approved ? "Approved" : "Pending"}
              </td>
              <td className="p-3 border border-gray-300 space-x-2">
                <button
                  onClick={() => openItem(index)}
                  className="bg-indigo-600 text-white px-3 py-1 rounded hover:bg-indigo-700"
                >
                  View
                </button>
                <button
                  onClick={() => fillItem(index)}
                  className="bg-teal-600 text-white px-3 py-1 rounded hover:bg-teal-700"
                >
                  Fill
                </button>
                <button
                  onClick={() => approveItem(index)}
                  className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                >
                  Approve
                </button>
                <button
                  onClick={() => deleteItem(index)}
                  className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Viewer Modal */}
      {viewerOpen && activeIndex !== null && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex justify-center overflow-auto z-50 py-10">
          <div className="bg-white w-4/5 rounded-xl p-6 max-h-[85vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold">
                {savedChecklists[activeIndex].name}
              </h2>
              <button
                onClick={closeViewer}
                className="bg-gray-800 text-white px-3 py-1 rounded hover:bg-gray-900"
              >
                Close &#10006;
              </button>
            </div>

            <div className="bg-gray-50 p-4 rounded-md border border-gray-200 mb-6">
              <p>
                <b>Created By:</b>{" "}
                {savedChecklists[activeIndex].metadata.createdBy}
              </p>
              <p>
                <b>Approved By:</b>{" "}
                {savedChecklists[activeIndex].metadata.approvedBy ||
                  "Not approved"}
              </p>
              <p>
                <b>Effective Date:</b>{" "}
                {savedChecklists[activeIndex].metadata.effectiveDate}
              </p>
            </div>

            {savedChecklists[activeIndex].sections.map((section, i) => (
              <div key={i} className="mb-6">
                <h3 className="text-xl font-semibold mb-2">Section {i + 1}</h3>
                <table className="w-full border border-gray-300 border-collapse">
                  <tbody>
                    {section.rows.map((row, rowIndex) => (
                      <tr key={rowIndex}>
                        {row.map((col, colIndex) => (
                          <td
                            key={colIndex}
                            className="border border-gray-300 p-2 bg-white"
                          >
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
      {fillViewerOpen && activeIndex !== null && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex justify-center overflow-auto z-50 py-10">
          <div className="bg-white w-4/5 rounded-xl p-6 max-h-[85vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold">
                Fill: {savedChecklists[activeIndex].name}
              </h2>
              <button
                onClick={closeFill}
                className="bg-gray-800 text-white px-3 py-1 rounded hover:bg-gray-900"
              >
                Close &#10006;
              </button>
            </div>

            <div className="bg-gray-50 p-4 rounded-md border border-gray-200 mb-4 space-y-4">
              <div>
                <label htmlFor="createdBy" className="block font-semibold mb-1">
                  Created By
                </label>
                <input
                  id="createdBy"
                  value={editMetadata.createdBy}
                  onChange={(e) =>
                    setEditMetadata((prev) => ({
                      ...prev,
                      createdBy: e.target.value,
                    }))
                  }
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>

              <div>
                <label
                  htmlFor="approvedBy"
                  className="block font-semibold mb-1"
                >
                  Approved By
                </label>
                <input
                  id="approvedBy"
                  value={editMetadata.approvedBy}
                  onChange={(e) =>
                    setEditMetadata((prev) => ({
                      ...prev,
                      approvedBy: e.target.value,
                    }))
                  }
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>

              <div>
                <label
                  htmlFor="effectiveDate"
                  className="block font-semibold mb-1"
                >
                  Effective Date
                </label>
                <input
                  type="date"
                  id="effectiveDate"
                  value={editMetadata.effectiveDate}
                  onChange={(e) =>
                    setEditMetadata((prev) => ({
                      ...prev,
                      effectiveDate: e.target.value,
                    }))
                  }
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>

            {editSections.map((section, sIdx) => (
              <div key={sIdx} className="mb-6">
                <h3 className="text-xl font-semibold mb-2">
                  Section {sIdx + 1}
                </h3>
                <table className="w-full border border-gray-300 border-collapse">
                  <tbody>
                    {section.rows.map((row, rIdx) => (
                      <tr key={rIdx}>
                        {row.map((col, cIdx) => (
                          <td
                            key={cIdx}
                            className="border border-gray-300 p-2 bg-white"
                          >
                            <input
                              type="text"
                              value={col}
                              onChange={(e) =>
                                handleSectionInputChange(
                                  sIdx,
                                  rIdx,
                                  cIdx,
                                  e.target.value
                                )
                              }
                              className="w-full border border-gray-300 rounded-sm p-1"
                            />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}

            <div className="flex space-x-4 mt-6">
              <button
                onClick={saveFilled}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                💾 Save Changes
              </button>
              <button
                onClick={saveAsNew}
                className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
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
