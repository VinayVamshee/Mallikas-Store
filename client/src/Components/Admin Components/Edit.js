import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function Edit() {
    const [baseline, setBaseline] = useState({
        apparels_category: [],
        apparels_colors: [],
        apparels_sizes: [],
        accessories_category: [],
        accessories_colors: [],
        accessories_sizes: [],
    });

    const [baselineInputs, setBaselineInputs] = useState({});

    useEffect(() => {
        axios.get('https://mallikas-store-server.vercel.app/Baseline')
            .then(res => {
                if (res.data) setBaseline(res.data);
            })
            .catch(err => console.error('Error fetching baseline:', err));
    }, []);

    const updateBaseline = () => {
        const dataToSend = { ...baseline };
        delete dataToSend._id;
        delete dataToSend.__v;

        axios.post('https://mallikas-store-server.vercel.app/Baseline', dataToSend)
            .then(() => alert('Baseline updated successfully'))
            .catch(() => alert('Error updating baseline'));
    };

    const sectionIcon = {
        apparels: <i className="fa-solid fa-shirt me-2 text-danger"></i>,
        accessories: <i className="fa-solid fa-gem me-2 text-purple"></i>,
    };

    return (
        <div className="container py-1">

            <div className="d-flex justify-content-end mb-2">
                <button className="btn btn-success px-4" onClick={updateBaseline}>
                    <i className="fa-solid fa-floppy-disk me-2"></i>Save All Changes
                </button>
            </div>

            {['apparels', 'accessories'].map(type => (
                <div key={type} className="card shadow-sm mb-4">
                    <div className="card-header bg-light">
                        <h5 className="mb-0 d-flex align-items-center">
                            {sectionIcon[type]} {type.charAt(0).toUpperCase() + type.slice(1)}
                        </h5>
                    </div>

                    <div className="card-body">
                        {['category', 'colors', 'sizes'].map(field => {
                            const key = `${type}_${field}`;
                            return (
                                <div key={field} className="mb-4">
                                    <label className="form-label text-capitalize fw-semibold">{field}</label>
                                    <div className="input-group mb-2">
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder={`Add ${field}`}
                                            value={baselineInputs[key] || ''}
                                            onChange={e => setBaselineInputs(prev => ({ ...prev, [key]: e.target.value }))}
                                        />
                                        <button
                                            className="btn btn-outline-primary"
                                            type="button"
                                            title="Click to add item to the list below"
                                            onClick={() => {
                                                if (!baselineInputs[key]?.trim()) return;
                                                setBaseline(prev => ({
                                                    ...prev,
                                                    [key]: [...(prev[key] || []), baselineInputs[key].trim()],
                                                }));
                                                setBaselineInputs(prev => ({ ...prev, [key]: '' }));
                                            }}
                                        >
                                            <i className="fa-solid fa-plus"></i>
                                        </button>
                                    </div>

                                    <div className="row">
                                        {(baseline[key] || []).map((item, idx) => (
                                            <div key={idx} className="col-md-3 mb-2 d-flex">
                                                <div className="flex-grow-1 border p-1 bg-white">
                                                    {item}
                                                </div>
                                                <button
                                                    type="button"
                                                    className="btn btn-outline-danger btn-sm "
                                                    onClick={() => {
                                                        setBaseline(prev => ({
                                                            ...prev,
                                                            [key]: prev[key].filter((_, i) => i !== idx),
                                                        }));
                                                    }}
                                                >
                                                    <i className="fa-solid fa-trash"></i>
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            ))}

        </div>
    );
}
