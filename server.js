require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const PORT = process.env.PORT || 5000;
const verifyToken = require('./src/hooks/Auth.js'); // adjust path

const app = express();
app.use(cors());
app.use(express.json());

const loginRoute = require('./src/hooks/Login.js');
const logoutRoute = require('./src/hooks/Logout.js');
const getUsersRoute = require('./src/hooks/GetUsers.js');
const addUserRoute = require('./src/hooks/AddUser.js');
const changePasswordRoute = require('./src/hooks/ChangePassword.js');
const exportsRouter = require('./src/hooks/Exports');

const getProdCountRoute = require('./src/hooks/GetProdCount.js');
const inventoryRoute = require('./src/hooks/Inventory.js');
const addProductRoute = require('./src/hooks/AddProduct.js');
const editProductRoute = require('./src/hooks/EditProduct.js');
const removeProductRoute = require('./src/hooks/removeProduct.js');
const getTopSupplyRoute = require('./src/hooks/GetTopSupply.js');
const stockChangeRoute = require('./src/hooks/StockChange.js');
const ordersRoute = require('./src/hooks/Orders.js');

const suppliersRoute = require('./src/hooks/Suppliers.js');
const getSuppliersRoute = require('./src/hooks/GetSuppliers.js');

const getBrandsRoute = require('./src/hooks/GetBrands.js');
const addBrandRoute = require('./src/hooks/AddBrand.js');
const editBrandRoute = require('./src/hooks/EditBrand.js');
const removeBrandRoute = require('./src/hooks/RemoveBrand.js');

const reportsRoute = require('./src/hooks/Reports.js');
const supplyDemandRoute = require('./src/hooks/SupplyDemand.js');

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
