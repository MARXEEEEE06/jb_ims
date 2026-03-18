import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import "./Login.css";
import "../../css/Site.css";

function Login(){
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isloading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try{
            const response = await fetch("http://localhost:5000/api/login",{
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email,
                    password
                }),
            });
            const data = await response.json();

            if(response.ok){
                alert("Login successfu!");
                setEmail('');
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
                    <label>Email:</label>
                    <input
                        className='credential-field'
                        type='email'
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder='Enter Email'
                        required></input>
                    <label>Password:</label>
                    <input
                        className='credential-field'
                        type='password'
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder='Enter Password'
                        required></input>
                </div>
                <button disabled={isloading}>
                    {isloading ? "Logging in..." : "Login"}
                </button>
            </form>
        </div></>
    );
}

export default Login;