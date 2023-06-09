const express = require('express');
const {IpModel} =require("./Model")
const app = express();
const {connect} =require("./Config")
const request = require('request');
const axios = require('axios');
const { exec } = require('child_process');

// Execute the "ipconfig" command to get the MAC address
let mac;
exec('ipconfig /all', (error, stdout, stderr) => {
  if (error) {
    console.error(`Error executing command: ${error.message}`);
    return;
  }
  if (stderr) {
    console.error(`Command stderr: ${stderr}`);
    return;
  }

  // Extract the MAC address from the output
  const macAddressRegex = /Physical Address[^\r\n]*: ([0-9A-Fa-f:-]{17})/g;
  const macAddresses = stdout.match(macAddressRegex);

  // Print the MAC addresses
 mac=macAddresses[0]
//   macAddresses.forEach((macAddress, index) => {
//     console.log(`${index + 1}. ${macAddress}`);
//   });
});

const ipstackAccessKey = 'dcf307c13bc588c8d1651f6fd366ad17';
request('https://api.ipify.org?format=json',async (error, response, body) => {
  if (error) {
    console.error('Error retrieving public IP address:', error);
  } else {
    const data = JSON.parse(body);
    const publicIp = data.ip; 
    axios.get(`http://api.ipstack.com/${publicIp}?access_key=${ipstackAccessKey}`)
  .then(response => {
    const locationData = response.data;
    console.log(locationData);
    // Extract latitude and longitude from locationData and use them as needed
  })
  .catch(error => {
    console.error('Error retrieving location data:', error);
  });

    const Data=new IpModel({ipAdresss:publicIp,mac})
    await Data.save()
    console.log('Public IP address:', publicIp);
  }
});


 
// Replace with the IP address you want to retrieve the location for
app.get("/",async(req,res)=>{
  try{
     res.send("Welcome")
  }
  catch{
    res.send("err")
  }
})


app.listen(3000, async() => {
    try{
      await connect
      console.log('Server running on port 3000');
    }
    catch{
     
    }
  
});
 