import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BASE_URL from '../../hooks/server/config';
import { eyeShowToggle, eyeHideToggle } from "../../assets/ui/Icons";
import "./Login.css";

function Login() {
    const [username, setUserName] = useState('');
    const [password, setPassword] = useState('');
    const [eyeToggle, setShow] = useState(false);
    const [isloading, setIsLoading] = useState(false);
    
    const [errors, setErrors] = useState({});
    const [lockoutMsg, setLockoutMsg] = useState('');
    const [isLocked, setIsLocked] = useState(false);
    const navigate = useNavigate();

    const validate = () => {
        const newErrors = {};

        const trimmedUsername = String(username).trim();
        if (!trimmedUsername) {
            newErrors.username = "Username is required.";
        }

        if (!password) {
            newErrors.password = "Password is required.";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        setIsLoading(true);
        try {
            const response = await fetch(`${BASE_URL}/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password }),
            });
            const data = await response.json();

            if (response.ok) {
                localStorage.setItem("token", data.token);
                navigate("/dashboard");
            } else {
                if (response.status === 429) {
                    setIsLocked(true);
                }
                setErrors({ form: data.error });
            }
        } catch (error) {
            alert("Frontend Server Error");
        }
        setIsLoading(false);
    };

    return (
        <><title>Login</title>
        <div className='login-container'>
            <h2 className='login-label'>Login</h2>
            <form onSubmit={handleSubmit}>
                <div className='form-group'>
                    <label>Username:</label>
                    <input
                        className={`credential-field${errors.username ? ' input-error' : ''}`}
                        type='text'
                        value={username}
                        onChange={(e) => setUserName(e.target.value)}
                        placeholder='Enter username'
                    />
                    {errors.username && <span className="error-msg">{errors.username}</span>}

                    <label>Password:</label>
                    <div className="password-wrapper">
                        <input
                            className={`credential-field${errors.password ? ' input-error' : ''}`}
                            type={eyeToggle ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder='Enter Password'
                        />
                        <a className='eye-toggle' onClick={() => setShow(!eyeToggle)}>
                            {eyeToggle ? <img src={eyeShowToggle} /> : <img src={eyeHideToggle} />}
                        </a>
                    </div>
                    {errors.password && <span className="error-msg">{errors.password}</span>}
                </div>
                <button disabled={isloading || isLocked}>
                    {isloading ? "Logging in..." : "Login"}
                </button>
                {errors.form && <span className="error-msg emsg-login">{errors.form}</span>}
            </form>
        </div></>
    );
}

export default Login;