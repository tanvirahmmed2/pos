'use client'
import React from 'react'
import { FaPrint } from "react-icons/fa";

const PrintOrder = ({ order }) => {
  const printOrder = () => {
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    document.body.appendChild(iframe);

    const receiptContent = `
      <html>
        <head>
          <style>
            @page { margin: 0; size: 80mm auto; }
            body { 
              font-family: 'Courier New', Courier, monospace; 
              width: 72mm; margin: 0 auto; padding: 5mm 2mm;
              font-size: 12px; color: #000; line-height: 1.4;
            }
            .center { text-align: center; }
            .bold { font-weight: bold; }
            .divider { border-top: 1px dashed #000; margin: 8px 0; }
            table { width: 100%; border-collapse: collapse; }
            th { border-bottom: 1px solid #000; text-align: left; }
            .qty { width: 15%; }
            .name { width: 55%; }
            .price { width: 30%; text-align: right; }
          </style>
        </head>
        <body>
          <div class="center">
            <h2 style="margin:0; font-size: 18px;">NIZAM VARIETIES</h2>
            <p style="margin:2px 0;">Phone: ${order.phone}</p>
            <div class="divider"></div>
            <p class="bold">INVOICE: #${order.order_id}</p>
            <p>${new Date(order.date).toLocaleString()}</p>
          </div>

          <p>Customer: <span class="bold">${order.name}</span></p>

          <table>
            <thead>
              <tr>
                <th class="qty">Qty</th>
                <th class="name">Item</th>
                <th class="price">Total</th>
              </tr>
            </thead>
            <tbody>
              ${order.product_list?.map(item => `
                <tr>
                  <td class="qty">${item.quantity}</td>
                  <td class="name">${item.name}</td>
                  <td class="price">${(parseFloat(item.sale_price) * item.quantity).toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="divider"></div>

          <div style="width: 100%;">
            <div style="display:flex; justify-content: space-between;">
              <span>Subtotal:</span><span>৳${parseFloat(order.subtotal || 0).toFixed(2)}</span>
            </div>
            ${order.discount > 0 ? `
            <div style="display:flex; justify-content: space-between;">
              <span>Discount:</span><span>-৳${parseFloat(order.discount).toFixed(2)}</span>
            </div>` : ''}
            <div style="display:flex; justify-content: space-between; font-weight: bold; font-size: 14px; margin-top: 5px; border-top: 1px solid #000; padding-top: 5px;">
              <span>NET TOTAL:</span><span>৳${parseFloat(order.total_amount).toFixed(2)}</span>
            </div>
          </div>

          <div class="center" style="margin-top: 15px;">
            <p style="margin:0;">Method: ${order.payment_method?.toUpperCase()}</p>
            <p style="margin:5px 0 0 0; font-size: 10px;">Thank You for Shopping!</p>
          </div>
        </body>
      </html>
    `;

    const pri = iframe.contentWindow;
    pri.document.open();
    pri.document.write(receiptContent);
    pri.document.close();

    setTimeout(() => {
      pri.focus();
      pri.print();
      document.body.removeChild(iframe);
    }, 500);
  }

  return (
    <button onClick={printOrder} className='mt-4 flex items-center justify-center gap-2 bg-gray-100 w-full py-2 rounded-lg hover:bg-gray-200 text-black  transition-all'>
      <FaPrint /> <span>Print Receipt</span>
    </button>
  )
}

export default PrintOrder
