// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

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
const getSuppliersRoute = require('./GetSuppliers')

const getBrandsRoute = require('./GetBrands')
const addBrandRoute = require('./AddBrand')
const editBrandRoute = require('./EditBrand')
const removeBrandRoute = require('./removeBrand')

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
app.use('/api/getsuppliers', getSuppliersRoute);

app.use('/api/getbrands', getBrandsRoute);
app.use('/api/addBrand', addBrandRoute);
app.use('/api/editBrand', editBrandRoute);
app.use('/api/removeBrand', removeBrandRoute);

// Add this AFTER all your app.use('/api/...') routes
app.use(express.static(path.join(__dirname, 'build')));

app.get('*path', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.listen(5000, '0.0.0.0', () => {
  console.log('Server running on port 5000');
});