import React, { useState, useEffect, useRef } from "react";
import axiosClient from "../api/axiosClient";
import { Plus, Car, Grid, List, Pencil, Trash2, Loader2, Camera, Upload, X } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import Webcam from "react-webcam";

const Vehicles = () => {
  const [vehicles, setVehicles] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [viewMode, setViewMode] = useState("list");
  const [loading, setLoading] = useState(false);
  const webcamRef = useRef(null);
  const MySwal = withReactContent(Swal);

  // Form states
  const [plateNumber, setPlateNumber] = useState("");
  const [model, setModel] = useState("");
  const [color, setColor] = useState("");
  const [image, setImage] = useState("");
  const [editId, setEditId] = useState(null);

  const [images, setImages] = useState({
    front: null,
    back: null,
    left: null,
    right: null,
  });
  const [showCamera, setShowCamera] = useState({
    front: false,
    back: false,
    left: false,
    right: false,
  });
  const webcamRefs = useRef({});

  // Fetch vehicles
  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const { data } = await axiosClient.get("/vehicles");
      setVehicles(data.data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load vehicles");
    } finally {
      setLoading(false);
    }
  };


  const capture = () => {
    const photo = webcamRef.current.getScreenshot();
    setImage(photo);
    setShowCamera(false);
  };
  // Handle image upload preview
  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImage(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleMultipleImageUpload = (e, position) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImages((prev) => ({ ...prev, [position]: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const capturePhoto = (position) => {
    const imageSrc = webcamRefs.current[position]?.getScreenshot();
    if (imageSrc) {
      setImages((prev) => ({ ...prev, [position]: imageSrc }));
      setShowCamera((prev) => ({ ...prev, [position]: false }));
    }
  };

  // Submit form (Add or Edit)
const handleSubmit = async (e) => {
  e.preventDefault();
  if (!plateNumber || !model || !color) {
    toast.error("Please fill all required fields");
    return;
  }

  setLoading(true);

  try {
    // Convert image object into array of base64 strings (remove empty/null)
    const imageArray = Object.values(images).filter(
      (img) => img !== null && img !== ""
    );

    const payload = {
      plate_number: plateNumber,
      model,
      color,
      images: imageArray,
    };

    if (editId) {
      await axiosClient.put(`/vehicles/${editId}`, payload);
      toast.success("Vehicle updated successfully");
    } else {
      await axiosClient.post("/vehicles", payload);
      toast.success("Vehicle added successfully");
    }

    fetchVehicles();
    resetForm();
  } catch (error) {
    console.error(error);
    toast.error("Failed to save vehicle");
  } finally {
    setLoading(false);
  }
};


  const resetForm = () => {
    setPlateNumber("");
    setModel("");
    setColor("");
    setImages({}); // ✅ clear all images
    setEditId(null);
    setShowForm(false);
  };

const handleEdit = (v) => {
  setEditId(v.id);
  setPlateNumber(v.plate_number);
  setModel(v.model);
  setColor(v.color);

  let vehicleImages = v.images;

  if (typeof v.images === "string") {
    try {
      vehicleImages = JSON.parse(v.images);
    } catch {
      vehicleImages = [];
    }
  }

  const positions = ["front", "back", "side"];

  // Start with empty placeholders
  const formattedImages = {
    front: null,
    back: null,
    side: null,
  };

  if (Array.isArray(vehicleImages) && vehicleImages.length > 0) {
    vehicleImages.forEach((img, index) => {
      const position = img.position || positions[index];

      // FORMAT: saved as { url: "...", position: "front" }
      if (typeof img === "object" && img.url) {
        formattedImages[position] = img.url;
      } 

      // FORMAT: saved as string ("base64 or URL")
      else if (typeof img === "string") {
        formattedImages[position] = img;
      }
    });
  }

  // 🔥 THIS ensures preview sees all 3 keys every time
  setImages(formattedImages);
  setShowForm(true);
};


  // Delete
const handleDelete = async (id) => {
  const result = await MySwal.fire({
    title: "Are you sure?",
    text: "You won't be able to revert this!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Yes, delete it!",
    cancelButtonText: "Cancel",
  });

  if (result.isConfirmed) {
    try {
      await axiosClient.delete(`/vehicles/${id}`);
      setVehicles((prev) => prev.filter((v) => v.id !== id));
      Swal.fire("Deleted!", "Vehicle has been deleted.", "success");
    } catch (error) {
      console.error(error);
      Swal.fire("Error!", "Failed to delete vehicle.", "error");
    }
  }
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
            Fetching vehicles, please wait...
          </p>
        </div>
      </div>
    );
  }
  return (
    <div className="space-y-6">
      <Toaster />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Vehicles</h1>
          <p className="text-gray-500">Manage registered vehicles</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-[#1f3d7a] text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
        >
          <Plus className="h-4 w-4" />
          {editId ? "Edit Vehicle" : "Register Vehicle"}
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="border border-gray-200 rounded-lg shadow-sm p-6 bg-white">
          <h2 className="text-xl font-semibold mb-4">
            {editId ? "Edit Vehicle" : "Register New Vehicle"}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Vehicle details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Plate Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Plate Number *
                </label>
                <input
                  value={plateNumber}
                  onChange={(e) => setPlateNumber(e.target.value)}
                  placeholder="ABC-1234"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              {/* Model */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Model *
                </label>
                <input
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  placeholder="Toyota Camry"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              {/* Color */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Color *
                </label>
                <input
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  placeholder="Silver"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Front, Back, and Side Photo Inputs */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
              {["front", "back", "side"].map((pos) => (
                <div key={pos} className="border border-gray-200 rounded-xl p-4 bg-gray-50">
                  <label className="block text-sm font-medium text-gray-700 mb-2 capitalize">
                    {pos} view
                  </label>

                  {!showCamera[pos] ? (
                    <div className="flex items-center gap-2">
                      {/* Upload */}
                      <label
                        htmlFor={`${pos}-upload`}
                        className="flex items-center justify-center gap-2 border border-gray-300 text-gray-700 px-4 py-2 font-medium hover:bg-gray-100 cursor-pointer active:scale-95 transition-all duration-200"
                      >
                        <Upload className="w-5 h-5" />
                        Upload
                        <input
                          id={`${pos}-upload`}
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleMultipleImageUpload(e, pos)}
                          className="hidden"
                        />
                      </label>

                      {/* Camera */}
                      <button
                        type="button"
                        onClick={() =>
                          setShowCamera((prev) => ({ ...prev, [pos]: true }))
                        }
                        className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-emerald-500 text-white px-4 py-2 rounded-lg shadow-md hover:from-green-700 hover:to-emerald-600 active:scale-95 transition-all duration-200"
                      >
                        <Camera className="w-5 h-5" />
                        Take Photo
                      </button>
                    </div>
                  ) : (
                     <div className="fixed inset-0 z-50 bg-black bg-opacity-90 flex flex-col items-center justify-center">
    {/* Webcam Full Screen */}
    <div className="relative w-full h-full">
      <Webcam
        ref={(ref) => (webcamRefs.current[pos] = ref)}
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
        onClick={() => capturePhoto(pos)}
        className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-full font-medium shadow-lg hover:bg-blue-700 active:scale-95 transition-all duration-200"
      >
        <Camera className="w-6 h-6" />
        Capture
      </button>

      <button
        type="button"
        onClick={() =>
          setShowCamera((prev) => ({ ...prev, [pos]: false }))
        }
        className="flex items-center gap-2 bg-gray-200 text-gray-700 px-6 py-3 rounded-full font-medium shadow hover:bg-gray-300 active:scale-95 transition-all duration-200"
      >
        <X className="w-6 h-6" />
        Cancel
      </button>
    </div>
  </div>
                  )}

                  {/* Preview */}
                  {images[pos] && (
                    <div className="mt-3">
                      <img
                        src={images[pos]}
                        alt={`${pos} view`}
                        className="h-32 w-full object-cover rounded-md border"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-2 mt-6">
              <button
                type="submit"
                disabled={loading}
                className="bg-[#1f3d7a] text-white px-5 py-2 rounded-md hover:bg-blue-700 transition"
              >
                {loading
                  ? "Saving..."
                  : editId
                    ? "Update Vehicle"
                    : "Submit"}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="border border-gray-300 px-5 py-2 rounded-md hover:bg-gray-100 transition"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* View Mode Toggle */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Registered Vehicles</h2>
        <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-md">
          <button
            onClick={() => setViewMode("list")}
            className={`p-2 rounded-md transition ${viewMode === "list"
              ? "bg-[#1f3d7a] text-white"
              : "text-gray-600 hover:bg-gray-200"
              }`}
          >
            <List className="h-5 w-5" />
          </button>
          <button
            onClick={() => setViewMode("grid")}
            className={`p-2 rounded-md transition ${viewMode === "grid"
              ? "bg-[#1f3d7a] text-white"
              : "text-gray-600 hover:bg-gray-200"
              }`}
          >
            <Grid className="h-5 w-5" />
          </button>

        </div>
      </div>

      {/* Vehicle List */}
      {vehicles.length > 0 ? (
        viewMode === "grid" ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {vehicles.map((v) => {
              const hasImages = v.images && v.images.length > 0;
              const imageUrl = hasImages ? v.images[0] : null; // show first image only
              return (
                <div
                  key={v.id}
                  className="border border-gray-200 rounded-lg shadow-sm bg-white p-4 relative"
                >
                  <div className="absolute top-3 right-3 flex gap-2">
                    <button
                      onClick={() => handleEdit(v)}
                      className="p-1.5 rounded-full bg-blue-50 hover:bg-blue-100 text-blue-600"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(v.id)}
                      className="p-1.5 rounded-full bg-red-50 hover:bg-red-100 text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt={v.model}
                      className="w-full h-40 object-cover rounded-md mb-4"
                    />
                  ) : (
                    <div className="w-full h-40 bg-gray-100 rounded-md mb-4 flex items-center justify-center">
                      <Car className="h-16 w-16 text-gray-400" />
                    </div>
                  )}

                  <h3 className="font-semibold text-lg text-gray-900">{v.plate_number}</h3>
                  <p className="text-sm text-gray-600">{v.model}</p>
                  <p className="text-sm text-gray-600">Color: {v.color}</p>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="divide-y divide-gray-200 border border-gray-200 rounded-lg bg-white shadow-sm">
            {vehicles.map((v) => {
              const hasImages = v.images && v.images.length > 0;
              const imageUrl = hasImages ? v.images[0] : null;
              return (
                <div
                  key={v.id}
                  className="flex items-center gap-4 p-4 hover:bg-gray-50 transition"
                >
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt={v.model}
                      className="h-16 w-24 object-cover rounded-md"
                    />
                  ) : (
                    <div className="h-16 w-24 bg-gray-100 flex items-center justify-center rounded-md">
                      <Car className="h-8 w-8 text-gray-400" />
                    </div>
                  )}

                  <div>
                    <h3 className="font-semibold text-gray-900">{v.plate_number}</h3>
                    <p className="text-sm text-gray-600">{v.model}</p>
                    <p className="text-sm text-gray-600">Color: {v.color}</p>
                  </div>

                  <div className="ml-auto flex gap-2">
                    <button
                      onClick={() => handleEdit(v)}
                      className="p-1.5 rounded-full bg-blue-50 hover:bg-blue-100 text-blue-600"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(v.id)}
                      className="p-1.5 rounded-full bg-red-50 hover:bg-red-100 text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )
      ) : (
        !showForm && (
          <div className="border border-gray-200 rounded-lg bg-white p-12 text-center">
            <Car className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500">No vehicles registered yet</p>
          </div>
        )
      )}

    </div>
  );
};

export default Vehicles;
