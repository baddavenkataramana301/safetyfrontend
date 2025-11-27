import { useNavigate } from "react-router-dom";
import ChecklistBuilderForm from "@/components/checklist/ChecklistBuilderForm";
import { useChecklist } from "../contexts/ChecklistContext";

export default function CreateList() {
  const { addChecklist } = useChecklist();
  const navigate = useNavigate();

  const handleSubmit = (builderPayload, { resetForm }) => {
    const newChecklist = {
      name: `Checklist ${new Date().toLocaleString()}`,
      approved: false,
      metadata: {
        createdBy: "Unknown",
        approvedBy: "",
        effectiveDate: new Date().toISOString().split("T")[0],
      },
      ...builderPayload,
    };

    addChecklist(newChecklist);
    alert("Checklist submitted and added!");
    resetForm?.();
    navigate("/checklists");
  };

  return (
    <ChecklistBuilderForm
      onSubmit={handleSubmit}
      submitLabel="Submit"
      title="Checklist Builder"
    />
  );
}
