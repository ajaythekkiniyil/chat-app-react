import React, { useState } from 'react'
import '../App.css'
import axios from 'axios'
import { baseUrl } from '../constants'

function Login() {
    const [signupBtnClicked, setSignupButtonClicked] = useState(false)
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [errorMessage, seterrorMessage] = useState('')

    const handleSignup = () => {
        if (username.length > 3 && password.length > 3) {
            axios.post(baseUrl + '/user/signup', {
                name: username,
                password: password
            },
                {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            )
                .then(resp => {
                    if (resp.status === 200) {
                        setPassword('')
                        setUsername('')
                        setSignupButtonClicked(false)
                        seterrorMessage('')
                    }
                })
                .catch(err => {
                    seterrorMessage('already user exist with same name')
                    setPassword('')
                    setUsername('')
                })
        }
        else {
            alert('fill username and password, minimum 4 characters')
        }
    }

    const handleLogin = () => {
        if (username.length > 3 && password.length > 3) {
            axios.post(baseUrl + '/user/login', {
                name: username,
                password: password
            },
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
            )
                .then(resp => {
                    if (resp.status === 200) {
                        localStorage.setItem('userId', resp.data.user._id)
                        localStorage.setItem('userName', resp.data.user.name)
                        location.href = '/chats'
                    }
                })
                .catch(err => {
                    seterrorMessage('Invalid credentials')
                })
        }
        else {
            alert('fill username and password, minimum 4 characters')
        }
    }

    return (
        <section className='login'>
            {
                signupBtnClicked
                    ?
                    <div className='card'>
                        <h3>Signup</h3>
                        <small style={{ color: 'red' }}>{errorMessage}</small>
                        <input type="text" placeholder='Enter username' value={username} onChange={(e) => setUsername(e.target.value)} />
                        <input type="text" placeholder='Enter password' value={password} onChange={(e) => setPassword(e.target.value)} />

                        <button className='signup-btn' onClick={handleSignup}>Signup</button>
                        <p style={{ textAlign: 'center' }}><small>already have account</small></p>
                        <button onClick={() => setSignupButtonClicked(false)} className='login-btn'>Login</button>
                    </div>
                    :
                    <div className='card'>
                        <h3>Login</h3>
                        <small style={{ color: 'red' }}>{errorMessage}</small>
                        <input type="text" placeholder='Enter username' value={username} onChange={(e) => setUsername(e.target.value)} />
                        <input type="text" placeholder='Enter password' value={password} onChange={(e) => setPassword(e.target.value)} />

                        <button className='login-btn' onClick={handleLogin}>Login</button>
                        <p style={{ textAlign: 'center' }}><small>don't have account</small></p>
                        <button onClick={() => setSignupButtonClicked(true)} className='signup-btn'>Signup</button>
                    </div>
            }
        </section>
    )
}

export default Login