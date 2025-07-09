import React, { useEffect, useState } from 'react';
import Order from './Admin Components/Order';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import Edit from './Admin Components/Edit';
import AddProduct from './AddProduct';

export default function AdminDashboard() {
    const navigate = useNavigate();
    const [activeSection, setActiveSection] = useState('orders');
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/');
            return;
        }

        try {
            const decoded = jwtDecode(token);
            if (!decoded.isAdmin) {
                navigate('/');
            } else {
                setIsAdmin(true);
            }
        } catch (err) {
            console.error('Token error:', err);
            localStorage.removeItem('token');
            navigate('/');
        }
    }, [navigate]);

    const renderSection = () => {
        switch (activeSection) {
            case 'orders':
                return <Order />;
            case 'addProduct':
                return <AddProduct />;
            case 'editAttributes':
                return <Edit />;
            default:
                return <div>Select a menu item</div>;
        }
    };

    if (!isAdmin) return null;

    return (
        <div className="admin" style={{ marginTop: '78px' }}>
            <div className="admin-dashboard">
                <button className={`btn ${activeSection === 'orders' ? 'fw-bold text-primary' : ''}`} onClick={() => setActiveSection('orders')}>
                    <i className="fa-solid fa-box me-2"></i>
                    <span className="d-none d-md-inline">Orders</span>
                </button>
                <button className={`btn ${activeSection === 'addProduct' ? 'fw-bold text-primary' : ''}`} onClick={() => setActiveSection('addProduct')}>
                    <i className="fa-solid fa-plus me-2"></i>
                    <span className="d-none d-md-inline">Add Product</span>
                </button>
                <button className={`btn ${activeSection === 'editAttributes' ? 'fw-bold text-primary' : ''}`} onClick={() => setActiveSection('editAttributes')}>
                    <i className="fa-solid fa-pen-to-square me-2"></i>
                    <span className="d-none d-md-inline">Edit Attributes</span>
                </button>
            </div>

            <div className="admin-content">
                {renderSection()}
            </div>
        </div>

    );
}
