import React, { useRef } from 'react';
import jsPDF from 'jspdf';
import './ReceiptModal.css';

function ReceiptModal({ receipt, onClose }) {
    const receiptRef = useRef();

    // ✅ Print only the receipt content
    const handlePrint = () => {
        const content = receiptRef.current.innerHTML;
        const printWindow = window.open('', '_blank', 'width=600,height=800');
        printWindow.document.write(`
            <html>
                <head>
                    <title>Receipt - ${receipt.receipt_number}</title>
                    <style>
                        body { font-family: sans-serif; padding: 20px; }
                        table { width: 100%; border-collapse: collapse; }
                        td, th { border: 1px solid #000; padding: 6px; text-align: left; }
                        .receipt-header { text-align: center; border-bottom: 1px solid #000; padding-bottom: 10px; }
                        .receipt-meta { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #000; }
                        .receipt-totals { text-align: right; padding-top: 8px; }
                        .receipt-totals div { display: flex; justify-content: flex-end; gap: 20px; }
                        .signature-line { width: 160px; border-top: 1px solid #000; margin: 20px 0 4px auto; }
                    </style>
                </head>
                <body>${content}</body>
            </html>
        `);
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
        printWindow.close();
    };

    // ✅ Save as PDF using jsPDF
    const handleSavePDF = () => {
        const doc = new jsPDF({ unit: 'pt', format: 'a5' });
        const issued = new Date(receipt.issued_at).toLocaleDateString('en-US', {
            year: 'numeric', month: 'long', day: 'numeric'
        });

        let y = 40;
        const left = 40;
        const right = 380;
        const center = 210;

        // Header
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(20);
        doc.text('J.B.SERRANO', center, y, { align: 'center' });
        y += 18;
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.text('SANTO NINO, MASANTOL, PAMPANGA', center, y, { align: 'center' });
        y += 14;
        doc.text('CONTACT NO: 0912-345-6789', center, y, { align: 'center' });
        y += 14;
        doc.line(left, y, right, y);
        y += 14;

        // Receipt No & Date
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.text(`RECEIPT NO: ${receipt.receipt_number}`, left, y);
        doc.text(`DATE: ${issued}`, right, y, { align: 'right' });
        y += 14;
        doc.line(left, y, right, y);
        y += 14;

        // Customer Info
        doc.setFont('helvetica', 'normal');
        doc.text(`Customer: ${receipt.customer_name}`, left, y); y += 13;
        doc.text(`Address: ${receipt.customer_address || '—'}`, left, y); y += 13;
        doc.text(`Contact No: ${receipt.customer_contact || '—'}`, left, y); y += 16;

        // Items Table Header
        doc.line(left, y, right, y); y += 12;
        doc.setFont('helvetica', 'bold');
        doc.text('DESCRIPTION', left, y);
        doc.text('QTY', 210, y);
        doc.text('PRICE', 270, y);
        doc.text('TOTAL', 330, y);
        y += 10;
        doc.line(left, y, right, y); y += 12;

        // Items
        doc.setFont('helvetica', 'normal');
        receipt.items.forEach(item => {
            doc.text(item.prod_name || String(item.product_id), left, y);
            doc.text(String(item.quantity), 210, y);
            doc.text(`P${item.price}`, 270, y);
            doc.text(`P${item.price * item.quantity}`, 330, y);
            y += 14;
        });

        y += 6;
        doc.line(left, y, right, y); y += 14;

        // Totals
        doc.text('Subtotal:', 270, y);
        doc.text(`P${receipt.subtotal}`, right, y, { align: 'right' }); y += 13;
        doc.text('Tax (10%):', 270, y);
        doc.text(`P${receipt.tax_amount}`, right, y, { align: 'right' }); y += 13;
        doc.setFont('helvetica', 'bold');
        doc.text('Grand Total:', 270, y);
        doc.text(`P${receipt.total_price}`, right, y, { align: 'right' }); y += 20;

        // Payment Info
        doc.line(left, y, right, y); y += 14;
        doc.setFont('helvetica', 'bold');
        doc.text('PAYMENT INFORMATION', left, y); y += 13;
        doc.setFont('helvetica', 'normal');
        doc.text(`• ${receipt.payment_method.toUpperCase()}`, left, y); y += 13;
        doc.text(`• Amount: P${receipt.amount_tendered}`, left, y); y += 13;
        doc.text(`• Change: P${receipt.change_amount}`, left, y); y += 30;

        // Signature
        doc.line(220, y, right, y); y += 12;
        doc.text('Authorized Signed', 270, y, { align: 'center' });

        doc.save(`${receipt.receipt_number}.pdf`);
    };

    const issued = new Date(receipt.issued_at).toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric'
    });

    return (
        <div className="receipt-overlay">
            <div className="receipt-modal">
                <div className="receipt-actions">
                    <button onClick={handlePrint}>🖨 Print</button>
                    <button onClick={handleSavePDF}>💾 Save as PDF</button>
                    <button onClick={onClose}>✕ Close</button>
                </div>

                <div className="receipt-content" ref={receiptRef}>
                    <div className="receipt-header">
                        <h1>J.B.SERRANO</h1>
                        <p>SANTO NIÑO, MASANTOL, PAMPANGA</p>
                        <p>CONTACT NO: 0912-345-6789</p>
                    </div>
                    <div className="receipt-meta">
                        <strong>RECEIPT NO: {receipt.receipt_number}</strong>
                        <strong>DATE: {issued}</strong>
                    </div>
                    <div className="receipt-customer">
                        <p>Customer: {receipt.customer_name}</p>
                        <p>Address: {receipt.customer_address || '—'}</p>
                        <p>Contact No: {receipt.customer_contact || '—'}</p>
                    </div>
                    <table className="receipt-table">
                        <thead>
                            <tr>
                                <th>DESCRIPTION</th>
                                <th>QUANTITY</th>
                                <th>PRICE</th>
                                <th>TOTAL</th>
                            </tr>
                        </thead>
                        <tbody>
                            {receipt.items.map((item, idx) => (
                                <tr key={idx}>
                                    <td>{item.prod_name || item.product_id}</td>
                                    <td>{item.quantity}</td>
                                    <td>₱{item.price}</td>
                                    <td>₱{item.price * item.quantity}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div className="receipt-totals">
                        <div><span>Subtotal:</span><span>₱{receipt.subtotal}</span></div>
                        <div><span>Tax (10%):</span><span>₱{receipt.tax_amount}</span></div>
                        <div className="grand-total"><span>Grand Total:</span><span>₱{receipt.total_price}</span></div>
                    </div>
                    <div className="receipt-payment">
                        <p><strong>PAYMENT INFORMATION</strong></p>
                        <p>• {receipt.payment_method.toUpperCase()}</p>
                        <p>• Amount: ₱{receipt.amount_tendered}</p>
                        <p>• Change: ₱{receipt.change_amount}</p>
                    </div>
                    <div className="receipt-signature">
                        <div className="signature-line"></div>
                        <p>Authorized Signed</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ReceiptModal;