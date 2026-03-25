import React, { useState, setShow } from 'react';
import { useNavigate } from 'react-router-dom';
import BASE_URL from '../../hooks/server/config';
import { eyeShowToggle, eyeHideToggle } from "../../assets/ui/Icons";
import "./Login.css";

function Login(){
    const [username, setUserName] = useState('');
    const [password, setPassword] = useState('');
    const [eyeToggle, setShow] = useState(false);
    const [isloading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try{
            const response = await fetch(`${BASE_URL}/login`,{
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    username,
                    password
                }),
            });
            const data = await response.json();

            if(response.ok){
                console.log("Response data:", data);           // Does data.token exist?
                localStorage.setItem("token", data.token);
                console.log("Token saved:", localStorage.getItem("token")); // Did it save?
                setUserName('');
                setPassword('');
                navigate("/dashboard");
            }
            else{
                alert(data.error);
            }
        }catch(error){
            alert("Server Error")
        }
        setIsLoading(false);
    };

    return(
        <><title>Login</title>
        <div className='login-container'>
            <h2 className='login-label'>Login</h2>
            <form onSubmit={handleSubmit}>
                <div className='form-group'>
                    <label>Username:</label>
                    <input
                        className='credential-field'
                        type='text'
                        value={username}
                        onChange={(e) => setUserName(e.target.value)}
                        placeholder='Enter username'
                        required />
                    <label>Password:</label>
                    <div className="password-wrapper">
                        <input
                            className='credential-field'
                            type={eyeToggle ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder='Enter Password'
                            required />
                        <a className='eye-toggle' onClick={() => setShow(!eyeToggle)}>
                            {eyeToggle ? <img src={eyeShowToggle}/> : <img src={eyeHideToggle}/>}
                        </a>
                    </div>
                </div>
                <button disabled={isloading}>
                    {isloading ? "Logging in..." : "Login"}
                </button>
            </form>
        </div></>
    );
}

export default Login;