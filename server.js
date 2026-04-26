require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const PORT = process.env.PORT || 5000;

const app = express();
app.use(cors());
app.use(express.json());

const loginRoute = require('./src/hooks/Login');
const authRoute = require('./src/hooks/Auth');
const getUsersRoute = require('./src/hooks/GetUsers');
const addUserRoute = require('./src/hooks/AddUser');
const changePasswordRoute = require('./src/hooks/ChangePassword.js');

const getProdCountRoute = require('./src/hooks/GetProdCount');
const inventoryRoute = require('./src/hooks/Inventory');
const addProductRoute = require('./src/hooks/AddProduct');
const editProductRoute = require('./src/hooks/EditProduct');
const removeProductRoute = require('./src/hooks/RemoveProduct');
const getTopSupplyRoute = require('./src/hooks/GetTopSupply');
const stockChangeRoute = require('./src/hooks/StockChange');
const ordersRoute = require('./src/hooks/Orders');
const suppliersRoute = require('./src/hooks/Suppliers');
const getSuppliersRoute = require('./src/hooks/GetSuppliers');

const getBrandsRoute = require('./src/hooks/GetBrands');
const addBrandRoute = require('./src/hooks/AddBrand');
const editBrandRoute = require('./src/hooks/EditBrand');
const removeBrandRoute = require('./src/hooks/RemoveBrand');

const reportsRoute = require('./src/hooks/Reports');

app.use('/api/login', loginRoute);
app.use('/api/auth', authRoute);
app.use('/api/getusers', getUsersRoute);
app.use('/api/adduser', addUserRoute);
app.use('/api/changepassword', changePasswordRoute);

app.use('/api/gettopsupply', getTopSupplyRoute);
app.use('/api/stock', stockChangeRoute);
app.use('/api/orders', ordersRoute);

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