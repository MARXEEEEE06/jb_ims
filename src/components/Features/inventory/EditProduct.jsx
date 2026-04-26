import React, { useState, useEffect } from "react";
import BASE_URL from "../../../hooks/server/config";
import "./EditProduct.css";

function EditProduct({ item, onClose, onRefresh }){
    const [product_name, setProduct] = useState(item?.product_name || '');
    const [brand, setBrand] = useState(item?.brand || '');
    const [supplier, setSupplier] = useState(item?.supplier || '');
    const [price, setPrice] = useState(item?.price || 0);
    const [variant, setvariant] = useState(item?.variant || '');
    const [category, setCategory] = useState(item?.category_type || '');
    const [unit, setUnit] = useState(item?.unit_type || '');
    const [isloading, setIsLoading] = useState(false);

    const [brands, setBrands] = useState([]);
    const [suppliers, setSuppliers] = useState([]);
    const [brand_id, setBrandId] = useState(item?.brand_id || '');
    const [supplier_id, setSupplierId] = useState(item?.sup_info_id || '');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try{
            const response = await fetch(`${BASE_URL}/edit-product`,{
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    variant_id: item.variant_id,
                    product_id: item.product_id,
                    product_name,
                    brand_id,
                    variant,
                    supplier: suppliers.find(s => s.sup_info_id === Number(supplier_id))?.name || '',
                    category_type: category,
                    unit_type: unit,
                    quantity: item.quantity,
                    price: Number(price) || 0,
                })
            });
            const data = await response.json();

            if(response.ok){
                onRefresh();   // ✅ re-fetches the list
                onClose();     // ✅ closes the modal
                alert("Item updated successfully!");
            }
            else{
                alert(data.error);
            }
        }catch(error){
            alert("Server Error")
        }
        setIsLoading(false);
    };

    useEffect(() => {
        if (item) {
        setProduct(item.product_name);
        }
    }, [item]);

    useEffect(() => {
        fetch(`${BASE_URL}/getbrands`).then(r => r.json()).then(setBrands);
        fetch(`${BASE_URL}/getsuppliers`).then(r => r.json()).then(setSuppliers);
    }, []);
    
    return(
        <div className="modal-edit-product">
            <div className="modal-header">
                <h1>Edit Product</h1>
                <button type="button" onClick={onClose}>X</button>
            </div>
            <div className="edit-product-form">
                <form>
                    <label className="required" htmlFor="product">Product</label>
                    <input required type="text" id="product" className="input-product-detail" value={product_name} onChange={(e) => setProduct(e.target.value)} placeholder="e.g: Cement, Plywood" />

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
                    <input required type="number" id="price" className="input-product-detail" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="Enter price" />

                    <label className="required" htmlFor="variant">Variant</label>
                    <input required type="text" id="variant" className="input-product-detail" value={variant} onChange={(e) => setvariant(e.target.value)} placeholder="e.g: 1x2, 2x2, 1/4, 3/4" />

                    <label className="required" htmlFor="category">Category</label>
                    <input required type="text" id="category" className="input-product-detail" value={category} onChange={(e) => setCategory(e.target.value)} placeholder="e.g: Cement, Sand, Tubular" />

                    <label className="required" htmlFor="Unit">Unit Type</label>
                    <input required type="text" id="Unit" className="input-product-detail" value={unit} onChange={(e) => setUnit(e.target.value)} placeholder="e.g: Kg, Yard, Pieces" />

                    <div className="form-button">
                        <button className="add-btn" onClick={handleSubmit}>Edit</button>
                        <button type="button" className="cancel-btn" onClick={onClose}>Cancel</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default EditProduct;