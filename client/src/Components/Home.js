import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'

export default function Home() {

    const [items, setItems] = useState([]);
    const fetchItems = async () => {
        try {
            const response = await axios.get('https://mallikas-store-server.vercel.app/items');
            const sortedItems = response.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            setItems(sortedItems);
        } catch (error) {
            console.error('Failed to fetch items:', error);
        }
    };

    useEffect(() => {
        fetchItems();
    }, []);

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
        <div className='home'>

            <div className='shop-types'>
                <Link to='/Apparels' className='btn'><i className="fa-solid fa-shirt fa-lg me-2"></i>Apparels</Link>
                <a href="#new-arrivals" className='btn'><i className="fa-solid fa-star fa-lg me-2"></i> New Arrivals</a>
                <Link to='/Accessories' className='btn'><i className="fa-solid fa-ring fa-lg me-2"></i>Accessories</Link>
            </div>

            <div id="carouselExampleCaptions" className="carousel slide" data-bs-ride="carousel" data-bs-interval="1000">
                <div className="carousel-indicators">
                    <button type="button" data-bs-target="#carouselExampleCaptions" data-bs-slide-to="0" className="active" aria-current="true" aria-label="Slide 1"></button>
                    <button type="button" data-bs-target="#carouselExampleCaptions" data-bs-slide-to="1" aria-label="Slide 2"></button>
                    <button type="button" data-bs-target="#carouselExampleCaptions" data-bs-slide-to="2" aria-label="Slide 3"></button>
                </div>
                <div className="carousel-inner">
                    <div className="carousel-item active">
                        <img src="https://w0.peakpx.com/wallpaper/748/25/HD-wallpaper-indian-women-in-saree-culture-in-tradition-women-saree-indian.jpg" className="d-block" alt="..." />
                        <div className="carousel-caption d-none d-md-block d-flex flex-column justify-content-center align-items-center bottom-50">
                            <h1>New Arrivals !</h1>
                            <p>Discover the latest sarees, elegant ensembles, and stunning jewelry to elevate your wardrobe.</p>
                            <a href='#new-arrivals'>Shop Now</a>
                        </div>
                    </div>
                    <div className="carousel-item">
                        <img src="https://images.bazarindiano.com.br/uploads/2022/12/shutterstock_132714794-1-scaled.jpg" className="d-block" alt="..." />
                        <div className="carousel-caption d-none d-md-block d-flex flex-column justify-content-center align-items-center  top-40 bottom-50">
                            <h1>Apparels</h1>
                            <p>Step into style with our latest collection of sarees, kurtis, and trendy outfits designed for every occasion.</p>
                            <Link to='/Apparels' className='btn'>Shop Now</Link>
                        </div>
                    </div>
                    <div className="carousel-item">
                        <img src="https://images.pexels.com/photos/157888/fashion-glasses-go-pro-female-157888.jpeg?cs=srgb&dl=pexels-pixabay-157888.jpg&fm=jpg" className="d-block" alt="..." />
                        <div className="carousel-caption d-none d-md-block d-flex flex-column justify-content-center align-items-center  top-40 bottom-50">
                            <h1>Accessories</h1>
                            <p>Complete your look with the newest jewelry pieces—rings, chains, and more that shine with every step.</p>
                            <Link to='/Accessories' className='btn'>Shop Now</Link>
                        </div>
                    </div>
                </div>
                <button className="carousel-control-prev" type="button" data-bs-target="#carouselExampleCaptions" data-bs-slide="prev">
                    <span className="carousel-control-prev-icon" aria-hidden="true"></span>
                    <span className="visually-hidden">Previous</span>
                </button>
                <button className="carousel-control-next" type="button" data-bs-target="#carouselExampleCaptions" data-bs-slide="next">
                    <span className="carousel-control-next-icon" aria-hidden="true"></span>
                    <span className="visually-hidden">Next</span>
                </button>
            </div>

            <div className='new-arrivals' id='new-arrivals'>
                <h1>New Arrivals</h1>

                <div className='items'>
                    {items.length === 0 ? (
                        <div className="text-center my-4">
                            <span className="spinner-border tex" role="status" />
                            <div>Loading...</div>
                        </div>
                    ) : (
                        items.slice(-20).map((item, index) => (
                             <HoverItem key={index} item={item} />
                        ))
                    )}

                </div>
            </div>

        </div>
    )
}
