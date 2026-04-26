import { useState, useEffect } from 'react';
import Sidebar from "../../components/sidebar/Sidebar.jsx";
import HeaderOverview from "../../components/header/Header.jsx";
import BASE_URL from '../../hooks/server/config.js';
import "./Reports.css";

const ACTION_LABELS = {
    LOGIN: 'Login',
    LOGOUT: 'Logout',
    FAILED_LOGIN: 'Failed Login',
    PASSWORD_CHANGED: 'Password Changed',
    PASSWORD_CHANGE_FAILED: 'Password Change Failed',
    STOCK_UPDATE: 'Stock Update',
    PRODUCT_CREATED: 'Product Created',
    PRODUCT_UPDATE: 'Product Update',
    PRODUCT_DELETED: 'Product Deleted',
    BRAND_CREATED: 'Brand Created',
    BRAND_UPDATE: 'Brand Update',
    BRAND_DELETED: 'Brand Deleted',
    SUPPLIER_ADDED: 'Supplier Added',
    SUPPLIER_UPDATE: 'Supplier Update',
    USER_ADDED: 'User Added',
    USER_UPDATED: 'User Updated',
    ORDER_CREATED: 'Order / Receipt',
};

const ACTION_CLASS = {
    LOGIN: 'badge-login',
    LOGOUT: 'badge-logout',
    FAILED_LOGIN: 'badge-failed',
    PASSWORD_CHANGED: 'badge-security',
    PASSWORD_CHANGE_FAILED: 'badge-security-failed',
    STOCK_UPDATE: 'badge-stock',
    PRODUCT_CREATED: 'badge-product',
    PRODUCT_UPDATE: 'badge-product',
    PRODUCT_DELETED: 'badge-product',
    BRAND_CREATED: 'badge-brand',
    BRAND_UPDATE: 'badge-brand',
    BRAND_DELETED: 'badge-brand',
    SUPPLIER_ADDED: 'badge-supplier',
    SUPPLIER_UPDATE: 'badge-supplier',
    USER_ADDED: 'badge-user',
    USER_UPDATED: 'badge-user-update',
    ORDER_CREATED: 'badge-order',
};

