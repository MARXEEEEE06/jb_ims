import { useEffect, useMemo, useState } from "react";
import BASE_URL from "../../../hooks/server/config";
import useAuth from "../../../hooks/UserAuth";
import "./AccountDetails.css";

function roleTypeToRoleId(roleType) {
  return String(roleType ?? "").toLowerCase() === "admin" ? 1 : 2;
}

function AccountDetails() {
  const { user, loading: authLoading } = useAuth();
  const isAdmin = String(user?.role ?? "").toLowerCase() === "admin";

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUserId, setSelectedUserId] = useState(null);

  const [edit, setEdit] = useState({
    username: "",
    email: "",
    contact_num: "",
    role_id: 2,
  });
  const [original, setOriginal] = useState(null);

  const [message, setMessage] = useState("");
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const selectedUser = useMemo(() => {
    return users.find((u) => Number(u.user_id) === Number(selectedUserId)) || null;
  }, [users, selectedUserId]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setMessage("");

      const token = localStorage.getItem("token");
      const response = await fetch(`${BASE_URL}/getusers`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data?.error || "Failed to fetch users");

      const list = Array.isArray(data) ? data : [];
      setUsers(list);

      const defaultId = user?.user_id ? Number(user.user_id) : (list[0] ? Number(list[0].user_id) : null);
      if (defaultId && !selectedUserId) setSelectedUserId(defaultId);
    } catch (e) {
      setUsers([]);
      setMessage(e?.message || "Failed to fetch users");
      setSelectedUserId(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authLoading) return;
    if (!isAdmin) {
      setLoading(false);
      return;
    }
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, isAdmin]);

  useEffect(() => {
    if (!selectedUser) return;
    const nextEdit = {
      username: selectedUser.username ?? "",
      email: selectedUser.email ?? "",
      contact_num: selectedUser.contact_num ?? "",
      role_id: roleTypeToRoleId(selectedUser.role_type),
    };
    setEdit(nextEdit);
    setOriginal(nextEdit);
    setMessage("");
    setShowSaveConfirm(false);
    setIsSaving(false);
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
    if (!selectedUserId) return "Please select a member.";
    if (!String(edit.username).trim()) return "Username is required.";
    if (edit.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(edit.email))) return "Invalid email.";
    if (edit.contact_num && !/^\d{7,15}$/.test(String(edit.contact_num))) return "Invalid contact number.";
    if (![1, 2].includes(Number(edit.role_id))) return "Invalid role.";
    return "";
  };

  const save = async () => {
    try {
      const validationError = validate();
      if (validationError) {
        setMessage(validationError);
        setShowSaveConfirm(false);
        return;
      }

      setIsSaving(true);
      setMessage("");

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
        }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data?.error || "Failed to update user.");

      setShowSaveConfirm(false);
      setMessage(data?.message || "User updated successfully.");
      await fetchUsers();
    } catch (e) {
      setMessage(e?.message || "Failed to update user.");
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
        <div className="member-list">
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
                      className={isSelected ? "member-row selected" : "member-row"}
                      onClick={() => setSelectedUserId(Number(u.user_id))}
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
              />

              <label htmlFor="ad-email">Email</label>
              <input
                id="ad-email"
                type="email"
                value={edit.email}
                onChange={(e) => setEdit((p) => ({ ...p, email: e.target.value }))}
                disabled={isSaving}
              />

              <label htmlFor="ad-contact">Contact No</label>
              <input
                id="ad-contact"
                type="text"
                inputMode="numeric"
                value={edit.contact_num}
                onChange={(e) => setEdit((p) => ({ ...p, contact_num: e.target.value }))}
                disabled={isSaving}
              />

              <label className="required" htmlFor="ad-role">Role</label>
              <select
                id="ad-role"
                name="role"
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
                  disabled={isSaving || !hasChanges}
                  onClick={() => {
                    const validationError = validate();
                    if (validationError) {
                      setMessage(validationError);
                      return;
                    }
                    setShowSaveConfirm(true);
                  }}
                >
                  {isSaving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          )}

          {message && <p className="account-details-msg">{message}</p>}
        </div>
      </div>

      {showSaveConfirm && (
        <div className="modal-overlay" onClick={() => setShowSaveConfirm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Confirm Update</h2>
            <p>Save changes to this member?</p>
            <button className="confirm-btn" onClick={save} disabled={isSaving}>Yes</button>
            <button className="cancel-btn" onClick={() => setShowSaveConfirm(false)} disabled={isSaving}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default AccountDetails;

