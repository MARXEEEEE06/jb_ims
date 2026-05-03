import { useEffect, useMemo, useState } from "react";
import BASE_URL from "../../../hooks/server/config";
import useAuth from "../../../hooks/UserAuth";
import { useRef } from "react";

import "./AccountDetails.css";
import { eyeShowToggle, eyeHideToggle } from "../../../assets/ui/Icons";

function roleTypeToRoleId(roleType) {
  return String(roleType ?? "").toLowerCase() === "admin" ? 1 : 2;
}

function AccountDetails() {
const { user, loading: authLoading } = useAuth();
const isAdmin = String(user?.role ?? "").toLowerCase() === "admin";

const [users, setUsers] = useState([]);
const [loading, setLoading] = useState(true);
const [selectedUserId, setSelectedUserId] = useState(null); // null by default = no selection

const [edit, setEdit] = useState({ username: "", email: "", contact_num: "", role_id: 2 });
const [original, setOriginal] = useState(null);

const [successMessage, setSuccessMessage] = useState("");
const [errorMessage, setErrorMessage] = useState("");
const [showSaveConfirm, setShowSaveConfirm] = useState(false);
const [isSaving, setIsSaving] = useState(false);
const [triedSaving, setTriedSaving] = useState(false);
const isRefetchingRef = useRef(false);

const [errors, setErrors] = useState({});
const [adminPassword, setAdminPassword] = useState("");
const [adminPasswordError, setAdminPasswordError] = useState("");
const [eyeToggle, setShow] = useState(false);

const selectedUser = useMemo(() => {
  setErrors({});
  return users.find((u) => Number(u.user_id) === Number(selectedUserId)) || null;
}, [users, selectedUserId]);

const fetchUsers = async () => {
  try {
    setLoading(true);
    const token = localStorage.getItem("token");
    const response = await fetch(`${BASE_URL}/getusers`, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      setErrorMessage("");  // don't show outside
      throw new Error(data?.error || "Failed to update user.");
    }
    const list = Array.isArray(data) ? data : [];
    setUsers(list);
  } catch (e) {
    setUsers([]);
    setErrorMessage(e?.message || "Failed to fetch users");
    setSelectedUserId(null);
  } finally {
    setLoading(false);
  }
};

useEffect(() => {
  if (authLoading) return;
  if (!isAdmin) { setLoading(false); return; }
  fetchUsers();
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [authLoading, isAdmin]);

useEffect(() => {
  if (!selectedUser) {
    setSuccessMessage("");
    setErrorMessage("");
    setTriedSaving(false);
    return;
  }
  const nextEdit = {
    username: selectedUser.username ?? "",
    email: selectedUser.email ?? "",
    contact_num: selectedUser.contact_num ?? "",
    role_id: roleTypeToRoleId(selectedUser.role_type),
  };
  if (isRefetchingRef.current) {
    isRefetchingRef.current = false;
    setEdit(nextEdit);
    setOriginal(nextEdit);
    setTriedSaving(false);
    return;
}

  setEdit(nextEdit); 
  setOriginal(nextEdit);  
  setTriedSaving(false);
  setSuccessMessage("");
  setErrorMessage("");
  setShowSaveConfirm(false);
  setIsSaving(false);
  setAdminPassword("");
  setAdminPasswordError("");
}, [selectedUser]);

const hasChanges = useMemo(() => {
  if (!original) return false;
  return (
    String(edit.username) !== String(original.username) ||
    String(edit.email) !== String(original.email) ||
    String(edit.contact_num) !== String(original.contact_num) ||
    Number(edit.role_id) !== Number(original.role_id)
  );
}, [edit, original]);

const validate = () => {
  const newErrors = {};
  const trimmedUsername = String(edit.username).trim();
  if (!trimmedUsername) {
    newErrors.username = "Username is required.";
  } else if (trimmedUsername.length < 3 || trimmedUsername.length > 30) {
    newErrors.username = "Username must be 3–30 characters.";
  } else if (!/^[a-zA-Z0-9_]+$/.test(trimmedUsername)) {
    newErrors.username = "Username can only contain letters, numbers, and underscores.";
  }
  const trimmedEmail = String(edit.email ?? "").trim();
  if (!trimmedEmail) {
    newErrors.email = "Email is required.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
    newErrors.email = "Enter a valid email address.";
  }
  const trimmedContact = String(edit.contact_num ?? "").trim();
  if (!trimmedContact) {
    newErrors.contact_num = "Contact number is required.";
  } else if (!/^09\d{9}$/.test(trimmedContact)) {
    newErrors.contact_num = "Enter a valid PH mobile number (e.g. 09171234567).";
  }
  if (![1, 2].includes(Number(edit.role_id))) {
    newErrors.role_id = "Invalid role.";
  }
  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};

const save = async () => {
  // validate admin password in modal
  if (!adminPassword.trim()) {
    setAdminPasswordError("Your password is required.");
    return;
  }
  setAdminPasswordError("");

  try {
    setIsSaving(true);
    const token = localStorage.getItem("token");
    const response = await fetch(`${BASE_URL}/getusers/${selectedUserId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({
        username: String(edit.username).trim(),
        email: String(edit.email ?? ""),
        contact_num: String(edit.contact_num ?? ""),
        role_id: Number(edit.role_id),
        adminPassword,   // send to backend for verification
      }),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data?.error || "Failed to update user.");

    isRefetchingRef.current = true;  // add this
    await fetchUsers();
    setShowSaveConfirm(false);
    setSuccessMessage(data?.message || "User updated successfully.");  // keep after
  } catch (e) {
      const msg = e?.message || "Failed to update user.";
      if (showSaveConfirm) {
          setAdminPasswordError(msg);  // stays in modal
      } else {
          setErrorMessage(msg);
      }
  } finally {
    setIsSaving(false);
  }
};

if (authLoading) return null;
if (!isAdmin) return <div className="no-access">You have no access to this page.</div>;

return (
  <div className="account-details-form">
    <h1>Account Details</h1>

    <div className="account-details-grid">
      <div>
        <h2>Members</h2>
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
              {users.map((u) => {
                const isSelected = Number(u.user_id) === Number(selectedUserId);
                return (
                  <tr
                    key={u.login_id}
                    className= {`tr-selectable {isSelected ? "member-row selected" : "member-row"}`}
                    onClick={() => setSelectedUserId(isSelected ? null : Number(u.user_id))} // toggle unselect
                  >
                    <td>{u.username}</td>
                    <td>{u.email}</td>
                    <td>{u.contact_num}</td>
                    <td>{String(u.role_type || "").charAt(0).toUpperCase() + String(u.role_type || "").slice(1)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      <div className="member-editor">
        <h2>Member Details</h2>
        {!selectedUser ? (
          <p>Select a member to view details.</p>
        ) : (
          <form onSubmit={(e) => e.preventDefault()}>
            <label className="required" htmlFor="ad-username">Username</label>
            <input
              id="ad-username"
              type="text"
              value={edit.username}
              onChange={(e) => setEdit((p) => ({ ...p, username: e.target.value }))}
              disabled={isSaving}
              className={errors.username ? "input-error" : ""}
            />
            {errors.username && <span className="error-msg">{errors.username}</span>}

            <label htmlFor="ad-email">Email</label>
            <input
              id="ad-email"
              type="text"
              value={edit.email}
              onChange={(e) => setEdit((p) => ({ ...p, email: e.target.value }))}
              disabled={isSaving}
              className={errors.email ? "input-error" : ""}
            />
            {errors.email && <span className="error-msg">{errors.email}</span>}

            <label htmlFor="ad-contact">Contact No</label>
            <input
              id="ad-contact"
              type="text"
              inputMode="numeric"
              onKeyDown={(e) => ["e", "E", "+", "-"].includes(e.key) && e.preventDefault()}
              value={edit.contact_num}
              onChange={(e) => setEdit((p) => ({ ...p, contact_num: e.target.value }))}
              disabled={isSaving}
              className={errors.contact_num ? "input-error" : ""}
              maxLength={11}
            />
            {errors.contact_num && <span className="error-msg">{errors.contact_num}</span>}

            <label className="required" htmlFor="ad-role">Role</label>
            <select
              id="ad-role"
              value={String(edit.role_id)}
              onChange={(e) => setEdit((p) => ({ ...p, role_id: Number(e.target.value) }))}
              disabled={isSaving}
            >
              <option value="1">Admin</option>
              <option value="2">Staff</option>
            </select>

            <div className="editor-actions">
              <button
                type="button"
                className="update-btn"
                disabled={isSaving}
                onClick={() => {
                  setTriedSaving(true);
                  if(!hasChanges) return;
                  if (!validate()) return;
                  setAdminPassword("");
                  setAdminPasswordError("");
                  setShowSaveConfirm(true);
              }}
              >
                {isSaving ? "Saving..." : "Save Changes"}
              </button>
              {triedSaving && !hasChanges && <span className="error-msg">No changes made.</span>}
            </div>
          </form>
        )}
        {successMessage && <p className="account-details-msg">{successMessage}</p>}
        {errorMessage && <span className="error-msg">{errorMessage}</span>}
      </div>
    </div>

    {showSaveConfirm && (
      <div className="modal-overlay" onClick={() => setShowSaveConfirm(false)}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <h2>Confirm Update</h2>
          <p>Enter your password to save changes to <strong>{selectedUser?.username}</strong>.</p>
          <input
            type={eyeToggle ? "text" : "password"}
            placeholder="Your admin password"
            value={adminPassword}
            onChange={(e) => {
              setAdminPassword(e.target.value);
              setAdminPasswordError("");
            }}
            disabled={isSaving}
            className={adminPasswordError ? "input-error" : ""}
          />
          <a className='eye-toggle' onClick={() => setShow(!eyeToggle)}>
            {eyeToggle ? <img src={eyeShowToggle} /> : <img src={eyeHideToggle} />}
          </a>
          {adminPasswordError && <span className="error-msg">{adminPasswordError}</span>}
          <button className="confirm-btn" onClick={save} disabled={isSaving}>
            {isSaving ? "Saving..." : "Yes"}
          </button>
          <button className="cancel-btn" onClick={() => setShowSaveConfirm(false)} disabled={isSaving}>
            Cancel
          </button>
        </div>
      </div>
    )}
  </div>
);
}

export default AccountDetails;