import React, { useState } from "react";
import BASE_URL from "../../../hooks/server/config";
import "./AddUser.css"

function AddUser({ onClose, onRefresh }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [contactNum, setContactNum] = useState('');
  const [roleId, setRoleId] = useState('2'); // default to staff
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${BASE_URL}/adduser`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          username,
          password,
          email,
          contact_num: contactNum,
          role_id: Number(roleId)
        })
      });

      const data = await response.json();
      if (response.ok) {
        onRefresh();
        onClose();
        alert("User added successfully!");
      } else {
        alert(data.error || "Failed to add user");
      }
    } catch (error) {
      alert("Server Error");
      console.error(error);
    }

    setIsLoading(false);
  };

  return (
    <div className="modal-add-user">
      <div className="modal-header">
        <h1>Add User</h1>
        <button type="button" onClick={onClose}>X</button>
      </div>
      <div className="add-user-form">
        <form>
          <label className="required" htmlFor="username">Username</label>
          <input required className="add-user-input" type="text" id="username" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Enter username" />

          <label className="required" htmlFor="password">Password</label>
          <input required className="add-user-input" type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter password" />

          <label className="required" htmlFor="email">Email</label>
          <input required className="add-user-input" type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter email" />

          <label className="required" htmlFor="contact">Contact Number</label>
          <input required className="add-user-input" type="number" id="contact" value={contactNum} onChange={(e) => setContactNum(e.target.value)} placeholder="Enter contact number" />

          <label className="required" htmlFor="role">Role</label>
          <select id="role" className="add-user-input role-dropdown" value={roleId} onChange={(e) => setRoleId(e.target.value)}>
            <option value="1">Manager</option>
            <option value="2">Staff</option>
          </select>

          <div className="form-button">
            <button type="button" className="add-btn" onClick={handleSubmit} disabled={isLoading}>
              {isLoading ? "Adding..." : "Add"}
            </button>
            <button type="button" className="cancel-btn" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddUser;
