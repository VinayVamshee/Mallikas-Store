import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom'

export default function Admin() {

    const navigate = useNavigate();
    // eslint-disable-next-line
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    // eslint-disable-next-line
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const decoded = jwtDecode(token);
                setIsLoggedIn(true);
                setIsAdmin(decoded.isAdmin);

                // Navigate only if the decoded token shows it's not admin
                if (!decoded.isAdmin) {
                    navigate('/');
                }
            } catch (error) {
                console.error('Invalid token:', error);
                setIsLoggedIn(false);
                setIsAdmin(false);
                navigate('/');
            }
        } else {
            setIsLoggedIn(false);
            setIsAdmin(false);
            navigate('/');
        }
    }, [navigate]);

    const [orders, setOrders] = useState([]);
    const [sortType, setSortType] = useState('latest-desc');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // For currently editing order in modal
    const [currentOrderId, setCurrentOrderId] = useState(null);
    const [deliveredDate, setDeliveredDate] = useState('');
    const [paymentMode, setPaymentMode] = useState('COD');
    const [updating, setUpdating] = useState(false);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = () => {
        setLoading(true);
        axios.get('http://localhost:3001/orders')
            .then(res => {
                setOrders(res.data);
                setLoading(false);
            })
            .catch(err => {
                setError('Failed to fetch orders');
                setLoading(false);
            });
    };

    const sortedOrders = () => {
        let sorted = [...orders];
        switch (sortType) {
            case 'price-desc':
                sorted.sort((a, b) => b.totalPrice - a.totalPrice);
                break;
            case 'price-asc':
                sorted.sort((a, b) => a.totalPrice - b.totalPrice);
                break;
            case 'latest-desc':
                sorted.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
                break;
            case 'latest-asc':
                sorted.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
                break;
            case 'delivered':
                sorted = sorted.filter(order => order.status === 'delivered');
                break;
            case 'pending':
                sorted = sorted.filter(order => order.status === 'pending');
                break;
            case 'cancelled':
                sorted = sorted.filter(order => order.status?.toLowerCase() === 'cancelled');
                break;
            default:
                break;
        }
        return sorted;
    };

    // When "Order Delivered" button clicked, set current order data for modal
    const openDeliveredModal = (order) => {
        setCurrentOrderId(order._id);
        setDeliveredDate(order.deliveredDate ? new Date(order.deliveredDate).toISOString().split('T')[0] : '');
        setPaymentMode(order.paymentMode || 'COD');
    };

    const handleUpdateOrder = () => {
        if (!deliveredDate) {
            alert('Please select delivered date');
            return;
        }
        setUpdating(true);
        axios.put(`http://localhost:3001/orders/${currentOrderId}`, {
            deliveredDate,
            paymentMode,
            status: 'Delivered'
        }).then(() => {
            setUpdating(false);
            // Close modal programmatically
            const modalEl = document.getElementById('orderDeliveredModal');
            if (modalEl) {
                const modal = window.bootstrap.Modal.getInstance(modalEl);
                if (modal) modal.hide();
            }
            fetchOrders();
        }).catch(() => {
            setUpdating(false);
            alert('Failed to update order');
        });
    };

    // Reset modal data on close
    const handleModalHidden = () => {
        setCurrentOrderId(null);
        setDeliveredDate('');
        setPaymentMode('COD');
    };

    useEffect(() => {
        // Attach bootstrap modal hidden event listener
        const modalEl = document.getElementById('orderDeliveredModal');
        if (modalEl) {
            modalEl.addEventListener('hidden.bs.modal', handleModalHidden);
        }
        return () => {
            if (modalEl) {
                modalEl.removeEventListener('hidden.bs.modal', handleModalHidden);
            }
        };
    }, []);

    const handleCancelOrder = (orderId) => {
        if (!window.confirm('Are you sure you want to cancel this order?')) return;

        axios.put(`http://localhost:3001/orders/${orderId}`, {
            status: 'Cancelled'
        }).then(() => {
            fetchOrders();
        }).catch(() => {
            alert('Failed to cancel order');
        });
    };


    return (
        <div className="container my-4">
            <h2 className="mb-4">Admin Orders Dashboard</h2>

            {/* Sort dropdown */}
            <div className="mb-3 d-flex align-items-center">
                <label htmlFor="sortOrders" className="me-2 fw-semibold">Sort Orders:</label>
                <select
                    id="sortOrders"
                    className="form-select w-auto"
                    value={sortType}
                    onChange={e => setSortType(e.target.value)}
                >
                    <option value="latest-desc">Latest to Oldest</option>
                    <option value="latest-asc">Oldest to Latest</option>
                    <option value="price-desc">Highest Price to Lowest</option>
                    <option value="price-asc">Lowest Price to Highest</option>
                    <option value="delivered">Delivered Orders</option>
                    <option value="pending">Pending Orders</option>
                    <option value="cancelled">Cancelled Orders</option>
                </select>

            </div>

            {/* Loading and error */}
            {loading && <p>Loading orders...</p>}
            {error && <p className="text-danger">{error}</p>}

            {/* Orders list */}
            {!loading && !error && (
                sortedOrders().length === 0 ? (
                    <p>No orders to display.</p>
                ) : (
                    sortedOrders().map((order, idx) => (
                        <div key={order._id} className="order-card mb-4 p-3 border rounded shadow-sm">
                            <div className="d-flex justify-content-between align-items-center mb-2">
                                <h5>Order #{order.orderNumber}</h5>
                                <small>
                                    Placed On: {new Date(order.timestamp).toLocaleString()}
                                </small>
                            </div>

                            {/* Show buttons based on status */}
                            {order.status?.toLowerCase() === 'pending' && (
                                <>
                                    <button
                                        type="button"
                                        className="btn btn-outline-info btn-sm mb-3"
                                        data-bs-toggle="modal"
                                        data-bs-target="#orderDeliveredModal"
                                        onClick={() => openDeliveredModal(order)}
                                    >
                                        Order Delivered
                                    </button>

                                    <button
                                        className="btn btn-outline-danger btn-sm mb-3 ms-2"
                                        onClick={() => handleCancelOrder(order._id)}
                                    >
                                        Cancel Order
                                    </button>
                                </>
                            )}

                            {order.status?.toLowerCase() === 'cancelled' && (
                                <p className="text-danger fw-bold mb-3">Order Cancelled</p>
                            )}

                            {order.status?.toLowerCase() === 'delivered' && (
                                <p className="text-success fw-bold mb-3">
                                    Delivered on {new Date(order.deliveredDate).toLocaleDateString()}
                                </p>
                            )}

                            <p><strong>User:</strong> {order.userId?.username || 'Unknown'} ({order.userId?.email || 'No email'})</p>

                            <p>
                                <strong>Shipping:</strong> {order.shipping.name}, {order.shipping.phone}, {order.shipping.address}
                            </p>

                            <p><strong>Payment Mode:</strong> {order.paymentMode || ''}</p>

                            <p>
                                <strong>Status:</strong>{' '}
                                {order.status === 'Delivered' && order.deliveredDate
                                    ? `Delivered on ${new Date(order.deliveredDate).toLocaleDateString()}`
                                    : order.status === 'Cancelled'
                                        ? 'Cancelled'
                                        : 'Pending'}
                            </p>

                            <p><strong>Total Price:</strong> ${order.totalPrice}</p>

                            <hr />

                            <div className="row">
                                {order.items.map(({ itemId, quantity }, i) => (
                                    <div
                                        key={i}
                                        className="col-md-6 d-flex align-items-center mb-3"
                                    >
                                        <img
                                            src={itemId?.mainImage || 'https://via.placeholder.com/80'}
                                            alt={itemId?.name || 'Item'}
                                            width={80}
                                            height={80}
                                            className="me-3 rounded"
                                            style={{ objectFit: 'cover' }}
                                        />
                                        <div>
                                            <h6 className="mb-1">{itemId?.name || 'Unnamed Item'}</h6>
                                            <small className="text-muted">
                                                Qty: {quantity} × ${itemId?.price || 0} = ${quantity * (itemId?.price || 0)}
                                            </small>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))
                )
            )}

            {/* Bootstrap Modal for Order Delivered */}
            <div
                className="modal fade"
                id="orderDeliveredModal"
                tabIndex="-1"
                aria-labelledby="orderDeliveredModalLabel"
                aria-hidden="true"
            >
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title" id="orderDeliveredModalLabel">Order Delivered</h5>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div className="modal-body">
                            <label htmlFor="deliveredDate" className="form-label">Delivered Date</label>
                            <input
                                type="date"
                                id="deliveredDate"
                                className="form-control mb-3"
                                value={deliveredDate}
                                onChange={e => setDeliveredDate(e.target.value)}
                            />

                            <label htmlFor="paymentMode" className="form-label">Payment Mode</label>
                            <select
                                id="paymentMode"
                                className="form-select"
                                value={paymentMode}
                                onChange={e => setPaymentMode(e.target.value)}
                            >
                                <option value="COD">Cash on Delivery (COD)</option>
                                <option value="Online">Online Payment</option>
                                <option value="UPI">UPI</option>
                                <option value="Card">Card</option>
                            </select>
                        </div>
                        <div className="modal-footer">
                            <button
                                type="button"
                                className="btn btn-secondary"
                                data-bs-dismiss="modal"
                                disabled={updating}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                className="btn btn-primary"
                                onClick={handleUpdateOrder}
                                disabled={updating}
                            >
                                {updating ? 'Updating...' : 'Confirm'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
