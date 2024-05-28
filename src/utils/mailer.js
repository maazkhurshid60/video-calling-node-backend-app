import nodemailer from 'nodemailer';

class MyMailer {

    constructor() {
        if(!this.transporter) {
            this.transporter = nodemailer.createTransport({
                host: 'email-smtp.ap-south-1.amazonaws.com',
                port: 587,
                secure: false, // true for 465, false for other ports
                auth: {
                    user: 'AKIA34M75TQJMR52PS5S', // generated ethereal user
                    pass: 'BEtb7+ULvwNIUZGgF7rLndTZ2x6QFM6vpn2yTRKoYwbm'  // generated ethereal password
                }
            })
        }
    }

}
// UserName: AKIA34M75TQJMR52PS5S
// Password: BEtb7+ULvwNIUZGgF7rLndTZ2x6QFM6vpn2yTRKoYwbm


export default new MyMailer();