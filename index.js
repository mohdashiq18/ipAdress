const express = require('express');
const { IpModel } = require('./Model');
const app = express();
const { connect } = require('./Config');
const request = require('request');
const axios = require('axios');
const { exec } = require('child_process');

// Connect to MongoDB
connect()
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB:', error);
  });

// Get MAC address
let mac = '';

// Replace with the IP address you want to retrieve the location for
app.get('/', async (req, res) => {
  try {
    exec('ifconfig | grep -o -E "([[:xdigit:]]{1,2}:){5}[[:xdigit:]]{1,2}" | head -n 1', (error, stdout, stderr) => {
      if (error) {
        console.error(`Error executing command: ${error.message}`);
        return;
      }
      if (stderr) {
        console.error(`Command stderr: ${stderr}`);
        return;
      }

      // Extract the MAC address from the output
      mac = stdout.trim();

      // Print the MAC address
      console.log('MAC address:', mac);
    });

    const ipstackAccessKey = 'dcf307c13bc588c8d1651f6fd366ad17';
    request('https://api.ipify.org?format=json', async (error, response, body) => {
      if (error) {
        console.error('Error retrieving public IP address:', error);
      } else {
        const data = JSON.parse(body);
        const publicIp = data.ip;

        axios
          .get(`http://api.ipstack.com/${publicIp}?access_key=${ipstackAccessKey}`)
          .then(async (response) => {
            const locationData = response.data;
            console.log('Location data:', locationData);

            // Save IP and MAC address to MongoDB
            const newData = new IpModel({ ipAddress: publicIp, macAddress: mac });
            await newData.save();

            res.json({ ipAddress: publicIp, macAddress: mac, locationData });
          })
          .catch((error) => {
            console.error('Error retrieving location data:', error);
            res.sendStatus(500);
          });

        console.log('Public IP address:', publicIp);
      }
    });
  } catch (error) {
    console.error('Error:', error);
    res.sendStatus(500);
  }
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
