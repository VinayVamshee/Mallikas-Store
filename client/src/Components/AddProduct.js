import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function AddProduct() {
    const [baseline, setBaseline] = useState({});
    const [uploading, setUploading] = useState(false);

    const [item, setItem] = useState({
        name: '',
        category: 'apparel',
        sub_category: '',
        color: '',
        size: '',
        price: '',
        description: '',
        mainImage: '',
        otherImages: [''],
        available: true
    });

    useEffect(() => {
        axios
            .get('https://mallikas-store-server.vercel.app/Baseline')
            .then(res => setBaseline(res.data || {}))
            .catch(err => console.error('Error fetching baseline:', err));
    }, []);

    const getBaselineOptions = (type) => {
        const key = Object.keys(baseline || {}).find(k =>
            k.toLowerCase().includes(item.category) && k.toLowerCase().includes(type)
        );
        return baseline?.[key] || [];
    };

    const handleImageChange = (index, value) => {
        const updatedImages = [...item.otherImages];
        updatedImages[index] = value;
        setItem({ ...item, otherImages: updatedImages });
    };

    const addImageInput = () => {
        const last = item.otherImages[item.otherImages.length - 1];
        if (!last || last.trim() !== '') {
            setItem({ ...item, otherImages: [...item.otherImages, ''] });
        } else {
            alert('Upload current image before adding another.');
        }
    };

    const uploadToImgBB = async (file) => {
        const formData = new FormData();
        formData.append("key", "bf8e662104cc4c32321dc2f7ee77370f");
        formData.append("image", file);

        setUploading(true);
        try {
            const res = await axios.post("https://api.imgbb.com/1/upload", formData);
            return res.data.data.display_url;
        } catch (err) {
            console.error("Image upload failed", err);
            throw new Error("Image upload failed");
        } finally {
            setUploading(false);
        }
    };

    const handleItemSubmit = async (e) => {
        e.preventDefault();

        if (uploading) return alert("Image is still uploading...");

        if (!item.mainImage.trim()) {
            return alert("Please upload the main image.");
        }

        const cleanedItem = {
            ...item,
            price: Number(item.price),
            otherImages: item.otherImages.filter(url => url.trim() !== '')
        };

        try {
            await axios.post('https://mallikas-store-server.vercel.app/items', cleanedItem);
            alert('✅ Product saved successfully!');
            setItem({
                name: '',
                category: 'apparel',
                sub_category: '',
                color: '',
                size: '',
                price: '',
                description: '',
                mainImage: '',
                otherImages: [''],
                available: true
            });
        } catch (error) {
            console.error(error);
            alert('❌ Failed to save product');
        }
    };

    return (
        <div className="container py-3">
            <h4 className="mb-4 text-success">
                <i className="fa-solid fa-cart-plus me-2" />
                Add New Product
            </h4>

            <form onSubmit={handleItemSubmit}>
                <div className="row mb-3">
                    <div className="col-md-6">
                        <label className="form-label">
                            <i className="fa-solid fa-tag me-2" />Item Name
                        </label>
                        <input type="text" className="form-control" value={item.name}
                            onChange={e => setItem({ ...item, name: e.target.value })} />
                    </div>

                    <div className="col-md-6">
                        <label className="form-label">
                            <i className="fa-solid fa-indian-rupee-sign me-2" />Price
                        </label>
                        <input type="number" className="form-control" value={item.price}
                            onChange={e => setItem({ ...item, price: e.target.value })} />
                    </div>
                </div>

                <div className="row mb-3">
                    <div className="col-md-4">
                        <label className="form-label">Type</label>
                        <select className="form-select" value={item.category}
                            onChange={e => setItem({ ...item, category: e.target.value, sub_category: '', color: '', size: '' })}>
                            <option value="apparel">Apparel</option>
                            <option value="accessories">Accessories</option>
                        </select>
                    </div>

                    <div className="col-md-4">
                        <label className="form-label">Category</label>
                        <select className="form-select" value={item.sub_category}
                            onChange={e => setItem({ ...item, sub_category: e.target.value })}>
                            <option value="">Select Category</option>
                            {getBaselineOptions('category').map((cat, i) => (
                                <option key={i} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>

                    <div className="col-md-4">
                        <label className="form-label">Color</label>
                        <select className="form-select" value={item.color}
                            onChange={e => setItem({ ...item, color: e.target.value })}>
                            <option value="">Select Color</option>
                            {getBaselineOptions('colors').map((color, i) => (
                                <option key={i} value={color}>{color}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="row mb-3">
                    <div className="col-md-4">
                        <label className="form-label">Size</label>
                        <select className="form-select" value={item.size}
                            onChange={e => setItem({ ...item, size: e.target.value })}>
                            <option value="">Select Size</option>
                            {getBaselineOptions('sizes').map((size, i) => (
                                <option key={i} value={size}>{size}</option>
                            ))}
                        </select>
                    </div>

                    <div className="col-md-8">
                        <label className="form-label">Description</label>
                        <textarea className="form-control" rows={2} value={item.description}
                            onChange={e => setItem({ ...item, description: e.target.value })} />
                    </div>
                </div>

                <div className="mb-3">
                    <label className="form-label">
                        <i className="fa-solid fa-image me-2" />Main Image
                    </label>
                    <input type="file" className="form-control" accept="image/*"
                        onChange={async (e) => {
                            const file = e.target.files[0];
                            if (file) {
                                const url = await uploadToImgBB(file);
                                setItem({ ...item, mainImage: url });
                            }
                        }} />
                </div>

                <div className="mb-3">
                    <label className="form-label">
                        <i className="fa-solid fa-images me-2" />Other Images
                    </label>
                    {item.otherImages.map((img, idx) => (
                        <input key={idx} type="file" className="form-control mb-2" accept="image/*"
                            onChange={async (e) => {
                                const file = e.target.files[0];
                                if (file) {
                                    const url = await uploadToImgBB(file);
                                    handleImageChange(idx, url);
                                }
                            }} />
                    ))}
                    <button type="button" className="btn btn-sm btn-outline-secondary mt-2" onClick={addImageInput}>
                        <i className="fa-solid fa-plus me-1" />Add Another Image
                    </button>
                </div>

                <div className="mb-3">
                    <label className="form-label">
                        <i className="fa-solid fa-box-open me-2" />Availability
                    </label>
                    <select className="form-select" value={item.available ? 'true' : 'false'}
                        onChange={e => setItem({ ...item, available: e.target.value === 'true' })}>
                        <option value="true">In Stock</option>
                        <option value="false">Sold Out</option>
                    </select>
                </div>

                <div className="d-flex justify-content-end gap-2 mt-4">
                    <button type="submit" className="btn btn-success">
                        <i className="fa-solid fa-floppy-disk me-2" />Save Product
                    </button>
                    <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">
                        <i className="fa-solid fa-xmark me-1" />Cancel
                    </button>
                </div>
            </form>
        </div>
    );
}
