import dotenv from "dotenv"
import {v2 as cloudinary} from "cloudinary"

dotenv.config({
    path: '../../.env'
})

cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

cloudinary.api.create_upload_preset({
    name: 'profile-image',
    tags: 'users, admins, super-admin',
    folder: 'AndyDoe/ProfileImages',

    transformation: [
        {
            width: 200,
            height: 200,
            crop: "thumb",
            gravity: "face",
        }
    ],
})
.then((uploadResult) => console.log(uploadResult))
.catch((err) => console.log(err));