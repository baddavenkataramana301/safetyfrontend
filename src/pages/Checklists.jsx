import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { createChecklistNotification } from "@/lib/notificationUtils";
import { getUserPermissions } from "@/lib/permissionUtils";
import { dummyChecklistData } from "@/data";
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
  const userPermissions = user ? getUserPermissions(user.id) : {};

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
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem("checklists");
    if (stored) {
      const parsed = JSON.parse(stored);
      // Filter out empty rows for employees - only show rows with complete data
      const filteredData = parsed.filter(
        (row) =>
          row.location &&
          row.type &&
          row.capacity &&
          row.mfgDate &&
          row.condition &&
          row.fireNo &&
          row.locationCode &&
          row.remarks
      );
      setDataSource(
        filteredData.map((item, idx) => ({ ...item, key: idx + 1 }))
      );
      setCount(filteredData.length);
    } else {
      // Load dummy data if no stored data exists - this allows employees to view sample data
      setDataSource(
        dummyChecklistData.map((item, idx) => ({ ...item, key: idx + 1 }))
      );
      setCount(dummyChecklistData.length);
      // Save dummy data to localStorage so employees can view it
      localStorage.setItem("checklists", JSON.stringify(dummyChecklistData));
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

  const handleAddRowFromForm = () => {
    const newRow = {
      key: count + 1,
      id: Date.now(),
      location: formData.location,
      type: formData.showroomName,
      capacity: formData.zone,
      mfgDate: formData.date,
      condition: "Pending",
      fireNo: formData.mobile,
      locationCode: formData.zone,
      remarks: `${formData.inspectedBy} - ${formData.designation} - ${formData.inchargeName} - ${formData.mailId}`,
    };

    setDataSource([...dataSource, newRow]);
    setCount(count + 1);
    createChecklistNotification("create", newRow);
    toast.success("Row added from form!");
    setCreateDialogOpen(false);
    setEditMode(false);
    setSelectedRow(null);
  };

  const handleUpdateRowFromForm = () => {
    if (!selectedRow) return;

    const updatedRow = {
      ...selectedRow,
      location: formData.location,
      type: formData.showroomName,
      capacity: formData.zone,
      mfgDate: formData.date,
      fireNo: formData.mobile,
      locationCode: formData.zone,
      remarks: `${formData.inspectedBy} - ${formData.designation} - ${formData.inchargeName} - ${formData.mailId}`,
    };

    const newData = dataSource.map((item) =>
      item.key === selectedRow.key ? updatedRow : item
    );
    setDataSource(newData);
    handleSave(updatedRow);
    toast.success("Row updated from form!");
    setCreateDialogOpen(false);
    setEditMode(false);
    setSelectedRow(null);
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
        <div className="flex gap-2">
          {userPermissions.checklists?.update && (
            <Button
              size="sm"
              onClick={() => {
                setEditMode(true);
                setSelectedRow(record);
                setFormData({
                  location: record.location || "",
                  date:
                    record.mfgDate || new Date().toISOString().split("T")[0],
                  inspectedBy: record.remarks?.split(" - ")[0] || "",
                  showroomName: record.type || "",
                  designation: record.remarks?.split(" - ")[1] || "",
                  inchargeName: record.remarks?.split(" - ")[2] || "",
                  zone: record.capacity || "",
                  mobile: record.fireNo || "",
                  mailId: record.remarks?.split(" - ")[3] || "",
                });
                setCreateDialogOpen(true);
              }}
            >
              Edit
            </Button>
          )}
          {userPermissions.checklists?.delete &&
            user?.role !== "Safety Manager" && (
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
            )}
        </div>
      ),
    },
  ];

  return (
    <DashboardLayout>
      <div className="p-6 bg-white rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Safety Checklists</h2>
          {userPermissions.checklists?.create && (
            <Button
              onClick={() => setCreateDialogOpen(true)}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Create List
            </Button>
          )}
        </div>

        {/* <div className="mb-4 flex justify-end">
          {userPermissions.checklists?.create && user?.role !== "Admin" && (
            <Button onClick={handleAdd} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add New Row
            </Button>
          )}
        </div> */}

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
                        className={
                          col.editable && userPermissions.checklists?.update
                            ? "cursor-pointer hover:bg-gray-100"
                            : ""
                        }
                        onClick={() =>
                          col.editable &&
                          userPermissions.checklists?.update &&
                          startEdit(rowIndex, col.dataIndex, value)
                        }
                      >
                        {value || (
                          <span className="text-gray-400">
                            {col.editable && userPermissions.checklists?.update
                              ? "Click to edit"
                              : ""}
                          </span>
                        )}
                      </TableCell>
                    );
                  }
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {user?.role !== "Employee" && (
          <div className="mt-6 text-center">
            <Button onClick={handleSubmitChecklist}>Submit Checklist</Button>
          </div>
        )}
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

      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editMode ? "Edit Checklist" : "Create New Checklist"}
            </DialogTitle>
            <DialogDescription>
              {editMode
                ? "Update the checklist details below."
                : "Fill in the checklist details below."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <Label htmlFor="create-location">NAME OF THE LOCATION :</Label>
              <Input
                id="create-location"
                value={formData.location}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, location: e.target.value }))
                }
                placeholder="Detecting location..."
                readOnly
              />
            </div>

            <div>
              <Label htmlFor="create-date">DATE :</Label>
              <Input
                id="create-date"
                type="date"
                value={formData.date}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, date: e.target.value }))
                }
              />
            </div>

            <div>
              <Label htmlFor="create-inspectedBy">INSPECTED BY :</Label>
              <Input
                id="create-inspectedBy"
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
              <Label htmlFor="create-showroomName">CHECK POINTS :</Label>
              <Input
                id="create-showroomName"
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
              <Label htmlFor="create-designation">DESIGNATION :</Label>
              <Input
                id="create-designation"
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
              <Label htmlFor="create-inchargeName">INCHARGE NAME :</Label>
              <Input
                id="create-inchargeName"
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
              <Label htmlFor="create-zone">ZONE :</Label>
              <Input
                id="create-zone"
                value={formData.zone}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, zone: e.target.value }))
                }
              />
            </div>

            <div>
              <Label htmlFor="create-mobile">MOBILE NO :</Label>
              <Input
                id="create-mobile"
                value={formData.mobile}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, mobile: e.target.value }))
                }
              />
            </div>

            <div>
              <Label htmlFor="create-mailId">MAIL ID :</Label>
              <Input
                id="create-mailId"
                value={formData.mailId}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, mailId: e.target.value }))
                }
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setCreateDialogOpen(false);
                setEditMode(false);
                setSelectedRow(null);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={
                editMode ? handleUpdateRowFromForm : handleAddRowFromForm
              }
            >
              {editMode ? "Update Row" : "Add to Row"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default Checklist;
