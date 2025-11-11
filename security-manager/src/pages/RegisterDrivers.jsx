import React, { useEffect, useState } from "react";
import axiosClient from "../api/axiosClient";
import toast, { Toaster } from "react-hot-toast";
import { UserPlus, User, Pencil, Trash2, Loader2 } from "lucide-react";

const RegisterDriver = () => {
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(false);

  const [selectedVehicle, setSelectedVehicle] = useState("");
  const [fullName, setFullName] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [phone, setPhone] = useState("");
  const [photo, setPhoto] = useState(null);


  console.log("drivers:", drivers);
  const [editingDriver, setEditingDriver] = useState(null);
  const [editForm, setEditForm] = useState({
    full_name: "",
    license_number: "",
    phone: "",
    photo: null,
  });

useEffect(() => {
    setLoading(true);
    axiosClient
      .get("/vehicles")
      .then((res) => setVehicles(res.data.data || []))
      .catch(() => toast.error("Failed to load vehicles"))
      .finally(() => setLoading(false));
  }, []);

  // Fetch drivers
  useEffect(() => {
    setLoading(true);
    axiosClient
      .get("/drivers")
      .then((res) => setDrivers(res.data.data || []))
      .catch(() => toast.error("Failed to load drivers"))
      .finally(() => setLoading(false));
  }, []);

  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) setPhoto(file);
  };

  // Register new driver
