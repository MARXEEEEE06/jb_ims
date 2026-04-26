import { useState } from "react";
import api from "../../../hooks/server/config";
import "./Security.css";
import { eyeHideToggle, eyeShowToggle } from "../../../assets/ui/Icons";

function Security() {
    const [eyeToggle, setShow] = useState(false);
    const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
    });

    const [message, setMessage] = useState("");
    const [showModal, setShowModal] = useState(false);

    const handleChange = (e) => {
    setForm({
    ...form,
    [e.target.name]: e.target.value
    });
    };

    const submitPassword = async () => {
    try {
    const token = localStorage.getItem("token");

    const res = await api.post(
        "/changepassword",
        form,
        {
        headers: {
            Authorization: `Bearer ${token}`
        }
        }
    );

    setMessage(res.data.message);
    setForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
    });

    } catch (err) {
    setMessage(
        err.response?.data?.error ||
        "Failed to change password."
    );
    }

    setShowModal(false);
    };

    return (
    <div className="container security-container">
    <h1>Security</h1>
    <input
        type={eyeToggle ? "text" : "password"}
        name="currentPassword"
        placeholder="Current Password"
        value={form.currentPassword}
        onChange={handleChange}
        required
    />

    <input
        type={eyeToggle ? "text" : "password"}
        name="newPassword"
        placeholder="New Password"
        value={form.newPassword}
        onChange={handleChange}
        required
    />

    <input
        type={eyeToggle ? "text" : "password"}
        name="confirmPassword"
        placeholder="Confirm New Password"
        value={form.confirmPassword}
        onChange={handleChange}
        required
    />

    <button
        className="change-pass-btn"
        onClick={() => setShowModal(true)}
    >
        Change Password
    </button>
    <a className='eye-toggle' onClick={() => setShow(!eyeToggle)}>
        {eyeToggle ? <img src={eyeShowToggle}/> : <img src={eyeHideToggle}/>}
    </a>

    {message && <p className="security-msg">{message}</p>}

    {showModal && (
        <div className="modal-overlay">
        <div className="modal-content">
            <h2>Confirm Password Change</h2>
            <p>Are you sure you want to change your password?</p>

            <button
            className="confirm-btn"
            onClick={submitPassword}
            >
            Yes
            </button>

            <button
            className="cancel-btn"
            onClick={() => setShowModal(false)}
            >
            Cancel
            </button>
        </div>
        </div>
    )}
    </div>
    );
}

export default Security;