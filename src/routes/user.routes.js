import { Router } from "express";

//Controller Methods
import {
    registerUser,
    loginUser,
    logoutUser,
    updateUserProfileImage,
    updateUserAccountDetails,
    getCurrentUser,
    changeCurrentPassword,
    changeUserPassword,
    deleteMyAccount,
    getUserCallLogs,
    sendUserOTP
} from '../controllers/user.controller.js';

//Middlewares
import { verifyJWT } from '../middlewares/auth.middleware.js';
import { upload } from '../middlewares/multer.middleware.js';

//Defining router object
const router = Router();

//User Open Routes
router.route('/register').post(registerUser);
router.route('/login').post(loginUser);
router.route('/change-user-password').patch(changeUserPassword);
router.route('/send-otp').post(sendUserOTP);

//User Secure Routes
router.route('/logout').post(verifyJWT, logoutUser);
router.route('/update-profile-image').patch(verifyJWT, upload.single('user-profile') ,updateUserProfileImage);
router.route('/update-user-account-details').patch(verifyJWT, updateUserAccountDetails);
router.route('/current-user').get(verifyJWT, getCurrentUser)
router.route('/change-password').patch(verifyJWT, changeCurrentPassword);
router.route('/delete-my-account').delete(verifyJWT, deleteMyAccount);

router.route('/user-call-logs').get(verifyJWT, getUserCallLogs);

export default router;