const handleSubmit = async (e) => {

  e.preventDefault();

  if (!selectedVehicle || !fullName || !licenseNumber || !phone) {
    toast.error("Please fill in all required fields");
    return;
  }

  const formData = new FormData();
  formData.append("vehicle_id", selectedVehicle);
  formData.append("vehicle_number", vehicles.find(v => v.id === parseInt(selectedVehicle)).plate_number || "");
  formData.append("vehicle_id", selectedVehicle);
  formData.append("full_name", fullName);
  formData.append("license_number", licenseNumber);
  formData.append("phone", phone);
  if (photo) formData.append("photo", photo);

  try {
    setLoading(true);
    const { data } = await axiosClient.post("/drivers", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    setDrivers((prev) => [data.data, ...prev]);
    toast.success("Driver registered successfully");

    // Reset form
    setFullName("");
    setLicenseNumber("");
    setPhone("");
    setPhoto(null);
    setSelectedVehicle("");
  } catch (err) {
    console.error("Error saving driver:", err);
    toast.error("Failed to register driver");
  } finally {
    setLoading(false);
  }
};


  // Delete driver
  const handleDeleteDriver = async (driverId) => {
    if (confirm("Are you sure you want to delete this driver?")) {
      try {
        await axiosClient.delete(`/drivers/${driverId}`);
        setDrivers((prev) => prev.filter((d) => d.id !== driverId));
        toast.success("Driver deleted successfully");
      } catch {
        toast.error("Error deleting driver");
      }
    }
  };

  // Update driver
  const handleUpdateDriver = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("full_name", editForm.full_name);
    formData.append("license_number", editForm.license_number);
    formData.append("phone", editForm.phone);
    if (editForm.photo) formData.append("photo", editForm.photo);

    try {
      setLoading(true);
      const { data } = await axiosClient.post(
        `/drivers/${editingDriver.id}?_method=PUT`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      setDrivers((prev) =>
        prev.map((d) => (d.id === data.data.id ? data.data : d))
      );
      toast.success("Driver updated successfully");
      setEditingDriver(null);
    } catch {
      toast.error("Failed to update driver");
    } finally {
      setLoading(false);
    }
  };

  // When opening edit modal
  useEffect(() => {
    if (editingDriver) {
      setEditForm({
        full_name: editingDriver.full_name || "",
        license_number: editingDriver.license_number || "",
        phone: editingDriver.phone || "",
        photo: null,
      });
    }
  }, [editingDriver]);


  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen text-gray-600">
        <div className="flex flex-col items-center space-y-4">
        <div className="relative">
          <div className="w-20 h-20 rounded-full bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/50">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-10 h-10 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 3l8 4v5a9 9 0 11-16 0V7l8-4z"
              />
            </svg>
          </div>

          {/* Spinner around logo */}
          <div className="absolute inset-0 border-4 border-transparent border-t-blue-400 rounded-full animate-spin"></div>
        </div>

        {/* Text below logo */}
        <h1 className="text-2xl font-semibold tracking-wide">Security Portal</h1>
        <p className="text-sm text-gray-300 animate-pulse">
          Fetching drivers, please wait...
        </p>
      </div>
      </div>
    );
  }
  return (
    <div className="space-y-6 relative">
      <Toaster />
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Register Driver</h1>
        <p className="text-gray-500">Add drivers to registered vehicles</p>
      </div>

      {/* Add Driver Form */}
      <div className="bg-white rounded-xl shadow-sm">
        <div className="border-b px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-blue-600" />
            New Driver Registration
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="col-span-2">
              <label className="text-sm font-medium text-gray-700">
                Select Vehicle
              </label>
              <select
                value={selectedVehicle}
                onChange={(e) => setSelectedVehicle(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="">Select Vehicle</option>
                {vehicles.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.plate_number} — {v.model}
                  </option>
                ))}
              </select>
            </div>

            <input
              type="text"
              placeholder="Full Name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            <input
              type="text"
              placeholder="License Number"
              value={licenseNumber}
              onChange={(e) => setLicenseNumber(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            <input
              type="text"
              placeholder="Phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            <input
              type="file"
              onChange={handlePhotoUpload}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-[#1f3d7a] hover:bg-blue-700 text-white rounded-md py-2"
          >
            {loading ? <Loader2 className="animate-spin" /> : <UserPlus />}
            Register Driver
          </button>
        </form>
      </div>

    {Array.isArray(drivers) && drivers.length === 0 ? (
  <p className="text-gray-500">No drivers registered yet.</p>
) : (
  drivers.map((driver) => (
    <div
      key={driver.id}
      className="flex items-center justify-between border rounded-lg p-3 mb-2"
    >
      <div className="flex items-center gap-3">
        {driver.photo ? (
          <img
            src={`${import.meta.env.VITE_API_BASE_URL}/storage/${driver.photo}`}
            alt={driver.full_name}
            className="h-12 w-12 rounded-full object-cover"
          />
        ) : (
          <User className="h-10 w-10 text-gray-400" />
        )}

        <div>
          <p className="font-medium">{driver.full_name}</p>
          <p className="text-sm text-gray-500">
            {driver.license_number} • {driver.phone}
          </p>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => setEditingDriver(driver)}
          className="p-1.5 rounded-full bg-blue-50 hover:bg-blue-100 text-blue-600"
        >
          <Pencil size={16} />
        </button>
        <button
          onClick={() => handleDeleteDriver(driver.id)}
          className="p-1.5 rounded-full bg-blue-50 hover:bg-red-100 text-red-600"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  ))
)}


      {/* Edit Modal */}
      {editingDriver && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h3 className="font-semibold text-lg mb-4">Edit Driver</h3>
            <form onSubmit={handleUpdateDriver} className="space-y-3">
              <input
                name="full_name"
                value={editForm.full_name}
                onChange={(e) =>
                  setEditForm({ ...editForm, full_name: e.target.value })
                }
                className="border px-3 py-2 w-full rounded-md"
              />
              <input
                name="license_number"
                value={editForm.license_number}
                onChange={(e) =>
                  setEditForm({
                    ...editForm,
                    license_number: e.target.value,
                  })
                }
                className="border px-3 py-2 w-full rounded-md"
              />
              <input
                name="phone"
                value={editForm.phone}
                onChange={(e) =>
                  setEditForm({ ...editForm, phone: e.target.value })
                }
                className="border px-3 py-2 w-full rounded-md"
              />
              <button
                type="submit"
                className="bg-blue-600 text-white w-full py-2 rounded-md"
              >
                Save
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RegisterDriver;
