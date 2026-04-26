import { useState } from "react";
import "./AccountDetails.css";

function AccountDetails() {
  const [formData, setFormData] = useState({
    name: "Vielle",
    email: "vielle@gmai.com",
    address: "",
    contact: "",
    role: "Admin"
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="account-details-form">
      <h1>Account Details</h1>
      
      <form onSubmit={(e) => e.preventDefault()}>
        <label className="required">Name</label>
        <input 
          type="text" 
          name="name" 
          value={formData.name} 
          onChange={handleChange}
        />

        <label className="required">Email</label>
        <input 
          type="email" 
          name="email" 
          value={formData.email} 
          onChange={handleChange}
        />

        <label className="required">Address</label>
        <input 
          type="text" 
          name="address" 
          value={formData.address} 
          onChange={handleChange}
        />

        <div style={{ display: "flex", gap: "20px" }}>
          <div style={{ flex: 1 }}>
            <label className="required">Contact No</label>
            <input 
              type="text" 
              name="contact" 
              value={formData.contact} 
              onChange={handleChange}
            />
          </div>
          
          <div style={{ flex: 1 }}>
            <label className="required">Role</label>
            <select 
              className="input-product-detail" 
              name="role" 
              value={formData.role} 
              onChange={handleChange}
              style={{ width: "100%", height: "50px", borderRadius: "50px", padding: "0 15px", border: "none" }}
            >
              <option value="Admin">Admin</option>
              <option value="Staff">Staff</option>
            </select>
          </div>
        </div>
      </form>
    </div>
  );
}

export default AccountDetails;