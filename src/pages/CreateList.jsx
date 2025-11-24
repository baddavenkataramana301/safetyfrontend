import ChecklistBuilder from "../components/checklist/ChecklistBuilder";
import { DashboardLayout } from "@/components/layout/DashboardLayout";

export default function CreateList() {
  return (
    <DashboardLayout>
      <ChecklistBuilder />
    </DashboardLayout>
  );
}
