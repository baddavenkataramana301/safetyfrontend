import React, { createContext, useState, useContext } from "react";

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

const ChecklistContext = createContext();

export const ChecklistProvider = ({ children }) => {
  const [checklists, setChecklists] = useState(initialChecklists);

  const addChecklist = (newChecklist) => {
    setChecklists((prev) => [...prev, newChecklist]);
  };

  const updateChecklist = (index, updatedChecklist) => {
    setChecklists((prev) => {
      const newList = [...prev];
      newList[index] = updatedChecklist;
      return newList;
    });
  };

  const deleteChecklist = (index) => {
    setChecklists((prev) => {
      const newList = [...prev];
      newList.splice(index, 1);
      return newList;
    });
  };

  const approveChecklist = (index) => {
    setChecklists((prev) => {
      const newList = [...prev];
      newList[index].approved = true;
      newList[index].metadata.approvedBy = "Approved Internally ✔";
      return newList;
    });
  };

  return (
    <ChecklistContext.Provider
      value={{
        checklists,
        addChecklist,
        updateChecklist,
        deleteChecklist,
        approveChecklist,
      }}
    >
      {children}
    </ChecklistContext.Provider>
  );
};

export const useChecklist = () => {
  const context = useContext(ChecklistContext);
  if (context === undefined) {
    throw new Error("useChecklist must be used within a ChecklistProvider");
  }
  return context;
};
