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
        axios.get('https://mallikas-store-server.vercel.app/Baseline')
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

        axios.post('https://mallikas-store-server.vercel.app/Baseline', dataToSend)
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

    const uploadToImgBB = async (file) => {
    const formData = new FormData();
    formData.append("key", "bf8e662104cc4c32321dc2f7ee77370f"); 
    formData.append("image", file);

    const res = await fetch("https://api.imgbb.com/1/upload", {
        method: "POST",
        body: formData,
    });

    const data = await res.json();
    if (data.success) {
        return data.data.display_url || data.data.url;
    } else {
        throw new Error("Image upload failed");
    }
};

    const handleItemSubmit = async (e) => {
        e.preventDefault();
        try {
            // eslint-disable-next-line
            const response = await axios.post('https://mallikas-store-server.vercel.app/items', item);
            alert('Item saved successfully!');
            setItem({ name: '', category: 'apparel', sub_category: '', color: '', size: '', description: '', mainImage: '', otherImages: [''], available: true });
            window.location.reload();
        } catch (error) {
            alert('Failed to save item: ' + (error.response?.data?.error || error.message));
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

                            {/* Admin-only buttons */}
                            {isAdmin && (
                                <div className="dropdown">
                                    <button
                                        className="btn btn-sm btn-warning dropdown-toggle"
                                        type="button"
                                        id="adminDropdown"
                                        data-bs-toggle="dropdown"
                                        aria-expanded="false"
                                    >
                                        Actions
                                    </button>
                                    <ul className="dropdown-menu" aria-labelledby="adminDropdown">
                                        <li>
                                            <button className="dropdown-item" data-bs-toggle="modal" data-bs-target="#AddItemModal">
                                                Add Item
                                            </button>
                                        </li>
                                        <li>
                                            <button
                                                className="dropdown-item"
                                                type="button"
                                                data-bs-toggle="collapse"
                                                data-bs-target="#BaselineCollapse"
                                                aria-expanded="false"
                                                aria-controls="BaselineCollapse"
                                            >
                                                Edit Basics
                                            </button>
                                        </li>
                                    </ul>
                                </div>
                            )}


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

                {/* Add Item Modal */}
                <div className='modal fade' id='AddItemModal' tabIndex='-1' aria-hidden='true' data-bs-backdrop='false'>
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
    type='file'
    className='form-control'
    accept="image/*"
    onChange={async (e) => {
        const file = e.target.files[0];
        if (file) {
            const url = await uploadToImgBB(file);
            setItem({ ...item, mainImage: url });
        }
    }}
/>

                                    </div>

                                    <div className='mb-3'>
                                        <label className='form-label'>Other Image URLs</label>
                                        {item.otherImages.map((img, idx) => (
                                            <input
    type='file'
    className='form-control mb-2'
    accept="image/*"
    onChange={async (e) => {
        const file = e.target.files[0];
        if (file) {
            const url = await uploadToImgBB(file);
            handleImageChange(idx, url); // updates the image link in state
        }
    }}
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
                                            <option value='false'>Sold Out</option>
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
                                    <button type='submit' className='btn btn-sm btn-success' style={{width:'fit-content'}}>Register</button>
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

            {/* Baseline Info Collapse */}
            <div className="collapse" id="BaselineCollapse" style={{ marginTop: '78px' }}>
                <div className="card card-body">
                    {['apparels', 'accessories'].map(type => (
                        <div key={type} className="form p-3 border rounded mb-3" style={{ backgroundColor: 'whitesmoke' }}>
                            <h3 className="mt-3 text-capitalize text-danger">{type}</h3>
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
                                                <div key={idx} className=" w-100 col-6 d-flex align-items-stretch mb-1 me-2" style={{ width: '48.5%' }}>
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
                                                            setBaseline(prev => ({
                                                                ...prev,
                                                                [key]: (prev[key] || []).filter((_, i) => i !== idx),
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
