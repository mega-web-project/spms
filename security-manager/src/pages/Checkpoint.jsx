import { useState, useEffect } from "react";
import axiosClient from "../api/axiosClient";
import toast, { Toaster } from "react-hot-toast";
import { MapPin, Flag, User, X } from "lucide-react";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import Select from "react-select";

const Checkpoint = () => {
  const [vehicles, setVehicles] = useState([]);
  const [visitors, setVisitors] = useState([]);
  const [checkInOuts, setCheckInOuts] = useState([]);
  const [checkpoints, setCheckpoints] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

const [filterType, setFilterType] = useState("all");
const [filterDate, setFilterDate] = useState("");
const [selectedActivity, setSelectedActivity] = useState(null);
const [activeTab, setActiveTab] = useState("operations");
const [currentPage, setCurrentPage] = useState(1);
const recordsPerPage = 5;



// Step 1: Filter records based on type, date, and status
const filteredRecords = checkInOuts.filter((r) => {
  let matchesDate = true;
  let matchesType = true;

  // Filter by date
  if (filterDate) {
    matchesDate =
      new Date(r.checked_in_at).toDateString() ===
      new Date(filterDate).toDateString();
  }

  // Filter by type
  if (filterType !== "all") {
    matchesType = r.type === filterType;
  }

  // Only show signed-out records
  return matchesDate && matchesType && r.status === "checked-out";
});

// Step 2: Pagination calculations
const indexOfLastRecord = currentPage * recordsPerPage;
const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
const currentRecords = filteredRecords.slice(indexOfFirstRecord, indexOfLastRecord);
const totalPages = Math.ceil(filteredRecords.length / recordsPerPage);


  // Checkpoint creation
  const [checkpointName, setCheckpointName] = useState("");
  const [checkpointLocation, setCheckpointLocation] = useState("");
  const [checkpointDescription, setCheckpointDescription] = useState("");

  // Vehicle check-in
  const [selectedCheckpoint, setSelectedCheckpoint] = useState("");
  const [selectedVehicle, setSelectedVehicle] = useState("");
  const [selectedDriver, setSelectedDriver] = useState("");
  const [shift, setShift] = useState("morning");
  const [vehiclePurpose, setVehiclePurpose] = useState("");
  const [drivers, setDrivers] = useState([]);
  // Visitor check-in
  const [selectedVisitors, setSelectedVisitors] = useState([]);

  const [visitorCheckpoint, setVisitorCheckpoint] = useState("");
  const [visitorShift, setVisitorShift] = useState("morning");
  const [visitorPurpose, setVisitorPurpose] = useState("");






  // Fetch all initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [
          vehiclesRes,
          visitorsRes,
          checkInOutsRes,
          checkpointsRes,
          driversRes,
          userRes,
        ] = await Promise.all([
          axiosClient.get("/vehicles"),
          axiosClient.get("/visitors"),
          axiosClient.get("/checkinout"),
          axiosClient.get("/checkpoints"),
          axiosClient.get("/drivers"), // 👈 Add this line
          axiosClient.get("/me"),
        ]);

        setVehicles(vehiclesRes.data.data);
        setVisitors(visitorsRes.data);
        setCheckInOuts(checkInOutsRes.data.data || []);

        setCheckpoints(checkpointsRes.data.data || []);
        setDrivers(driversRes.data.data || []); // 👈 Make sure you have a state for drivers
        setCurrentUser(userRes.data);
      } catch (error) {
        console.error(error);
        toast.error("Failed to fetch initial data");
      }
    };

    fetchData();
  }, []);


  // Create checkpoint
  const handleCreateCheckpoint = async () => {
    if (!checkpointName || !checkpointLocation || !currentUser) {
      toast.error("Please fill in checkpoint name and location");
      return;
    }

    try {
      const res = await axiosClient.post("/checkpoints", {
        name: checkpointName,
        location: checkpointLocation,
        description: checkpointDescription,
      });

      setCheckpoints((prev) => [...prev, res.data]);
      toast.success("Checkpoint created successfully");
      setCheckpointName("");
      setCheckpointLocation("");
      setCheckpointDescription("");
    } catch (error) {
      console.error(error);
      toast.error("Failed to create checkpoint");
    }
  };

  // Vehicle check-in
  const handleCheckIn = async () => {
    if (!selectedDriver) {
      toast.error("Please select a driver");
      return;
    }

    if (!selectedCheckpoint) {
      toast.error("Please select a checkpoint");
      return;
    }

    if (!selectedVehicle) {
      toast.error("Please select a vehicle");
      return;
    }

    if (!currentUser) {
      toast.error("You must be logged in to perform this action");
      return;
    }

    const vehicle = vehicles.find((v) => v.id === selectedVehicle);

    const checkpoint = checkpoints.find((c) => c.id === selectedCheckpoint);
    const driver = drivers.find((d) => d.id === parseInt(selectedDriver));

    if (!vehicle || !checkpoint || !driver) {
      toast.error("Invalid selection — please recheck your entries");
      return;
    }

    try {
      const res = await axiosClient.post("/checkinout/check-in", {
        type: "vehicle",
        item_id: [selectedVehicle],
        item_names: [vehicle.model],
        checkpoint_id: checkpoint.id,
        checkpoint_name: checkpoint.name,
        checked_in_by: currentUser.name,
        shift,
        driver_name: driver.name,
        status: "checked-in",
        purpose: vehiclePurpose,
      });

      setCheckInOuts((prev) => [...prev, res.data.data]);
      toast.success("Vehicle signed in successfully");

      setSelectedVehicle("");
      setSelectedDriver("");
      setVehiclePurpose("");
      window.location.reload();
    } catch (error) {
      console.error(error.response?.data || error);
      toast.error("Failed to sign in vehicle");
    }
  };



  // Vehicle/Visitor check-out
  const handleCheckOut = async (id) => {
    if (!currentUser) return;

    try {
      const res = await axiosClient.put(`/checkinout/check-out/${id}`, {
        checkedOutBy: currentUser.name,
        status: "checked-out",
      });

      setCheckInOuts((prev) => prev.map((c) => (c.id === id ? res.data.data : c)));
      toast.success("Signed out successfully");
      window.location.reload();
    } catch (error) {
      console.error(error);
      toast.error("Failed to sign out");
    }
  };

  // Visitor check-in
  const handleVisitorCheckIn = async () => {
    if (!visitorCheckpoint) {
      toast.error("Please select a checkpoint");
      return;
    }

    if (!Array.isArray(selectedVisitors) || selectedVisitors.length === 0) {
      toast.error("Please select at least one visitor");
      return;
    }

    if (!currentUser) {
      toast.error("You must be logged in to perform this action");
      return;
    }

    const checkpoint = checkpoints.find(
      (c) => c.id === parseInt(visitorCheckpoint)
    );
    if (!checkpoint) {
      toast.error("Selected checkpoint not found. Please try again.");
      return;
    }

    try {
      const visitorData = visitors.filter((v) =>
        selectedVisitors.includes(v.id)
      );

      const visitorIds = visitorData.map((v) => v.id);
      const visitorNames = visitorData.map((v) => v.name);

      const res = await axiosClient.post("/checkinout/check-in", {
        type: "visitor",
        item_id: visitorIds, // ✅ now sending array of visitor IDs
        item_names: visitorNames, // ✅ send array of visitor names
        checkpoint_id: checkpoint.id,
        shift: visitorShift,
        purpose: visitorPurpose,
      });

      setCheckInOuts((prev) => [...prev, res.data.data]);
      toast.success("Visitors checked in successfully!");

      setSelectedVisitors([]);
      setVisitorPurpose("");
      window.location.reload();
    } catch (error) {
      console.error(error);
      toast.error("Failed to check in visitors");
    }
  };




  const activeCheckIns = checkInOuts.filter((c) => c.status === "checked-in");
  const signedOutRecords = checkInOuts.filter((c) => c.status === "checked-out");



  const exportToExcel = () => {
    if (filteredRecords.length === 0)
      return toast.error("No records found for the selected filters.");

    const data = filteredRecords.map((r) => ({
      Type: r.type === "vehicle" ? "Vehicle" : "Visitor",
      Name: r.item_names,
      Checkpoint: r.checkpoint.name,
      Shift: r.shift,
      "Signed In By": r.checked_in_by.full_name,
      "Signed Out By": r.checked_out_by?.full_name || "N/A",
      Purpose: r.purpose || "N/A",
      "Signed In At": r.checked_in_at
        ? new Date(r.checked_in_at).toLocaleString()
        : "N/A",
      "Signed Out At": r.checked_out_at
        ? new Date(r.checked_out_at).toLocaleString()
        : "N/A",
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Records");
    XLSX.writeFile(
      wb,
      `signed-out-${filterDate || "all"}-${new Date()
        .toISOString()
        .split("T")[0]}.xlsx`
    );
    toast.success("Exported to Excel");
  };

  const exportToPDF = () => {
    if (filteredRecords.length === 0)
      return toast.error("No records found for the selected filters.");

    const doc = new jsPDF();
    doc.text("Signed Out Records", 14, 20);
    autoTable(doc, {
      head: [
        [
          "Type",
          "Driver/Visitor",
          "Checkpoint",
          "Shift",
          "Signed In By",
          "Signed Out By",
          "Purpose",
          "Signed In At",
          "Signed Out At",
        ],
      ],
      body: filteredRecords.map((r) => [
        r.type === "vehicle" ? "Vehicle" : "Visitor",
        r.item_names,
        r.checkpoint.name,
        r.shift,
        r.checked_in_by.full_name,
        r.checked_out_by?.full_name || "N/A",
        r.purpose || "N/A",
        r.checked_in_at
          ? new Date(r.checked_in_at).toLocaleString()
          : "N/A",
        r.checked_out_at
          ? new Date(r.checked_out_at).toLocaleString()
          : "N/A",
      ]),
      startY: 30,
    });
    doc.save(
      `signed-out-${filterDate || "all"}-${new Date()
        .toISOString()
        .split("T")[0]}.pdf`
    );
    toast.success("Exported to PDF");
  };
  return (
    <div className="p-6 space-y-6">
      <Toaster />

      <div>
        <h1 className="text-3xl font-bold">Security Checkpoint</h1>
        <p className="text-gray-500">Manage checkpoints and gate operations</p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 pb-2">
        {["operations", "visitors", "active", "signedout", "create", "list"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-t-lg bg-gray-300 ${activeTab === tab
              ? "bg-white text-dark font-semibold"
              : "bg-gray-100 hover:bg-gray-200 text-gray-700"
              }`}
          >
            {tab === "operations"
              ? "Vehicle Check-in"
              : tab === "visitors"
                ? "Visitor Check-in"
                : tab === "active"
                  ? `Active Sign-ins (${activeCheckIns.length})`
                  : tab === "signedout"
                    ? `Signed Out (${signedOutRecords.length})`
                    : tab === "create"
                      ? "Create Checkpoint"
                      : `All Checkpoints (${checkpoints.length})`}
          </button>
        ))}
      </div>


      {/* Vehicle Check-in */}
      {activeTab === "operations" && (
        <div className="bg-white p-6 rounded-lg shadow space-y-4">
          {checkpoints.length === 0 ? (
            <p className="text-center text-gray-500">
              No checkpoints available. Please create one first.
            </p>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Checkpoint</label>
                  <select
                    value={selectedCheckpoint}
                    onChange={(e) => setSelectedCheckpoint(Number(e.target.value))}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="">Select checkpoint</option>
                    {checkpoints.map((cp) => (
                      <option key={cp.id} value={cp.id}>
                        {cp.name} - {cp.location}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Shift</label>
                  <select
                    value={shift}
                    onChange={(e) => setShift(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="morning">Morning</option>
                    <option value="afternoon">Afternoon</option>
                    <option value="night">Night</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Vehicle</label>
                  <select
                    value={selectedVehicle}
                    onChange={(e) => {
                      setSelectedVehicle(Number(e.target.value));
                      setSelectedDriver("");
                    }}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="">Select vehicle</option>
                    {Array.isArray(vehicles) &&
                      vehicles.map((v) => (
                        <option key={v.id} value={v.id}>
                          {v.plate_number} - {v.model}
                        </option>
                      ))}

                  </select>
                </div>
                {selectedVehicle && (
                  <div>
                    <label className="block text-sm font-medium mb-1">Driver</label>
                    <select
                      value={selectedDriver}
                      onChange={(e) => setSelectedDriver(e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    >
                      <option value="">Select driver</option>
                      {(() => {
                        const vehicle = vehicles.find((v) => v.id === selectedVehicle);
                        const assignedDrivers = vehicle?.drivers || [];

                        return assignedDrivers.length > 0 ? (
                          assignedDrivers.map((d) => (
                            <option key={d.id} value={d.id}>
                              {d.name}
                            </option>
                          ))
                        ) : (
                          <option disabled>No drivers available</option>
                        );
                      })()}
                    </select>
                  </div>
                )}



                {/* 🚗 Purpose field for vehicle */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1">Purpose</label>
                  <input
                    type="text"
                    value={vehiclePurpose}
                    onChange={(e) => setVehiclePurpose(e.target.value)}
                    placeholder="Enter purpose (e.g., Delivery, Pickup, Maintenance)"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <button
                onClick={handleCheckIn}
                className="w-full flex items-center justify-center gap-2 bg-[#1f3d7a] text-white py-2.5 px-4 rounded-lg font-medium hover:bg-blue-700 transition duration-150"
              >
                Sign In Vehicle
              </button>
            </>
          )}
        </div>
      )}


      {/* Visitor Check-in */}
      {activeTab === "visitors" && (
        <div className="bg-white p-6 rounded-lg shadow space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Checkpoint</label>
              <select
                value={visitorCheckpoint}
                onChange={(e) => setVisitorCheckpoint(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="">Select checkpoint</option>
                {checkpoints.map((cp) => (
                  <option key={cp.id} value={cp.id}>
                    {cp.name} - {cp.location}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Shift</label>
              <select
                value={visitorShift}
                onChange={(e) => setVisitorShift(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="morning">Morning</option>
                <option value="afternoon">Afternoon</option>
                <option value="night">Night</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Visitor</label>
              <Select
                isMulti
                options={visitors.map((v) => ({ value: v.id, label: `${v.name} - ${v.id_number}` }))}
                value={visitors.filter((v) => selectedVisitors.includes(v.id)).map((v) => ({
                  value: v.id,
                  label: `${v.name} - ${v.id_number}`,
                }))}
                onChange={(selected) => setSelectedVisitors(selected.map((s) => s.value))}
                className="w-full"
                placeholder="Select visitors..."
              />
            </div>

            {/* New Purpose Field */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Purpose</label>
              <input
                type="text"
                value={visitorPurpose}
                onChange={(e) => setVisitorPurpose(e.target.value)}
                placeholder="Enter purpose of visit (e.g., Meeting, Delivery, Interview)"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <button
            onClick={handleVisitorCheckIn}
            className="w-full flex items-center justify-center gap-2 bg-[#1f3d7a] text-white py-2.5 px-4 rounded-lg font-medium hover:bg-blue-700 transition duration-150"
          >
            Sign In Visitor
          </button>
        </div>
      )}

      {/* Active Sign-ins */}
      {activeTab === "active" && (
        <div className="bg-white p-6 rounded-lg shadow space-y-3">
          <h2 className="font-semibold text-lg">Active Sign-ins ({activeCheckIns.length})</h2>
          {activeCheckIns.map((c) => (
            <div
              key={c.id}
              onClick={() => setSelectedActivity(c)}
              className="border border-gray-200 p-4 rounded cursor-pointer hover:shadow-md transition duration-300"
            >
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between transition-all duration-300">
                    <div className="space-y-1">
                      <p className="font-semibold text-gray-800 capitalize text-sm sm:text-base">
                        {Array.isArray(c.item_names)
                          ? c.item_names.join(", ")
                          : c.item_names}
                      </p>
                    </div>

                    <div className="mt-2 sm:mt-0">
                      <span
                        className={`inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-full capitalize shadow-sm ${c.type === "visitor"
                          ? "bg-green-100 text-green-700 border border-green-200"
                          : c.type === "driver"
                            ? "bg-blue-100 text-blue-700 border border-blue-200"
                            : "bg-gray-100 text-gray-700 border border-gray-200"
                          }`}
                      >
                        {c.type}
                      </span>
                    </div>
                  </div>

                  <p className="text-sm text-gray-600 capitalize pt-4">
                    Checkpoint: {c.checkpoint?.name || "—"}
                  </p>
                  <p className="text-xs text-gray-500">
                    Signed in:{" "}
                    {c.checked_in_at
                      ? new Date(c.checked_in_at).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                      : "—"}{" "}
                    • {c.shift} shift
                  </p>
                  <p className="text-xs text-gray-500">
                    By: {c.checked_in_by?.full_name || "—"}
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation(); // prevents opening modal when signing out
                    handleCheckOut(c.id);
                  }}
                  className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                >
                  Sign Out
                </button>
              </div>
            </div>
          ))}

        </div>
      )}


      {selectedActivity && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-lg rounded-xl shadow-lg p-6 relative animate-fadeIn">
            {/* Close button */}
            <button
              onClick={() => setSelectedActivity(null)}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
            >
              <X size={20} />
            </button>

            <h3 className="text-lg font-semibold text-gray-800 mb-3">
              Activity Details
            </h3>

            <div className="space-y-3 text-sm text-gray-700">
              <p>
                <span className="font-medium">Type:</span>{" "}
                <span className="capitalize">{selectedActivity.type}</span>
              </p>
              <p>
                <span className="font-medium">Checkpoint:</span>{" "}
                {selectedActivity.checkpoint?.name || "—"}
              </p>
              <p>
                <span className="font-medium">
                  {selectedActivity.type === "vehicle" ? "Vehicle" : "Visitor"} :
                </span>
                {" "}
                {Array.isArray(selectedActivity.item_names)
                  ? selectedActivity.item_names.join(", ")
                  : selectedActivity.item_names}
              </p>
              <p>
                <span className="font-medium">Signed In:</span>{" "}
                {selectedActivity.checked_in_at
                  ? new Date(selectedActivity.checked_in_at).toLocaleString()
                  : "—"}
              </p>
              <p>
                <span className="font-medium">By:</span>{" "}
                {selectedActivity.checked_in_by?.full_name || "—"}
              </p>
              <p>
                <span className="font-medium">Shift:</span>{" "}
                {selectedActivity.shift || "—"}
              </p>

              {/* Image Display */}
              {selectedActivity.type === "vehicle" &&
                selectedActivity.vehicles &&
                selectedActivity.vehicles.length > 0 &&
                selectedActivity.vehicles[0].photo && (
                  <div className="mt-4">
                    <p className="font-medium mb-2">Vehicle Image</p>
                    <img
                      src={selectedActivity.vehicles[0].photo}
                      alt="Vehicle"
                      className="w-full h-56 object-cover rounded-lg border"
                    />
                  </div>
                )}

              {selectedActivity.type === "visitor" &&
                Array.isArray(selectedActivity.visitors) &&
                selectedActivity.visitors.length > 0 && (
                  <div className="mt-4">
                    <p className="font-medium mb-2">Visitor Photos</p>
                    <div className="grid grid-cols-2 gap-3">
                      {selectedActivity.visitors.map((v) => (
                        <div key={v.id} className="text-center">
                          {v.photo ? (
                            <img
                              src={v.photo}
                              alt={v.name}
                              className="w-full h-40 object-cover rounded-lg border"
                            />
                          ) : (
                            <div className="w-full h-40 flex items-center justify-center border rounded-lg text-gray-400 text-sm">
                              No Photo
                            </div>
                          )}
                          <p className="text-xs mt-1 text-gray-600 font-medium">{v.name}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

            </div>
          </div>
        </div>
      )}


      {/* Signed Out */}
{/* Signed Out */}
{activeTab === "signedout" && (
  <div className="bg-white p-6 rounded-lg shadow space-y-3">
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
      <h2 className="font-semibold text-lg">
        Signed Out Records ({filteredRecords.length})
      </h2>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 items-center">
        {/* Date Filter */}
        <input
          type="date"
          value={filterDate}
          onChange={(e) => {
            setFilterDate(e.target.value);
            setCurrentPage(1);
          }}
          className="border rounded px-2 py-1"
        />

        {/* Type Filter */}
        <select
          value={filterType}
          onChange={(e) => {
            setFilterType(e.target.value);
            setCurrentPage(1);
          }}
          className="border rounded px-2 py-1"
        >
          <option value="all">All Types</option>
          <option value="vehicle">Vehicle</option>
          <option value="visitor">Visitor</option>
        </select>

        {/* Export Buttons */}
        <button
          onClick={exportToExcel}
          className="px-3 py-1 border rounded hover:bg-gray-100"
        >
          Excel
        </button>
        <button
          onClick={exportToPDF}
          className="px-3 py-1 border rounded hover:bg-gray-100"
        >
          PDF
        </button>
      </div>
    </div>

    {filteredRecords.length === 0 ? (
      <p className="text-gray-500 text-center py-4">No signed out records</p>
    ) : (
      <>
        {/* Paginated records */}
        {filteredRecords
          .slice((currentPage - 1) * recordsPerPage, currentPage * recordsPerPage)
          .map((r) => (
            <div key={r.id} className="border border-gray-200 p-4 rounded space-y-2">
              {/* Images */}
              <div className="flex space-x-2">
                {r.type === "vehicle" && r.vehicles?.length > 0 ? (
                  <img
                    src={r.vehicles[0].photo}
                    alt={r.vehicles[0].plate_number || "Vehicle"}
                    className="w-12 h-12 rounded-lg object-cover border"
                  />
                ) : r.type === "visitor" && r.visitors?.length > 0 ? (
                  r.visitors.map((v) => (
                    <img
                      key={v.id}
                      src={v.photo}
                      alt={v.name}
                      className="w-10 h-10 rounded-full border-2 border-white object-cover"
                    />
                  ))
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 text-xs">
                    N/A
                  </div>
                )}
              </div>

              <p className="font-semibold">{Array.isArray(r.item_names) ? r.item_names.join(", ") : r.item_names}</p>
              <p className="text-sm text-gray-600">{r.checkpoint?.name}</p>
              <p className="text-xs text-gray-500">
                Signed in:{" "}
                {r.checked_in_at
                  ? new Date(r.checked_in_at).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "—"}{" "}
                • {r.shift}
              </p>
              <p className="text-xs text-gray-500">By: {r.checked_in_by.full_name}</p>
              <p className="text-xs text-gray-500">
                Signed out:{" "}
                {r.checked_out_at
                  ? new Date(r.checked_out_at).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "—"}{" "}
                by {r.checked_out_by?.full_name || "—"}
              </p>
            </div>
          ))}

        {/* Pagination controls */}
        <div className="flex justify-center gap-2 mt-4">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((prev) => prev - 1)}
            className="px-3 py-1 border rounded hover:bg-gray-100 disabled:opacity-50"
          >
            Prev
          </button>

          {Array.from(
            { length: Math.ceil(filteredRecords.length / recordsPerPage) },
            (_, i) => (
              <button
                key={i + 1}
                onClick={() => setCurrentPage(i + 1)}
                className={`px-3 py-1 border rounded hover:bg-gray-100 ${
                  currentPage === i + 1 ? "bg-blue-500 text-white" : ""
                }`}
              >
                {i + 1}
              </button>
            )
          )}

          <button
            disabled={currentPage === Math.ceil(filteredRecords.length / recordsPerPage)}
            onClick={() => setCurrentPage((prev) => prev + 1)}
            className="px-3 py-1 border rounded hover:bg-gray-100 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </>
    )}
  </div>
)}


      {/* Create Checkpoint */}
      {activeTab === "create" && (
        <div className="bg-white p-6 rounded-lg shadow space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Checkpoint Name</label>
              <input
                value={checkpointName}
                onChange={(e) => setCheckpointName(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="Main Entrance"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Location</label>
              <input
                value={checkpointLocation}
                onChange={(e) => setCheckpointLocation(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="Gate A, North Wing"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea
                value={checkpointDescription}
                onChange={(e) => setCheckpointDescription(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                rows="3"
                placeholder="Additional details..."
              ></textarea>
            </div>
          </div>

          <button
            onClick={handleCreateCheckpoint}
            className="w-full flex items-center justify-center gap-2 bg-[#1f3d7a] text-white py-2.5 px-4 rounded-lg font-medium hover:bg-blue-700 transition duration-150"
          >
            Create Checkpoint
          </button>
        </div>
      )}

      {/* List Checkpoints */}


      {activeTab === "list" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {checkpoints.length === 0 ? (
            <p className="text-center text-gray-500 col-span-full">
              No checkpoints created yet
            </p>
          ) : (
            checkpoints.map((cp) => (
              <div
                key={cp.id}
                className="border border-gray-200 p-4 rounded-xl shadow-sm hover:shadow-md transition bg-white"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Flag className="text-blue-500" size={18} />
                  <h3 className="font-semibold text-lg">{cp.name}</h3>
                </div>

                <div className="flex items-center text-gray-600 text-sm gap-1 mb-1">
                  <MapPin size={14} className="text-red-500" />
                  <span>{cp.location}</span>
                </div>

                {cp.description && (
                  <p className="text-xs text-gray-500 mb-1">{cp.description}</p>
                )}

                <div className="flex items-center text-xs text-gray-400 gap-1 mt-2">
                  <User size={12} className="text-gray-400" />
                  <span>Created by: {cp.createdBy}</span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

    </div>
  );
}

export default Checkpoint;
