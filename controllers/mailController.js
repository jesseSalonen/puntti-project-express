const asyncHandler = require("express-async-handler");
const logger = require("../logger");
const { StatusCodes } = require("http-status-codes");
const axios = require("axios");

const ZOHO_MAIL_ACCOUNT = process.env.ZOHO_MAIL_ACCOUNT;

getZohoAccessToken = asyncHandler(async () => {
    try {
        const response = await axios.post("https://accounts.zoho.com/oauth/v2/token", null, {
            params: {
                refresh_token: process.env.ZOHO_REFRESH_TOKEN,
                client_id: process.env.ZOHO_CLIENT_ID,
                client_secret: process.env.ZOHO_REFRESH_TOKEN,
                grant_type: "refresh_token"
            }
        });
        console.log(response.data);
        return response.data.access_token;
    } catch (error) {
        logger.error(error);
        return false;
    }
});

const sendEmail = asyncHandler(async (req, res) => {
    const { name, email, message } = req.body;

    const accessToken = await getZohoAccessToken();
    if (!accessToken) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR);
        throw new Error("Could not get Zoho Access Token");
    }

    try {
        const emailData = {
            fromAddress: process.env.ZOHO_MAIL_ACCOUNT,
            toAddress: process.env.ZOHO_MAIL_ACCOUNT,
            subject: `Uusi yhteydenotto: ${name}`,
            content: `Nimi: ${name}\nSähköposti: ${email}\n\nViesti:\n${message}`,
            contentType: "text/plain"
        };

        const response = await axios.post("https://mail.zoho.com/api/accounts/me/messages", emailData, {
            headers: {
                Authorization: `Zoho-oauthtoken ${accessToken}`,
                "Content-Type": "application/json"
            }
        });

        return res.status(StatusCodes.OK).json({ message: "Email sent successfully!" });
    } catch (error) {
        logger.error(error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR);
        if (error.message) {
            throw new Error(error.message);
        } else {
            throw new Error("Error sending email");
        }
    }
});

module.exports = {
    sendEmail
};