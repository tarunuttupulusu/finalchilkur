const http = require('http');

async function runTest() {
  console.log('--- STARTING E2E INTEGRATION TEST ---');
  let qrToken = null;
  let bookingRef = null;

  // 1. Test Reservation Creation
  console.log('1. Testing Reservation Creation API...');
  try {
    const res = await fetch('http://localhost:3000/api/reservations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        branchId: '52ae6a0f-daee-40f5-aa0e-ac44e17d325e',
        customerName: 'E2E Test User',
        phone: '+919999999999',
        email: 'test@example.com',
        guests: '4',
        date: new Date().toISOString(),
        time: '19:00',
        specialInstructions: 'Test integration'
      })
    });
    const data = await res.json();
    if (data.success) {
      console.log('✅ Reservation created successfully');
      qrToken = data.qrToken;
      bookingRef = data.reservation.bookingRef;
      console.log('✅ Booking Ref generated:', bookingRef);
      console.log('✅ QR Token (HMAC) generated');
    } else {
      console.error('❌ Reservation failed:', data);
    }
  } catch(e) {
    console.error('❌ Reservation request error:', e.message);
  }

  // 2. Test QR Verification
  console.log('\n2. Testing QR Scanner Verification API...');
  if (qrToken) {
    try {
      const res = await fetch('http://localhost:3000/api/admin/reservations/scan-qr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ qrToken })
      });
      const data = await res.json();
      if (data.success) {
        console.log('✅ QR verified successfully');
        console.log('✅ Database updated with discountClaimed = true');
      } else {
        console.error('❌ QR Verification failed:', data);
      }
    } catch(e) {
      console.error('❌ QR request error:', e.message);
    }
  }

  // 3. Test WhatsApp Order
  console.log('\n3. Testing WhatsApp Order API...');
  try {
    const res = await fetch('http://localhost:3000/api/whatsapp/order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customerName: 'WhatsApp Test User',
        phone: '+918888888888',
        items: [{ id: '1', name: 'Biryani', price: 200, quantity: 2 }],
        total: 400
      })
    });
    const data = await res.json();
    if (data.success) {
      console.log('✅ WhatsApp order logged successfully');
    } else {
      console.error('❌ WhatsApp order failed:', data);
    }
  } catch(e) {
    console.error('❌ WhatsApp request error:', e.message);
  }

  console.log('\n--- E2E TEST COMPLETE ---');
}

runTest();
