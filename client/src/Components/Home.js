import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'

export default function Home() {

    const [items, setItems] = useState([]);
    const fetchItems = async () => {
        try {
            const response = await axios.get('http://localhost:3001/items');
            const sortedItems = response.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            setItems(sortedItems);
        } catch (error) {
            console.error('Failed to fetch items:', error);
        }
    };

    useEffect(() => {
        fetchItems();
    }, []);

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
                        <img src="https://i.pinimg.com/736x/41/1b/f9/411bf92ab7db3f5e560ff6899affecf7.jpg" className="d-block" alt="..." />
                        <div className="carousel-caption d-none d-md-block d-flex flex-column justify-content-center align-items-center bottom-50">
                            <h1>New Arrivals !</h1>
                            <p>Discover the latest sarees, elegant ensembles, and stunning jewelry to elevate your wardrobe.</p>
                            <a href='#new-arrivals'>Shop Now</a>
                        </div>
                    </div>
                    <div className="carousel-item">
                        <img src="https://img.businessoffashion.com/resizer/v2/PYW4AD3SPZFEPGCFIW3XW5HO5M.jpg?auth=d8701bdc2f1a1dc19aa45e96e51d5b7d3a1b21ee6e43f916bef4670d0b712462&width=1440" className="d-block" alt="..." />
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

                    {
                        items.slice(-20).map((item, index) => {
                            return (
                                <Link to="/Product" state={{ item }} key={index} className='item text-decoration-none text-dark' >
                                    <img src={item.mainImage} alt={item.name} />
                                    <div className='item-info'>
                                        <div className='item-name'>{item.name}</div>
                                        <div className='item-specifics'>{item.color} - {item.size}</div>
                                        <div className='item-price'>${item.price}</div>
                                    </div>
                                </Link>
                            )
                        })
                    }
                </div>
            </div>

        </div>
    )
}
