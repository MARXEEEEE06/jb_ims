import React, { useState } from "react";
import BASE_URL from "../../../hooks/server/config.js";

import "./AddUser.css"
import { eyeHideToggle, eyeShowToggle } from "../../../assets/ui/Icons";

function AddUser({ onClose, onRefresh }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [contactNum, setContactNum] = useState('');
  const [roleId, setRoleId] = useState('2');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [eyeToggle, setShow] = useState(false);

  const validate = () => {
    const newErrors = {};

    // Username: required, 3–30 chars, alphanumeric + underscores only
    const trimmedUsername = username.trim();
    if (!trimmedUsername) {
      newErrors.username = "Username is required.";
    } else if (trimmedUsername.length < 3 || trimmedUsername.length > 30) {
      newErrors.username = "Username must be 3–30 characters.";
    } else if (!/^[a-zA-Z0-9_]+$/.test(trimmedUsername)) {
      newErrors.username = "Username can only contain letters, numbers, and underscores.";
    }

    // Password: required, min 8 chars, at least 1 number
    if (!password) {
      newErrors.password = "Password is required.";
    } else if (password.length < 8) {
      newErrors.password = "Password must be at least 8 characters.";
    } else if (!/\d/.test(password)) {
      newErrors.password = "Password must contain at least one number.";
    }

    // Email: required, standard format
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      newErrors.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      newErrors.email = "Enter a valid email address.";
    }

    // Contact: PH mobile 09XXXXXXXXX
    const trimmedContact = contactNum.trim();
    if (!trimmedContact) {
      newErrors.contactNum = "Contact number is required.";
    } else if (!/^09\d{9}$/.test(trimmedContact)) {
      newErrors.contactNum = "Enter a valid PH mobile number (e.g. 09171234567).";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

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
          username: username.trim(),
          password,
          email: email.trim().toLowerCase(),
          contact_num: contactNum.trim(),
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
        <form onSubmit={handleSubmit}>
          <label className="required" htmlFor="username">Username</label>
          <input
            className={`add-user-input ${errors.username ? 'input-error' : ''}`}
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter username"
          />
          {errors.username && <span className="error-msg">{errors.username}</span>}

          <label className="required" htmlFor="password">Password</label>
          <input
            className={`add-user-input ${errors.password ? 'input-error' : ''}`}
            type={eyeToggle ? "text" : "password"}
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
          />
          <a className='eye-toggle' onClick={() => setShow(!eyeToggle)}>
            {eyeToggle ? <img src={eyeShowToggle}/> : <img src={eyeHideToggle}/>}
          </a>
          {errors.password && <span className="error-msg">{errors.password}</span>}

          <label className="required" htmlFor="email">Email</label>
          <input
            className={`add-user-input ${errors.email ? 'input-error' : ''}`}
            type="text"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter email"
          />
          {errors.email && <span className="error-msg">{errors.email}</span>}

          <label className="required" htmlFor="contact">Contact Number</label>
          <input
            className={`add-user-input ${errors.contactNum ? 'input-error' : ''}`}
            type="text"
            inputMode="numeric"
            onKeyDown={(e) => ["e", "E", "+", "-"].includes(e.key) && e.preventDefault()}
            id="contact"
            value={contactNum}
            onChange={(e) => setContactNum(e.target.value)}
            placeholder="e.g. 09171234567"
            maxLength={11}
          />
          {errors.contactNum && <span className="error-msg">{errors.contactNum}</span>}

          <label className="required" htmlFor="role">Role</label>
          <select id="role" className="add-user-input role-dropdown" value={roleId} onChange={(e) => setRoleId(e.target.value)}>
            <option value="1">Manager</option>
            <option value="2">Staff</option>
          </select>

          <div className="form-button">
            <button type="submit" className="add-btn" disabled={isLoading}>
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