import { useState } from "react";
import BASE_URL from "../../../hooks/server/config";
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
    const [isSubmitting, setIsSubmitting] = useState(false);

    const passwordChecks = {
        minLength: form.newPassword.length >= 8,
        hasNumber: /[0-9]/.test(form.newPassword),
        hasSymbol: /[!@#$%^&*(),.?":{}|<>]/.test(form.newPassword),
    };

    const handleChange = (e) => {
    setMessage("");
    setForm({
    ...form,
    [e.target.name]: e.target.value
    });
    };

    const validateForm = () => {
        const currentPassword = form.currentPassword.trim();
        const newPassword = form.newPassword.trim();
        const confirmPassword = form.confirmPassword.trim();

        if (!currentPassword || !newPassword || !confirmPassword) {
            return "All fields are required.";
        }

        if (newPassword !== confirmPassword) {
            return "New passwords do not match.";
        }

        if (!(passwordChecks.minLength && passwordChecks.hasNumber && passwordChecks.hasSymbol)) {
            return "Password must be at least 8 characters and contain 1 number + 1 symbol (e.g. %$#^!).";
        }

        if (!localStorage.getItem("token")) {
            return "You are not logged in. Please login again.";
        }

        return "";
    };

    const submitPassword = async () => {
    try {
    const validationError = validateForm();
    if (validationError) {
        setMessage(validationError);
        setShowModal(false);
        return;
    }

    setIsSubmitting(true);
    const token = localStorage.getItem("token");

    const res = await fetch(`${BASE_URL}/changepassword`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
            currentPassword: form.currentPassword,
            newPassword: form.newPassword,
            confirmPassword: form.confirmPassword,
        }),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
        throw new Error(data?.error || "Failed to change password.");
    }

    setMessage(data?.message || "Password changed successfully.");
    setForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
    });

    } catch (err) {
    setMessage(err?.message || "Failed to change password.");
    } finally {
    setIsSubmitting(false);
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
    
    <div className="password-hints" aria-live="polite">
        <div className="password-hints-title">Password must include:</div>
        <ul className="password-hints-list">
            <li className={passwordChecks.minLength ? "hint-ok" : "hint-bad"}>At least 8 characters</li>
            <li className={passwordChecks.hasNumber ? "hint-ok" : "hint-bad"}>At least 1 number (0-9)</li>
            <li className={passwordChecks.hasSymbol ? "hint-ok" : "hint-bad"}>At least 1 symbol (e.g. %$#^!)</li>
        </ul>
    </div>

    <button
        className="change-pass-btn"
        disabled={isSubmitting}
        onClick={() => {
            const validationError = validateForm();
            if (validationError) {
                setMessage(validationError);
                return;
            }
            setShowModal(true);
        }}
    >
        {isSubmitting ? "Saving..." : "Change Password"}
    </button>
    <button
        type="button"
        className="eye-toggle"
        onClick={() => setShow(!eyeToggle)}
        aria-label={eyeToggle ? "Hide passwords" : "Show passwords"}
        disabled={isSubmitting}
    >
        {eyeToggle ? <img src={eyeShowToggle} alt="" /> : <img src={eyeHideToggle} alt="" />}
    </button>

    {message && <p className="security-msg">{message}</p>}

    {showModal && (
        <div className="modal-overlay">
        <div className="modal-content">
            <h2>Confirm Password Change</h2>
            <p>Are you sure you want to change your password?</p>

            <button
            className="confirm-btn"
            onClick={submitPassword}
            disabled={isSubmitting}
            >
            {isSubmitting ? "Saving..." : "Yes"}
            </button>

            <button
            className="cancel-btn"
            onClick={() => setShowModal(false)}
            disabled={isSubmitting}
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