function Reports() {
    const [activeTab, setActiveTab] = useState('logs');

    // --- Logs state ---
    const [logs, setLogs] = useState([]);
    const [logsLoading, setLogsLoading] = useState(false);
    const [keyword, setKeyword] = useState('');
    const [filterUser, setFilterUser] = useState('');
    const [filterAction, setFilterAction] = useState('');
    const [filterStart, setFilterStart] = useState('');
    const [filterEnd, setFilterEnd] = useState('');
    const [sortOrder, setSortOrder] = useState('desc');
    const [users, setUsers] = useState([]);

    // --- Receipts state ---
    const [receipts, setReceipts] = useState([]);
    const [receiptsLoading, setReceiptsLoading] = useState(false);
    const [receiptKeyword, setReceiptKeyword] = useState('');
    const [receiptSortOrder, setReceiptSortOrder] = useState('desc');

    // --- Modal state ---
    const [modal, setModal] = useState(null); // { type: 'log'|'receipt', data: {} }

    // Fetch logs
    useEffect(() => {
        const fetchLogs = async () => {
            try {
                setLogsLoading(true);
                const res = await fetch(`${BASE_URL}/reports/logs`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
                });
                const data = await res.json();
                if (res.ok) {
                    setLogs(Array.isArray(data) ? data : []);
                    // Derive unique users
                    const uniqueUsers = [...new Set(data.map(l => l.username).filter(Boolean))];
                    setUsers(uniqueUsers);
                } else {
                    alert(data.error);
                }
            } catch {
                alert('Server Error');
            } finally {
                setLogsLoading(false);
            }
        };
        fetchLogs();
    }, []);

    // Fetch receipts
    useEffect(() => {
        const fetchReceipts = async () => {
            try {
                setReceiptsLoading(true);
                const res = await fetch(`${BASE_URL}/orders`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
                });
                const data = await res.json();
                if (res.ok) {
                    setReceipts(Array.isArray(data) ? data : []);
                } else {
                    alert(data.error);
                }
            } catch {
                alert('Server Error');
            } finally {
                setReceiptsLoading(false);
            }
        };
        fetchReceipts();
    }, []);

    // --- Log filtering ---
    const filteredLogs = logs
        .filter(l => {
            const logDate = l.created_at?.split('T')[0] ?? l.created_at?.split(' ')[0] ?? '';
            if (filterStart && logDate < filterStart) return false;
            if (filterEnd && logDate > filterEnd) return false;
            if (filterUser && l.username !== filterUser) return false;
            if (filterAction && l.action !== filterAction) return false;
            if (keyword) {
                const hay = `${l.username} ${l.action} ${JSON.stringify(l.details)}`.toLowerCase();
                if (!hay.includes(keyword.toLowerCase())) return false;
            }
            return true;
        })
        .sort((a, b) => sortOrder === 'asc'
            ? a.created_at?.localeCompare(b.created_at)
            : b.created_at?.localeCompare(a.created_at)
        );

    // --- Receipt filtering ---
    const filteredReceipts = receipts
        .filter(r => {
            if (!receiptKeyword) return true;
            const hay = `${r.customer_name} ${r.contact_num} ${r.address} ${r.payment_method}`.toLowerCase();
            return hay.includes(receiptKeyword.toLowerCase());
        })
        .sort((a, b) => receiptSortOrder === 'asc'
            ? `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`)
            : `${b.date} ${b.time}`.localeCompare(`${a.date} ${a.time}`)
        );

    const resetLogFilters = () => {
        setKeyword('');
        setFilterUser('');
        setFilterAction('');
        setFilterStart('');
        setFilterEnd('');
        setSortOrder('desc');
    };

    const formatDateTime = (val) => {
        if (!val) return '—';
        return val.replace('T', ' ').substring(0, 16);
    };

    const formatCurrency = (val) =>
        `₱${Number(val).toLocaleString('en-PH', { minimumFractionDigits: 2 })}`;

    const openLogModal = (log) => setModal({ type: 'log', data: log });
    const openReceiptModal = (receipt) => setModal({ type: 'receipt', data: receipt });
    const closeModal = () => setModal(null);

    return (
        <div className="main-container">
            <HeaderOverview
                items={activeTab === 'logs' ? logs : receipts}
                field={activeTab === 'logs' ? 'action' : 'customer_name'}
                keyword={activeTab === 'logs' ? keyword : receiptKeyword}
                setKeyword={activeTab === 'logs' ? setKeyword : setReceiptKeyword}
            />
            <Sidebar />

            <div className="container reports-content">

                {/* Tabs */}
                <div className="reports-tabs">
                    <button
                        className={`tab-btn ${activeTab === 'logs' ? 'tab-active' : ''}`}
                        onClick={() => setActiveTab('logs')}
                    >
                        Activity Logs
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'receipts' ? 'tab-active' : ''}`}
                        onClick={() => setActiveTab('receipts')}
                    >
                        Receipts
                    </button>
                </div>

                {/* ── LOGS TAB ── */}
                {activeTab === 'logs' && (
                    <>
                        <div className="filters-panel filters-row">
                            <div className="filter-group">
                                <label>From</label>
                                <input type="date" value={filterStart} onChange={e => setFilterStart(e.target.value)} />
                            </div>
                            <div className="filter-group">
                                <label>To</label>
                                <input type="date" value={filterEnd} onChange={e => setFilterEnd(e.target.value)} />
                            </div>
                            <select value={filterUser} onChange={e => setFilterUser(e.target.value)}>
                                <option value="">All Users</option>
                                {users.map(u => <option key={u} value={u}>{u}</option>)}
                            </select>
                            <select value={filterAction} onChange={e => setFilterAction(e.target.value)}>
                                <option value="">All Events</option>
                                {Object.entries(ACTION_LABELS).map(([val, label]) => (
                                    <option key={val} value={val}>{label}</option>
                                ))}
                            </select>
                            <select value={sortOrder} onChange={e => setSortOrder(e.target.value)}>
                                <option value="desc">Latest First</option>
                                <option value="asc">Oldest First</option>
                            </select>
                            <button className="reset-btn" onClick={resetLogFilters}>Reset</button>
                        </div>

                        <div className="item-table">
                            {logsLoading ? <p>Loading...</p> : (
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Date &amp; Time</th>
                                            <th>User</th>
                                            <th>Event</th>
                                            <th>Details</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredLogs.length === 0 ? (
                                            <tr>
                                                <td colSpan={4} className="empty-row">No logs found.</td>
                                            </tr>
                                        ) : filteredLogs.map((log) => (
                                            <tr key={log.log_id}>
                                                <td className="td-muted">{formatDateTime(log.created_at)}</td>
                                                <td><strong>{log.username ?? '—'}</strong></td>
                                                <td>
                                                    <span className={`action-badge ${ACTION_CLASS[log.action] ?? ''}`}>
                                                        {ACTION_LABELS[log.action] ?? log.action}
                                                    </span>
                                                </td>
                                                <td>
                                                    <button className="details-btn" onClick={() => openLogModal(log)}>
                                                        View
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </>
                )}

                {/* ── RECEIPTS TAB ── */}
                {activeTab === 'receipts' && (
                    <>
                        <div className="filters-panel filters-row">
                            <select value={receiptSortOrder} onChange={e => setReceiptSortOrder(e.target.value)}>
                                <option value="desc">Latest First</option>
                                <option value="asc">Oldest First</option>
                            </select>
                        </div>

                        <div className="item-table">
                            {receiptsLoading ? <p>Loading...</p> : (
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Receipt #</th>
                                            <th>Customer</th>
                                            <th>Date</th>
                                            <th>Payment</th>
                                            <th>Amount</th>
                                            <th>Details</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredReceipts.length === 0 ? (
                                            <tr>
                                                <td colSpan={6} className="empty-row">No receipts found.</td>
                                            </tr>
                                        ) : filteredReceipts.map((r) => (
                                            <tr key={r.receipt_id}>
                                                <td className="td-muted">#{r.receipt_id}</td>
                                                <td><strong>{r.customer_name}</strong></td>
                                                <td className="td-muted">{r.date} {r.time}</td>
                                                <td>
                                                    <span className={`action-badge ${r.payment_method === 'cash' ? 'badge-order' : 'badge-login'}`}>
                                                        {r.payment_method}
                                                    </span>
                                                </td>
                                                <td>{formatCurrency(r.amount_tendered)}</td>
                                                <td>
                                                    <button className="details-btn" onClick={() => openReceiptModal(r)}>
                                                        View
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </>
                )}
            </div>

            {/* ── MODAL ── */}
            {modal && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal-content reports-modal" onClick={e => e.stopPropagation()}>
                        {modal.type === 'log' && (
                            <>
                                <h2>{ACTION_LABELS[modal.data.action] ?? modal.data.action}</h2>
                                <div className="modal-table">
                                    <div className="modal-row"><span className="modal-label">Date &amp; Time</span><span className="modal-value">{formatDateTime(modal.data.created_at)}</span></div>
                                    <div className="modal-row"><span className="modal-label">User</span><span className="modal-value">{modal.data.username ?? '—'}</span></div>
                                    <div className="modal-row"><span className="modal-label">Event</span><span className="modal-value">{ACTION_LABELS[modal.data.action] ?? modal.data.action}</span></div>
                                    <div className="modal-row"><span className="modal-label">Target</span><span className="modal-value">{modal.data.target_type ?? '—'}{modal.data.target_id ? ` #${modal.data.target_id}` : ''}</span></div>
                                    {modal.data.details && Object.entries(
                                        typeof modal.data.details === 'string'
                                            ? JSON.parse(modal.data.details)
                                            : modal.data.details
                                    ).map(([k, v]) => (
                                        <div className="modal-row" key={k}>
                                            <span className="modal-label">{k}</span>
                                            <span className="modal-value">
                                                {typeof v === 'object' ? JSON.stringify(v) : String(v)}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                        {modal.type === 'receipt' && (
                            <>
                                <h2>Receipt #{modal.data.receipt_id}</h2>
                                <div className="modal-table">
                                    <div className="modal-row"><span className="modal-label">Customer</span><span className="modal-value">{modal.data.customer_name}</span></div>
                                    <div className="modal-row"><span className="modal-label">Contact</span><span className="modal-value">{modal.data.contact_num}</span></div>
                                    <div className="modal-row"><span className="modal-label">Address</span><span className="modal-value">{modal.data.address}</span></div>
                                    <div className="modal-row"><span className="modal-label">Date</span><span className="modal-value">{modal.data.date} {modal.data.time}</span></div>
                                    <div className="modal-row"><span className="modal-label">Payment</span><span className="modal-value">{modal.data.payment_method}</span></div>
                                    <div className="modal-row"><span className="modal-label">Amount Tendered</span><span className="modal-value">{formatCurrency(modal.data.amount_tendered)}</span></div>
                                </div>
                            </>
                        )}
                        <button className="modal-close-btn" onClick={closeModal}>Close</button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Reports;
