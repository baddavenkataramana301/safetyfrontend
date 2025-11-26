import React from "react";
import { useChecklist } from "../contexts/ChecklistContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "../components/ui/button";

// Responsive ListSet component to show checklist sets in mobile, tablet, desktop views
export default function ListSet() {
  const { checklists } = useChecklist();

  // Determine viewport width (basic approach with window.innerWidth) to toggle views
  const [viewportWidth, setViewportWidth] = React.useState(window.innerWidth);

  React.useEffect(() => {
    const handleResize = () => setViewportWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // View type based on width
  const viewType =
    viewportWidth < 640
      ? "mobile"
      : viewportWidth < 1024
      ? "tablet"
      : "desktop";

  // Mobile and Tablet view: show cards grid
  const CardView = () => (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 px-4">
      {checklists.map((cl, idx) => (
        <Card
          key={idx}
          className="border border-gray-300 rounded shadow-sm hover:shadow-md transition-shadow"
        >
          <CardHeader>
            <CardTitle className="text-lg font-semibold">{cl.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              <strong>Created By:</strong> {cl.metadata.createdBy}
            </p>
            <p>
              <strong>Approved By:</strong> {cl.metadata.approvedBy || "-"}
            </p>
            <p>
              <strong>Effective Date:</strong> {cl.metadata.effectiveDate}
            </p>
            <p>
              <strong>Status:</strong> {cl.approved ? "Approved" : "Pending"}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button size="sm" variant="outline" disabled>
                View
              </Button>
              <Button size="sm" variant="outline" disabled>
                Fill
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  // Desktop view: table with checklist data
  const TableView = () => (
    <div className="overflow-x-auto rounded shadow border border-gray-300 max-w-full px-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Document Name</TableHead>
            <TableHead>Created By</TableHead>
            <TableHead>Approved By</TableHead>
            <TableHead>Effective Date</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {checklists.map((cl, idx) => (
            <TableRow key={idx} className="hover:bg-gray-50 cursor-pointer">
              <TableCell>{cl.name}</TableCell>
              <TableCell>{cl.metadata.createdBy}</TableCell>
              <TableCell>{cl.metadata.approvedBy || "-"}</TableCell>
              <TableCell>{cl.metadata.effectiveDate}</TableCell>
              <TableCell>{cl.approved ? "Approved" : "Pending"}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <h1 className="text-2xl font-bold mb-6 text-center">
        Checklist List Set - Responsive View
      </h1>
      {viewType === "mobile" && <CardView />}
      {viewType === "tablet" && <CardView />}
      {viewType === "desktop" && <TableView />}
    </div>
  );
}
