import { useState, useEffect } from "react";
import { z } from "zod";
import { UserPlus, Loader2, KeyRound } from "lucide-react";
import axiosClient from "../api/axiosClient";

const userSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    fullName: z.string().min(2, "Full name must be at least 2 characters"),
    role: z.enum(["admin", "security"], {
        required_error: "Please select a role",
    }),
});

const passwordSchema = z.object({
    password: z.string().min(6, "Password must be at least 6 characters"),
});

const ManageUsers = () => {
    const [loading, setLoading] = useState(false);
    const [users, setUsers] = useState([]);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [fullName, setFullName] = useState("");
    const [role, setRole] = useState("security");
    const [message, setMessage] = useState("");
    const [resettingUser, setResettingUser] = useState(null);
    const [newPassword, setNewPassword] = useState("");

    /**
     * Fetch users dynamically from backend (with fallback to dummy data)
     */
    useEffect(() => {
        const fetchUsers = async () => {
            setLoading(true);
            try {
                const { data } = await axiosClient.get("/users");
                setUsers(data);
                
            } catch (error) {
                console.warn("⚠️ Failed to fetch users, loading dummy data instead");
            } finally {
                setLoading(false);
            }
        };
        fetchUsers();
    }, []);

    /**
     * Add new user
     */
    const handleAddUser = async (e) => {
        e.preventDefault();
        setMessage("");

        try {
            const validated = userSchema.parse({ email, password, fullName, role });
            setLoading(true);

            const { data } = await axiosClient.post("/register", {
                full_name: validated.fullName,
                email: validated.email,
                password: validated.password,
                role: validated.role,
            });

            setUsers((prev) => [data, ...prev]);
            setEmail("");
            setPassword("");
            setFullName("");
            setRole("security");
            setMessage("✅ User added successfully!");
        } catch (error) {
            if (error instanceof z.ZodError) {
                setMessage(`⚠️ ${error.errors[0].message}`);
            } else {
                const msg = error.response?.data?.message || "❌ Failed to add user";
                setMessage(msg);
            }
        } finally {
            setLoading(false);
        }
    };

    /**
     * Reset password for a user
     */
    const handleResetPassword = async (e) => {
        e.preventDefault();
        if (!resettingUser) return;

        try {
            // validate the new password (using your zod schema)
            const validated = passwordSchema.parse({ password: newPassword });
            setLoading(true);

            // send the new password to backend (no need for tokens or confirmations)
            await axiosClient.put(`/users/${resettingUser.id}/reset-password`, {
                password: validated.password,
            });

            setMessage(`✅ Password for ${resettingUser.full_name} has been reset successfully!`);
            setResettingUser(null);
            setNewPassword("");
        } catch (error) {
            if (error instanceof z.ZodError) {
                setMessage(`⚠️ ${error.errors[0].message}`);
            } else if (error.response) {
                setMessage(`❌ ${error.response.data.message || "Failed to reset password"}`);
            } else {
                setMessage("❌ An unexpected error occurred");
            }
        } finally {
            setLoading(false);
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
          Fetching users, please wait...
        </p>
      </div>
      </div>
    );
  }
    return (
        <div className="space-y-6 p-6 max-w-6xl mx-auto">
            <div>
                <h1 className="text-3xl font-bold text-gray-800">Manage Users</h1>
                <p className="text-gray-500 mt-1">Add, view, and reset user passwords</p>
            </div>

            {/* Add User Form */}
            <div className="bg-white p-6 rounded-lg shadow space-y-4">
                <div>
                    <h2 className="flex items-center gap-2 text-xl font-semibold text-gray-800">
                        <UserPlus className="w-5 h-5 text-gray-600" />
                        Add New User
                    </h2>
                </div>

                {message && (
                    <p
                        className={`p-3 rounded-md text-sm ${message.includes("✅")
                            ? "bg-green-50 text-green-700 border border-green-200"
                            : message.includes("⚠️")
                                ? "bg-yellow-50 text-yellow-700 border border-yellow-200"
                                : "bg-red-50 text-red-700 border border-red-200"
                            }`}
                    >
                        {message}
                    </p>
                )}

                <form onSubmit={handleAddUser} className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Full Name</label>
                            <input
                                type="text"
                                placeholder="John Doe"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Email</label>
                            <input
                                type="email"
                                placeholder="user@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Password</label>
                            <input
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Role</label>
                            <select
                                value={role}
                                onChange={(e) => setRole(e.target.value)}
                                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            >
                                <option value="security">Security Guard</option>
                                <option value="admin">Admin</option>
                            </select>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="flex items-center justify-center gap-2 bg-[#1f3d7a] hover:bg-blue-700 text-white font-medium px-6 py-2 rounded-md transition w-full md:w-auto"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" /> Creating User...
                            </>
                        ) : (
                            <>
                                <UserPlus className="w-4 h-4" /> Add User
                            </>
                        )}
                    </button>
                </form>
            </div>

            {/* Users Table */}
            <div className="bg-white p-6 rounded-lg shadow space-y-4">
                <h2 className="text-xl font-semibold text-gray-800">Existing Users</h2>
                <div className="overflow-x-auto">
                    <table className="min-w-full border border-gray-200 text-sm">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="px-4 py-2 text-left font-medium text-gray-700 border-b">Full Name</th>
                                <th className="px-4 py-2 text-left font-medium text-gray-700 border-b">Email</th>
                                <th className="px-4 py-2 text-left font-medium text-gray-700 border-b">Roles</th>
                                <th className="px-4 py-2 text-left font-medium text-gray-700 border-b">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((user) => (
                                <tr key={user.id} className="hover:bg-gray-50">
                                    <td className="px-4 py-2 border-b font-medium text-gray-800">{user.full_name}</td>
                                    <td className="px-4 py-2 border-b text-gray-600">{user.email}</td>
                                    <td className="px-4 py-2 border-b">

                                        <span
                                            className={`text-xs px-2 py-1 rounded-full mr-1 ${user.role === "admin" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"
                                                }`}
                                        >
                                            {user?.role}
                                        </span>


                                    </td>
                                    <td className="px-4 py-2 border-b">
                                        <button
                                            onClick={() => setResettingUser(user)}
                                            className="flex items-center gap-1 text-blue-600 hover:underline text-sm"
                                        >
                                            <KeyRound className="w-4 h-4" /> Reset Password
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Reset Password Modal */}
            {resettingUser && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
                    <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md space-y-4">
                        <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                            <KeyRound className="w-5 h-5 text-blue-600" />
                            Reset Password for {resettingUser.full_name}
                        </h3>

                        <form onSubmit={handleResetPassword} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">New Password</label>
                                <input
                                    type="password"
                                    placeholder="Enter new password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                />
                            </div>

                            <div className="flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setResettingUser(null);
                                        setNewPassword("");
                                    }}
                                    className="px-4 py-2 rounded-md border text-gray-700 hover:bg-gray-100"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
                                >
                                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <KeyRound className="w-4 h-4" />}
                                    Reset
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageUsers;
