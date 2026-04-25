// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const loginRoute = require('./Login');
const getProdCountRoute = require('./GetProdCount');
const authRoute = require('./Auth');
const inventoryRoute = require('./Inventory');
const addProductRoute = require('./AddProduct');
const editProductRoute = require('./EditProduct');
const getUsersRoute = require('./GetUsers')
const addUserRoute = require('./AddUser')
const removeProductRoute = require('./RemoveProduct')
const getTopSupplyRoute = require('./GetTopSupply')
const stockChangeRoute = require('./StockChange')
const ordersRoute = require('./Orders')
const suppliersRoute = require('./Suppliers')

app.use('/api/login', loginRoute);
app.use('/api/getprodcount', getProdCountRoute);
app.use('/api/auth', authRoute);
app.use('/api/inventory', inventoryRoute);
app.use('/api/add-product', addProductRoute);
app.use('/api/edit-product', editProductRoute);
app.use('/api/getusers', getUsersRoute);
app.use('/api/adduser', addUserRoute);
app.use('/api/removeproduct', removeProductRoute);
app.use('/api/gettopsupply', getTopSupplyRoute);
app.use('/api/stock', stockChangeRoute);
app.use('/api/orders', ordersRoute);
app.use('/api/suppliers', suppliersRoute);

app.listen(5000, '0.0.0.0', () => {
  console.log('Server running on port 5000');
});