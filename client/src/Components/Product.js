import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
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

                                        {!item.available && (
                                            <div className="text-white bg-secondary rounded px-3 py-1 small">
                                                Out of Stock
                                            </div>
                                        )}
                                    </>
                                )}

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
                                        <span className="text-danger">Out of Stock</span>
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
                    <h4 className="mb-4" style={{fontFamily:'impact', fontSize:'2rem'}}>You May Also Like...</h4>
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
