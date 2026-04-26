require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const PORT = process.env.PORT || 5000;

const app = express();
app.use(cors());
app.use(express.json());

const loginRoute = require('./src/hooks/Login.js');
const authRoute = require('./src/hooks/Auth.js');
const getUsersRoute = require('./src/hooks/GetUsers.js');
const addUserRoute = require('./src/hooks/AddUser.js');
const changePasswordRoute = require('./src/hooks/ChangePassword.js');

const getProdCountRoute = require('./src/hooks/GetProdCount.js');
const inventoryRoute = require('./src/hooks/Inventory.js');
const addProductRoute = require('./src/hooks/AddProduct.js');
const editProductRoute = require('./src/hooks/EditProduct.js');
const removeProductRoute = require('./src/hooks/RemoveProduct.js');
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
app.use('/api/auth', authRoute);
app.use('/api/getusers', getUsersRoute);
app.use('/api/adduser', addUserRoute);
app.use('/api/changepassword', changePasswordRoute);

app.use('/api/gettopsupply', getTopSupplyRoute);
app.use('/api/stock', stockChangeRoute);
app.use('/api/orders', ordersRoute);
app.use('/api/supply-demand', supplyDemandRoute);

app.use('/api/inventory', inventoryRoute);
app.use('/api/add-product', addProductRoute);
app.use('/api/edit-product', editProductRoute);
app.use('/api/removeproduct', removeProductRoute);
app.use('/api/getprodcount', getProdCountRoute);

app.use('/api/suppliers', suppliersRoute);
app.use('/api/getsuppliers', getSuppliersRoute);

app.use('/api/getbrands', getBrandsRoute);
app.use('/api/addBrand', addBrandRoute);
app.use('/api/editBrand', editBrandRoute);
app.use('/api/removeBrand', removeBrandRoute);

app.use('/api/reports', reportsRoute);

app.use(express.static(path.join(__dirname, 'build')));

app.get('*path', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
