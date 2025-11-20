import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { createChecklistNotification } from "@/lib/notificationUtils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const Checklist = () => {
  const { user } = useAuth();

  const [dataSource, setDataSource] = useState([]);
  const [count, setCount] = useState(0);
  const [formData, setFormData] = useState({
    location: "",
    date: new Date().toISOString().split("T")[0],
    inspectedBy: "",
    showroomName: "",
    designation: "",
    inchargeName: "",
    zone: "",
    mobile: "",
    mailId: "",
  });
  const [editingCell, setEditingCell] = useState(null); // { rowIndex, dataIndex }
  const [tempValue, setTempValue] = useState("");
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogContent, setDialogContent] = useState({
    title: "",
    content: "",
  });

  useEffect(() => {
    const stored = localStorage.getItem("checklists");
    if (stored) {
      const parsed = JSON.parse(stored);
      setDataSource(parsed.map((item, idx) => ({ ...item, key: idx + 1 })));
      setCount(parsed.length);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("checklists", JSON.stringify(dataSource));
  }, [dataSource]);

  useEffect(() => {
    detectLocation();
  }, []);

  const detectLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported.");
      return;
    }

    setLoadingLocation(true);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;

        try {
          const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`;
          const response = await fetch(url);
          const data = await response.json();

          const address = data?.display_name || "Unknown Location";

          setFormData((prev) => ({ ...prev, location: address }));

          toast.success("Location detected.");
        } catch (error) {
          toast.error("Failed to fetch address.");
        } finally {
          setLoadingLocation(false);
        }
      },
      () => {
        toast.error("Permission denied or location unavailable.");
        setLoadingLocation(false);
      }
    );
  };

  const handleAdd = () => {
    const newChecklist = {
      key: count + 1,
      id: Date.now(),
      location: "",
      type: "",
      capacity: "",
      mfgDate: "",
      condition: "Pending",
      fireNo: "",
      locationCode: "",
      remarks: "",
    };

    setDataSource([...dataSource, newChecklist]);
    setCount(count + 1);

    toast.success("New checklist row added!");
  };

  const handleDelete = (key) => {
    const deleted = dataSource.find((item) => item.key === key);
    const newData = dataSource.filter((item) => item.key !== key);
    setDataSource(newData);
    createChecklistNotification("delete", deleted);
    toast.success("Checklist deleted successfully!");
  };

  const handleSave = (row) => {
    const newData = [...dataSource];
    const index = newData.findIndex((item) => row.key === item.key);
    const item = newData[index];
    newData.splice(index, 1, { ...item, ...row });
    setDataSource(newData);
    createChecklistNotification("update", row);
    toast.success("Checklist updated!");
  };

  const startEdit = (rowIndex, dataIndex, value) => {
    setEditingCell({ rowIndex, dataIndex });
    setTempValue(value);
  };

  const saveEdit = () => {
    if (editingCell) {
      const { rowIndex, dataIndex } = editingCell;
      const newData = [...dataSource];
      newData[rowIndex][dataIndex] = tempValue;
      setDataSource(newData);
      handleSave(newData[rowIndex]);
      setEditingCell(null);
      setTempValue("");
    }
  };

  const cancelEdit = () => {
    setEditingCell(null);
    setTempValue("");
  };

  const handleSubmitChecklist = () => {
    // Validate form
    const requiredFields = [
      "location",
      "date",
      "inspectedBy",
      "showroomName",
      "designation",
      "inchargeName",
      "zone",
      "mobile",
      "mailId",
    ];
    const missing = requiredFields.filter((field) => !formData[field]);
    if (missing.length > 0) {
      setDialogContent({
        title: "Incomplete Form",
        content: `Please fill all the form fields: ${missing.join(", ")}.`,
      });
      setDialogOpen(true);
      return;
    }

    // Validate rows
    const incompleteRow = dataSource.find(
      (row) =>
        !row.location ||
        !row.type ||
        !row.capacity ||
        !row.mfgDate ||
        !row.condition ||
        !row.fireNo ||
        !row.locationCode ||
        !row.remarks
    );

    if (incompleteRow) {
      setDialogContent({
        title: "Incomplete Checklist",
        content: "Please fill all checklist row fields before submitting.",
      });
      setDialogOpen(true);
      return;
    }

    setDialogContent({
      title: "Checklist Submitted",
      content: "Checklist sent successfully.",
    });
    setDialogOpen(true);
  };

  const columns = [
    {
      title: "SL No",
      dataIndex: "slno",
      width: "6%",
      render: (_, __, index) => index + 1,
    },
    {
      title: "Location",
      dataIndex: "location",
      width: "12%",
      editable: true,
    },
    {
      title: "Type",
      dataIndex: "type",
      width: "12%",
      editable: true,
    },
    {
      title: "Capacity",
      dataIndex: "capacity",
      width: "10%",
      editable: true,
    },
    {
      title: "Date of MFG",
      dataIndex: "mfgDate",
      width: "10%",
      editable: true,
      inputType: "date",
    },
    {
      title: "Condition",
      dataIndex: "condition",
      width: "10%",
      editable: true,
      inputType: "select",
    },
    {
      title: "Fire Extinguisher No",
      dataIndex: "fireNo",
      width: "14%",
      editable: true,
    },
    {
      title: "Location Code",
      dataIndex: "locationCode",
      width: "12%",
      editable: true,
    },
    {
      title: "Remarks",
      dataIndex: "remarks",
      width: "14%",
      editable: true,
    },
    {
      title: "Operation",
      dataIndex: "operation",
      width: "8%",
      render: (_, record) => (
        <Button
          variant="destructive"
          size="sm"
          onClick={() => {
            if (window.confirm("Sure to delete?")) {
              handleDelete(record.key);
            }
          }}
        >
          Delete
        </Button>
      ),
    },
  ];

  return (
    <DashboardLayout>
      <div className="p-6 bg-white rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Safety Checklists</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <Label htmlFor="location">NAME OF THE LOCATION :</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, location: e.target.value }))
              }
              placeholder="Detecting location..."
              readOnly
            />
          </div>

          <div>
            <Label htmlFor="date">DATE :</Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, date: e.target.value }))
              }
            />
          </div>

          <div>
            <Label htmlFor="inspectedBy">INSPECTED BY :</Label>
            <Input
              id="inspectedBy"
              value={formData.inspectedBy}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  inspectedBy: e.target.value,
                }))
              }
            />
          </div>

          <div>
            <Label htmlFor="showroomName">CHECK POINTS :</Label>
            <Input
              id="showroomName"
              value={formData.showroomName}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  showroomName: e.target.value,
                }))
              }
            />
          </div>

          <div>
            <Label htmlFor="designation">DESIGNATION :</Label>
            <Input
              id="designation"
              value={formData.designation}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  designation: e.target.value,
                }))
              }
            />
          </div>

          <div>
            <Label htmlFor="inchargeName">INCHARGE NAME :</Label>
            <Input
              id="inchargeName"
              value={formData.inchargeName}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  inchargeName: e.target.value,
                }))
              }
            />
          </div>

          <div>
            <Label htmlFor="zone">ZONE :</Label>
            <Input
              id="zone"
              value={formData.zone}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, zone: e.target.value }))
              }
            />
          </div>

          <div>
            <Label htmlFor="mobile">MOBILE NO :</Label>
            <Input
              id="mobile"
              value={formData.mobile}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, mobile: e.target.value }))
              }
            />
          </div>

          <div>
            <Label htmlFor="mailId">MAIL ID :</Label>
            <Input
              id="mailId"
              value={formData.mailId}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, mailId: e.target.value }))
              }
            />
          </div>
        </div>

        <div className="mb-4 flex justify-end">
          <Button onClick={handleAdd} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add New Row
          </Button>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((col) => (
                <TableHead key={col.dataIndex} style={{ width: col.width }}>
                  {col.title}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {dataSource.map((record, rowIndex) => (
              <TableRow key={record.key}>
                {columns.map((col) => {
                  const isEditing =
                    editingCell &&
                    editingCell.rowIndex === rowIndex &&
                    editingCell.dataIndex === col.dataIndex;
                  const value = record[col.dataIndex];

                  if (col.dataIndex === "slno") {
                    return (
                      <TableCell key={col.dataIndex}>
                        {col.render(null, record, rowIndex)}
                      </TableCell>
                    );
                  }

                  if (col.dataIndex === "operation") {
                    return (
                      <TableCell key={col.dataIndex}>
                        {col.render(null, record)}
                      </TableCell>
                    );
                  }

                  if (isEditing) {
                    if (col.inputType === "select") {
                      return (
                        <TableCell key={col.dataIndex}>
                          <Select
                            value={tempValue}
                            onValueChange={(val) => setTempValue(val)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Pending">Pending</SelectItem>
                              <SelectItem value="In Progress">
                                In Progress
                              </SelectItem>
                              <SelectItem value="Completed">
                                Completed
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <div className="flex gap-2 mt-2">
                            <Button size="sm" onClick={saveEdit}>
                              Save
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={cancelEdit}
                            >
                              Cancel
                            </Button>
                          </div>
                        </TableCell>
                      );
                    } else {
                      return (
                        <TableCell key={col.dataIndex}>
                          <Input
                            type={col.inputType === "date" ? "date" : "text"}
                            value={tempValue}
                            onChange={(e) => setTempValue(e.target.value)}
                            onBlur={saveEdit}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") saveEdit();
                              if (e.key === "Escape") cancelEdit();
                            }}
                            autoFocus
                          />
                        </TableCell>
                      );
                    }
                  } else {
                    return (
                      <TableCell
                        key={col.dataIndex}
                        className="cursor-pointer hover:bg-gray-100"
                        onClick={() =>
                          col.editable &&
                          startEdit(rowIndex, col.dataIndex, value)
                        }
                      >
                        {value || (
                          <span className="text-gray-400">Click to edit</span>
                        )}
                      </TableCell>
                    );
                  }
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <div className="mt-6 text-center">
          <Button onClick={handleSubmitChecklist}>Submit Checklist</Button>
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{dialogContent.title}</DialogTitle>
            <DialogDescription>{dialogContent.content}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setDialogOpen(false)}>OK</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default Checklist;
