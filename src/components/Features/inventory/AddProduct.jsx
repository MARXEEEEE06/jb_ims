import React, { useState, useEffect } from "react";
import BASE_URL from "../../../hooks/server/config";
import "./AddProduct.css";

function AddProduct({ onClose, onRefresh }){
    const [product_name, setProduct] = useState(''); 
    const [price, setPrice] = useState(''); 
    const [brand, setBrand] = useState(''); 
    const [variant, setvariant] = useState(''); 
    const [supplier, setSupplier] = useState(''); 
    const [category, setCategory] = useState(''); 
    const [unit, setUnit] = useState(''); 
    const [isloading, setIsLoading] = useState(false);

    const [brands, setBrands] = useState([]);
    const [suppliers, setSuppliers] = useState([]);
    const [brand_id, setBrandId] = useState('');
    const [supplier_id, setSupplierId] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try{
            const response = await fetch(`${BASE_URL}/add-product`,{
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    product_name,
                    brand_id,
                    category,
                    variant,
                    price: Number(price) || 0,
                    unit_type: unit,
                    quantity: 0,
                    supplier: suppliers.find(s => s.sup_info_id === Number(supplier_id))?.name || '',
                })
            });
            const data = await response.json();

            if(response.ok){
                onRefresh();   // ✅ re-fetches the list
                onClose();     // ✅ closes the modal
                alert("item added successfully!");
            }
            else{
                alert(data.error);
            }
        }catch(error){
            alert("JSX Server Error")
        }
        setIsLoading(false);
    };

    useEffect(() => {
        fetch(`${BASE_URL}/getbrands`).then(r => r.json()).then(setBrands);
        fetch(`${BASE_URL}/getsuppliers`).then(r => r.json()).then(setSuppliers);
    }, []);
    
    return(
        <div className="modal-add-product">
            <div className="modal-header">
                <h1>Add Product</h1>
                <button onClick={onClose}>X</button>
            </div>
            <div className="add-product-form">
                <form>
                    <label className="required" htmlFor="product">Product</label>
                    <input required type="text" id="product" className="input-product-detail" onChange={(e) => setProduct(e.target.value)} placeholder="e.g: Cement, Plywood" />

                    <label className="required" htmlFor="brand">Brand</label>
                    <select required id="brand" className="input-product-detail" onChange={(e) => setBrandId(e.target.value)} value={brand_id}>
                        <option value="">Select a brand</option>
                        {brands.map(b => (
                            <option key={b.brand_id} value={b.brand_id}>{b.brand_name}</option>
                        ))}
                    </select>

                    <label className="required" htmlFor="supplier">Supplier</label>
                    <select required id="supplier" className="input-product-detail" onChange={(e) => setSupplierId(e.target.value)} value={supplier_id}>
                        <option value="">Select a supplier</option>
                        {suppliers.map(s => (
                            <option key={s.sup_info_id} value={s.sup_info_id}>{s.name}</option>
                        ))}
                    </select>

                    <label className="required" htmlFor="price">Price</label>
                    <input required type="number" id="price" className="input-product-detail" onChange={(e) => setPrice(e.target.value)} placeholder="Enter price" />

                    <label className="required" htmlFor="variant">Variant</label>
                    <input required type="text" id="variant" className="input-product-detail" onChange={(e) => setvariant(e.target.value)} placeholder="e.g: 1x2, 2x2, 1/4, 3/4" />

                    <label className="required" htmlFor="category">Category</label>
                    <input required type="text" id="category" className="input-product-detail" onChange={(e) => setCategory(e.target.value)} placeholder="e.g: Cement, Sand, Tubular" />

                    <label className="required" htmlFor="Unit">Unit Type</label>
                    <input required type="text" id="Unit" className="input-product-detail" onChange={(e) => setUnit(e.target.value)} placeholder="e.g: Kg, Yard, Pieces" />

                    <div className="form-button">
                        <button className="add-btn" onClick={handleSubmit}>Add</button>
                        <button className="cancel-btn" onClick={onClose}>Cancel</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default AddProduct;