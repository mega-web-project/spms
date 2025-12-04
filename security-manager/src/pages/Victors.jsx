import React, { useState, useEffect, useRef } from "react";
import { Plus, User, Grid, List, Pencil, Trash2, Loader2, Camera, X,Upload} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import Swal from "sweetalert2";
import axiosClient from "../api/axiosClient";
import Webcam from "react-webcam";
const Visitors = () => {
  const [visitors, setVisitors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingVisitor, setEditingVisitor] = useState(null);
  const [name, setName] = useState("");
  const [idNumber, setIdNumber] = useState("");
  const [phone, setPhone] = useState("");
  const [company, setCompany] = useState("");
  const [photo, setPhoto] = useState("");
  const [viewMode, setViewMode] = useState("list");
  const webcamRef = useRef(null);

  const [showCamera, setShowCamera] = useState(false);

  // Fetch visitors
  const fetchVisitors = async () => {
    try {
      setLoading(true);
      const { data } = await axiosClient.get("/visitors");
      setVisitors(data);
    } catch (error) {
      console.error("Error fetching visitors:", error);
      toast.error("Failed to load visitors");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVisitors();
  }, []);


  const capture = () => {
    const imageSrc = webcamRef.current.getScreenshot();
    setPhoto(imageSrc);
    setShowCamera(false);
  }
  // Handle photo upload
  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];

    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPhoto(reader.result);
      reader.readAsDataURL(file);
    }
  };

  // Handle add/update visitor
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || !idNumber || !phone) {
      toast.error("Please fill in all required fields");
      return;
    }

    const visitorData = {
      name,
      id_number: idNumber,
      phone,
      company,
      photo,
    };

    try {
      if (editingVisitor) {
        // Update visitor
        await axiosClient.put(`/visitors/${editingVisitor.id}`, visitorData);
        toast.success("Visitor updated successfully");
      } else {
        // Add new visitor
        await axiosClient.post("/visitors", visitorData);
        toast.success("Visitor added successfully");
      }

      setShowForm(false);
      resetForm();
      fetchVisitors();
    } catch (error) {
      console.error("Error saving visitor:", error.response || error);
      toast.error("Failed to save visitor");
    }
  };

  // Delete visitor
