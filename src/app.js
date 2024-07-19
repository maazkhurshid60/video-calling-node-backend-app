import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"

//Adding this liine for git activity

//Defining Express App Object
const app = express();

//Applying CORS policy
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}));

//Applying Middlewares on Express App
app.use(express.json({limit: "16kb"}));
app.use(express.urlencoded({extended: true, limit: "16kb"}));
app.use(express.static("public"));
app.use(cookieParser());

//Importing All App Routes
import superAdminRouter from './routes/superAdmin.routes.js';
import userRouter from './routes/user.routes.js';
import adminRouter from './routes/admin.routes.js';
import callsRouter from './routes/calls.routes.js';

app.use('/api/v1/super-admin', superAdminRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/admins', adminRouter);
app.use('/api/v1/calls', callsRouter);

export { app }
