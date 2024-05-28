import { Router } from "express";

//Controller Methods
import {
    createNewIncomingCall,
    changeCallStatus,
    changeCallType,
    makeCallEnded
} from '../controllers/calls.controller.js';

//Middlewares
import { verifyJWT } from '../middlewares/auth.middleware.js';

//Defining router object
const router = Router();

//Secure Routes
router.route('/create-incoming-call').post(verifyJWT, createNewIncomingCall);
router.route('/change-call-status').patch(verifyJWT, changeCallStatus);
router.route('/change-call-type').patch(verifyJWT, changeCallType);
router.route('/make-call-end').patch(verifyJWT, makeCallEnded);



export default router;