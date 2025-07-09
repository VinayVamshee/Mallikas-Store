import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function Order() {
  const [orders, setOrders] = useState([]);
  const [sortType, setSortType] = useState('latest-desc');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentOrderId, setCurrentOrderId] = useState(null);
  const [deliveredDate, setDeliveredDate] = useState('');
  const [paymentMode, setPaymentMode] = useState('COD');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = () => {
    setLoading(true);
    axios.get('https://mallikas-store-server.vercel.app/orders')
      .then(res => {
        setOrders(res.data);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to fetch orders');
        setLoading(false);
      });
  };

  const sortedOrders = () => {
    let sorted = [...orders];
    switch (sortType) {
      case 'price-desc':
        return sorted.sort((a, b) => b.totalPrice - a.totalPrice);
      case 'price-asc':
        return sorted.sort((a, b) => a.totalPrice - b.totalPrice);
      case 'latest-desc':
        return sorted.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      case 'latest-asc':
        return sorted.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
      case 'delivered':
        return sorted.filter(order => order.status === 'delivered');
      case 'pending':
        return sorted.filter(order => order.status === 'pending');
      case 'cancelled':
        return sorted.filter(order => order.status?.toLowerCase() === 'cancelled');
      default:
        return sorted;
    }
  };

  const openDeliveredModal = (order) => {
    setCurrentOrderId(order._id);
    setDeliveredDate(order.deliveredDate ? new Date(order.deliveredDate).toISOString().split('T')[0] : '');
    setPaymentMode(order.paymentMode || 'COD');
  };

  const handleUpdateOrder = () => {
    if (!deliveredDate) return alert('Please select delivered date');

    setUpdating(true);
    axios.put(`https://mallikas-store-server.vercel.app/orders/${currentOrderId}`, {
      deliveredDate,
      paymentMode,
      status: 'Delivered'
    }).then(() => {
      setUpdating(false);
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

  const handleCancelOrder = (orderId) => {
    if (!window.confirm('Cancel this order?')) return;

    axios.put(`https://mallikas-store-server.vercel.app/orders/${orderId}`, {
      status: 'Cancelled'
    }).then(() => {
      fetchOrders();
    }).catch(() => {
      alert('Failed to cancel order');
    });
  };

  return (
    <div className="container my-4">
      <h2>Orders</h2>

      <div className="mb-3 d-flex align-items-center">
        <label className="me-2 fw-semibold">Sort Orders:</label>
        <select
          className="form-select w-auto"
          value={sortType}
          onChange={e => setSortType(e.target.value)}
        >
          <option value="latest-desc">Latest to Oldest</option>
          <option value="latest-asc">Oldest to Latest</option>
          <option value="price-desc">Highest Price</option>
          <option value="price-asc">Lowest Price</option>
          <option value="delivered">Delivered</option>
          <option value="pending">Pending</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {loading && <p>Loading orders...</p>}
      {error && <p className="text-danger">{error}</p>}
      {sortedOrders().length === 0 && !loading && <p>No orders to display.</p>}

      {sortedOrders().map(order => (
        <div key={order._id} className="order-card mb-4 p-3 border rounded shadow-sm">
          <div className="d-flex justify-content-between">
            <h5>Order #{order.orderNumber}</h5>
            <small>{new Date(order.timestamp).toLocaleString()}</small>
          </div>

          {order.status?.toLowerCase() === 'pending' && (
            <div className="mb-2">
              <button className="btn btn-outline-info btn-sm me-2" data-bs-toggle="modal"
                data-bs-target="#orderDeliveredModal" onClick={() => openDeliveredModal(order)}>
                Order Delivered
              </button>
              <button className="btn btn-outline-danger btn-sm" onClick={() => handleCancelOrder(order._id)}>
                Cancel Order
              </button>
            </div>
          )}

          <p><strong>User:</strong> {order.userId?.username || 'Unknown'} ({order.userId?.email})</p>
          <p><strong>Shipping:</strong> {order.shipping.name}, {order.shipping.phone}, {order.shipping.address}</p>
          <p><strong>Total:</strong> ₹{order.totalPrice}</p>
          <p><strong>Status:</strong> {order.status}</p>

          <div className="row">
            {order.items.map(({ itemId, quantity }, i) => (
              <div key={i} className="col-md-6 d-flex align-items-center mb-2">
                <img src={itemId?.mainImage} alt="img" width={80} height={80} className="me-3 rounded" />
                <div>
                  <h6>{itemId?.name}</h6>
                  <small>Qty: {quantity} × ₹{itemId?.price}</small>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className="modal fade" id="orderDeliveredModal" tabIndex="-1">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Order Delivered</h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div className="modal-body">
              <label className="form-label">Delivered Date</label>
              <input
                type="date"
                className="form-control mb-3"
                value={deliveredDate}
                onChange={e => setDeliveredDate(e.target.value)}
              />

              <label className="form-label">Payment Mode</label>
              <select
                className="form-select"
                value={paymentMode}
                onChange={e => setPaymentMode(e.target.value)}
              >
                <option value="COD">Cash on Delivery</option>
                <option value="Online">Online Payment</option>
                <option value="UPI">UPI</option>
                <option value="Card">Card</option>
              </select>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
              <button className="btn btn-primary" onClick={handleUpdateOrder}>
                {updating ? 'Updating...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
