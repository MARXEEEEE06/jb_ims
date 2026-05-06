import { useState, useEffect } from "react";
import BASE_URL from "../../../hooks/server/config";
import AddUser from "./AddUser";
import Toast from "../modals/Toast.jsx";
import { useToast } from "../../../hooks/useToast.js";
import "./AccountManagement.css";

function AccountManagement() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAdd, setShowAdd] = useState(false);
    const { toast, showToast, clearToast } = useToast();

    const fetchUsers = async () => {
        try {
            setLoading(true);

            const token = localStorage.getItem("token");
            const response = await fetch(`${BASE_URL}/getusers`, {
                headers: token ? { Authorization: `Bearer ${token}` } : undefined,
            });

            const data = await response.json().catch(() => ({}));
            if (!response.ok) {
                throw new Error(data?.error || "Failed to fetch users");
            }

            setUsers(Array.isArray(data) ? data : []);
        } catch (err) {
            setUsers([]);
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    return (
        <div className="container acc-manage-container">
            <h1>Account Management</h1>
            <div className="acc-manage-content">
                <div className="content-header">
                    <h2>Members</h2>
                    <button className="add-mem-btn" onClick={() => setShowAdd(true)}>+ Add Member</button>
                </div>

                <div className="item-table">
                    {loading ? (
                        <p>Loading...</p>
                    ) : users.length === 0 ? (
                        <p>No members found.</p>
                    ) : (
                        <table>
                            <thead>
                                <tr>
                                    <th>Username</th>
                                    <th>Email</th>
                                    <th>Contact No.</th>
                                    <th>Role</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((u) => (
                                    <tr 
                                        className="tr-selectable"
                                        key={u.login_id}
                                    >
                                        <td>{u.username}</td>
                                        <td>{u.email}</td>
                                        <td>{u.contact_num}</td>
                                        <td>{u.role_type?.charAt(0).toUpperCase() + u.role_type?.slice(1)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {showAdd && (
                    <div className="modal-overlay">
                        <div className="modal-content">
                            <AddUser
                                onRefresh={fetchUsers}
                                onClose={() => setShowAdd(false)}
                                onToast={showToast}
                            />
                        </div>
                    </div>
                )}
            </div>
            {toast && (
                <Toast
                    key={toast.key}
                    message={toast.message}
                    duration={toast.duration}
                    onDone={clearToast}
                />
            )}
        </div>
    );
}

export default AccountManagement;
