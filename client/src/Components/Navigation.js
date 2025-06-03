import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { jwtDecode } from 'jwt-decode';
import { Link, useNavigate } from 'react-router-dom'

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
            const res = await axios.post('http://localhost:3001/login', loginUser);
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
            const res = await axios.post('http://localhost:3001/register', {
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

    const [baseline, setBaseline] = useState({
        apparels_category: [],
        apparels_colors: [],
        apparels_sizes: [],
        accessories_category: [],
        accessories_colors: [],
        accessories_sizes: []
    });
    const [baselineInputs, setBaselineInputs] = useState({});

    useEffect(() => {
        axios.get('http://localhost:3001/Baseline')
            .then(res => {
                if (res.data) setBaseline(res.data);
            })
            .catch(err => console.error('Error fetching baseline:', err));
    }, []);

    const updateBaseline = () => {
        console.log(Object.keys(baseline));
        // Create a copy and delete unwanted fields
        const dataToSend = { ...baseline };
        delete dataToSend._id;
        delete dataToSend.__v;

        axios.post('http://localhost:3001/Baseline', dataToSend)
            .then(res => {
                alert('Baseline updated successfully');
            })
            .catch(err => {
                console.error('Error updating baseline:', err);
                alert('Error updating baseline');
            });
    };

    const [item, setItem] = useState({
        name: '',
        category: 'apparel',
        sub_category: '',
        color: '',
        size: '',
        price: '',
        description: '',
        mainImage: '',
        otherImages: [''],
        available: true
    });

    const handleImageChange = (index, value) => {
        const newImages = [...item.otherImages];
        newImages[index] = value;
        setItem({ ...item, otherImages: newImages });
    };

    const addImageInput = () => {
        setItem({ ...item, otherImages: [...item.otherImages, ''] });
    };

    const handleItemSubmit = async (e) => {
        e.preventDefault();
        try {
            // eslint-disable-next-line
            const response = await axios.post('http://localhost:3001/items', item);
            alert('Item saved successfully!');
            setItem({ name: '', category: 'apparel', sub_category: '', color: '', size: '', description: '', mainImage: '', otherImages: [''], available: true });
            window.location.reload();
        } catch (error) {
            alert('Failed to save item: ' + (error.response?.data?.error || error.message));
        }
    };

    return (
        <div>

            {/* Mobile Navigation */}
            <nav className="navbar navbar-expand-lg">
                <div className="container-fluid">
                    <a className="navbar-brand" href="/">Mallika's Store</a>
                    <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
                        <span className="navbar-toggler-icon"></span>
                    </button>
                    <form className="d-flex" role="search" style={{ flex: '1' }}>
                        <input className="form-control me-2" type="search" placeholder="Search" aria-label="Search" />
                        <button className="btn btn-sm btn-outline-success" type="submit">Search</button>
                    </form>
                    <div className="collapse navbar-collapse" id="navbarSupportedContent">
                        <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                            <li className="nav-item">
                                <a className="nav-link active" aria-current="page" href="...">Home</a>
                            </li>
                            <li className="nav-item">
                                <a className="nav-link" href="...">Link</a>
                            </li>
                            <li className="nav-item dropdown">
                                <a className="nav-link dropdown-toggle" href="..." role="button" data-bs-toggle="dropdown" aria-expanded="false">
                                    Dropdown
                                </a>
                                <ul className="dropdown-menu">
                                    <li><a className="dropdown-item" href="...">Action</a></li>
                                    <li><a className="dropdown-item" href="...">Another action</a></li>

                                    <li><a className="dropdown-item" href="...">Something else here</a></li>
                                </ul>
                            </li>
                            <li className="nav-item">
                                <a className="nav-link disabled" href='...' aria-disabled="true">Disabled</a>
                            </li>
                        </ul>
                    </div>
                </div>
            </nav>



            {/* Navigation */}
            <div className='navigation'>
                <Link to="/" className='logo'><i className="fa-solid fa-shop fa-lg me-2"></i>Mallika's Store</Link>
                <form><input type='text' placeholder='Search' /><button className='btn'><i className="fa-solid fa-magnifying-glass fa-lg me-2"></i>Search</button></form>
                <div className='profile'>
                    {isLoggedIn ? (
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '5px', width: '100%' }}>
                            {/* Redirect Button */}
                            <button className={`btn btn-sm ${isAdmin ? 'btn-danger' : 'btn-info'} me-2`}
                                onClick={() => navigate(isAdmin ? '/Admin' : '/User')} >
                                <i className='fa-solid fa-user fa-lg me-2'></i>{isAdmin ? 'Admin Profile' : 'User Profile'}
                            </button>

                            {/* Admin-only buttons */}
                            {isAdmin && (
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '5px', flexGrow: 1 }}>
                                    <button className='btn btn-sm btn-warning me-2' data-bs-toggle='modal' data-bs-target='#AddItemModal'>Add Item</button>
                                    <button className="btn btn-sm btn-warning" type="button" data-bs-toggle="collapse" data-bs-target="#BaselineCollapse" aria-expanded="false" aria-controls="BaselineCollapse">
                                        Edit Basics
                                    </button>
                                </div>
                            )}

                            {/* Logout */}
                            <button className='btn btn-sm btn-secondary'
                                onClick={() => {
                                    localStorage.removeItem('token');
                                    window.location.reload();
                                }}
                            >
                                Logout
                            </button>
                        </div>
                    ) : (
                        <button className='btn btn-sm btn-primary' data-bs-target='#LoginRegisterModal' data-bs-toggle='modal'>
                            <i className='fa-solid fa-right-to-bracket fa-lg me-2'></i>Login
                        </button>
                    )}
                </div>

                {/* Add Item Modal */}
                <div className='modal fade' id='AddItemModal' tabIndex='-1' aria-hidden='true'>
                    <div className='modal-dialog modal-dialog-scrollable modal-lg'>
                        <div className='modal-content'>
                            <div className='modal-header'>
                                <h5 className='modal-title'>Add New Item</h5>
                                <button type='button' className='btn-close' data-bs-dismiss='modal' aria-label='Close'></button>
                            </div>
                            <form className='form' onSubmit={handleItemSubmit}>
                                <div className='modal-body'>
                                    <div className='mb-3'>
                                        <label className='form-label'>Item Name</label>
                                        <input
                                            type='text'
                                            className='form-control'
                                            value={item.name}
                                            onChange={e => setItem({ ...item, name: e.target.value })}
                                        />
                                    </div>

                                    <div className='mb-3'>
                                        <label className='form-label'>Price</label>
                                        <input
                                            type='number'
                                            className='form-control'
                                            value={item.price}
                                            onChange={e => setItem({ ...item, price: e.target.value })}
                                        />
                                    </div>

                                    <div className='mb-3'>
                                        <label className='form-label'>Type</label>
                                        <select
                                            className='form-select'
                                            value={item.category}
                                            onChange={e => setItem({ ...item, category: e.target.value, sub_category: '', color: '', size: '' })}
                                        >
                                            <option value='apparel'>Apparel</option>
                                            <option value='accessories'>Accessories</option>
                                        </select>
                                    </div>

                                    <div className='mb-3'>
                                        <label className='form-label'>Category</label>
                                        <select
                                            className='form-select'
                                            value={item.sub_category}
                                            onChange={e => setItem({ ...item, sub_category: e.target.value })}
                                        >
                                            <option value=''>Select Category</option>
                                            {(function getCategories() {
                                                // find keys in baseline that include 'category' and 'apparel' or 'accessories' per selected type
                                                const baselineKeys = Object.keys(baseline || {});
                                                // find keys with category & apparel or accessories
                                                const categoryKey = baselineKeys.find(k =>
                                                    k.toLowerCase().includes(item.category) && k.toLowerCase().includes('category')
                                                );
                                                return (baseline?.[categoryKey] || []).map((cat, i) => (
                                                    <option key={i} value={cat}>{cat}</option>
                                                ));
                                            })()}
                                        </select>
                                    </div>

                                    <div className='mb-3'>
                                        <label className='form-label'>Color</label>
                                        <select
                                            className='form-select'
                                            value={item.color}
                                            onChange={e => setItem({ ...item, color: e.target.value })}
                                        >
                                            <option value=''>Select Color</option>
                                            {(function getColors() {
                                                const baselineKeys = Object.keys(baseline || {});
                                                const colorsKey = baselineKeys.find(k =>
                                                    k.toLowerCase().includes(item.category) && k.toLowerCase().includes('colors')
                                                );
                                                return (baseline?.[colorsKey] || []).map((color, i) => (
                                                    <option key={i} value={color}>{color}</option>
                                                ));
                                            })()}
                                        </select>
                                    </div>

                                    <div className='mb-3'>
                                        <label className='form-label'>Size</label>
                                        <select
                                            className='form-select'
                                            value={item.size}
                                            onChange={e => setItem({ ...item, size: e.target.value })}
                                        >
                                            <option value=''>Select Size</option>
                                            {(function getSizes() {
                                                const baselineKeys = Object.keys(baseline || {});
                                                const sizesKey = baselineKeys.find(k =>
                                                    k.toLowerCase().includes(item.category) && k.toLowerCase().includes('sizes')
                                                );
                                                return (baseline?.[sizesKey] || []).map((size, i) => (
                                                    <option key={i} value={size}>{size}</option>
                                                ));
                                            })()}
                                        </select>
                                    </div>

                                    {/* rest of your form unchanged */}
                                    <div className='mb-3'>
                                        <label className='form-label'>Description</label>
                                        <textarea
                                            className='form-control'
                                            rows={3}
                                            value={item.description}
                                            onChange={e => setItem({ ...item, description: e.target.value })}
                                        ></textarea>
                                    </div>

                                    <div className='mb-3'>
                                        <label className='form-label'>Main Image URL</label>
                                        <input
                                            type='text'
                                            className='form-control'
                                            value={item.mainImage}
                                            onChange={e => setItem({ ...item, mainImage: e.target.value })}
                                        />
                                    </div>

                                    <div className='mb-3'>
                                        <label className='form-label'>Other Image URLs</label>
                                        {item.otherImages.map((img, idx) => (
                                            <input
                                                key={idx}
                                                type='text'
                                                className='form-control mb-2'
                                                value={img}
                                                onChange={e => handleImageChange(idx, e.target.value)}
                                            />
                                        ))}
                                        <button type='button' className='btn btn-sm btn-outline-secondary mt-2' onClick={addImageInput}>Add Another Image</button>
                                    </div>

                                    <div className='mb-3'>
                                        <label className='form-label'>Availability</label>
                                        <select
                                            className='form-select'
                                            value={item.available ? 'true' : 'false'}
                                            onChange={e => setItem({ ...item, available: e.target.value === 'true' })}
                                        >
                                            <option value='true'>In Stock</option>
                                            <option value='false'>Out of Stock</option>
                                        </select>
                                    </div>

                                </div>
                                <div className='modal-footer'>
                                    <button type='submit' className='btn btn-sm btn-success'>Save Item</button>
                                    <button type='button' className='btn btn-sm btn-secondary' data-bs-dismiss='modal'>Cancel</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>



                <div className='modal fade' id='LoginRegisterModal' aria-hidden='true' aria-labelledby='LoginRegisterModalLabel' tabIndex='-1'>
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
                <div className='modal fade' id='RegisterModal' aria-hidden='true' aria-labelledby='RegisterModalLabel' tabIndex='-1'>
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
                                    <button type='submit' className='btn btn-sm btn-outline-success'>Register</button>
                                </form>
                            </div>
                            <div className='modal-footer'>
                                <button type='button' className='btn btn-sm btn-link' data-bs-target='#LoginRegisterModal' data-bs-toggle='modal' data-bs-dismiss='modal'>Back to Login</button>
                            </div>
                        </div>
                    </div>
                </div>



            </div>
            {/* Baseline Info Collapse */}
            <div className="collapse" id="BaselineCollapse">
                <div className="card card-body">
                    {['apparels', 'accessories'].map(type => (
                        <div key={type} className="form p-3 border rounded mb-3" style={{ backgroundColor: 'whitesmoke' }}>
                            <h6 className="mt-3 text-capitalize">{type}</h6>
                            {['category', 'colors', 'sizes'].map(field => {
                                const key = `${type}_${field}`;
                                return (
                                    <div key={field}>
                                        <label className="form-label">{`${type} ${field}`}</label>
                                        <div className="d-flex mb-2">
                                            <input
                                                type="text"
                                                className="form-control me-2"
                                                placeholder={`Add ${field}`}
                                                value={baselineInputs?.[key] || ''}
                                                onChange={e => setBaselineInputs(prev => ({ ...prev, [key]: e.target.value }))}
                                            />
                                            <button
                                                type="button"
                                                className="btn btn-sm btn-sm btn-outline-primary"
                                                onClick={() => {
                                                    if (!baselineInputs?.[key]?.trim()) return;
                                                    setBaseline(prev => ({
                                                        ...prev,
                                                        [key]: [...(prev[key] || []), baselineInputs[key].trim()],
                                                    }));
                                                    setBaselineInputs(prev => ({ ...prev, [key]: '' }));
                                                }}
                                            >
                                                Add
                                            </button>
                                        </div>
                                        <div className="row mb-2">
                                            {(baseline[key] || []).map((item, idx) => (
                                                <div key={idx} className="col-6 d-flex align-items-stretch mb-1 me-2" style={{ width: '48.5%' }}>
                                                    <div
                                                        className="p-2 border"
                                                        style={{ flexGrow: 1, borderTopRightRadius: 0, borderBottomRightRadius: 0, display: 'flex', alignItems: 'center' }}
                                                    >
                                                        {item}
                                                    </div>
                                                    <button
                                                        type="button"
                                                        className="btn btn-sm btn-sm btn-outline-danger"
                                                        style={{ borderTopLeftRadius: 0, borderBottomLeftRadius: 0, paddingLeft: '0.75rem', paddingRight: '0.75rem' }}
                                                        onClick={() => {
                                                            console.log('Adding to:', key, baselineInputs[key].trim());

                                                            setBaseline(prev => ({
                                                                ...prev,
                                                                [key]: prev[key].filter((_, i) => i !== idx),
                                                            }));
                                                        }}
                                                    >
                                                        Remove
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                            <div className="d-flex justify-content-end mt-3">
                                <button className="btn btn-sm btn-success me-2" onClick={updateBaseline}>Save Changes</button>
                                <button className="btn btn-sm btn-secondary" type="button" data-bs-toggle="collapse" data-bs-target="#BaselineCollapse" aria-expanded="true" aria-controls="BaselineCollapse">
                                    Close
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
