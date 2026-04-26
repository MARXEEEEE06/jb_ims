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
                    variant_id: item.variant_id,  // ❌ also missing entirely
                    product_id: item.product_id,
                    product_name,
                    price: Number(price) || 0,
                    brand,
                    variant,
                    supplier,
                    category_type: category,      // ✅
                    unit_type: unit,
                    quantity: item.quantity
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
    
    return(
        <div className="modal-edit-product">
            <div className="modal-header">
                <h1>Edit Product</h1>
                <button type="button" onClick={onClose}>X</button>
            </div>
            <div className="edit-product-form">
                <form>
                    <label className="required" for="product">Product</label>
                    <input required type="text" id="product" class="input-product-detail" value={product_name} onChange={(e) => setProduct(e.target.value)} placeholder="e.g: Cement, Plywood" />
                    
                    <label className="required" for="brand">Brand</label>
                    <input required type="text" id="brand" class="input-product-detail" value={brand} onChange={(e) => setBrand(e.target.value)} placeholder="e.g: Davis, Republic Portland" />
                    
                    <label className="required" for="supplier">Supplier</label>
                    <input required type="text" id="supplier" class="input-product-detail" value={supplier} onChange={(e) => setSupplier(e.target.value)} placeholder="Enter supplier's company name" />
                    
                    <label className="required" for="price">Price</label>
                    <input required type="number" id="price" class="input-product-detail" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="Enter price" />
                    
                    <label className="required" for="variant">Variant</label>
                    <input required type="text" id="product" class="input-product-detail" value={variant} onChange={(e) => setvariant(e.target.value)} placeholder="e.g: 1x2, 2x2, 1/4, 3/4" />
                    
                    <label className="required" for="category">Category</label>
                    <input required type="text" id="category" class="input-product-detail" value={category} onChange={(e) => setCategory(e.target.value)} placeholder="e.g: Cement, Sand, Tubular" />
                    
                    <label className="required" for="Unit">Unit Type</label>
                    <input required type="text" id="Unit" class="input-product-detail" value={unit} onChange={(e) => setUnit(e.target.value)} placeholder="e.g: Kg, Yard, Pieces" />
                    
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