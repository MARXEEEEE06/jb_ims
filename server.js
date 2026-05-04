require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const PORT = process.env.PORT || 5000;
const verifyToken = require('./Auth.js'); // adjust path

const app = express();
app.use(cors());
app.use(express.json());

const loginRoute = require('./Login.js');
const logoutRoute = require('./Logout.js');
const getUsersRoute = require('./GetUsers.js');
const addUserRoute = require('./AddUser.js');
const changePasswordRoute = require('./ChangePassword.js');
const exportsRouter = require('./src/hooks/Exports.js');

const getProdCountRoute = require('./GetProdCount.js');
const inventoryRoute = require('./Inventory.js');
const addProductRoute = require('./AddProduct.js');
const editProductRoute = require('./EditProduct.js');
const removeProductRoute = require('./removeProduct.js');
const getTopSupplyRoute = require('./GetTopSupply.js');
const stockChangeRoute = require('./StockChange.js');
const ordersRoute = require('./Orders.js');

const suppliersRoute = require('./Suppliers.js');
const getSuppliersRoute = require('./GetSuppliers.js');

const getBrandsRoute = require('./GetBrands.js');
const addBrandRoute = require('./AddBrand.js');
const editBrandRoute = require('./EditBrand.js');
const removeBrandRoute = require('./RemoveBrand.js');

const reportsRoute = require('./Reports.js');
const supplyDemandRoute = require('./SupplyDemand.js');

app.use('/api/login', loginRoute);
app.get('/api/auth', verifyToken, (req, res) => {
  res.json({ user: req.user });
});
app.use('/api/logout', verifyToken, logoutRoute);
app.use('/api/getusers', getUsersRoute);
app.use('/api/adduser', addUserRoute);
app.use('/api/changepassword', changePasswordRoute);
app.use('/api/exports', verifyToken, exportsRouter);

app.use('/api/gettopsupply', getTopSupplyRoute);
app.use('/api/stock', verifyToken, stockChangeRoute);
app.use('/api/supply-demand', supplyDemandRoute);

app.use('/api/orders', verifyToken, ordersRoute);
app.use('/api/inventory', verifyToken, inventoryRoute);
app.use('/api/add-product', verifyToken, addProductRoute);
app.use('/api/edit-product', verifyToken, editProductRoute);
app.use('/api/removeproduct', verifyToken, removeProductRoute);
app.use('/api/getprodcount', getProdCountRoute);

app.use('/api/suppliers', verifyToken, suppliersRoute);
app.use('/api/getsuppliers', getSuppliersRoute);

app.use('/api/getbrands', getBrandsRoute);
app.use('/api/addBrand', verifyToken, addBrandRoute);
app.use('/api/editBrand', verifyToken, editBrandRoute);
app.use('/api/removeBrand', verifyToken, removeBrandRoute);

app.use('/api/reports', verifyToken, reportsRoute);

app.use(express.static(path.join(__dirname, 'build')));

app.get('*path', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
