import { Router } from "express";

//Controller Methods
import {
    registerAdminUser,
    registerNormalUser,
    getAllAdminUsers,
    getAllNormalUsers,
    changeAdminAccountStatus,
    changeUserAccountStatus,
    deleteAdminAccount,
    deleteUserAccount
} from '../controllers/superAdmin.controller.js';

//Middlewares
import { verifyJWT } from '../middlewares/auth.middleware.js';
import { checkSuperAdminRole } from '../middlewares/checkSuperAdmin.middleware.js';

//Defining router object
const router = Router();

//Secure Routes
router.route('/register-admin-user').post(verifyJWT, checkSuperAdminRole, registerAdminUser);
router.route('/register-normal-user').post(verifyJWT, checkSuperAdminRole, registerNormalUser);

router.route('/get-all-admin-users').get(verifyJWT, checkSuperAdminRole, getAllAdminUsers);
router.route('/get-all-normal-users').get(verifyJWT, checkSuperAdminRole, getAllNormalUsers);

router.route('/change-admin-account-status').patch(verifyJWT, checkSuperAdminRole, changeAdminAccountStatus);
router.route('/change-user-account-status').patch(verifyJWT, checkSuperAdminRole, changeUserAccountStatus);

router.route('/delete-admin-account').delete(verifyJWT, checkSuperAdminRole, deleteAdminAccount);
router.route('/delete-user-account').delete(verifyJWT, checkSuperAdminRole, deleteUserAccount);


export default router;