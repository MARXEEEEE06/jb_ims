import { useState, useEffect } from "react";
import BASE_URL from "../../../hooks/server/config";
import AddUser from "../inventory/AddUser";
import "./AccountManagement.css";

function AccountManagement() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAdd, setShowAdd] = useState(false);

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
                                    <tr key={u.login_id}>
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
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default AccountManagement;
