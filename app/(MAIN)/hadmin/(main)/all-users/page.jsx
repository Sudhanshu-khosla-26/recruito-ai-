"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";

// Function to convert Firebase Timestamp to readable date string
const firebaseTimestampToDate = (timestamp) => {
    if (!timestamp || !timestamp._seconds) {
        return new Date().toISOString().split("T")[0];
    }
    const date = new Date(timestamp._seconds * 1000);
    return date.toISOString().split("T")[0];
};

// Function to normalize role names for consistency
const normalizeRole = (role) => {
    if (!role) return "Unknown";

    const roleMap = {
        hhr: "Head HR",
        hr: "HR",
        hm: "HM",
        admin: "Admin",
        hadmin: "Head Admin",
        jobseeker: "Candidate",
    };

    return roleMap[role.toLowerCase()] || role;
};
// Main mapping function
const mapFirebaseUsersToComponent = (firebaseUsers) => {
    return firebaseUsers.map((user) => ({
        id: user.id,
        name: user.name,
        email: user.email,
        role: normalizeRole(user.role),
        status: user.status || "active",
        createdAt: firebaseTimestampToDate(user.createdAt),
        profilePicture: user.profilePicture,
        is_verified: user.is_verified || false,
    }));
};


export default function AdminUserManagement() {
    const [users, setUsers] = useState([]);
    const [companies, setCompanies] = useState([]);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [viewMode, setViewMode] = useState("table");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Filters
    const [statusFilter, setStatusFilter] = useState("all");
    const [roleFilter, setRoleFilter] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");



    // Form state
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        role: "",
        company: "",
        password: "",
    });

    useEffect(() => {
        const getalluser = async () => {
            try {
                setLoading(true);
                setError(null);
                const res = await axios.get("/api/HAdmin/get-all-users");
                console.log("API Response:", res.data);

                if (res.data.users && Array.isArray(res.data.users)) {
                    const mappedUsers = mapFirebaseUsersToComponent(res.data.users);
                    setUsers(mappedUsers);
                    console.log("Mapped Users:", mappedUsers);
                } else {
                    console.warn("No users found in API response, using dummy data");
                    setUsers(dummyUsers);
                }
            } catch (error) {
                console.error("Error fetching users:", error);
                setError("Failed to fetch users. Using default data.");
                setUsers(dummyUsers);
            } finally {
                setLoading(false);
            }
        };
        const fetchCompanies = async () => {
            try {
                const res = await axios.get("/api/HAdmin/get-all-company"); // Your companies endpoint
                console.log("Companies API Response:", res.data);
                setCompanies(res.data.companies || []);
            } catch (error) {
                console.error("Error fetching companies:", error);
            }
        };
        getalluser();
        fetchCompanies();
    }, []);

    const handleCreateUser = async () => {
        if (!formData.name || !formData.email || !formData.password) {
            alert("Please fill in all fields including password");
            return;
        }

        if (formData.password.length < 6) {
            alert("Password must be at least 6 characters");
            return;
        }

        if ((formData.role === "Admin") && !formData.company) {
            alert("Please select a company for Admin roles");
            return;
        }

        const newUser = {
            name: formData.name,
            email: formData.email,
            role: formData.role === "Head Admin" ? "HAdmin" : "Admin",
            status: "active",
            company_id: formData?.company || "",
            password: formData.password // Add this line
        };

        try {
            const res = await axios.post("/api/HAdmin/create-user", newUser);

            if (res.status === 201) {
                // Send welcome email with credentials
                await axios.post("/api/Notification/Email", {
                    to: formData.email,
                    subject: "Welcome to the Platform - Your Account Details",
                    html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <h2 style="color: #16a34a;">Welcome to Our Platform!</h2>
                        <p>Hello ${formData.name},</p>
                        <p>Your account has been successfully created. Here are your login credentials:</p>
                        
                        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                            <p style="margin: 5px 0;"><strong>Email:</strong> ${formData.email}</p>
                            <p style="margin: 5px 0;"><strong>Password:</strong> ${formData.password}</p>
                            <p style="margin: 5px 0;"><strong>Role:</strong> ${formData.role}</p>
                        </div>
                        
                        <p style="color: #dc2626; font-size: 14px;">
                            ⚠️ <strong>Important:</strong> Please change your password after your first login for security purposes.
                        </p>
                        
                        <p>You can login at: <a href="${process.env.NEXT_PUBLIC_APP_URL}/login" style="color: #16a34a;">Login Here</a></p>

                        <p>If you have any questions, feel free to contact support.</p>

                    <p style="margin-top: 30px;">Best regards,<br />The Team</p>
                    </div >
        `,
                    text: `Welcome to Our Platform!\n\nHello ${formData.name}, \n\nYour account has been created successfully.\n\nLogin Credentials: \nEmail: ${formData.email} \nPassword: ${formData.password} \nRole: ${formData.role} \n\nPlease change your password after your first login.\n\nBest regards, \nThe Team`
                });

                alert("User created successfully! Welcome email sent.");

                // Refresh users list
                const usersRes = await axios.get("/api/HAdmin/get-all-users");
                if (usersRes.data.users) {
                    const mappedUsers = mapFirebaseUsersToComponent(usersRes.data.users);
                    setUsers(mappedUsers);
                }
            }
        } catch (error) {
            console.error("Error creating user:", error);
            alert("Failed to create user: " + (error.response?.data?.error || error.message));
        } finally {
            setFormData({ name: "", email: "", role: "HR", company: "", password: "" }); // Reset including password
            setShowCreateModal(false);
        }
    };

    const handleEditUser = async () => {
        if (!formData.name || !formData.email || !formData.role) {
            alert("Please fill in all fields");
            return;
        }

        if (formData.role === "Admin" && !formData.company) {
            alert("Please select a company for Admin roles");
            return;
        }

        try {
            const updateData = {
                id: selectedUser.id,
                role: formData.role,
                company_id: formData.role === "Admin" ? formData.company : null,
            };

            const res = await axios.patch("/api/HAdmin/update-user", updateData);
            console.log(res);

            // Update local state


            setFormData({ name: "", email: "", role: "HR", company: "" });
            setShowEditModal(false);
            setSelectedUser(null);
        } catch (error) {
            console.error("Error updating user:", error);
            alert("Failed to update user");
        }
    };


    const openEditModal = (user) => {
        setSelectedUser(user);
        setFormData({
            name: user.name,
            email: user.email,
            role: user.role,
            company: user.company || "",
        });
        setShowEditModal(true);
    };

    const handleDeleteUser = async () => {
        setLoading(true)
        const res = await axios.delete(`/ api / HAdmin / delete /user/${selectedUser.id} `);
        if (res.status === 200) {
            setUsers(users.filter((u) => u.id !== selectedUser.id));
        }
        setShowDeleteConfirm(false);
        setSelectedUser(null);
        setLoading(false)
    };

    const handleToggleStatus = async (user) => {
        try {
            const newStatus = user.status === "active" ? "suspended" : "active";

            const res = await axios.patch("/api/HAdmin/update-user", {
                id: user.id,
                status: newStatus,
            });

            if (res.status === 200) {
                setUsers(
                    users.map((u) =>
                        u.id === user.id ? { ...u, status: newStatus } : u
                    )
                );
            }
        } catch (error) {
            console.error("Error toggling status:", error);
            alert("Failed to update user status");
        }
    };

    const filteredUsers = users.filter((user) => {
        const matchStatus = statusFilter === "all" || user.status === statusFilter;
        const matchRole = roleFilter === "all" || user.role === roleFilter;
        const matchSearch =
            user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.email.toLowerCase().includes(searchQuery.toLowerCase());
        return matchStatus && matchRole && matchSearch;
    });

    const resetFilters = () => {
        setStatusFilter("all");
        setRoleFilter("all");
        setSearchQuery("");
    };

    const getStatusColor = (status) => {
        return status === "active"
            ? "bg-green-100 text-green-700"
            : "bg-red-100 text-red-700";
    };

    const getRoleBadgeColor = (role) => {
        if (role === "Head Admin") return "bg-green-600 text-white";
        if (role === "Admin") return "bg-green-400 text-black";
        return "bg-gray-300 text-gray-800";
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <div className="bg-white rounded-lg shadow p-8 text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 sm:py-6 sm:px-6 py-4 ">
            <div className="w-full mx-auto">
                {/* Error Alert */}
                {error && (
                    <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800 text-sm">
                        {error}
                    </div>
                )}

                {/* Header */}
                <div className="bg-white rounded-lg shadow p-4 sm:p-6 mb-4 sm:mb-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                        <h1 className="text-xl sm:text-2xl font-bold text-gray-800">
                            User Management
                        </h1>
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="w-full sm:w-auto px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded text-sm font-medium"
                        >
                            + Create User
                        </button>
                    </div>

                    {/* Filters */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 text-xs">
                        <div className="sm:col-span-2 lg:col-span-1">
                            <label className="block font-medium text-gray-600 mb-1">
                                Search
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Name or Email"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="border border-gray-300 rounded px-3 py-2 w-full text-xs pr-8"
                                />
                                {searchQuery && (
                                    <button
                                        onClick={() => setSearchQuery("")}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    >
                                        ✕
                                    </button>
                                )}
                            </div>
                        </div>

                        <div>
                            <label className="block font-medium text-gray-600 mb-1">
                                Status
                            </label>
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="border border-gray-300 rounded px-3 py-2 w-full text-xs"
                            >
                                <option value="all">All Status</option>
                                <option value="active">Active</option>
                                <option value="suspended">Suspended</option>
                            </select>
                        </div>

                        <div>
                            <label className="block font-medium text-gray-600 mb-1">
                                Role
                            </label>
                            <select
                                value={roleFilter}
                                onChange={(e) => setRoleFilter(e.target.value)}
                                className="border border-gray-300 rounded px-3 py-2 w-full text-xs"
                            >
                                <option value="all">All Roles</option>
                                <option value="Head Admin">Head Admin</option>
                                <option value="Admin">Admin</option>
                                <option value="Head HR">Head HR</option>
                                <option value="HM">HM</option>
                                <option value="HR">HR</option>
                                <option value="Candidate">Candidate</option>
                            </select>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-2 sm:col-span-2 lg:col-span-2">
                            <button
                                onClick={resetFilters}
                                className="px-3 py-2 h-fit mt-auto mb-1 bg-gray-200 hover:bg-gray-300 rounded text-xs font-medium"
                            >
                                ✕ Reset
                            </button>
                            <button
                                onClick={() => setViewMode(viewMode === "table" ? "cards" : "table")}
                                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded text-xs flex-1 lg:hidden"
                            >
                                {viewMode === "table" ? "Card View" : "Table View"}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Desktop Table View */}
                <div className="hidden lg:block bg-white rounded-lg shadow overflow-hidden">
                    <div className="p-4 border-b bg-gray-50">
                        <p className="text-sm text-gray-600">
                            Total Users: <span className="font-semibold">{filteredUsers.length}</span>
                        </p>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-xs">
                            <thead className="bg-gray-50">
                                <tr className="text-left text-gray-600 border-b">
                                    <th className="p-4">Name</th>
                                    <th className="p-4">Email</th>
                                    <th className="p-4">Role</th>
                                    <th className="p-4">Status</th>
                                    <th className="p-4">Created At</th>
                                    <th className="p-4 text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredUsers.map((user) => (
                                    <tr key={user.id} className="border-b hover:bg-gray-50">
                                        <td className="p-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                                                    <span className="text-green-700 font-semibold text-xs">
                                                        {user.name.charAt(0).toUpperCase()}
                                                    </span>
                                                </div>
                                                <span className="font-medium text-gray-800">
                                                    {user.name}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="p-4 text-gray-600">{user.email}</td>
                                        <td className="p-4">
                                            <span
                                                className={`px - 2 py - 1 rounded text - xs font - medium ${getRoleBadgeColor(
                                                    user.role
                                                )
                                                    } `}
                                            >
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <span
                                                className={`px - 2 py - 1 rounded - full text - xs font - medium ${getStatusColor(
                                                    user.status
                                                )
                                                    } `}
                                            >
                                                {user.status}
                                            </span>
                                        </td>
                                        <td className="p-4 text-gray-600">{user.createdAt}</td>
                                        <td className="p-4">
                                            <div className="flex gap-2 justify-center">
                                                <button
                                                    onClick={() => openEditModal(user)}
                                                    className="px-3 py-1 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded text-xs font-medium"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleToggleStatus(user)}
                                                    className={`px - 3 py - 1 rounded text - xs font - medium ${user.status === "active"
                                                        ? "bg-orange-100 text-orange-700 hover:bg-orange-200"
                                                        : "bg-green-100 text-green-700 hover:bg-green-200"
                                                        } `}
                                                >
                                                    {user.status === "active" ? "Suspend" : "Activate"}
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setSelectedUser(user);
                                                        setShowDeleteConfirm(true);
                                                    }}
                                                    className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-xs font-medium"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {filteredUsers.length === 0 && (
                        <div className="p-8 text-center text-gray-500">
                            No users found matching the filters
                        </div>
                    )}
                </div>

                {/* Mobile/Tablet View */}
                <div className="lg:hidden">
                    {viewMode === "table" && (
                        <div className="bg-white rounded-lg shadow overflow-hidden">
                            <div className="p-4 border-b bg-gray-50">
                                <p className="text-sm text-gray-600">
                                    Total Users: <span className="font-semibold">{filteredUsers.length}</span>
                                </p>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-xs">
                                    <thead className="bg-gray-50">
                                        <tr className="text-left text-gray-600 border-b">
                                            <th className="p-3">User</th>
                                            <th className="p-3">Role</th>
                                            <th className="p-3">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredUsers.map((user) => (
                                            <tr key={user.id} className="border-b">
                                                <td className="p-3">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                                                            <span className="text-green-700 font-semibold text-xs">
                                                                {user.name.charAt(0).toUpperCase()}
                                                            </span>
                                                        </div>
                                                        <div>
                                                            <div className="font-medium text-gray-800">{user.name}</div>
                                                            <div className="text-gray-500 text-xs truncate max-w-[150px]">{user.email}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="p-3">
                                                    <span className={`px - 2 py - 1 rounded text - xs font - medium ${getRoleBadgeColor(user.role)} `}>
                                                        {user.role}
                                                    </span>
                                                    <div className="mt-1">
                                                        <span className={`px - 2 py - 1 rounded - full text - xs font - medium ${getStatusColor(user.status)} `}>
                                                            {user.status}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="p-3">
                                                    <div className="flex flex-col gap-1">
                                                        <button
                                                            onClick={() => openEditModal(user)}
                                                            className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium"
                                                        >
                                                            Edit
                                                        </button>
                                                        <button
                                                            onClick={() => handleToggleStatus(user)}
                                                            className={`px - 2 py - 1 rounded text - xs font - medium ${user.status === "active"
                                                                ? "bg-orange-100 text-orange-700"
                                                                : "bg-green-100 text-green-700"
                                                                } `}
                                                        >
                                                            {user.status === "active" ? "Suspend" : "Activate"}
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                setSelectedUser(user);
                                                                setShowDeleteConfirm(true);
                                                            }}
                                                            className="px-2 py-1 bg-red-500 text-white rounded text-xs font-medium"
                                                        >
                                                            Delete
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            {filteredUsers.length === 0 && (
                                <div className="p-8 text-center text-gray-500">
                                    No users found
                                </div>
                            )}
                        </div>
                    )}

                    {viewMode === "cards" && (
                        <div className="space-y-4">
                            {filteredUsers.map((user) => (
                                <div key={user.id} className="bg-white rounded-lg shadow p-4">
                                    <div className="flex items-start gap-3 mb-3">
                                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                                            <span className="text-green-700 font-semibold text-sm">
                                                {user.name.charAt(0).toUpperCase()}
                                            </span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-semibold text-gray-800 text-sm">{user.name}</h3>
                                            <p className="text-gray-600 text-xs truncate">{user.email}</p>
                                            <p className="text-gray-500 text-xs mt-1">{user.createdAt}</p>
                                        </div>
                                    </div>

                                    <div className="flex gap-2 mb-3">
                                        <span className={`px - 2 py - 1 rounded text - xs font - medium ${getRoleBadgeColor(user.role)} `}>
                                            {user.role}
                                        </span>
                                        <span className={`px - 2 py - 1 rounded - full text - xs font - medium ${getStatusColor(user.status)} `}>
                                            {user.status}
                                        </span>
                                    </div>

                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => openEditModal(user)}
                                            className="flex-1 px-3 py-2 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded text-xs font-medium"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleToggleStatus(user)}
                                            className={`flex - 1 px - 3 py - 2 rounded text - xs font - medium ${user.status === "active"
                                                ? "bg-orange-100 text-orange-700 hover:bg-orange-200"
                                                : "bg-green-100 text-green-700 hover:bg-green-200"
                                                } `}
                                        >
                                            {user.status === "active" ? "Suspend" : "Activate"}
                                        </button>
                                        <button
                                            onClick={() => {
                                                setSelectedUser(user);
                                                setShowDeleteConfirm(true);
                                            }}
                                            className="flex-1 px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded text-xs font-medium"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {filteredUsers.length === 0 && (
                                <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
                                    No users found matching the filters
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Create User Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/40 bg-opacity-40 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-md shadow-lg relative">
                        <button
                            onClick={() => {
                                setShowCreateModal(false);
                                setFormData({ name: "", email: "", role: "", company: "", password: "" });
                            }}
                            className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 text-xl"
                        >
                            ✕
                        </button>
                        <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-4 sm:mb-6">
                            Create New User
                        </h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Full Name
                                </label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) =>
                                        setFormData({ ...formData, name: e.target.value })
                                    }
                                    placeholder="Enter full name"
                                    className="border border-gray-300 rounded px-3 py-2 w-full text-sm"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) =>
                                        setFormData({ ...formData, email: e.target.value })
                                    }
                                    placeholder="user@company.com"
                                    className="border border-gray-300 rounded px-3 py-2 w-full text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Password
                                </label>
                                <input
                                    type="password"
                                    value={formData.password}
                                    onChange={(e) =>
                                        setFormData({ ...formData, password: e.target.value })
                                    }
                                    placeholder="Enter password (min 6 characters)"
                                    className="border border-gray-300 rounded px-3 py-2 w-full text-sm"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Role
                                </label>
                                <select
                                    value={formData.role}
                                    onChange={(e) =>
                                        setFormData({ ...formData, role: e.target.value })
                                    }
                                    className="border border-gray-300 rounded px-3 py-2 w-full text-sm"
                                >
                                    <option value="">Select Role</option>
                                    <option value="Admin">Admin</option>
                                    <option value="Head Admin">Head Admin</option>
                                </select>
                            </div>

                            {/* Add this new div for company selection */}
                            {(formData.role === "Admin") && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Company
                                    </label>
                                    <select
                                        value={formData.company}
                                        onChange={(e) =>
                                            setFormData({ ...formData, company: e.target.value })
                                        }
                                        className="border border-gray-300 rounded px-3 py-2 w-full text-sm"
                                        required
                                    >
                                        <option value="">Select Company</option>
                                        {companies.map((company) => (
                                            <option key={company.id} value={company.id}>
                                                {company.company_name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3 mt-6">
                            <button
                                onClick={() => {
                                    setShowCreateModal(false);
                                    setFormData({ name: "", email: "", role: "", company: "", password: "" });
                                }}
                                className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded text-sm font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleCreateUser}
                                className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded text-sm font-medium"
                            >
                                Create User
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && selectedUser && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-md shadow-lg">
                        <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-4">
                            Confirm Delete
                        </h2>
                        <p className="text-gray-600 text-sm mb-6">
                            Are you sure you want to delete user{" "}
                            <span className="font-semibold">{selectedUser.name}</span>? This
                            action cannot be undone.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3">
                            <button
                                onClick={() => {
                                    setShowDeleteConfirm(false);
                                    setSelectedUser(null);
                                }}
                                className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded text-sm font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteUser}
                                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded text-sm font-medium"
                            >
                                Delete User
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit User Modal */}
            {showEditModal && selectedUser && (
                <div className="fixed inset-0 bg-black/40 bg-opacity-40 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-md shadow-lg relative">
                        <button
                            onClick={() => {
                                setShowEditModal(false);
                                setSelectedUser(null);
                                setFormData({ name: "", email: "", role: "", company: "" });
                            }}
                            className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 text-xl"
                        >
                            ✕
                        </button>
                        <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-4 sm:mb-6">
                            Edit User
                        </h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Full Name
                                </label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) =>
                                        setFormData({ ...formData, name: e.target.value })
                                    }
                                    readOnly
                                    placeholder="Enter full name"
                                    className="border border-gray-300 rounded px-3 py-2 w-full text-sm"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    readOnly
                                    value={formData.email}
                                    onChange={(e) =>
                                        setFormData({ ...formData, email: e.target.value })
                                    }
                                    placeholder="user@company.com"
                                    className="border border-gray-300 rounded px-3 py-2 w-full text-sm"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Role
                                </label>
                                <select
                                    value={formData.role}
                                    onChange={(e) =>
                                        setFormData({ ...formData, role: e.target.value })
                                    }
                                    className="border border-gray-300 rounded px-3 py-2 w-full text-sm"
                                >
                                    <option value="">Select Role</option>
                                    <option value="Admin">Admin</option>
                                    <option value="Head Admin">Head Admin</option>
                                </select>
                            </div>

                            {/* Add this new div for company selection */}
                            {(formData.role === "Admin") && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Company
                                    </label>
                                    <select
                                        value={formData.company}
                                        onChange={(e) =>
                                            setFormData({ ...formData, company: e.target.value })
                                        }
                                        className="border border-gray-300 rounded px-3 py-2 w-full text-sm"
                                        required
                                    >
                                        <option value="">Select Company</option>
                                        {companies.map((company) => (
                                            <option key={company.id} value={company.id}>
                                                {company.company_name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3 mt-6">
                            <button
                                onClick={() => {
                                    setShowEditModal(false);
                                    setSelectedUser(null);
                                    setFormData({ name: "", email: "", role: "", company: "" });
                                }}
                                className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded text-sm font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleEditUser}
                                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-medium"
                            >
                                Update User
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}