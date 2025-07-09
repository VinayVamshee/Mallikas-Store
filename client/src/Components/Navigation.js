import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { jwtDecode } from 'jwt-decode';
import { Link, useNavigate } from 'react-router-dom'
import logo from './android-chrome-512x512.png';

export default function Navigation() {

    const navigate = useNavigate();

    const [loginUser, setLoginUser] = useState({
        email: '',
        password: ''
    });

    const [registerUser, setRegisterUser] = useState({
        username: '',
        phone: '',
        address: '',
        email: '',
        password: ''
    });

    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const decoded = jwtDecode(token);
                // You can also check token expiration here if you want
                setIsLoggedIn(true);
                setIsAdmin(decoded.isAdmin);
            } catch (error) {
                console.error('Invalid token:', error);
                setIsLoggedIn(false);
                setIsAdmin(false);
            }
        } else {
            setIsLoggedIn(false);
            setIsAdmin(false);
        }
    }, []);


    const handleLoginChange = (e) => {
        setLoginUser(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleRegisterChange = (e) => {
        setRegisterUser(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post('https://mallikas-store-server.vercel.app/login', loginUser);
            if (res.data.token) {
                localStorage.setItem('token', res.data.token);
                alert('Login successful!');
                window.location.reload();
            } else {
                alert('Login failed: Invalid response from server');
            }
        } catch (err) {
            alert(err.response?.data?.error || 'Login failed');
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post('https://mallikas-store-server.vercel.app/register', {
                ...registerUser,
                isAdmin: false
            });
            if (res.status === 201) {
                alert('Registration successful! You can now login.');
                setRegisterUser({
                    username: '',
                    phone: '',
                    address: '',
                    email: '',
                    password: ''
                });
            }
        } catch (err) {
            alert(err.response?.data?.error || 'Registration failed');
        }
    };

    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [showResults, setShowResults] = useState(false);
    const handleSearch = async () => {
        if (!searchQuery.trim()) {
            setShowResults(false);
            setSearchResults([]);
            return;
        }
        try {
            const res = await axios.get(`https://mallikas-store-server.vercel.app/items`);
            const allItems = res.data;

            const filtered = allItems.filter(item =>
                (item.name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
                (item.color?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
                (item.size?.toLowerCase() || '').includes(searchQuery.toLowerCase())
            );

            setSearchResults(filtered);
            setShowResults(true);
        } catch (error) {
            console.error('Search failed:', error);
        }
    };
    useEffect(() => {
        if (searchQuery.trim() === '') {
            setShowResults(false);
            setSearchResults([]);
        }
    }, [searchQuery]);

    const HoverItem = ({ item }) => {
        const [imageIndex, setImageIndex] = useState(0);
        const [hovering, setHovering] = useState(false);

        useEffect(() => {
            let interval;
            if (hovering && item.otherImages?.length > 0) {
                interval = setInterval(() => {
                    setImageIndex((prev) => (prev + 1) % item.otherImages.length);
                }, 1000);
            } else {
                setImageIndex(0);
            }

            return () => clearInterval(interval);
        }, [hovering, item.otherImages]);

        const currentImage =
            hovering && item.otherImages?.length > 0
                ? item.otherImages[imageIndex]
                : item.mainImage;

        return (
            <Link
                to="/Product"
                state={{ item }}
                className="item text-decoration-none text-dark"
                onMouseEnter={() => setHovering(true)}
                onMouseLeave={() => setHovering(false)}
                style={{ marginTop: '50px' }}
            >
                <img src={currentImage} alt={item.name} />
                <div className="item-info">
                    <div className="item-name">{item.name}</div>
                    <div className="item-specifics">{item.color} - {item.size}</div>
                    <div className="item-price">${item.price}</div>
                </div>
            </Link>
        );
    };

    return (
        <div>
            {/* Navigation */}
            <div className='navigation'>
                <Link to="/" className='logo'><img src={logo} alt='...' /><strong>Maguva's Collection</strong></Link>
                <form onSubmit={(e) => {
                    e.preventDefault();
                    handleSearch();
                }}>
                    <input
                        type="text"
                        placeholder="Search"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <button className="btn search-btn">
                        <i className="fa-solid fa-magnifying-glass fa-lg me-2"></i>Search
                    </button>
                </form>

                <div className='profile'>
                    {isLoggedIn ? (
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '5px', width: '100%' }}>
                            {/* Redirect Button */}
                            <button className={`btn profile-btn ${isAdmin ? 'btn-danger' : 'btn-info'} me-2`}
                                onClick={() => navigate(isAdmin ? '/Admin' : '/User')} >
                                <i className='fa-solid fa-user fa-lg'></i><div>Profile</div>
                            </button>

                            {/* Logout */}
                            <button className='btn btn-secondary'
                                onClick={() => {
                                    localStorage.removeItem('token');
                                    window.location.reload();
                                }}
                            >
                                Logout
                            </button>
                        </div>
                    ) : (
                        <button className='btn btn-primary' data-bs-target='#LoginRegisterModal' data-bs-toggle='modal'>
                            <i className='fa-solid fa-right-to-bracket fa-lg me-2'></i>Login
                        </button>
                    )}
                </div>

                <div className='modal fade' id='LoginRegisterModal' aria-hidden='true' aria-labelledby='LoginRegisterModalLabel' tabIndex='-1' data-bs-backdrop='false'>
                    <div className='modal-dialog modal-dialog-centered'>
                        <div className='modal-content'>
                            <div className='modal-header'>
                                <h1 className='modal-title fs-5' id='LoginRegisterModalLabel'>Login</h1>
                                <button type='button' className='btn-close' data-bs-dismiss='modal' aria-label='Close'></button>
                            </div>
                            <div className='modal-body'>
                                <form onSubmit={handleLogin} className='form'>
                                    <div className='mb-3'>
                                        <label htmlFor='loginEmail' className='form-label'>Email address</label>
                                        <input type='email' className='form-control' id='loginEmail' name='email' value={loginUser.email} onChange={handleLoginChange} required />
                                    </div>
                                    <div className='mb-3'>
                                        <label htmlFor='loginPassword' className='form-label'>Password</label>
                                        <input type='password' className='form-control' id='loginPassword' name='password' value={loginUser.password} onChange={handleLoginChange} required />
                                    </div>
                                    <button type='submit' className='btn btn-sm btn-success' style={{ width: 'fit-content' }}>Login</button>
                                </form>
                            </div>
                            <div className='modal-footer'>
                                <p>
                                    New user? <button type='button' className='btn btn-sm btn-link' data-bs-target='#RegisterModal' data-bs-toggle='modal' data-bs-dismiss='modal'>Register here</button>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Register Modal */}
                <div className='modal fade' id='RegisterModal' aria-hidden='true' aria-labelledby='RegisterModalLabel' tabIndex='-1' data-bs-backdrop='false'>
                    <div className='modal-dialog modal-dialog-centered'>
                        <div className='modal-content'>
                            <div className='modal-header'>
                                <h1 className='modal-title fs-5' id='RegisterModalLabel'>Register</h1>
                                <button type='button' className='btn-close' data-bs-dismiss='modal' aria-label='Close'></button>
                            </div>
                            <div className='modal-body'>
                                <form onSubmit={handleRegister} className='form'>
                                    <div className='mb-3'>
                                        <label htmlFor='regUsername' className='form-label'>Name</label>
                                        <input type='text' className='form-control' id='regUsername' name='username' value={registerUser.username} onChange={handleRegisterChange} required />
                                    </div>
                                    <div className='mb-3'>
                                        <label htmlFor='regPhone' className='form-label'>Phone No.</label>
                                        <input type='tel' className='form-control' id='regPhone' name='phone' value={registerUser.phone} onChange={handleRegisterChange} required />
                                    </div>
                                    <div className='mb-3'>
                                        <label htmlFor='regAddress' className='form-label'>Address</label>
                                        <input type='text' className='form-control' id='regAddress' name='address' value={registerUser.address} onChange={handleRegisterChange} required />
                                    </div>
                                    <div className='mb-3'>
                                        <label htmlFor='regEmail' className='form-label'>Email address</label>
                                        <input type='email' className='form-control' id='regEmail' name='email' value={registerUser.email} onChange={handleRegisterChange} required />
                                    </div>
                                    <div className='mb-3'>
                                        <label htmlFor='regPassword' className='form-label'>Password</label>
                                        <input type='password' className='form-control' id='regPassword' name='password' value={registerUser.password} onChange={handleRegisterChange} required />
                                    </div>
                                    <button type='submit' className='btn btn-sm btn-success' style={{ width: 'fit-content' }}>Register</button>
                                </form>
                            </div>
                            <div className='modal-footer'>
                                <button type='button' className='btn btn-sm btn-link' data-bs-target='#LoginRegisterModal' data-bs-toggle='modal' data-bs-dismiss='modal'>Back to Login</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {showResults && (
                <div className="search-collapse bg-light p-3 my-3 rounded shadow">
                    <h5>Search Results for "{searchQuery}"</h5>
                    {searchResults.length > 0 ? (
                        <div className="d-flex flex-wrap gap-3">
                            {searchResults.map((item, index) => (
                                <HoverItem key={index} item={item} />
                            ))}
                        </div>
                    ) : (
                        <p style={{ marginTop: '78px' }}>No items found.</p>
                    )}
                </div>
            )}

        </div>
    )
}
