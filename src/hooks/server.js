// server.js
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const loginRoute = require('./Login');
const inventoryRoute = require('./Inventory');
const addProductRoute = require('./AddProduct');
const editProductRoute = require('./EditProduct');

app.use('/api/login', loginRoute);
app.use('/api/inventory', inventoryRoute);
app.use('/api/add-product', addProductRoute);
app.use('/api/edit-product', editProductRoute);

app.listen(5000, '0.0.0.0', () => {
  console.log('Server running on port 5000');
});