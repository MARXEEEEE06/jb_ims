import React, { useState, useEffect } from "react";
import BASE_URL from "../../../hooks/server/config";
import getAuthHeaders from "../../../hooks/server/getAuthHeaders.js";

import Toast from "../modals/Toast.jsx";
import { useToast } from "../../../hooks/useToast.js";

import "./EditProduct.css";

function EditProduct({ item, onClose, onRefresh, onToast }){
    const [product_name, setProduct] = useState(item?.product_name || '');
    const [price, setPrice] = useState(item?.price || 0);
    const [variant, setvariant] = useState(item?.variant || '');
    const [category, setCategory] = useState(item?.category_type || '');
    const [unit, setUnit] = useState(item?.unit_type || '');
    const [isloading, setIsLoading] = useState(false);
    const { toast, showToast, clearToast } = useToast();

    const [brands, setBrands] = useState([]);
    const [suppliers, setSuppliers] = useState([]);
    const [brand_id, setBrandId] = useState('');
    const [supplier_id, setSupplierId] = useState('');

    // Store originals for comparison
    const [originalValues, setOriginalValues] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!originalValues) {
            showToast("Still loading product details...");
            return;
        }

        // Check if anything changed
        const hasChanges =
            product_name !== originalValues.product_name ||
            String(price) !== String(originalValues.price) ||
            variant !== originalValues.variant ||
            category !== originalValues.category ||
            unit !== originalValues.unit ||
            brand_id !== originalValues.brand_id ||
            supplier_id !== originalValues.supplier_id;

        if (!hasChanges) {
            showToast("No changes made.");
            return;
        }

        setIsLoading(true);
        try {
            if (!item?.variant_id || !item?.product_id) {
                showToast("Missing product identifiers.");
                setIsLoading(false);
                return;
            }

            const response = await fetch(`${BASE_URL}/edit-product`, {
                method: "POST",
                headers: getAuthHeaders({ "Content-Type": "application/json" }),
                body: JSON.stringify({
                    variant_id: item.variant_id,
                    product_id: item.product_id,
                    product_name,
                    brand_id,
                    variant,
                    supplier_id: Number(supplier_id) || null,
                    category_type: category,
                    unit_type: unit,
                    quantity: item.quantity,
                    price: Number(price) || 0,
                })
            });
            const data = await response.json().catch(() => ({}));

            if (response.ok) {
                // Show success toast in the parent (modal will unmount on close)
                if (typeof onToast === "function") onToast("Item updated successfully!");
                else showToast("Item updated successfully!");
                onRefresh();
                onClose();
            } else {
                if (typeof onToast === "function") onToast(data.error || "Failed to update product.");
                else showToast(data.error || "Failed to update product.");
            }
        } catch (error) {
            if (typeof onToast === "function") onToast("Server Error");
            else showToast("Server Error");
        }
        setIsLoading(false);
    };

    useEffect(() => {
        const fetchData = async () => {
            if (!item) {
                setOriginalValues(null);
                return;
            }

            // Reset editable fields whenever the selected item changes
            setProduct(item?.product_name || '');
            setPrice(item?.price || 0);
            setvariant(item?.variant || '');
            setCategory(item?.category_type || '');
            setUnit(item?.unit_type || '');

            try {
                const [brandsData, suppliersData] = await Promise.all([
                    fetch(`${BASE_URL}/getbrands`).then(r => r.json()),
                    fetch(`${BASE_URL}/getsuppliers`).then(r => r.json()),
                ]);
                setBrands(brandsData);
                setSuppliers(suppliersData);

                const matchedBrand = brandsData.find(b => b.brand_name === item?.brand);
                const matchedSupplier = suppliersData.find(s => s.name === item?.supplier);

                const resolvedBrandId = String(matchedBrand?.brand_id || '');
                const resolvedSupplierId = String(matchedSupplier?.sup_info_id || '');

                setBrandId(resolvedBrandId);
                setSupplierId(resolvedSupplierId);

                // Snapshot originals after IDs are resolved
                setOriginalValues({
                    product_name: item?.product_name || '',
                    price: item?.price || 0,
                    variant: item?.variant || '',
                    category: item?.category_type || '',
                    unit: item?.unit_type || '',
                    brand_id: resolvedBrandId,
                    supplier_id: resolvedSupplierId,
                });
            } catch (err) {
                showToast("Failed to load brands/suppliers.");
                setOriginalValues(null);
            }
        };

        fetchData();
    }, [item, showToast]);

    
    return(
        <div className="modal-edit-product">
            <div className="modal-header">
                <h1>Edit Product</h1>
                <button type="button" onClick={onClose}>X</button>
            </div>
            <div className="edit-product-form">
                <form onSubmit={handleSubmit}>
                    <label className="required" htmlFor="product">Product</label>
                    <input required type="text" id="product" className="input-product-detail" value={product_name} onChange={(e) => setProduct(e.target.value)} placeholder="e.g: Cement, Plywood" />

                    <label className="required" htmlFor="brand">Brand</label>
                    <select required id="brand" className="input-product-detail" onChange={(e) => setBrandId(e.target.value)} value={brand_id}>
                        <option value="">Select a brand</option>
                        {brands.map(b => (
                            <option key={b.brand_id} value={String(b.brand_id)}>{b.brand_name}</option>
                        ))}
                    </select>

                    <label className="required" htmlFor="supplier">Supplier</label>
                    <select required id="supplier" className="input-product-detail" onChange={(e) => setSupplierId(e.target.value)} value={supplier_id}>
                        <option value="">Select a supplier</option>
                        {suppliers.map(s => (
                            <option key={s.sup_info_id} value={String(s.sup_info_id)}>{s.name}</option>
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
                        <button className="add-btn" type="submit" disabled={isloading}>
                            {isloading ? "Saving..." : "Edit"}
                        </button>
                        <button type="button" className="cancel-btn" onClick={onClose}>Cancel</button>
                    </div>
                </form>
            </div>
            {toast && (
                <Toast
                    key={toast.key}
                    message={toast.message}
                    duration={toast.duration}
                    onDone={clearToast}
                />
            )}
        </div>
    );
}

export default EditProduct;
