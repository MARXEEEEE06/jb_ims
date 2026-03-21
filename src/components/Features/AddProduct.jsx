import React, { useState } from "react";
import "../../css/Site.css"
import "./AddProduct.css";

function AddProduct(props){
    const [prod_name, setProduct] = useState(''); 
    const [price, setPrice] = useState(''); 
    const [brand, setBrand] = useState(''); 
    const [variety, setVariety] = useState(''); 
    const [supplier, setSupplier] = useState(''); 
    const [category, setCategory] = useState(''); 
    const [unit, setUnit] = useState(''); 
    const [isloading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try{
            const response = await fetch("http://192.168.254.142:5000/api/product",{
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    prod_name,
                    price: Number(price) || 0,
                    brand,
                    variety,
                    supplier,
                    category,
                    unit_type: unit,  // must be provided
                    stock_quantity: 0 // optional, backend default
                })
            });
            const data = await response.json();

            if(response.ok){
                alert("item added successfully!");
            }
            else{
                alert(data.error);
            }
        }catch(error){
            alert("Server Error")
        }
        setIsLoading(false);
    };
    
    return(
        <div className="modal-add-product">
            <div className="modal-header">
                <h1>Add Product</h1>
                <button onClick={props.onClose}>X</button>
            </div>
            <div className="add-product-form">
                <form>
                    <label className="required" for="product">Product</label>
                    <input required type="text" id="product" class="input-product-detail" onChange={(e) => setProduct(e.target.value)} placeholder="e.g: Cement, Plywood" />
                    
                    <label className="required" for="brand">Brand</label>
                    <input required type="text" id="brand" class="input-product-detail" onChange={(e) => setBrand(e.target.value)} placeholder="e.g: Davis, Republic Portland" />
                    
                    <label className="required" for="supplier">Supplier</label>
                    <input required type="text" id="supplier" class="input-product-detail" onChange={(e) => setSupplier(e.target.value)} placeholder="Enter supplier's company name" />
                    
                    <label className="required" for="price">Price</label>
                    <input required type="number" id="price" class="input-product-detail" onChange={(e) => setPrice(e.target.value)} placeholder="Enter price" />
                    
                    <label className="required" for="variant">Variant</label>
                    <input required type="text" id="product" class="input-product-detail" onChange={(e) => setVariety(e.target.value)} placeholder="e.g: 1x2, 2x2, 1/4, 3/4" />
                    
                    <label className="required" for="category">Category</label>
                    <input required type="text" id="category" class="input-product-detail" onChange={(e) => setCategory(e.target.value)} placeholder="e.g: Cement, Sand, Tubular" />
                    
                    <label className="required" for="Unit">Unit Type</label>
                    <input required type="text" id="Unit" class="input-product-detail" onChange={(e) => setUnit(e.target.value)} placeholder="e.g: Kg, Yard, Pieces" />
                    
                    <div className="form-button">
                        <button className="add-btn" onClick={handleSubmit}>Add</button>
                        <button className="cancel-btn" onClick={props.onClose}>Cancel</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default AddProduct;