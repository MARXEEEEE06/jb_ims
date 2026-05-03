import { useEffect, useState } from "react";
import BASE_URL from "../../../hooks/server/config";
import useAuth from "../../../hooks/UserAuth";
import "./Security.css";
import { eyeHideToggle, eyeShowToggle } from "../../../assets/ui/Icons";

function Security() {
    const { user } = useAuth();
    const isAdmin = String(user?.role ?? "").toLowerCase() === "admin";

    // Admin member password change state
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [adminForm, setAdminForm] = useState({ adminPassword: "", newPassword: "", confirmPassword: "" });
    const [adminEyeToggle, setAdminShow] = useState(false);
    const [adminMessage, setAdminMessage] = useState("");
    const [showAdminModal, setShowAdminModal] = useState(false);
    const [adminSubmitting, setAdminSubmitting] = useState(false);
    const [adminErrors, setAdminErrors] = useState({});
    const [adminPassword, setAdminPassword] = useState("");
    const [adminPasswordError, setAdminPasswordError] = useState("");
    const [eyeToggle, setShow] = useState(false);

    const adminPasswordChecks = {
        minLength: adminForm.newPassword.length >= 8,
        hasNumber: /[0-9]/.test(adminForm.newPassword),
        hasSymbol: /[!@#$%^&*(),.?":{}|<>]/.test(adminForm.newPassword),
    };

    useEffect(() => {
        if (!isAdmin) return;
        const fetchUsers = async () => {
            try {
                const token = localStorage.getItem("token");
                const res = await fetch(`${BASE_URL}/getusers`, {
                    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
                });
                const data = await res.json();
                if (res.ok) setUsers(Array.isArray(data) ? data : []);
            } catch {
                console.error("Failed to fetch users");
            }
        };
        fetchUsers();
    }, [isAdmin]);

    useEffect(() => {
        setAdminForm({ newPassword: "", confirmPassword: "" });
        setAdminMessage("");
        setAdminErrors({});
        setShowAdminModal(false);
        setAdminPassword("");        // add
        setAdminPasswordError("");   // add
    }, [selectedUser]);

    const handleAdminChange = (e) => {
        setAdminMessage("");
        setAdminForm({ ...adminForm, [e.target.name]: e.target.value });
    };

    // const validateAdmin = () => {
    //     const newErrors = {};
    //     if (!adminForm.adminPassword) newErrors.adminPassword = "Your password is required.";
    //     if (!adminForm.newPassword) {
    //         newErrors.newPassword = "New password is required.";
    //     } else if (!(adminPasswordChecks.minLength && adminPasswordChecks.hasNumber && adminPasswordChecks.hasSymbol)) {
    //         newErrors.newPassword = "Must be 8+ chars with 1 number and 1 symbol.";
    //     }
    //     if (!adminForm.confirmPassword) {
    //         newErrors.confirmPassword = "Please confirm the new password.";
    //     } else if (adminForm.newPassword !== adminForm.confirmPassword) {
    //         newErrors.confirmPassword = "Passwords do not match.";
    //     }
    //     setAdminErrors(newErrors);
    //     return Object.keys(newErrors).length === 0;
    // };

    const validateAdmin = () => {
        const newErrors = {};
        if (!adminForm.newPassword) {
            newErrors.newPassword = "New password is required.";
        } else if (!(adminPasswordChecks.minLength && adminPasswordChecks.hasNumber && adminPasswordChecks.hasSymbol)) {
            newErrors.newPassword = "Must be 8+ chars with 1 number and 1 symbol.";
        }
        if (!adminForm.confirmPassword) {
            newErrors.confirmPassword = "Please confirm the new password.";
        } else if (adminForm.newPassword !== adminForm.confirmPassword) {
            newErrors.confirmPassword = "Passwords do not match.";
        }
        setAdminErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // const submitAdminPassword = async () => {
    //     try {
    //         setAdminSubmitting(true);
    //         const token = localStorage.getItem("token");
    //         const res = await fetch(`${BASE_URL}/changepassword/admin`, {
    //             method: "POST",
    //             headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    //             body: JSON.stringify({
    //                 targetUserId: selectedUser.user_id,
    //                 adminPassword: adminForm.adminPassword,
    //                 newPassword: adminForm.newPassword,
    //                 confirmPassword: adminForm.confirmPassword,
    //             }),
    //         });
    //         const data = await res.json().catch(() => ({}));
    //         if (!res.ok) throw new Error(data?.error || "Failed to change password.");
    //         setAdminMessage(data?.message || "Password changed successfully.");
    //         setAdminForm({ adminPassword: "", newPassword: "", confirmPassword: "" });
    //     } catch (err) {
    //         setAdminMessage(err?.message || "Failed to change password.");
    //     } finally {
    //         setAdminSubmitting(false);
    //         setShowAdminModal(false);
    //     }
    // };

    const submitAdminPassword = async () => {
        if (!adminPassword.trim()) {
            setAdminPasswordError("Your password is required.");
            return;
        }
        setAdminPasswordError("");
        try {
            setAdminSubmitting(true);
            const token = localStorage.getItem("token");
            const res = await fetch(`${BASE_URL}/changepassword/admin`, {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify({
                    targetUserId: selectedUser.user_id,
                    adminPassword,   // from modal now
                    newPassword: adminForm.newPassword,
                    confirmPassword: adminForm.confirmPassword,
                }),
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(data?.error || "Failed to change password.");
            setAdminMessage(data?.message || "Password changed successfully.");
            setAdminForm({ newPassword: "", confirmPassword: "" });
            setAdminPassword("");
        } catch (err) {
            setAdminMessage(err?.message || "Failed to change password.");
        } finally {
            setAdminSubmitting(false);
            setShowAdminModal(false);
        }
    };

    return (
        <div className="container security-container">
            <h1>Security</h1>

            {!isAdmin ? (
                <div className="no-access">You don&apos;t have access to Security settings.</div>
            ) : (
                <>
                    <h2>Change Member Password</h2>
                    <div className="security-admin-grid">
                        <div>
                            <div className="item-table">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Username</th>
                                            <th>Email</th>
                                            <th>Role</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {users.map((u) => {
                                            const isSelected = selectedUser?.user_id === u.user_id;
                                            return (
                                                <tr
                                                    key={u.login_id}
                                                    className={isSelected ? "member-row selected" : "member-row"}
                                                    onClick={() => setSelectedUser(isSelected ? null : u)}
                                                >
                                                    <td>{u.username}</td>
                                                    <td>{u.email}</td>
                                                    <td>{String(u.role_type || "").charAt(0).toUpperCase() + String(u.role_type || "").slice(1)}</td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="admin-pass-form">
                            <h3>{selectedUser ? <>Setting password for: <strong>{selectedUser.username}</strong></> : "Select a member"}</h3>
                            {selectedUser && (
                                <>
                                    {/* <label>Your Password (to confirm)</label>
                                    <input
                                        type={adminEyeToggle ? "text" : "password"}
                                        name="adminPassword"
                                        placeholder="Enter your admin password"
                                        value={adminForm.adminPassword}
                                        onChange={handleAdminChange}
                                        className={adminErrors.adminPassword ? "input-error" : ""}
                                    />
                                    {adminErrors.adminPassword && <span className="error-msg">{adminErrors.adminPassword}</span>} */}

                                    <label>New Password for {selectedUser.username}</label>
                                    <input
                                        type={adminEyeToggle ? "text" : "password"}
                                        name="newPassword"
                                        placeholder="New password"
                                        value={adminForm.newPassword}
                                        onChange={handleAdminChange}
                                        className={adminErrors.newPassword ? "input-error" : ""}
                                    />
                                    {adminErrors.newPassword && <span className="error-msg">{adminErrors.newPassword}</span>}

                                    <div className="password-hints" aria-live="polite">
                                        <ul className="password-hints-list">
                                            <li className={adminPasswordChecks.minLength ? "hint-ok" : "hint-bad"}>At least 8 characters</li>
                                            <li className={adminPasswordChecks.hasNumber ? "hint-ok" : "hint-bad"}>At least 1 number</li>
                                            <li className={adminPasswordChecks.hasSymbol ? "hint-ok" : "hint-bad"}>At least 1 symbol</li>
                                        </ul>
                                    </div>

                                    <label>Confirm New Password</label>
                                    <input
                                        type={adminEyeToggle ? "text" : "password"}
                                        name="confirmPassword"
                                        placeholder="Confirm new password"
                                        value={adminForm.confirmPassword}
                                        onChange={handleAdminChange}
                                        className={adminErrors.confirmPassword ? "input-error" : ""}
                                    />
                                    {adminErrors.confirmPassword && <span className="error-msg">{adminErrors.confirmPassword}</span>}

                                    <div className="admin-pass-actions">
                                        <button
                                            className="change-pass-btn"
                                            disabled={adminSubmitting}
                                            onClick={() => {
                                                if (!validateAdmin()) return;
                                                setShowAdminModal(true);
                                            }}
                                        >
                                            {adminSubmitting ? "Saving..." : "Change Member Password"}
                                        </button>
                                        <button type="button" className="eye-toggle" onClick={() => setAdminShow(!adminEyeToggle)}>
                                            {adminEyeToggle ? <img src={eyeShowToggle} alt="" /> : <img src={eyeHideToggle} alt="" />}
                                        </button>
                                    </div>
                                    {adminMessage && <p className="security-msg">{adminMessage}</p>}
                                </>
                            )}
                        </div>
                    </div>
                </>
            )}

            {showAdminModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h2>Confirm Password Change</h2>
                        <p>Enter your password to change password for <strong>{selectedUser?.username}</strong>.</p>
                        <input
                            type={eyeToggle ? "text" : "password"}
                            placeholder="Your admin password"
                            value={adminPassword}
                            onChange={(e) => {
                                setAdminPassword(e.target.value);
                                setAdminPasswordError("");
                            }}
                            disabled={adminSubmitting}
                            className={adminPasswordError ? "input-error" : ""}
                        />
                        <a className='eye-toggle' onClick={() => setShow(!eyeToggle)}>
                            {eyeToggle ? <img src={eyeShowToggle} /> : <img src={eyeHideToggle} />}
                        </a>
                        {adminPasswordError && <span className="error-msg">{adminPasswordError}</span>}
                        <button className="confirm-btn" onClick={submitAdminPassword} disabled={adminSubmitting}>
                            {adminSubmitting ? "Saving..." : "Yes"}
                        </button>
                        <button className="cancel-btn" onClick={() => { setShowAdminModal(false); setAdminPassword(""); setAdminPasswordError(""); }} disabled={adminSubmitting}>
                            Cancel
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Security;
