import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

// Mock related products data
// const relatedProducts = [
//     { id: 1, name: 'Related Product 1', price: 29.99, image: 'https://via.placeholder.com/150' },
//     { id: 2, name: 'Related Product 2', price: 19.99, image: 'https://via.placeholder.com/150' },
//     { id: 3, name: 'Related Product 3', price: 39.99, image: 'https://via.placeholder.com/150' },
// ];

export default function Product() {

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
    const [isFading, setIsFading] = useState(false);
    const [quantity, setQuantity] = useState(1);

    if (!item) {
        return (
            <div className="container mt-5">
                <h2>No product data available.</h2>
            </div>
        );
    }

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

    return (
        <div className="mt-3 product-detail">

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
                <div className="card shadow-sm mb-4">
                    <div className="card-body">
                        <h2 className="card-title mb-3">{item.name}</h2>

                        <ul className="list-group list-group-flush mb-3">
                            <li className="list-group-item px-0">
                                <strong>Category:</strong> {item.sub_category}
                            </li>
                            <li className="list-group-item px-0">
                                <strong>Color:</strong> {item.color}
                            </li>
                            <li className="list-group-item px-0">
                                <strong>Size:</strong> {item.size}
                            </li>
                            <li className="list-group-item px-0">
                                <strong>Price:</strong> <span className="text-success">${item.price.toFixed(2)}</span>
                            </li>
                            <li className="list-group-item px-0">
                                <strong>Availability:</strong>{' '}
                                {inStock ? (
                                    <span className="text-success">In Stock</span>
                                ) : (
                                    <span className="text-danger">Out of Stock</span>
                                )}
                            </li>
                        </ul>

                        {/* Ratings */}
                        <div className="mb-3">
                            <strong>Rating:</strong>{' '}
                            <span className="text-warning">
                                {'★'.repeat(Math.floor(rating))}
                                {rating % 1 >= 0.5 ? '½' : ''}
                                {'☆'.repeat(5 - Math.ceil(rating))}
                            </span>{' '}
                            ({reviewCount} reviews)
                        </div>

                        <h5>Description</h5>
                        <p className="text-muted">{item.description || 'No description available.'}</p>

                        {/* Size Guide Link
                            <p>
                                <a href="/size-guide" target="_blank" rel="noopener noreferrer">
                                    View Size Guide
                                </a>
                            </p> */}

                        {/* Quantity and Add to Cart */}
                        <div className="d-flex align-items-center mb-3 gap-3">
                            <label htmlFor="quantity" className="fw-semibold mb-0">
                                Quantity:
                            </label>
                            <input
                                id="quantity"
                                type="number"
                                min="1"
                                value={quantity}
                                onChange={handleQuantityChange}
                                className="form-control w-25"
                                disabled={!inStock}
                            />
                        </div>

                        <div className="mt-4 d-flex align-items-center gap-3 mb-4">
                            <span className="fw-semibold">Share:</span>

                            <button
                                className="btn btn-outline-secondary btn-sm"
                                onClick={handleCopyLink}
                                aria-label="Copy product link"
                            >
                                <i className="fa-solid fa-link fa-lg me-2"></i>Copy Link
                            </button>

                            {/* Copy confirmation message */}
                            <div
                                className={` ms-2 px-2 py-1 rounded bg-success text-white small ${copySuccess ? 'opacity-100' : 'opacity-0'
                                    }`}
                                style={{
                                    transition: 'opacity 0.5s ease',
                                    pointerEvents: 'none',
                                    whiteSpace: 'nowrap',
                                }}
                            >
                                Link copied!
                            </div>
                        </div>

                        {!isLoggedIn && (
                            <button
                                className="btn btn-info btn-sm w-100"
                                onClick={() => alert('Please log in first.')}
                            >
                                <i className="fa-solid fa-cart-plus fa-lg me-3"></i>Add to Cart
                            </button>
                        )}

                        {isLoggedIn && !isAdmin && (
                            <>
                                <button
                                    className="btn btn-info btn-sm w-100"
                                    onClick={addToCart}
                                    disabled={!item.available}
                                >
                                    <i className="fa-solid fa-cart-plus fa-lg me-3"></i>Add to Cart
                                </button>

                                {!item.available && (
                                    <div className="text-light text-center mt-1 p-2 bg-secondary rounded" style={{ fontSize: '0.85rem' }}>
                                        Out of Stock
                                    </div>
                                )}
                            </>
                        )}

                    </div>
                </div>
            </div>

            {/* Related Products */}
            {/* <div className="mt-5">
                <h4>Related Products</h4>
                <div className="row">
                    {relatedProducts.map((prod) => (
                        <div key={prod.id} className="col-sm-6 col-md-4 col-lg-3 mb-3">
                            <div className="card h-100 shadow-sm">
                                <img
                                    src={prod.image}
                                    alt={prod.name}
                                    className="card-img-top"
                                    style={{ objectFit: 'cover', height: '150px' }}
                                />
                                <div className="card-body d-flex flex-column">
                                    <h6 className="card-title">{prod.name}</h6>
                                    <p className="card-text text-success fw-bold">${prod.price.toFixed(2)}</p>
                                    <button
                                        className="btn btn-sm btn-outline-primary mt-auto"
                                        onClick={() => alert(`Added ${prod.name} to cart!`)}
                                    >
                                        Add to Cart
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div> */}
        </div>
    );
}
