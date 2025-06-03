import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function User() {
    const [section, setSection] = useState('profile');
    const [user, setUser] = useState(null);
    const [editable, setEditable] = useState(false);
    const [formData, setFormData] = useState({});

    const token = localStorage.getItem('token');

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const decoded = JSON.parse(atob(token.split('.')[1]));
                const res = await axios.get(`https://mallikas-store-server.vercel.app/users/${decoded.id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setUser(res.data);
                setFormData(res.data);
            } catch (err) {
                console.error(err);
            }
        };

        if (token) fetchUser();
    }, [token]);

    const handleEditToggle = () => setEditable(!editable);

    const handleInputChange = e => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSave = async () => {
        try {
            await axios.put(`https://mallikas-store-server.vercel.app/users/${user._id}`, formData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert('Customer Data Updated');
            setUser(formData);
            setEditable(false);
        } catch (err) {
            console.error(err);
        }
    };

    const renderProfile = () => (
        <div className="userprofile">
            <div className="d-flex justify-content-between">
                <h4>Profile Info</h4>
                <button className="btn btn-sm btn-warning" onClick={editable ? handleSave : handleEditToggle}>
                    {editable ? 'Save' : 'Edit'}
                </button>
            </div>

            {['username', 'email', 'password', 'phone', 'address'].map(key => (
                <div className="mb-2" key={key}>
                    <strong>{key.charAt(0).toUpperCase() + key.slice(1)}:</strong>
                    <input
                        type={key === 'password' ? 'password' : 'text'}
                        className="form-control"
                        name={key}
                        value={formData[key] || ''}
                        onChange={handleInputChange}
                        disabled={!editable}
                    />
                </div>
            ))}
        </div>

    );

    const [editMode, setEditMode] = useState(false);
    const [checkoutForm, setCheckoutForm] = useState({
        name: '',
        phone: '',
        address: ''
    });

    useEffect(() => {
        if (user) {
            setCheckoutForm({
                name: user.username || '',
                phone: user.phone || '',
                address: user.address || ''
            });
        }
    }, [user]);

    const handleCheckoutChange = e => {
        setCheckoutForm({ ...checkoutForm, [e.target.name]: e.target.value });
    };

    const handlePlaceOrder = async () => {
        try {
            const availableItems = user.cart.filter(c => c.itemId.available);

            const totalPrice = availableItems.reduce((acc, c) => acc + c.quantity * c.itemId.price, 0);

            const orderPayload = {
                userId: user._id,
                items: availableItems.map(c => ({
                    itemId: typeof c.itemId === 'object' ? c.itemId._id : c.itemId,
                    quantity: c.quantity
                })),
                shipping: {
                    name: checkoutForm.name,
                    phone: checkoutForm.phone,
                    address: checkoutForm.address
                },
                totalPrice
            };

            await axios.post('https://mallikas-store-server.vercel.app/orders', orderPayload, {
                headers: { Authorization: `Bearer ${token}` }
            });

            alert('Order placed successfully!');
            const decoded = JSON.parse(atob(token.split('.')[1]));
            const res = await axios.get(`https://mallikas-store-server.vercel.app/users/${decoded.id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUser(res.data);
            window.location.reload();
        } catch (err) {
            console.error(err);
            alert('Failed to place order.');
        }
    };

    const removeFromCart = (itemId) => {
        axios.post('https://mallikas-store-server.vercel.app/removefromcart', { itemId }, {
            headers: { Authorization: `Bearer ${token}` }
        }).then(response => {
            // Update local state with returned cart
            setUser(prevUser => ({ ...prevUser, cart: response.data.cart }));
        }).catch(err => console.error('Failed to update cart', err));

    };


    const renderCart = () => (

        <div className="cart-info">
            {/* Calculate Total Quantity and Total Cost */}
            {(() => {
                let totalQuantity = 0;
                let totalCost = 0;

                user?.cart?.forEach((c) => {
                    if (c.itemId.available) {
                        totalQuantity += c.quantity;
                        totalCost += c.quantity * c.itemId.price;
                    }
                });


                return (
                    <>
                        {/* Net Value Section */}
                        <div className='net-value mb-3'>
                            <h5>Total Quantity: {totalQuantity}</h5>
                            <h5>Total Cost: ${totalCost}</h5>
                            {totalQuantity > 0 && (
                                <button
                                    type="button"
                                    className="btn btn-success btn-sm mt-2"
                                    data-bs-toggle="modal"
                                    data-bs-target="#checkoutModal"
                                    style={{ width: 'fit-content' }}
                                >
                                    Proceed to Checkout
                                </button>
                            )}
                        </div>

                        {/* Cart Items List */}
                        <h4>Cart Items</h4>
                        {user?.cart?.length ? user.cart.map((c, i) => {
                            const item = c.itemId;
                            return (
                                <div key={i} className="cart-item">
                                    <img src={item.mainImage || 'https://via.placeholder.com/100'} alt={item.name} style={{ objectFit: 'cover' }} className={`${!item.available ? 'unavailable-item' : ''}`} />
                                    <div className={`cart-item-info ${!item.available ? 'unavailable-item' : ''}`}>
                                        <h5>{item.name}</h5>
                                        <p className="mb-1 text-muted">{item.description}</p>
                                        <div className="text-muted">
                                            Color: {item.color || 'N/A'} | Size: {item.size || 'N/A'}
                                        </div>
                                        <div className="fw-bold mt-2">${item.price}</div>
                                    </div>
                                    <div className="cart-item-quantity">
                                        <div className="fw-semibold">Qty: {c.quantity}</div>
                                        <div className="fw-bold text-success mt-2">${item.price * c.quantity}</div>
                                        <button
                                            className="btn btn-outline-danger btn-sm mt-2"
                                            onClick={() => removeFromCart(item._id)}
                                        >
                                            <i className="fa-solid fa-square-minus fa-lg me-2"></i>Remove from Cart
                                        </button>
                                    </div>
                                    {!item.available && (
                                        <div className="unavailable-item-text">This item is currently out of stock</div>
                                    )}
                                </div>
                            );
                        }) : (
                            <p>No items in cart.</p>
                        )}

                        {/* Bootstrap Modal */}
                        <div className="modal fade" id="checkoutModal" tabIndex="-1" aria-labelledby="checkoutModalLabel" aria-hidden="true">
                            <div className="modal-dialog modal-dialog-centered">
                                <div className="modal-content">
                                    <div className="modal-header">
                                        <h5 className="modal-title" id="checkoutModalLabel">Confirm Order</h5>
                                        <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                                    </div>
                                    <div className="modal-body">
                                        <h6>Total Cost: ${totalCost}</h6>
                                        <hr />
                                        <h6>Shipping Info:</h6>
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
                                            <>
                                                <p><strong>Name:</strong> {checkoutForm.name || 'N/A'}</p>
                                                <p><strong>Phone:</strong> {checkoutForm.phone || 'N/A'}</p>
                                                <p><strong>Address:</strong> {checkoutForm.address || 'N/A'}</p>
                                            </>
                                        )}
                                        <button className="btn btn-link p-0" onClick={() => setEditMode(!editMode)}>
                                            {editMode ? 'Cancel Edit' : 'Edit Info'}
                                        </button>

                                    </div>
                                    <div className="modal-footer">
                                        <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                                        <button type="button" className="btn btn-primary" onClick={handlePlaceOrder}>
                                            Place Order
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                );
            })()}
        </div>
    );

    const [orders, setOrders] = useState([]);
    useEffect(() => {
        const fetchUserAndOrders = async () => {
            try {
                const decoded = JSON.parse(atob(token.split('.')[1]));

                const [userRes, ordersRes] = await Promise.all([
                    axios.get(`https://mallikas-store-server.vercel.app/users/${decoded.id}`, {
                        headers: { Authorization: `Bearer ${token}` }
                    }),
                    axios.get(`https://mallikas-store-server.vercel.app/orders/${decoded.id}`, {
                        headers: { Authorization: `Bearer ${token}` }
                    })
                ]);

                setUser(userRes.data);
                setFormData(userRes.data);

                // Sort orders by timestamp descending (latest first)
                const sortedOrders = ordersRes.data.sort(
                    (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
                );

                setOrders(sortedOrders);
            } catch (err) {
                console.error(err);
            }
        };

        if (token) fetchUserAndOrders();
    }, [token]);


    const [filterStatus, setFilterStatus] = useState('all');

