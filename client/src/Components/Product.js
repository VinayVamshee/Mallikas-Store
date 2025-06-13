import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

export default function Product() {
    const navigate = useNavigate();

    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const token = localStorage.getItem('token');
    // State to toggle edit mode
    const [editMode, setEditMode] = useState(false);

    // State for the shipping form if not already declared
    const [checkoutForm, setCheckoutForm] = useState({
        name: '',
        phone: '',
        address: ''
    });

    // Handle form input changes
    const handleCheckoutChange = (e) => {
        const { name, value } = e.target;
        setCheckoutForm(prev => ({ ...prev, [name]: value }));
    };

    const [loading, setLoading] = useState(false);

    useEffect(() => {
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
    }, [token]);

    const [copySuccess, setCopySuccess] = useState(false);

    const handleCopyLink = () => {
        navigator.clipboard.writeText(shareUrl).then(() => {
            setCopySuccess(true);
            setTimeout(() => setCopySuccess(false), 3000);
        });
    };

    const location = useLocation();
    const { item } = location.state || {};

    const [selectedImage, setSelectedImage] = useState(item?.mainImage || '');
    useEffect(() => {
        if (item?.mainImage) {
            setSelectedImage(item.mainImage);
        }
    }, [item]);
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [item]);


    const [isFading, setIsFading] = useState(false);
    const [quantity, setQuantity] = useState(1);

    const [relatedProducts, setRelatedProducts] = useState([]);

    useEffect(() => {
        const fetchRelated = async () => {
            try {
                const response = await axios.get(`https://mallikas-store-server.vercel.app/items`);
                const allItems = response.data;

                // Try finding related items (same sub_category)
                let related = allItems
                    .filter(prod => prod.sub_category === item.sub_category && prod._id !== item._id)
                    .slice(0, 4);

                // If no related items, just pick latest 4 excluding current item
                if (related.length === 0) {
                    related = allItems
                        .filter(prod => prod._id !== item._id)
                        .slice(-4)  // latest 4 (assuming response is in order from oldest to newest)
                        .reverse(); // so newest comes first
                }

                setRelatedProducts(related);
            } catch (err) {
                console.error("Failed to fetch products", err);
            }
        };

        if (item?.sub_category) {
            fetchRelated();
        }
    }, [item]);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const decoded = JSON.parse(atob(token.split('.')[1]));
                const res = await axios.get(`https://mallikas-store-server.vercel.app/users/${decoded.id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setCheckoutForm({
                    name: res.data.username || '',
                    phone: res.data.phone || '',
                    address: res.data.address || ''
                });

            } catch (err) {
                console.error(err);
            }
        };

        if (token) fetchUser();
    }, [token]);

    const allImages = [item.mainImage, ...(item.otherImages || [])];

    const onImageClick = (newSrc) => {
        if (newSrc === selectedImage) return;

        setIsFading(true);

        setTimeout(() => {
            setSelectedImage(newSrc);
            setIsFading(false);
        }, 300);
    };

    const handleQuantityChange = (e) => {
        const val = parseInt(e.target.value);
        if (val > 0) setQuantity(val);
    };

    const addToCart = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                alert('Please log in first.');
                return;
            }

            const decoded = jwtDecode(token);
            const userId = decoded._id || decoded.id; // adjust to your token's userId field

            if (!userId) {
                alert('Invalid user token.');
                return;
            }

            const payload = {
                userId,
                itemId: item._id,
                quantity,
            };

            const response = await axios.post('https://mallikas-store-server.vercel.app/addtocart', payload, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            alert(response.data.message);

        } catch (error) {
            console.error(error);
            alert('Failed to add to cart.');
        }
    };


    // Placeholder stock status (can be dynamic)
    const inStock = item.stock !== undefined ? item.stock > 0 : true;

    // Placeholder rating info
    const rating = 4.3; // out of 5
    const reviewCount = 23;

    // Social share URLs (example using current page url)
    const shareUrl = window.location.href;

    const handlePlaceOrder = async () => {
        if (!checkoutForm.name || !checkoutForm.phone || !checkoutForm.address) {
            return alert("Please complete the shipping info before placing the order.");
        }

        const token = localStorage.getItem('token');
        if (!token) return alert("User not logged in.");

        setLoading(true);
        try {
            const decoded = jwtDecode(token);

            const orderPayload = {
                userId: decoded.id || decoded._id,
                items: [{ itemId: item._id, quantity }],
                shipping: checkoutForm,
                totalPrice: item.price * quantity
            };

            await axios.post('https://mallikas-store-server.vercel.app/orders', orderPayload, {
                headers: { Authorization: `Bearer ${token}` }
            });

            document.querySelector('#checkoutModal .btn-close')?.click();
            document.getElementById("triggerSuccessModal")?.click();

        } catch (err) {
            console.error(err);
            alert('Failed to place order.');
        } finally {
            setLoading(false);
        }
    };

    if (!item) {
        return (
            <div className="container mt-5">
                <h2>No product data available.</h2>
            </div>
        );
    }

    return (
        <div className="product-detail">
            {/* <h2 className='fw-bold'>{item.name}</h2> */}
            <div className='product'>
                {/* Images */}
                <div className="images">
                    <div className="mb-4 text-center">
                        <img
                            src={selectedImage}
                            alt={item.name}
                            className={`selectedImage ${isFading ? 'fade-out' : 'fade-in'}`}
                        />
                    </div>
                    <div className="otherImages">
                        {allImages.map((img, i) => (
                            <img
                                key={i}
                                src={img}
                                alt={`Preview ${i}`}
                                className={`img-thumbnail ${selectedImage === img ? 'border-primary' : ''}`}
                                style={{ width: '80px', height: '80px', objectFit: 'cover', cursor: 'pointer' }}
                                onClick={() => onImageClick(img)}
                            />
                        ))}
                    </div>
                </div>

                {/* Product details */}
                <div className="col-md-6">
                    <div className="p-2 mb-4">
                        <div className="product-info">

                            {/* Name */}
                            <h2 className="fw-bold mb-3">{item.name}</h2>

                            {/* Price */}
                            <div className="mb-3 fs-5 text-success fw-semibold">
                                ${item.price.toFixed(2)}
                            </div>

                            {/* Quantity */}
                            <div className="d-flex align-items-center mb-3">
                                <label htmlFor="quantity" className="form-label me-3 mb-0 fw-medium">Quantity:</label>
                                <input
                                    id="quantity"
                                    type="number"
                                    min="1"
                                    value={quantity}
                                    onChange={handleQuantityChange}
                                    className="form-control w-auto"
                                    style={{ maxWidth: '100px' }}
                                    disabled={!inStock}
                                />
                            </div>

                            {/* Share & Add to Cart */}
                            <div className="d-flex flex-wrap align-items-center gap-3 mb-4">
                                <button
                                    className="btn btn-outline-secondary btn-sm"
                                    onClick={handleCopyLink}
                                    aria-label="Copy product link"
                                >
                                    <i className="fa-solid fa-link me-2"></i>Copy Link
                                </button>

                                {!isLoggedIn && (
                                    <button
                                        className="btn btn-info btn-sm"
                                        onClick={() => alert('Please log in first.')}
                                    >
                                        <i className="fa-solid fa-cart-plus me-2"></i>Add to Cart
                                    </button>
                                )}

                                {isLoggedIn && !isAdmin && (
                                    <>
                                        <button
                                            className="btn btn-info btn-sm"
                                            onClick={addToCart}
                                            disabled={!item.available}
                                        >
                                            <i className="fa-solid fa-cart-plus me-2"></i>Add to Cart
                                        </button>
                                        <button
                                            className="btn btn-success btn-sm"
                                            data-bs-toggle="modal"
                                            data-bs-target="#checkoutModal"
                                        >
                                            <i className="fa-solid fa-bag-shopping me-2"></i>Buy Now
                                        </button>

                                        <button
                                            type="button"
                                            className="d-none"
                                            id="triggerSuccessModal"
                                            data-bs-toggle="modal"
                                            data-bs-target="#orderSuccessModal"
                                        ></button>


                                        {!item.available && (
                                            <div className="text-white bg-danger rounded px-3 py-1 small">
                                                <i className="fa-solid fa-ban me-2"></i>Sold Out
                                            </div>
                                        )}
                                    </>
                                )}

                                {/* Order Success Modal */}
                                <div className="modal fade" id="orderSuccessModal" tabIndex="-1" aria-labelledby="orderSuccessLabel" aria-hidden="true">
                                    <div className="modal-dialog modal-dialog-centered">
                                        <div className="modal-content text-center">
                                            <div className="modal-body p-5">
                                                <div className="text-success mb-3" style={{ fontSize: '3rem' }}>
                                                    <i className="fa-solid fa-circle-check fa-xl"></i>
                                                </div>
                                                <h5 className="mb-2">Order Placed Successfully!</h5>
                                                <p className="text-muted">Thank you for shopping with us.</p>

                                                <hr />
                                                <div className="text-start">
                                                    <p><strong>Name:</strong> {checkoutForm.name}</p>
                                                    <p><strong>Phone:</strong> {checkoutForm.phone}</p>
                                                    <p><strong>Address:</strong> {checkoutForm.address}</p>
                                                </div>

                                                <button
                                                    type="button"
                                                    className="btn btn-success mt-3"
                                                    onClick={() => {
                                                        // Optional: Close the modal
                                                        document.getElementById('orderSuccessModal')?.classList.remove('show');
                                                        document.querySelector('.modal-backdrop')?.remove();
                                                        document.body.classList.remove('modal-open');
                                                        navigate('/');
                                                    }}
                                                >
                                                    Continue Shopping
                                                </button>

                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Confirm Order Modal for Buy Now */}
                                <div className="modal fade" id="checkoutModal" tabIndex="-1" aria-labelledby="checkoutModalLabel" aria-hidden="true">
                                    <div className="modal-dialog modal-dialog-centered">
                                        <div className="modal-content">
                                            <div className="modal-header">
                                                <h5 className="modal-title" id="checkoutModalLabel">Confirm Order</h5>
                                                <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                                            </div>
                                            <div className="modal-body">
                                                <h6 className="mb-3">🛍️ Item You're Buying</h6>
                                                <ul className="list-group mb-4">
                                                    <li className="list-group-item d-flex align-items-center">
                                                        <img
                                                            src={item.mainImage || 'https://via.placeholder.com/50'}
                                                            alt={item.name}
                                                            className="me-3 rounded"
                                                            style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                                                        />
                                                        <div className="flex-grow-1">
                                                            <div className="fw-semibold">{item.name}</div>
                                                            <small className="text-muted">Qty: {quantity}</small>
                                                        </div>
                                                        <div className="text-end fw-bold text-success">
                                                            ${item.price * quantity}
                                                        </div>
                                                    </li>
                                                </ul>

                                                <h6 className="mb-3">🚚 Shipping Info</h6>
                                                {editMode ? (
                                                    <>
                                                        <input
                                                            type="text"
                                                            className="form-control mb-2"
                                                            placeholder="Name"
                                                            name="name"
                                                            value={checkoutForm.name}
                                                            onChange={handleCheckoutChange}
                                                        />
                                                        <input
                                                            type="text"
                                                            className="form-control mb-2"
                                                            placeholder="Phone"
                                                            name="phone"
                                                            value={checkoutForm.phone}
                                                            onChange={handleCheckoutChange}
                                                        />
                                                        <textarea
                                                            className="form-control mb-2"
                                                            placeholder="Address"
                                                            name="address"
                                                            value={checkoutForm.address}
                                                            onChange={handleCheckoutChange}
                                                        />
                                                    </>
                                                ) : (
                                                    <ul className="list-group list-group-flush mb-2">
                                                        <li className="list-group-item">
                                                            <strong>Name:</strong> {checkoutForm.name || 'N/A'}
                                                        </li>
                                                        <li className="list-group-item">
                                                            <strong>Phone:</strong> {checkoutForm.phone || 'N/A'}
                                                        </li>
                                                        <li className="list-group-item">
                                                            <strong>Address:</strong> {checkoutForm.address || 'N/A'}
                                                        </li>
                                                    </ul>
                                                )}
                                                <button className="btn btn-info btn-sm" onClick={() => setEditMode(!editMode)}>
                                                    {editMode ? 'Cancel Edit' : 'Edit Info'}
                                                </button>
                                            </div>

                                            <div className="modal-footer">
                                                <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                                                <button type="button" className="btn btn-primary" onClick={handlePlaceOrder} disabled={loading}>
                                                    {loading ? 'Placing Order...' : 'Place Order'}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>



                                <div
                                    className={`px-2 py-1 rounded bg-success text-white small ${copySuccess ? 'opacity-100' : 'opacity-0'}`}
                                    style={{
                                        transition: 'opacity 0.5s ease',
                                        pointerEvents: 'none',
                                        whiteSpace: 'nowrap',
                                    }}
                                >
                                    Link copied!
                                </div>
                            </div>

                            {/* Description */}
                            <div className="mb-4">
                                <h5 className="fw-semibold">Description</h5>
                                <p className="text-muted mb-0">{item.description || 'No description available.'}</p>
                            </div>

                            {/* Additional Info */}
                            <ul className="list-group list-group-flush">
                                <li className="list-group-item px-0"><strong>Category:</strong> {item.sub_category}</li>
                                <li className="list-group-item px-0"><strong>Color:</strong> {item.color}</li>
                                <li className="list-group-item px-0"><strong>Size:</strong> {item.size}</li>
                                <li className="list-group-item px-0">
                                    <strong>Availability:</strong> {inStock ? (
                                        <span className="text-success">In Stock</span>
                                    ) : (
                                        <span className="text-danger">Sold Out</span>
                                    )}
                                </li>
                            </ul>

                            {/* Rating */}
                            <div className="mt-3">
                                <strong>Rating:</strong>{' '}
                                <span className="text-warning">
                                    {'★'.repeat(Math.floor(rating))}
                                    {rating % 1 >= 0.5 ? '½' : ''}
                                    {'☆'.repeat(5 - Math.ceil(rating))}
                                </span>{' '}
                                ({reviewCount} reviews)
                            </div>
                        </div>

                    </div>
                </div>

            </div>

            {/* Related Products */}
            {relatedProducts.length > 0 && (
                <div className="mt-5 container">
                    <h4 className="mb-4" style={{ fontFamily: 'impact', fontSize: '2rem' }}>You May Also Like...</h4>
                    <div className="items">
                        {relatedProducts.map((prod) => (
                            <div key={prod._id} className="item">

                                <img
                                    src={prod.mainImage}
                                    alt={prod.name}
                                />
                                <div className="item-info bg-light">
                                    <div className="text-dark">{prod.name}</div>
                                    <div className="item-price text-success">${prod.price}</div>
                                    <Link
                                        to="/Product"
                                        state={{ item: prod }}
                                        className="btn btn-outline-dark"
                                    >
                                        View
                                    </Link>
                                </div>
                            </div>

                        ))}
                    </div>
                </div>
            )}

        </div>
    );
}
