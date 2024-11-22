// DOM Elements
const broadcastBtn = document.getElementById('broadcast-btn');
const scanBtn = document.getElementById('scan-btn');
const sendBtn = document.getElementById('send-btn');
const deviceList = document.getElementById('device-list');
const usernameField = document.getElementById('username');

let userName = ''; // User's name
let connectedDevice = null; // Current connected device
let gattServer = null; // GATT server instance
let bingoCharacteristic = null; // Characteristic for sending messages

// Update the user's name from input
usernameField.addEventListener('input', (e) => {
  userName = e.target.value.trim();
});

// Start broadcasting (placeholder functionality)
function startBroadcasting() {
  if (!userName) {
    alert('Please enter your name!');
    return;
  }

  console.log(`Broadcasting: ${userName}`);
  alert(`Broadcasting started as "${userName}". Note: Web Bluetooth does not support true broadcasting.`);
}

// Scan for nearby devices and connect
async function scanNearbyDevices() {
  try {
    const device = await navigator.bluetooth.requestDevice({
      acceptAllDevices: true,
      optionalServices: ['0000180d-0000-1000-8000-00805f9b34fb'] // Replace with your service UUID
    });

    console.log('Device discovered:', device.name || 'Unknown');
    connectedDevice = device;

    device.addEventListener('gattserverdisconnected', onDisconnected);

    // Connect to the GATT server
    gattServer = await device.gatt.connect();
    console.log('Connected to GATT server');

    // Get the custom service
    const service = await gattServer.getPrimaryService('0000180d-0000-1000-8000-00805f9b34fb'); // Replace with your service UUID
    console.log('Service found:', service);

    // Get the characteristic to write the message
    bingoCharacteristic = await service.getCharacteristic('00002a37-0000-1000-8000-00805f9b34fb'); // Replace with your characteristic UUID
    console.log('Characteristic found:', bingoCharacteristic);

    sendBtn.disabled = false;

    // Update the device list
    const listItem = document.createElement('li');
    listItem.textContent = `Connected to: ${device.name || 'Unknown Device'}`;
    deviceList.appendChild(listItem);
  } catch (error) {
    console.error('Error during scanning or connection:', error);
    alert('Could not find a suitable device. Please try again.');
  }
}

// Send the "bingo" message
async function sendBingoMessage() {
  if (!bingoCharacteristic) {
    alert('No connected device or characteristic available!');
    return;
  }

  try {
    const message = new TextEncoder().encode('bingo');
    await bingoCharacteristic.writeValue(message);
    console.log('Bingo message sent!');
    alert('Message "bingo" sent successfully!');
  } catch (error) {
    console.error('Failed to send message:', error);
    alert('Failed to send the message. Please check your connection.');
  }
}

// Handle device disconnection
function onDisconnected() {
  console.log('Device disconnected');
  sendBtn.disabled = true;
  connectedDevice = null;
  gattServer = null;
  bingoCharacteristic = null;

  // Update the device list
  const listItem = document.createElement('li');
  listItem.textContent = 'Device disconnected.';
  deviceList.appendChild(listItem);
}

// Attach event listeners
broadcastBtn.addEventListener('click', startBroadcasting);
scanBtn.addEventListener('click', scanNearbyDevices);
sendBtn.addEventListener('click', sendBingoMessage);
