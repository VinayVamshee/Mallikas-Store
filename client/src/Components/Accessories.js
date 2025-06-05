import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

export default function Accessories() {

    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const decoded = jwtDecode(token);
                setIsAdmin(decoded.isAdmin);
            } catch (error) {
                console.error('Invalid token:', error);
                setIsAdmin(false);
            }
        } else {
            setIsAdmin(false);
        }
    }, []);

    const [items, setItems] = useState([]);

    const [loading, setLoading] = useState(true);

    const fetchItems = async () => {
        setLoading(true); // Start spinner
        try {
            const response = await axios.get('https://mallikas-store-server.vercel.app/items');
            const sortedItems = response.data
                .filter(item => item.category === 'accessories')
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            setItems(sortedItems);
        } catch (error) {
            console.error('Failed to fetch items:', error);
        } finally {
            setLoading(false); // Stop spinner
        }
    };

    useEffect(() => {
        fetchItems();
    }, []);

    const [baseline, setBaseline] = useState({
        apparels_category: [],
        apparels_colors: [],
        apparels_sizes: [],
        accessories_category: [],
        accessories_colors: [],
        accessories_sizes: []
    });

    useEffect(() => {
        axios.get('https://mallikas-store-server.vercel.app/Baseline')
            .then(res => {
                if (res.data) setBaseline(res.data);
            })
            .catch(err => console.error('Error fetching baseline:', err));
    }, []);

    const [filterType, setFilterType] = useState({
        category: [],
        size: [],
        color: []
    });

    const handleFilterChange = (type, value) => {
        setFilterType(prev => {
            const isSelected = prev[type].includes(value);
            let updated = [];

            if (isSelected) {
                // Remove value if already selected
                updated = prev[type].filter(v => v !== value);
            } else {
                // Add value if not selected
                updated = [...prev[type], value];
            }

            return {
                ...prev,
                [type]: updated
            };
        });
    };

    const [sortOption, setSortOption] = useState('latest');
    const [searchQuery, setSearchQuery] = useState('');

    const filteredItems = items
        .filter(item => {
            const matchCategory = filterType.category.length === 0 || filterType.category.includes(item.sub_category?.toLowerCase());
            const matchSize = filterType.size.length === 0 || filterType.size.includes(item.size?.toLowerCase());
            const matchColor = filterType.color.length === 0 || filterType.color.includes(item.color?.toLowerCase());
            const matchSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());

            return matchCategory && matchSize && matchColor && matchSearch;
        })
        .sort((a, b) => {
            if (sortOption === 'latest') {
                return new Date(b.createdAt) - new Date(a.createdAt);
            } else if (sortOption === 'oldest') {
                return new Date(a.createdAt) - new Date(b.createdAt);
            } else if (sortOption === 'priceHigh') {
                return b.price - a.price;
            } else if (sortOption === 'priceLow') {
                return a.price - b.price;
            } else {
                return 0;
            }
        });

    const [editItem, setEditItem] = useState({
        name: '',
        description: '',
        price: '',
        category: '',
        sub_category: '',
        color: '',
        size: '',
        mainImage: '',
        otherImages: [''],
        available: true,
    });


    const handleEditImageChange = (index, value) => {
        const updatedImages = [...editItem.otherImages];
        updatedImages[index] = value;
        setEditItem({ ...editItem, otherImages: updatedImages });
    };

    const addEditImageInput = () => {
        setEditItem({ ...editItem, otherImages: [...editItem.otherImages, ''] });
    };


    const handleEditItemSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.put(`https://mallikas-store-server.vercel.app/items/${editItem._id}`, editItem);
            alert('Item updated successfully');
            const modalEl = document.getElementById('EditItemModal');
            const modal = window.bootstrap.Modal.getInstance(modalEl);
            modal?.hide();
            fetchItems();
        } catch (error) {
            alert('Failed to update item');
        }
    };

    return (
        <div className='apparels'>
            <div className='filters'>

                <div className='filter-reset mb-3'>
                    <i className="fa-solid fa-filter fa-lg"></i> Filter ||
                    <button className='btn' onClick={() => setFilterType({ category: [], size: [], color: [] })}>
                        Reset
                    </button>
                </div>

                {/* Accessories Filter Section */}
                <div className="w-100 mb-4">
                    {/* Categories */}
                    <div className="mb-4">
                        <h5 className="text-white border-bottom pb-2">Categories</h5>
                        <div className="list-group">
                            {baseline.accessories_category && baseline.accessories_category.length > 0 ? (
                                baseline.accessories_category.map((cat, i) => {
                                    const val = cat.toLowerCase();
                                    return (
                                        <label key={i} className="list-group-item bg-dark text-white border-0">
                                            <input
                                                type="checkbox"
                                                value={val}
                                                checked={filterType.category.includes(val)}
                                                onChange={() => handleFilterChange('category', val)}
                                                className="form-check-input me-2"
                                            />
                                            {cat}
                                        </label>
                                    );
                                })
                            ) : (
                                <div className="text-muted">No categories available</div>
                            )}
                        </div>
                    </div>

                    {/* Sizes */}
                    <div className="mb-4">
                        <h5 className="text-white border-bottom pb-2">Sizes</h5>
                        <div className="list-group">
                            {baseline.accessories_sizes && baseline.accessories_sizes.length > 0 ? (
                                baseline.accessories_sizes.map((size, i) => {
                                    const val = size.toLowerCase();
                                    return (
                                        <label key={i} className="list-group-item bg-dark text-white border-0">
                                            <input
                                                type="checkbox"
                                                value={val}
                                                checked={filterType.size.includes(val)}
                                                onChange={() => handleFilterChange('size', val)}
                                                className="form-check-input me-2"
                                            />
                                            {size.toUpperCase()}
                                        </label>
                                    );
                                })
                            ) : (
                                <div className="text-muted">No sizes available</div>
                            )}
                        </div>
                    </div>

                    {/* Colors */}
                    <div className="mb-4">
                        <h5 className="text-white border-bottom pb-2">Colors</h5>
                        <div className="list-group">
                            {baseline.accessories_colors && baseline.accessories_colors.length > 0 ? (
                                baseline.accessories_colors.map((color, i) => {
                                    const val = color.toLowerCase();
                                    return (
                                        <label key={i} className="list-group-item bg-dark text-white border-0">
                                            <input
                                                type="checkbox"
                                                value={val}
                                                checked={filterType.color.includes(val)}
                                                onChange={() => handleFilterChange('color', val)}
                                                className="form-check-input me-2"
                                            />
                                            {color}
                                        </label>
                                    );
                                })
                            ) : (
                                <div className="text-muted">No colors available</div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className='apparel-content'>
                <div className='apparel-search'>
                    <form onSubmit={e => e.preventDefault()}>
                        <input
                            alt='...'
                            placeholder='Search Accessories'
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                        />
                        <button className='btn search-btn'>
                            <i className="fa-solid fa-magnifying-glass fa-lg me-2"></i>Search
                        </button>
                    </form>

                    <div className="dropdown ms-2">
                        <button className="btn dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                            <i className="fa-solid fa-sort fa-lg me-2"></i>Sort By
                        </button>
                        <ul className="dropdown-menu">
                            <li><button className="dropdown-item" onClick={() => setSortOption('latest')}>Latest (New on Top)</button></li>
                            <li><button className="dropdown-item" onClick={() => setSortOption('oldest')}>Oldest (Old on Top)</button></li>
                            <li><button className="dropdown-item" onClick={() => setSortOption('priceHigh')}>Price: High to Low</button></li>
                            <li><button className="dropdown-item" onClick={() => setSortOption('priceLow')}>Price: Low to High</button></li>
                        </ul>
                    </div>
                    <div className="dropdown mobile-filters">
                        <button
                            className="btn dropdown-toggle"
                            type="button"
                            id="filtersDropdown"
                            data-bs-toggle="dropdown"
                            aria-expanded="false"
                        >
                            Filters
                        </button>
                        <ul className="dropdown-menu" aria-labelledby="filtersDropdown" style={{ minWidth: 'auto' }}>
                            <li>
                                <button
                                    className="dropdown-item"
                                    type="button"
                                    data-bs-toggle="collapse"
                                    data-bs-target="#CategoriesFilterCollapse"
                                    aria-expanded="false"
                                    aria-controls="CategoriesFilterCollapse"
                                >
                                    Categories
                                </button>
                            </li>
                            <li>
                                <button
                                    className="dropdown-item"
                                    type="button"
                                    data-bs-toggle="collapse"
                                    data-bs-target="#SizesFilterCollapse"
                                    aria-expanded="false"
                                    aria-controls="SizesFilterCollapse"
                                >
                                    Sizes
                                </button>
                            </li>
                            <li>
                                <button
                                    className="dropdown-item"
                                    type="button"
                                    data-bs-toggle="collapse"
                                    data-bs-target="#ColorsFilterCollapse"
                                    aria-expanded="false"
                                    aria-controls="ColorsFilterCollapse"
                                >
                                    Colors
                                </button>
                            </li>
                        </ul>
                    </div>

                </div>

                <div className="collapse mobile-collapse w-100" id="CategoriesFilterCollapse">
                    <div className="card card-body">
                        {baseline.apparels_category && baseline.apparels_category.length > 0 ? (
                            baseline.apparels_category.map((cat, i) => {
                                const val = cat.toLowerCase();
                                return (
                                    <label key={i}>
                                        <input
                                            type="checkbox"
                                            value={val}
                                            checked={filterType.category.includes(val)}
                                            onChange={() => handleFilterChange('category', val)}
                                        /> {cat}
                                    </label>
                                );
                            })
                        ) : (
                            <p>No categories available</p>
                        )}

                    </div>
                </div>

                <div className="collapse mobile-collapse w-100" id="SizesFilterCollapse">
                    <div className="card card-body">
                        {baseline.apparels_sizes && baseline.apparels_sizes.length > 0 ? (
                            baseline.apparels_sizes.map((size, i) => {
                                const val = size.toLowerCase();
                                return (
                                    <label key={i}>
                                        <input
                                            type="checkbox"
                                            value={val}
                                            checked={filterType.size.includes(val)}
                                            onChange={() => handleFilterChange('size', val)}
                                        /> {size.toUpperCase()}
                                    </label>
                                );
                            })
                        ) : (
                            <p>No sizes available</p>
                        )}

                    </div>
                </div>

                <div className="collapse mobile-collapse w-100" id="ColorsFilterCollapse">
                    <div className="card card-body">
                        {baseline.apparels_colors && baseline.apparels_colors.length > 0 ? (
                            baseline.apparels_colors.map((color, i) => {
                                const val = color.toLowerCase();
                                return (
                                    <label key={i}>
                                        <input
                                            type="checkbox"
                                            value={val}
                                            checked={filterType.color.includes(val)}
                                            onChange={() => handleFilterChange('color', val)}
                                        /> {color}
                                    </label>
                                );
                            })
                        ) : (
                            <p>No colors available</p>
                        )}

                    </div>
                </div>

                <div className='items'>
                    {loading ? (
                        <div className="d-flex flex-column align-items-center my-4">
                            <div className="spinner-border" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </div>
                            <div className="mt-2">Loading items...</div>
                        </div>
                    ) : filteredItems.length === 0 ? (
                        <div className="text-center my-4 text-muted">
                            No items found for the selected filters.
                        </div>
                    ) : (
                        filteredItems.map((item, index) => (
                            <div key={index} style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                                <Link
                                    to="/Product"
                                    state={{ item }}
                                    className='item text-decoration-none text-dark'
                                >
                                    <img src={item.mainImage} alt={item.name} />
                                    <div className='item-info'>
                                        <div className='item-name'>{item.name}</div>
                                        <div className='item-specifics'>{item.color} - {item.size}</div>
                                        <div className='item-price'>${item.price}</div>
                                    </div>
                                </Link>

                                {isAdmin && (
                                    <div>
                                        <button
                                            className='btn btn-sm btn-outline-info me-2'
                                            data-bs-toggle='modal'
                                            data-bs-target='#EditItemModal'
                                            onClick={() =>
                                                setEditItem({
                                                    ...item,
                                                    otherImages: Array.isArray(item.otherImages)
                                                        ? item.otherImages
                                                        : [''],
                                                })
                                            }
                                        >
                                            Edit
                                        </button>

                                        <button
                                            className='btn btn-sm btn-outline-danger'
                                            onClick={() => {
                                                if (window.confirm('Are you sure you want to delete this item?')) {
                                                    axios
                                                        .delete(`https://mallikas-store-server.vercel.app/items/${item._id}`)
                                                        .then(() => {
                                                            alert('Deleted successfully');
                                                            fetchItems();
                                                        });
                                                }
                                            }}
                                        >
                                            Delete
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>

                <div className='modal fade' id='EditItemModal' tabIndex='-1' aria-hidden='true'>
                    <div className='modal-dialog modal-dialog-scrollable modal-lg'>
                        <div className='modal-content'>
                            <div className='modal-header'>
                                <h5 className='modal-title'>Edit Item</h5>
                                <button type='button' className='btn-close' data-bs-dismiss='modal' aria-label='Close'></button>
                            </div>
                            <form className='form' onSubmit={handleEditItemSubmit}>
                                <div className='modal-body'>

                                    <div className='mb-3'>
                                        <label className='form-label'>Item Name</label>
                                        <input
                                            type='text'
                                            className='form-control'
                                            value={editItem.name}
                                            onChange={e => setEditItem({ ...editItem, name: e.target.value })}
                                        />
                                    </div>

                                    <div className='mb-3'>
                                        <label className='form-label'>Price</label>
                                        <input
                                            type='number'
                                            className='form-control'
                                            value={editItem.price}
                                            onChange={e => setEditItem({ ...editItem, price: e.target.value })}
                                        />
                                    </div>

                                    <div className='mb-3'>
                                        <label className='form-label'>Type</label>
                                        <select
                                            className='form-select'
                                            value={editItem.category}
                                            onChange={e => setEditItem({ ...editItem, category: e.target.value, sub_category: '', color: '', size: '' })}
                                        >
                                            <option value='apparel'>Apparel</option>
                                            <option value='accessories'>Accessories</option>
                                        </select>
                                    </div>

                                    <div className='mb-3'>
                                        <label className='form-label'>Category</label>
                                        <select
                                            className='form-select'
                                            value={editItem.sub_category}
                                            onChange={e => setEditItem({ ...editItem, sub_category: e.target.value })}
                                        >
                                            <option value=''>Select Category</option>
                                            {(function getCategories() {
                                                const keys = Object.keys(baseline || {});
                                                const key = keys.find(k =>
                                                    k.toLowerCase().includes(editItem.category) &&
                                                    k.toLowerCase().includes('category')
                                                );
                                                return (baseline?.[key] || []).map((cat, i) => (
                                                    <option key={i} value={cat}>{cat}</option>
                                                ));
                                            })()}
                                        </select>
                                    </div>

                                    <div className='mb-3'>
                                        <label className='form-label'>Color</label>
                                        <select
                                            className='form-select'
                                            value={editItem.color}
                                            onChange={e => setEditItem({ ...editItem, color: e.target.value })}
                                        >
                                            <option value=''>Select Color</option>
                                            {(function getColors() {
                                                const keys = Object.keys(baseline || {});
                                                const key = keys.find(k =>
                                                    k.toLowerCase().includes(editItem.category) &&
                                                    k.toLowerCase().includes('colors')
                                                );
                                                return (baseline?.[key] || []).map((color, i) => (
                                                    <option key={i} value={color}>{color}</option>
                                                ));
                                            })()}
                                        </select>
                                    </div>

                                    <div className='mb-3'>
                                        <label className='form-label'>Size</label>
                                        <select
                                            className='form-select'
                                            value={editItem.size}
                                            onChange={e => setEditItem({ ...editItem, size: e.target.value })}
                                        >
                                            <option value=''>Select Size</option>
                                            {(function getSizes() {
                                                const keys = Object.keys(baseline || {});
                                                const key = keys.find(k =>
                                                    k.toLowerCase().includes(editItem.category) &&
                                                    k.toLowerCase().includes('sizes')
                                                );
                                                return (baseline?.[key] || []).map((size, i) => (
                                                    <option key={i} value={size}>{size}</option>
                                                ));
                                            })()}
                                        </select>
                                    </div>

                                    <div className='mb-3'>
                                        <label className='form-label'>Description</label>
                                        <textarea
                                            className='form-control'
                                            rows={3}
                                            value={editItem.description}
                                            onChange={e => setEditItem({ ...editItem, description: e.target.value })}
                                        ></textarea>
                                    </div>

                                    <div className='mb-3'>
                                        <label className='form-label'>Main Image URL</label>
                                        <input
                                            type='text'
                                            className='form-control'
                                            value={editItem.mainImage}
                                            onChange={e => setEditItem({ ...editItem, mainImage: e.target.value })}
                                        />
                                    </div>

                                    <div className='mb-3'>
                                        <label className='form-label'>Other Images</label>
                                        {editItem.otherImages.map((img, idx) => (
                                            <input key={idx} type='text' className='form-control mb-2' value={img} onChange={e => handleEditImageChange(idx, e.target.value)} />
                                        ))}
                                        <button type='button' className='btn btn-sm btn-outline-secondary mt-2' onClick={addEditImageInput}>Add Another Image</button>
                                    </div>

                                    <div className='mb-3'>
                                        <label className='form-label'>Availability</label>
                                        <select
                                            className='form-select'
                                            value={editItem.available ? 'true' : 'false'}
                                            onChange={e => setEditItem({ ...editItem, available: e.target.value === 'true' })}
                                        >
                                            <option value='true'>In Stock</option>
                                            <option value='false'>Out of Stock</option>
                                        </select>
                                    </div>

                                </div>
                                <div className='modal-footer'>
                                    <button type='submit' className='btn btn-sm btn-success'>Save Changes</button>
                                    <button type='button' className='btn btn-sm btn-secondary' data-bs-dismiss='modal'>Cancel</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
