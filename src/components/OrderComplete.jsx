import React, { useRef, useState, useCallback, useEffect } from 'react';
import html2canvas from 'html2canvas';

function OrderComplete({
  isOpen,
  onClose,
  eventTitle,
  allOrders = [],
  orderId,
  eventDates,
  eventTime,
  eventLocation,
  eventImage
}) {
  const receiptRef = useRef(null);
  const [saving, setSaving] = useState(false);
  const savedRef = useRef(false); // prevent duplicate localStorage writes

  // Persist order once when modal opens
  useEffect(() => {
    if (isOpen && allOrders.length > 0 && orderId && !savedRef.current) {
      const orderData = {
        orderId,
        eventTitle,
        allOrders,
        dateSaved: new Date().toISOString(),
        eventMeta: {
          date: eventDates,
          time: eventTime,
          venue: eventLocation,
          image: eventImage
        },
        status: 'Pending'
      };

      const existingRaw = localStorage.getItem('userOrders');
      let parsedOrders = [];
      if (existingRaw) {
        try {
          parsedOrders = JSON.parse(existingRaw) || [];
        } catch (err) {
          console.error('Error parsing stored orders:', err);
          parsedOrders = [];
        }
      }

      parsedOrders.push(orderData);
      localStorage.setItem('userOrders', JSON.stringify(parsedOrders));
      savedRef.current = true;
      console.log('Order saved to profile:', orderData);
    }
  }, [
    isOpen,
    allOrders,
    orderId,
    eventTitle,
    eventDates,
    eventTime,
    eventLocation,
    eventImage
  ]);

  const saveImage = useCallback(async () => {
    if (!receiptRef.current || saving) return;
    setSaving(true);
    try {
      await new Promise(res => {
        requestAnimationFrame(() => setTimeout(res, 100));
      });

      const el = receiptRef.current;
      if (!el || el.offsetWidth === 0 || el.offsetHeight === 0) {
        throw new Error('Receipt not rendered');
      }

      const canvas = await html2canvas(el, {
        backgroundColor: '#ffffff',
        scale: 1,
        useCORS: true,
        allowTaint: false,
        logging: false,
        width: el.offsetWidth,
        height: el.offsetHeight
      });

      const dataUrl = canvas.toDataURL('image/png', 0.9);
      if (!dataUrl || dataUrl === 'data:,') throw new Error('Canvas export failed');

      const link = document.createElement('a');
      link.download = `order-${orderId || 'receipt'}.png`;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      alert('Image saved successfully!');
    } catch (err) {
      console.error('Save failed:', err);
      alert('Save failed: ' + err.message);
    } finally {
      setSaving(false);
    }
  }, [saving, orderId]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center px-4"
      style={{ zIndex: 11000, background: 'rgba(0,0,0,0.7)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-2xl relative max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-2xl font-bold text-gray-400 hover:text-gray-600"
          style={{ backgroundColor: 'transparent', border: 'none', outline: 'none' }}
          aria-label="Close"
        >
          ×
        </button>

        <div
          ref={receiptRef}
          className="select-none"
          style={{
            backgroundColor: '#ffffff',
            color: '#000000',
            fontFamily: 'Arial, sans-serif',
            padding: '12px'
          }}
        >
          <div style={{ textAlign: 'center', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '6px' }}>
              Order Completed !
            </h2>
          </div>

          {allOrders.length === 0 && (
            <p style={{ textAlign: 'center', color: '#888', fontSize: '14px' }}>No tickets.</p>
          )}

          {allOrders.length > 0 && (
            <div
              style={{
                
                overflow: 'hidden',
                maxWidth: '400px',
                margin: '0 auto'
              }}
            >
              <div>
                <p
                  style={{
                    padding: '16px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '20px',
                    fontWeight: '300'
                  }}
                >
                  Event <span>{eventTitle || '-'}</span>
                </p>
              </div>

              <div>
                <p
                  style={{
                    padding: '16px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '20px',
                    fontWeight: '300'
                  }}
                >
                  Order ID <span>{orderId || '-'}</span>
                </p>
              </div>

              {allOrders.map((o, i) => (
                <div
                  key={o.id || i}
                  style={{
                    padding: '16px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    borderBottom: i < allOrders.length - 1 ? '1px solid #e5e7eb' : 'none'
                  }}
                >
                  <span style={{ fontSize: '20px', fontWeight: '300' }}>
                    Ticket {String(i + 1).padStart(2, '0')}
                  </span>
                  <span style={{ fontSize: '20px', fontWeight: '300' }}>
                    {o.userName || '-'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-8 flex justify-center gap-4">
          <button
            onClick={saveImage}
            disabled={saving}
            className="px-10 py-4 w-100 h-15 text-white rounded-lg font-semibold hover:opacity-90 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-pink-500 transition"
            style={{ background: '#feb1c3' }}
          >
            {saving ? 'Saving...' : 'Save Image'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default OrderComplete;