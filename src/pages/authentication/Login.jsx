import React, { useState, setShow } from 'react';
import { useNavigate } from 'react-router-dom';
import "./Login.css";
import "../../css/Site.css";

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
            const response = await fetch("http://192.168.254.142:5000/api/login",{
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
                alert("Login successfu!");
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
        <div className="login-container">
            <h2 className="login-label">Login</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>username:</label>
                    <input
                        className='credential-field'
                        type='text'
                        value={username}
                        onChange={(e) => setUserName(e.target.value)}
                        placeholder='Enter username'
                        required />
                    <label>Password:</label>
                    <input
                        className='credential-field'
                        type={eyeToggle ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder='Enter Password'
                        required />
                    <a className='eye-toggle' onClick={() => setShow(!eyeToggle)}>{eyeToggle ? "Hide" : "Show"}</a>
                </div>
                <button disabled={isloading}>
                    {isloading ? "Logging in..." : "Login"}
                </button>
            </form>
        </div></>
    );
}

export default Login;