const cancelOrder = async (orderId) => {
    if (window.confirm("Are you sure you want to cancel this order?")) {
        try {
            await axios.put(`https://mallikas-store-server.vercel.app/orders/${orderId}/cancel`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert("Order cancelled.");
            const updated = await axios.get(`https://mallikas-store-server.vercel.app/orders/${user._id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setOrders(updated.data);
        } catch (err) {
            console.error("Error cancelling order", err);
            alert("Failed to cancel order.");
        }
    }
};

const renderOrders = () => {
    const filteredOrders = filterStatus === 'all'
        ? orders
        : orders.filter(order => order.status === filterStatus);

    return (
        <div className="orders-info">
            <h4 className="mb-4">Order History</h4>

            {/* Filter Buttons */}
            <div className="mb-3 d-flex gap-2 flex-wrap">
                {['all', 'pending', 'delivered', 'cancelled'].map(status => (
                    <button
                        key={status}
                        className={`btn btn-sm ${filterStatus === status ? 'btn-info' : 'btn-outline-info'}`}
                        onClick={() => setFilterStatus(status)}
                    >
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                    </button>
                ))}
            </div>

            {filteredOrders.length === 0 ? (
                <p>No orders found for selected filter.</p>
            ) : (
                [...filteredOrders].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).map((order, idx) => (
                    <div
                        key={order._id}
                        className={`order-card mb-4 p-3 border rounded shadow-sm ${order.status === 'cancelled' ? 'bg-secondary bg-opacity-25' : 'bg-light'}`}
                    >
                        <div className="d-flex justify-content-between align-items-center mb-2">
                            <h5 className="mb-0">Order #{orders.length - idx}</h5>
                            <small className="text-muted">Placed on: {new Date(order.timestamp).toLocaleString()}</small>
                        </div>

                        <div className="mb-2">
                            <strong>Status:</strong> <span className={`badge p-2 bg-${order.status === 'cancelled' ? 'danger' : order.status === 'delivered' ? 'success' : 'warning'}`}>
                               {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                            </span>
                        </div>

                        <div className="mb-2">
                            <strong>Shipping Info:</strong><br />
                            <span>{order.shipping.name}</span><br />
                            <span>{order.shipping.phone}</span><br />
                            <span>{order.shipping.address}</span>
                        </div>

                        <div className="mb-2">
                            <strong>Total Price:</strong> ${order.totalPrice}
                        </div>

                        <hr />

                        <div>
                            <strong>Items Ordered:</strong>
                            <div className="row">
                                {order.items.map((item, i) => (
                                    <div key={i} className="col-12 col-md-6">
                                        <div className="order-item d-flex align-items-center mb-3">
                                            <img
                                                src={item.itemId.mainImage || 'https://via.placeholder.com/60'}
                                                alt={item.itemId.name}
                                                className="me-3 rounded"
                                                width="60"
                                                height="60"
                                                style={{ objectFit: 'cover' }}
                                            />
                                            <div>
                                                <h6 className="mb-1">{item.itemId.name}</h6>
                                                <small className="text-muted">
                                                    Qty: {item.quantity} × ${item.itemId.price} = ${item.quantity * item.itemId.price}
                                                </small>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Cancel Order Button */}
                        {order.status === 'pending' && (
                            <button
                                className="btn btn-danger btn-sm mt-3 "
                                onClick={() => cancelOrder(order._id)}
                            >
                                Cancel Order
                            </button>
                        )}
                    </div>
                ))
            )}
        </div>
    );
};

    return (
        <div className='user'>
            <div className='user-dashboard'>
                <button className='btn ' onClick={() => setSection('profile')}>
                    <i className="fa-solid fa-circle-user me-2"></i>Profile
                </button>
                <button className='btn ' onClick={() => setSection('cart')}>
                    <i className="fa-solid fa-cart-shopping me-2"></i>Cart
                </button>
                <button className='btn ' onClick={() => setSection('orders')}>
                    <i className="fa-solid fa-truck me-2"></i>Orders
                </button>
            </div>

            <div className='user-information'>
                {section === 'profile' && renderProfile()}
                {section === 'cart' && renderCart()}
                {section === 'orders' && renderOrders()}
            </div>
        </div>
    );
}
