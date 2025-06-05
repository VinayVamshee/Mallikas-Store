import React from 'react';

export default function Footer() {
    return (
        <div>
            <div className="py-5" style={{ backgroundColor: 'black', color: 'white' }}>
                <footer className="container">
                    <ul className="nav justify-content-center border-bottom pb-3 mb-3">
                        <li className="nav-item">
                            <a href="/" className="nav-link px-2 text-white">Home</a>
                        </li>
                        <li className="nav-item">
                            <button className="nav-link px-2 text-white btn btn-link" data-bs-toggle="modal" data-bs-target="#featuresModal" >  Features </button>
                        </li>
                        <li className="nav-item">
                            <a href="#new-arrivals" className="nav-link px-2 text-white">New Arrivals</a>
                        </li>
                        <li className="nav-item">
                            <a href="..." className="nav-link px-2 text-white">FAQs</a>
                        </li>
                        <li className="nav-item">
                            <button className="nav-link px-2 text-white btn btn-link" data-bs-toggle="modal" data-bs-target="#aboutModal" > About </button>
                        </li>
                    </ul>

                    <div className="d-flex justify-content-between flex-wrap text-white small mt-4">
                        {/* Contact Info */}
                        <div className="d-flex flex-column flex-md-row align-items-start align-items-md-center gap-3">
                            <div className="d-flex align-items-center">
                                <i className="fa-brands fa-whatsapp fa-lg me-2" style={{ color: 'limegreen' }}></i>
                                <a
                                    href="https://wa.me/919876543210"
                                    className="text-white"
                                    target="_blank"
                                    rel="noreferrer"
                                    style={{ textDecoration: 'none' }}
                                >
                                    +91 98765 43210
                                </a>
                            </div>

                            <div className="d-flex align-items-center">
                                <i className="fa-brands fa-instagram fa-lg me-2" style={{ color: 'hotpink' }}></i>
                                <a
                                    href="https://instagram.com/mallikas.store"
                                    className="text-white"
                                    target="_blank"
                                    rel="noreferrer"
                                    style={{ textDecoration: 'none' }}
                                >
                                    @mallikas.store
                                </a>
                            </div>

                            <div className="d-flex align-items-center">
                                <i className="fa-solid fa-envelope fa-lg me-2" style={{ color: 'white' }}></i>
                                <a
                                    href="mailto:contact@mallikastore.com"
                                    className="text-white"
                                    style={{ textDecoration: 'none' }}
                                >
                                    contact@mallikastore.com
                                </a>
                            </div>
                        </div>

                        {/* Store Name */}
                        <div className="text-end mt-3 mt-md-0">
                            © Maguva's Collection, Since 2020
                        </div>
                    </div>

                </footer>

            </div>

            {/* Features Modal */}
            <div
                className="modal fade"
                id="featuresModal"
                tabIndex="-1"
                aria-labelledby="featuresModalLabel"
                aria-hidden="true"
            >
                <div className="modal-dialog modal-lg modal-dialog-centered">
                    <div className="modal-content shadow-lg rounded-4">
                        <div className="modal-header bg-primary text-white">
                            <h5 className="modal-title fw-bold" id="featuresModalLabel">
                                Features of Maguva's Collection
                            </h5>
                            <button
                                type="button"
                                className="btn-close btn-close-white"
                                data-bs-dismiss="modal"
                                aria-label="Close"
                            ></button>
                        </div>

                        <div className="modal-body">
                            <ul className="list-group list-group-flush">
                                <li className="list-group-item">🎨 <strong>Custom Design Requests:</strong> Choose or specify a particular design, and we will source it for you.</li>
                                <li className="list-group-item">✈️ <strong>Imported from India:</strong> All products are carefully imported directly from India to the US.</li>
                                <li className="list-group-item">👗 <strong>Authentic Indian Fashion:</strong> Specially curated collections for Indian women combining traditional and modern styles.</li>
                                <li className="list-group-item">🛍️ <strong>Wide Range of Products:</strong> From sarees, lehengas, kurtis to rings, gold chains, and more.</li>
                                <li className="list-group-item">✅ <strong>Quality Assurance:</strong> High-quality fabrics and craftsmanship you can trust.</li>
                                <li className="list-group-item">💻 <strong>Easy Online Shopping:</strong> User-friendly interface with filters for category, color, size.</li>
                                <li className="list-group-item">🔒 <strong>Secure Payment & Fast Shipping:</strong> Safe checkout options and timely delivery.</li>
                                <li className="list-group-item">🤝 <strong>Excellent Customer Support:</strong> Reach out anytime for help or inquiries.</li>
                            </ul>
                        </div>

                        <div className="modal-footer border-top shadow-sm">
                            <button
                                type="button"
                                className="btn btn-secondary"
                                data-bs-dismiss="modal"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            </div>


            {/* Bootstrap Modal */}
            <div
                className="modal fade"
                id="aboutModal"
                tabIndex="-1"
                aria-labelledby="aboutModalLabel"
                aria-hidden="true"
                data-bs-backdrop="false"
            >
                <div className="modal-dialog modal-dialog-scrollable modal-xl">
                    <div className="modal-content shadow-lg rounded-4">
                        <div className="modal-header border-bottom shadow-sm">
                            <h1 className="modal-title fs-4 fw-bold text-primary" id="aboutModalLabel">
                                About Maguva's Collection
                            </h1>
                            <button
                                type="button"
                                className="btn-close"
                                data-bs-dismiss="modal"
                                aria-label="Close"
                            ></button>
                        </div>

                        <div className="modal-body">
                            {/* Intro Section */}
                            <section className="mb-4 p-3 border rounded shadow-sm bg-light">
                                <p>
                                    <strong>Maguva's Collection</strong> is a stylish and modern e-commerce platform dedicated to women's fashion.
                                    We offer a curated collection of ethnic and contemporary wear, along with elegant accessories.
                                </p>
                            </section>

                            {/* Features Section */}
                            <section className="mb-4 p-3 border-start border-4 border-primary bg-white shadow-sm rounded">
                                <h5 className="text-secondary fw-semibold mb-3">What You’ll Find Here:</h5>
                                <ul className="list-group list-group-flush">
                                    <li className="list-group-item">👗 <strong>Apparels:</strong> Sarees, Lehengas, Kurtis, Gowns, Jackets, and more</li>
                                    <li className="list-group-item">💍 <strong>Accessories:</strong> Rings, Gold Chains, Necklaces, Clutches, Scarves</li>
                                    <li className="list-group-item">🔎 <strong>Filters:</strong> Refine by size, color, and category</li>
                                    <li className="list-group-item">🛒 <strong>Shopping:</strong> Add to cart, checkout, and order placement</li>
                                    <li className="list-group-item">📦 <strong>Order Status:</strong> Track order progress in real-time</li>
                                    <li className="list-group-item">🛠️ <strong>Admin Panel:</strong> Manage products, orders, and inventory with ease</li>
                                </ul>
                            </section>

                            {/* Contact Info Section */}
                            <section className="mb-4 p-3 border rounded bg-light shadow-sm">
                                <h6 className="fw-bold text-dark">📞 For Enquiries</h6>
                                <p className="mb-1">
                                    <strong>Email:</strong> <a href="mailto:contact@mallikastore.com">contact@mallikastore.com</a><br />
                                    <strong>WhatsApp:</strong> <a href="https://wa.me/919876543210" target="_blank" rel="noreferrer">+91 98765 43210</a>
                                </p>
                            </section>

                            {/* Developer Credit */}
                            <section className="text-center mt-4">
                                <p className="text-muted mb-2">Application developed by:</p>
                                <div className="px-3 py-2 border border-2 rounded d-inline-block blink-box">
                                    <a
                                        href="https://vinayvamsheeresume.vercel.app/"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className=" text-decoration-none text-dark"
                                    >
                                        Vinay Vamshee
                                    </a>
                                </div>
                            </section>
                        </div>

                        <div className="modal-footer border-top shadow-sm">
                            <button
                                type="button"
                                className="btn btn-secondary"
                                data-bs-dismiss="modal"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
}
