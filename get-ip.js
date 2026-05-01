const os = require('os');

const interfaces = os.networkInterfaces();
let ip = 'localhost';

for (const iface of Object.values(interfaces)) {
  for (const alias of iface) {
    if (alias.family === 'IPv4' && !alias.internal) {
      ip = alias.address;
      break;
    }
  }
}

console.log(`Starting with REACT_APP_API_URL=http://${ip}:5000/api`);

process.env.REACT_APP_API_URL = `http://${ip}:5000/api`;
require('react-scripts/scripts/start');