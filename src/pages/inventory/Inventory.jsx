import { useState, useEffect } from 'react';
import Sidebar from "../../components/sidebar/Sidebar.jsx";
import HeaderOverview from "../../components/header/Header.jsx";
import "./Inventory.css";
import { COLUMNS } from '../../hooks/data/tableColumns.js';

import BASE_URL from '../../hooks/server/config.js';
import getStatusClass from '../../hooks/inventory/GetStatus.js';

// Import filter hooks
import { useKeywordFilter } from '../../hooks/filters/useKeywordFilter';
import { useBrandFilter } from '../../hooks/filters/useBrandFilter';
import { useSupplierFilter } from '../../hooks/filters/useSupplierFilter';
import { useStatusFilter } from '../../hooks/filters/useStatusFilter';
import { useSort } from '../../hooks/filters/useSort';

function Inventory() {
    const [items, setItems] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const visibleKeys = ['sku', 'product-name', 'brand', 'variant', 'supplier', 'quantity', 'status'];
    const columns = COLUMNS.filter(col => visibleKeys.includes(col.key));

    // Start from raw items
    const { filtered: keywordFiltered, keyword, setKeyword } = useKeywordFilter(items);
    // Apply brand filter on keywordFiltered
    const { filtered: brandFiltered, brand, setBrand, brands } = useBrandFilter(keywordFiltered, items);
    // Apply supplier filter on brandFiltered
    const { filtered: supplierFiltered, supplier, setSupplier, suppliers } = useSupplierFilter(brandFiltered, items);
    // Apply status filter on supplierFiltered
    const { filtered: statusFiltered, status, setStatus } = useStatusFilter(supplierFiltered, 'status');
    // Apply sorting on statusFiltered
    const { sorted: finalFiltered, sortKey, setSortKey, order, setOrder } = useSort(statusFiltered);

    useEffect(() => {
        const fetchInventory = async () => {
            try {
                setIsLoading(true);
                const response = await fetch(`${BASE_URL}/inventory`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({}),
                });
                const data = await response.json();

                if (response.ok) {
                    setItems(Array.isArray(data) ? data : [data]);
                } else {
                    alert(data.error);
                }
            } catch (error) {
                alert("Server Error");
            } finally {
                setIsLoading(false);
            }
        };

        fetchInventory();
    }, []);

    getStatusClass();

    return (
        <div className="main-container">
            <HeaderOverview
                items={items}
                field="product_name"
                keyword={keyword}
                setKeyword={setKeyword}
            />
            <Sidebar />

            <div className="container inventory-content">
                <div className="filters-panel">
                    {/* <input
                        type="text"
                        placeholder="Search product..."
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                    /> */}
                    <select value={brand} onChange={(e) => setBrand(e.target.value)}>
                        <option value="">All Brands</option>
                        {brands.map(b => (
                            <option key={b} value={b}>{b}</option>
                        ))}
                    </select>

                    <select value={supplier} onChange={(e) => setSupplier(e.target.value)}>
                        <option value="">All Suppliers</option>
                        {suppliers.map(s => (
                            <option key={s} value={s}>{s}</option>
                        ))}
                    </select>
                    <select value={status} onChange={(e) => setStatus(e.target.value)}>
                        <option value="">All Status</option>
                        <option value="in-stock">In Stock</option>
                        <option value="low">Low Stock</option>
                        <option value="critical">Critical</option>
                        <option value="out-of-stock">Out of Stock</option>
                    </select>
                    <select value={sortKey} onChange={(e) => setSortKey(e.target.value)}>
                        <option value="">Sort by...</option>
                        <option value="product_name">Alphabetical</option>
                        <option value="quantity">Stock</option>
                        <option value="status">Status</option>
                    </select>
                    <select value={order} onChange={(e) => setOrder(e.target.value)}>
                        <option value="asc">Ascending</option>
                        <option value="desc">Descending</option>
                    </select>
                </div>

                <div className="item-table">
                    {isLoading ? <p>Loading...</p> : (
                        <table>
                            <thead>
                                <tr>
                                    {/* <th className='sku'>sku</th>
                                    <th className='product-name'>PRODUCT</th>
                                    <th className='brand'>BRAND</th>
                                    <th className='variant'>VARIETY</th>
                                    <th className='status'>SUPPLIER</th>
                                    <th className='status'>STOCK</th>
                                    <th className='status'>STATUS</th> */ }

                                    {columns.map(col => (
                                        <th key={col.key} className={col.key}>{col.label}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {finalFiltered.map((item, idx) => (
                                    <tr key={idx}>
                                        <td>{item.sku}</td>
                                        <td>{item.product_name}</td>
                                        <td>{item.brand}</td>
                                        <td>{item.variant}</td>
                                        <td>{item.supplier}</td>
                                        <td>{item.quantity}</td>
                                        <td>
                                            <div className={`status-container ${getStatusClass(item.quantity)}`}>
                                                {item.status}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Inventory;