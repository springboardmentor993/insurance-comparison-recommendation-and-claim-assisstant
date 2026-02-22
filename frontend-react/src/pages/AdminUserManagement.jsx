import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * User Management
 * Admin page to view and manage all registered users
 */
export const UserManagement = ({ token }) => {
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(0);
    const [totalCount, setTotalCount] = useState(0);

    const PAGE_SIZE = 25;

    useEffect(() => {
        if (!token) {
            navigate("/login");
            return;
        }
        fetchUsers();
    }, [token, navigate, page]);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await fetch(
                `http://localhost:8000/admin/users?token=${token}&skip=${page * PAGE_SIZE}&limit=${PAGE_SIZE}`
            );

            if (!response.ok) {
                if (response.status === 403) {
                    setError("You don't have admin access");
                    setTimeout(() => navigate("/home"), 2000);
                    return;
                }
                throw new Error("Failed to fetch users");
            }

            const data = await response.json();
            setUsers(data.data?.users || []);
            setTotalCount(data.data?.total_count || 0);
        } catch (err) {
            console.error("Error:", err);
            setError("Failed to load users");
        } finally {
            setLoading(false);
        }
    };

    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(search.toLowerCase()) ||
        user.email.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div style={{
            minHeight: "100vh",
            background: "#f5f5f5",
            padding: "20px"
        }}>
            {/* Header */}
            <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "30px"
            }}>
                <div>
                    <h1 style={{ margin: "0", fontSize: "32px", color: "#667eea" }}>
                        User Management
                    </h1>
                    <p style={{ margin: "5px 0 0 0", color: "#999" }}>
                        Total Users: {totalCount}
                    </p>
                </div>
                <button
                    onClick={() => navigate("/admin/dashboard")}
                    style={{
                        padding: "10px 20px",
                        background: "#667eea",
                        color: "white",
                        border: "none",
                        borderRadius: "5px",
                        cursor: "pointer"
                    }}
                >
                    ← Back to Dashboard
                </button>
            </div>

            {error && (
                <div style={{
                    background: "#ffebee",
                    color: "#d32f2f",
                    padding: "15px",
                    borderRadius: "5px",
                    marginBottom: "20px"
                }}>
                    {error}
                </div>
            )}

            {/* Search Bar */}
            <div style={{
                marginBottom: "20px"
            }}>
                <input
                    type="text"
                    placeholder="Search by name or email..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    style={{
                        width: "100%",
                        padding: "12px",
                        fontSize: "16px",
                        border: "1px solid #ddd",
                        borderRadius: "5px",
                        boxSizing: "border-box"
                    }}
                />
            </div>

            {loading ? (
                <div style={{
                    textAlign: "center",
                    padding: "40px",
                    color: "#999"
                }}>
                    Loading users...
                </div>
            ) : (
                <>
                    {/* Users Table */}
                    <div style={{
                        background: "white",
                        borderRadius: "10px",
                        overflow: "hidden",
                        boxShadow: "0 2px 10px rgba(0,0,0,0.1)"
                    }}>
                        <table style={{
                            width: "100%",
                            borderCollapse: "collapse"
                        }}>
                            <thead>
                                <tr style={{
                                    background: "#f5f5f5",
                                    borderBottom: "2px solid #ddd"
                                }}>
                                    <th style={{
                                        padding: "15px",
                                        textAlign: "left",
                                        fontWeight: "bold",
                                        color: "#667eea"
                                    }}>
                                        ID
                                    </th>
                                    <th style={{
                                        padding: "15px",
                                        textAlign: "left",
                                        fontWeight: "bold",
                                        color: "#667eea"
                                    }}>
                                        Name
                                    </th>
                                    <th style={{
                                        padding: "15px",
                                        textAlign: "left",
                                        fontWeight: "bold",
                                        color: "#667eea"
                                    }}>
                                        Email
                                    </th>
                                    <th style={{
                                        padding: "15px",
                                        textAlign: "left",
                                        fontWeight: "bold",
                                        color: "#667eea"
                                    }}>
                                        Role
                                    </th>
                                    <th style={{
                                        padding: "15px",
                                        textAlign: "left",
                                        fontWeight: "bold",
                                        color: "#667eea"
                                    }}>
                                        Policies
                                    </th>
                                    <th style={{
                                        padding: "15px",
                                        textAlign: "left",
                                        fontWeight: "bold",
                                        color: "#667eea"
                                    }}>
                                        Joined
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredUsers.map((user, idx) => (
                                    <tr
                                        key={user.id}
                                        style={{
                                            borderBottom: "1px solid #eee",
                                            background: idx % 2 === 0 ? "white" : "#f9f9f9"
                                        }}
                                    >
                                        <td style={{ padding: "15px", color: "#333" }}>
                                            #{user.id}
                                        </td>
                                        <td style={{ padding: "15px", color: "#333" }}>
                                            {user.name}
                                        </td>
                                        <td style={{ padding: "15px", color: "#666" }}>
                                            {user.email}
                                        </td>
                                        <td style={{ padding: "15px" }}>
                                            <span style={{
                                                padding: "5px 10px",
                                                borderRadius: "20px",
                                                background: user.role === "admin" ? "#ffcdd2" : "#e3f2fd",
                                                color: user.role === "admin" ? "#d32f2f" : "#1976d2",
                                                fontSize: "12px",
                                                fontWeight: "bold"
                                            }}>
                                                {user.role === "admin" ? "🔐 Admin" : "👤 User"}
                                            </span>
                                        </td>
                                        <td style={{ padding: "15px", color: "#333" }}>
                                            {user.has_policies}
                                        </td>
                                        <td style={{ padding: "15px", color: "#999", fontSize: "12px" }}>
                                            {new Date(user.created_at).toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {filteredUsers.length === 0 && (
                        <div style={{
                            textAlign: "center",
                            padding: "40px",
                            background: "white",
                            borderRadius: "10px",
                            marginTop: "20px",
                            color: "#999"
                        }}>
                            No users found
                        </div>
                    )}

                    {/* Pagination */}
                    <div style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginTop: "20px",
                        padding: "20px",
                        background: "white",
                        borderRadius: "10px"
                    }}>
                        <div>
                            Page {page + 1} of {Math.ceil(totalCount / PAGE_SIZE) || 1}
                            {" "}
                            (Showing {filteredUsers.length} of {totalCount} users)
                        </div>
                        <div style={{ display: "flex", gap: "10px" }}>
                            <button
                                disabled={page === 0}
                                onClick={() => setPage(page - 1)}
                                style={{
                                    padding: "8px 15px",
                                    background: page === 0 ? "#ccc" : "#667eea",
                                    color: "white",
                                    border: "none",
                                    borderRadius: "5px",
                                    cursor: page === 0 ? "not-allowed" : "pointer"
                                }}
                            >
                                ← Previous
                            </button>
                            <button
                                disabled={page >= Math.ceil(totalCount / PAGE_SIZE) - 1}
                                onClick={() => setPage(page + 1)}
                                style={{
                                    padding: "8px 15px",
                                    background: page >= Math.ceil(totalCount / PAGE_SIZE) - 1 ? "#ccc" : "#667eea",
                                    color: "white",
                                    border: "none",
                                    borderRadius: "5px",
                                    cursor: page >= Math.ceil(totalCount / PAGE_SIZE) - 1 ? "not-allowed" : "pointer"
                                }}
                            >
                                Next →
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default UserManagement;
