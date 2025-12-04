import { useEffect, useState } from "react";
import axiosClient from "../api/axiosClient";
import { Car, Users, CheckCircle, XCircle, Loader2} from "lucide-react";

const Dashboard = () => {
  const [vehicles, setVehicles] = useState([]);
  const [visitors, setVisitors] = useState([]);
  const [checkpoints, setCheckpoints] = useState([]);
  const [checkInOuts, setCheckInOuts] = useState([]);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const { data } = await axiosClient.get("/vehicles");
        setVehicles(data.data);
      } catch (error) {
        console.error("Error fetching vehicles:", error.response || error);
      }
    };

    const fetchVisitors = async () => {
      try {
        const { data } = await axiosClient.get("/visitors");
        setVisitors(data);
      } catch (error) {
        console.error("Error fetching visitors:", error.response || error);
      }
    };

    const fetchCheckpoints = async () => {
      try {
        const { data } = await axiosClient.get("/checkpoints");
        setCheckpoints(data);
      } catch (error) {
        console.error("Error fetching checkpoints:", error.response || error);
      }
    };

    const fetchCheckInOuts = async () => {
      try {
        const { data } = await axiosClient.get("/checkinout");
        setCheckInOuts(data.data || []);
     
      } catch (error) {
        console.error("Error fetching check-ins/outs:", error.response || error);
      }
    };

    const loadAll = async () => {
      setLoading(true);
      await Promise.all([
        fetchVehicles(),
        fetchVisitors(),
        fetchCheckpoints(),
        fetchCheckInOuts(),
      ]);
      setLoading(false);
    };

    loadAll();
  }, []);

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
          Loading Dashboard, please wait...
        </p>
      </div>
      </div>
    );
  }

  const activeCheckIns = checkInOuts.filter(
    (c) => c.status === "checked-in"
  ).length;

  const completedCheckOuts = checkInOuts.filter(
    (c) => c.status === "checked-out"
  ).length;

  const recentActivity = checkInOuts.slice(-5).reverse();

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10 space-y-8">
      {/* Header */}
      <header>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500">Security checkpoint overview</p>
      </header>

      {/* Stats */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Vehicles"
          icon={<Car className="h-5 w-5 text-gray-400" />}
          value={vehicles.length}
        />
        <StatCard
          title="Total Visitors"
          icon={<Users className="h-5 w-5 text-gray-400" />}
          value={visitors.length}
        />
        <StatCard
          title="Active Check-ins"
          icon={<CheckCircle className="h-5 w-5 text-green-500" />}
          value={activeCheckIns}
          color="text-green-600"
        />
        <StatCard
          title="Completed Check-outs"
          icon={<XCircle className="h-5 w-5 text-red-400" />}
          value={completedCheckOuts}
          color="text-red-500"
        />
      </div>

{/* Recent Activity */}
<section className="bg-white rounded border border-gray-100 p-6 hover:shadow-lg transition-shadow duration-300">
  {recentActivity.length === 0 ? (
    <EmptyActivity />
  ) : (
    <>
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl font-semibold text-gray-800">Recent Activity</h2>
        <span className="text-sm text-gray-500">
          Showing {Math.min(recentActivity.length, 4)} of {recentActivity.length}
        </span>
      </div>

      <ul className="divide-y divide-gray-100">
        {recentActivity.slice(0, 4).map((activity) => {
          const vehicleImage =
            activity.type === "vehicle" && activity.vehicles?.length > 0
              ? activity.vehicles[0].photo
              : null;

          const vehiclePlate =
            activity.type === "vehicle" && activity.vehicles?.length > 0
              ? activity.vehicles[0].plate_number
              : "Vehicle";

          return (
            <li
              key={activity.id}
              className="flex items-center justify-between py-4 gap-4 hover:bg-gray-50 rounded-xl transition-all duration-200 px-2"
            >
              {/* Left: Image + Info */}
              <div className="flex items-center gap-4">
                {/* Avatar / Photo */}
                {activity.type === "visitor" && activity.visitors?.length > 0 ? (
                  <div className="flex -space-x-2">
                    {activity.visitors.map((v) => (
                      <img
                        key={v.id}
                        src={v.photo}
                        alt={v.name}
                        className="w-10 h-10 rounded-full border-2 border-white object-cover shadow-sm"
                      />
                    ))}
                  </div>
                ) : vehicleImage ? (
                  <img
                    src={vehicleImage}
                    alt={vehiclePlate}
                    className="w-12 h-12 rounded-lg object-cover border border-gray-200 shadow-sm"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 text-xs font-medium">
                    N/A
                  </div>
                )}

                {/* Text Info */}
                <div>
                  <p className="text-sm font-semibold text-gray-800 leading-tight">
                    {Array.isArray(activity.item_names)
                      ? activity.item_names.join(", ")
                      : activity.item_names || "Unknown"}
                  </p>
                  <p className="text-xs text-gray-500">
                    {activity.checkpoint?.name || "Unknown Checkpoint"}
                  </p>

                  <div className="mt-1 flex items-center gap-2 flex-wrap">
                    <span
                      className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                        activity.type === "vehicle"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-green-100 text-green-700"
                      }`}
                    >
                      {activity.type === "vehicle"
                        ? `Vehicle • ${vehiclePlate}`
                        : `Visitor • ${
                            activity.visitors?.[0]?.name || "Unknown"
                          }`}
                    </span>

                    <p className="text-xs text-gray-400">
                      {activity.created_at
                        ? new Date(activity.created_at).toLocaleString([], {
                            dateStyle: "medium",
                            timeStyle: "short",
                          })
                        : "No timestamp"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Right: Status + Shift */}
              <div className="text-right space-y-1 min-w-[80px]">
                <span
                  className={`inline-block px-3 py-1 text-xs font-medium rounded-full capitalize ${
                    activity.status === "checked-in"
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {activity.status}
                </span>
                <p className="text-xs text-gray-500 capitalize">
                  {activity.shift || "No shift"}
                </p>
              </div>
            </li>
          );
        })}
      </ul>

      {/* View More */}
      {recentActivity.length > 4 && (
        <div className="mt-5 text-center">
          <a
            href="/checkpoint"
            className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
          >
            View More
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-4 h-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 5l7 7-7 7"
              />
            </svg>
          </a>
        </div>
      )}
    </>
  )}
</section>






    </div>
  );
};

// ✅ Small UI Components
const StatCard = ({ title, icon, value, color = "text-gray-900" }) => (
  <div className="bg-white rounded-xl hover:shadow-md transition p-5 border border-gray-100">
    <div className="flex items-center justify-between">
      <p className="text-sm font-semibold text-gray-600">{title}</p>
      {icon}
    </div>
    <div className={`mt-3 text-3xl font-bold ${color}`}>{value}</div>
  </div>
);

const EmptyActivity = () => (
  <div className="flex flex-col items-center justify-center py-10 text-center text-gray-500">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-12 w-12 text-gray-400 mb-3"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 8v4l3 3m6 0a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
    <p className="text-base font-medium text-gray-700">No recent activity</p>
    <p className="text-sm text-gray-500 mt-1">Everything is quiet for now.</p>
  </div>
);

export default Dashboard;
