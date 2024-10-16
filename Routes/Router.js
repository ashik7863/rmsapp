const express=require('express');

const {upload,handleMulterError}=require('../Services/FileUtils');
const {AddRestaurant,UpdateRestaurant,FetchAllRestaurants,DeleteRestaurants}=require('../Controller/RestaurantController');
const {AddMenu,FetchAllMenu,DeleteMenu}=require('../Controller/MenuController');
const {AddMenuItem,FetchAllMenuItem,DeleteMenuItem}=require('../Controller/MenuItemController');
const {AddStaffMember,FetchAllStaff,DeleteStaff}=require('../Controller/StaffController');
const {AddTable,FetchAllTable,DeleteTable,FetchTableByStaff}=require('../Controller/TableController');
const {Login,ForgotPassword, OtpVerify, ResetPassword, LoginStaff}=require('../Controller/LoginController');
const {CreateOrder,PaymentSuccess,FetchOrderByMobile, FetchOrderByRestaurant}=require('../Controller/OrderController');
const { SuperAdminCount ,AdminCount} = require('../Controller/CountController');


const router = express.Router();

// Auth Route
router.post('/api/login',Login);
router.post('/api/login-staff',LoginStaff);
router.post('/api/forgot-password',ForgotPassword);
router.post('/api/verify-otp',OtpVerify);
router.post('/api/reset-password',ResetPassword);

// Order Routes
router.post('/api/create-order',CreateOrder);
router.post('/api/payment-success',PaymentSuccess);
router.get('/api/fetch-order-by-mobile/:mobile',FetchOrderByMobile);
router.get('/api/fetch-order-by-restaurant/:id',FetchOrderByRestaurant);

// Restaurant Routes
router.post('/api/add-restaurant',AddRestaurant);
router.get('/api/fetch-restaurant',FetchAllRestaurants);
router.post('/api/update-restaurant',UpdateRestaurant);
router.post('/api/delete-restaurant',DeleteRestaurants);

// Menu Routes
router.post('/api/add-menu',AddMenu);
router.get('/api/fetch-menu/:id',FetchAllMenu);
router.post('/api/delete-menu',DeleteMenu);

// Item Routes
router.post('/api/add-menu-item', upload.single('image'),handleMulterError, AddMenuItem);
router.get('/api/fetch-menu-item/:id',FetchAllMenuItem);
router.post('/api/delete-menu-item',DeleteMenuItem);

// Staff Routes
router.post('/api/add-staff', upload.single('image'),handleMulterError, AddStaffMember);
router.get('/api/fetch-staff/:id',FetchAllStaff);
router.post('/api/delete-staff',DeleteStaff);

// Menu Routes
router.post('/api/add-table',AddTable);
router.get('/api/fetch-table/:id',FetchAllTable);
router.get('/api/fetch-tableby-staff/:id',FetchTableByStaff);
router.post('/api/delete-table',DeleteTable);

// Super Admin Count
router.get('/api/super-admin-count',SuperAdminCount);
router.get('/api/admin-count/:id',AdminCount);

module.exports=router;