import { Router } from "express";

//Controller Methods
import {
    getAdminCalls,
    getAdminStats
} from '../controllers/admin.controller.js';

//Middlewares
import { verifyJWT } from '../middlewares/auth.middleware.js';
import { checkAdminRole } from '../middlewares/checkAdmin.middleware.js'

//Defining router object
const router = Router();

router.route('/get-admin-calls').get(verifyJWT, checkAdminRole, getAdminCalls);
router.route('/get-admin-dashboard-stats').get(verifyJWT, checkAdminRole, getAdminStats);

export default router;