const handleDeleteVisitor = async (id) => {
  const result = await Swal.fire({
    title: "Are you sure?",
    text: "This action cannot be undone!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Yes, delete it!",
    cancelButtonText: "Cancel",
  });

  if (result.isConfirmed) {
    try {
      await axiosClient.delete(`/visitors/${id}`);
      setVisitors((prev) => prev.filter((v) => v.id !== id));
      toast.success("Visitor deleted successfully");
    } catch (error) {
      console.error("Error deleting visitor:", error.response || error);
      toast.error("Failed to delete visitor");
    }
  }
};
  // Edit Visitor
  const handleEditVisitor = (visitor) => {
    setEditingVisitor(visitor);
    setShowForm(true);
    setName(visitor.name);
    setIdNumber(visitor.id_number);
    setPhone(visitor.phone);
    setCompany(visitor.company || "");
    setPhoto(visitor.photo || "");
  };

  // Reset form
  const resetForm = () => {
    setEditingVisitor(null);
    setName("");
    setIdNumber("");
    setPhone("");
    setCompany("");
    setPhoto("");
  };

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
          Fetching visitors, please wait...
        </p>
      </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <Toaster />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Visitors</h1>
          <p className="text-gray-500">Manage visitor records dynamically</p>
        </div>
        <button
          onClick={() => {
            setShowForm(!showForm);
            resetForm();
          }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#1f3d7a] hover:bg-blue-700 text-white rounded-lg transition-all"
        >
          <Plus className="h-4 w-4" />
          {showForm ? "Close Form" : "Register Visitor"}
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white shadow rounded-xl p-6">
          <h2 className="text-xl font-semibold mb-4">
            {editingVisitor ? "Edit Visitor" : "Register New Visitor"}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <InputField label="Full Name *" value={name} onChange={setName} placeholder="John Doe" />
              <InputField label="ID Number *" value={idNumber} onChange={setIdNumber} placeholder="ID12345" />
              <InputField label="Phone *" value={phone} onChange={setPhone} placeholder="+233 123 456 789" />
              <InputField label="Company" value={company} onChange={setCompany} placeholder="ABC Corp" />

              <div>
             

                {!showCamera ? (
                  <div className="flex items-center gap-2">
                      <label
                    htmlFor="vehicle-upload"
                    className="flex items-center justify-center gap-2 border border-gray-300 text-gray-700 px-5 py-2.5 rounded-xl font-medium hover:bg-gray-100 cursor-pointer active:scale-95 transition-all duration-200 whitespace-nowrap"
                  >
                    <Upload className="w-5 h-5" />
                    Upload Image
                    <input
                      id="vehicle-upload"
                      type="file"
                      accept="image/*"
                       onChange={handlePhotoUpload}
                      className="hidden"
                    />
                  </label>
                    <button
                      type="button"
                      onClick={() => setShowCamera(true)}
                      className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-emerald-500 text-white px-4 py-2.5 rounded-xl shadow-md hover:from-green-700 hover:to-emerald-600 active:scale-95 whitespace-nowrap transition-all duration-200"
                    >
                      <Camera size={18} />
                      <span className="font-medium">Take Photo</span>
                    </button>
                  </div>
                ) : (
                  <div className="fixed inset-0 z-50 bg-black bg-opacity-90 flex flex-col items-center justify-center p-0">

    {/* Webcam Full Screen */}
    <div className="relative w-full h-full">
      <Webcam
        ref={webcamRef}
        screenshotFormat="image/jpeg"
        className="w-full h-full object-cover"
        videoConstraints={{ facingMode: "environment" }}
      />

      {/* LIVE Badge */}
      <div className="absolute top-4 right-4 bg-red-500 text-white text-xs px-3 py-1 rounded-full shadow-lg">
        LIVE
      </div>
    </div>

    {/* Bottom Buttons */}
    <div className="absolute bottom-10 flex gap-4">
      <button
        type="button"
        onClick={capture}
        className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-full shadow-lg hover:bg-blue-700 active:scale-95 transition-all duration-200"
      >
        <Camera className="w-6 h-6" />
        Capture
      </button>

      <button
        type="button"
        onClick={() => setShowCamera(false)}
        className="flex items-center gap-2 bg-gray-200 text-gray-700 px-6 py-3 rounded-full font-medium shadow hover:bg-gray-300 active:scale-95 transition-all duration-200"
      >
        <X className="w-6 h-6" />
        Cancel
      </button>
    </div>
  </div>
                )}
              </div>

            </div>

            {photo && (
              <div className="mt-4">
                <img src={photo} alt="Visitor preview" className="h-32 w-32 object-cover rounded-md border" />
              </div>
            )}

            <div className="flex gap-3">
              <button
                type="submit"
                className="px-5 py-2 bg-[#1f3d7a] text-white rounded-lg hover:bg-blue-700 transition"
              >
                {editingVisitor ? "Update Visitor" : "Submit"}
              </button>
              <button
                type="button"
                onClick={() => {
                  resetForm();
                  setShowForm(false);
                }}
                className="px-5 py-2 border rounded-lg text-gray-700 hover:bg-gray-100 transition"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Display Section */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800">Visitor Records</h2>
        <div className="flex items-center gap-2">
          <ViewToggleButton viewMode={viewMode} setViewMode={setViewMode} />
        </div>
      </div>

      {/* Visitors List */}
      {visitors.length > 0 ? (
        <div
          className={
            viewMode === "grid"
              ? "grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
              : "space-y-4"
          }
        >
          {visitors.map((visitor) => (
            <VisitorCard
              key={visitor.id}
              visitor={visitor}
              viewMode={viewMode}
              onEdit={handleEditVisitor}
              onDelete={handleDeleteVisitor}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white shadow-sm rounded-xl p-12 text-center">
          <User className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500">No visitors registered yet</p>
        </div>
      )}
    </div>
  );
};

export default Visitors;

// 🔹 Reusable Components
const InputField = ({ label, value, onChange, placeholder, colSpan }) => (
  <div className={colSpan ? `sm:col-span-${colSpan}` : ""}>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {label}
    </label>
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
    />
  </div>
);

const VisitorCard = ({ visitor, viewMode, onEdit, onDelete }) => (
  <div
    className={`bg-white shadow-sm rounded-xl p-6 flex ${viewMode === "grid"
      ? "flex-col items-center text-center"
      : "items-center gap-4"
      }`}
  >
    {visitor.photo ? (
      <img
        src={visitor.photo}
        alt={visitor.name}
        className={`${viewMode === "grid" ? "w-24 h-24 mb-4" : "w-16 h-16"
          } rounded-full object-cover border`}
      />
    ) : (
      <div
        className={`${viewMode === "grid" ? "w-24 h-24 mb-4" : "w-16 h-16"
          } bg-gray-100 rounded-full flex items-center justify-center`}
      >
        <User className="h-8 w-8 text-gray-400" />
      </div>
    )}

    <div className={`${viewMode === "grid" ? "" : "flex-1"}`}>
      <h3 className="text-lg font-semibold text-gray-800">{visitor.name}</h3>
      <p className="text-sm text-gray-500">ID: {visitor.id_number}</p>
      <p className="text-sm text-gray-500">{visitor.phone}</p>
      {visitor.company && (
        <p className="text-sm text-gray-500">{visitor.company}</p>
      )}

    </div>

    <div
      className={`flex gap-2 mt-3 ${viewMode === "grid" ? "justify-center" : "ml-auto"
        }`}
    >
      <button
        onClick={() => onEdit(visitor)}
        className="px-3 py-1.5 text-sm font-medium text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition flex items-center gap-1"
      >
        <Pencil size={14} />
      </button>
      <button
        onClick={() => onDelete(visitor.id)}
        className="px-3 py-1.5 text-sm font-medium text-red-600 border border-red-600 rounded-lg hover:bg-red-50 transition flex items-center gap-1"
      >
        <Trash2 size={14} />
      </button>
    </div>
  </div>
);

const ViewToggleButton = ({ viewMode, setViewMode }) => (
  <>
    <button
      onClick={() => setViewMode("list")}
      className={`px-3 py-1 rounded-lg border ${viewMode === "list"
        ? "bg-[#1f3d7a] text-white border-blue-600"
        : "border-gray-300 text-gray-600 hover:bg-gray-100"
        }`}
    >
      <List className="h-5 w-5" />
    </button>
    <button
      onClick={() => setViewMode("grid")}
      className={`px-3 py-1 rounded-lg border ${viewMode === "grid"
        ? "bg-[#1f3d7a] text-white border-blue-600"
        : "border-gray-300 text-gray-600 hover:bg-gray-100"
        }`}
    >
      <Grid className="h-5 w-5" />
    </button>

  </>
);
