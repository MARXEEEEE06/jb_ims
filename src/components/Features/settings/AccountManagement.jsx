import { useState, useEffect } from "react";
import BASE_URL from "../../../hooks/server/config";
import AddUser from "../inventory/AddUser";
import "./AccountManagement.css";

function AccountManagement() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAdd, setShowAdd] = useState(false);

    const [selectedItem, setSelectedItem] = useState(null);


    // Fetch users from backend API
    const fetchUsers = async () => {
    try {
        const response = await fetch(`${BASE_URL}/getusers`);
        if (!response.ok) throw new Error("Failed to fetch users");

        const data = await response.json();
        setUsers(data);
    } catch (err) {
        console.error(err);
    } finally {
        setLoading(false);
    }
    };

    useEffect(() => {
            fetchUsers(); // still runs on mount
    }, []);

    return (
        <div className="acc-manage-container">
        <h1>Account Management</h1>
        <div className="acc-manage-content">
            <div className="content-header">
                <h2>Members</h2>
                <button className="add-mem-btn" onClick={() => setShowAdd(true)}>+ Add Member</button>
            </div>

            <div className="member-list">
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
                    {users.map((user) => (
                    <tr key={user.user_info_id}>
                        <td>{user.username}</td>
                        <td>{user.email}</td>
                        <td>{user.contact_num}</td>
                        <td>{user.role_id === 1 ? "Manager" : "Staff"}</td>
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
                        onClose={() => setShowAdd(false)} />
                    </div>
                </div>
            )}
        </div>
        </div>
    );
}

export default AccountManagement;