const axios = require('axios');

async function testAPI() {
  try {
    console.log('Testing notification creation...');

    const response = await axios.post('http://localhost:3000/api/notifications', {
      user_id: 1,
      address: '123 Main St',
      waste_type: 'plastic',
      estimated_volume: 2.5
    });

    console.log('✅ Notification created successfully:', response.data);

    console.log('\nTesting notification retrieval...');
    const getResponse = await axios.get('http://localhost:3000/api/notifications');
    console.log('✅ Notifications retrieved:', getResponse.data);

  } catch (error) {
    console.error('❌ API test failed:', error.response ? error.response.data : error.message);
  }
}

testAPI();
