const asyncHandler = require("express-async-handler");
const logger = require("../logger");
const { StatusCodes } = require("http-status-codes");
const axios = require("axios");

getZohoAccessToken = asyncHandler(async () => {
    try {
        const response = await axios.post("https://accounts.zoho.eu/oauth/v2/token", null, {
            params: {
                refresh_token: process.env.ZOHO_REFRESH_TOKEN,
                client_id: process.env.ZOHO_CLIENT_ID,
                client_secret: process.env.ZOHO_CLIENT_SECRET,
                grant_type: "refresh_token"
            }
        });
        return response.data.access_token;
    } catch (error) {
        logger.error(error);
        return false;
    }
});

const sendEmail = asyncHandler(async (req, res) => {
    const { name, email, message, formId } = req.body;

    const accessToken = await getZohoAccessToken();
    if (!accessToken) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR);
        throw new Error("Could not get Zoho Access Token");
    }

    let subject;
    switch (formId) {
        case "consult-form":
            subject = "Uusi konsultaatiopyyntö";
            break;
        case "general-form":
            subject = "Uusi yhteydenotto";
            break;
        case "bike-form":
            subject = "Uusi pyörävuokrauspyyntö";
            break;
        default:
            res.status(StatusCodes.BAD_REQUEST);
            throw new Error("Invalid formId");
    }

    try {
        const emailData = {
            fromAddress: process.env.ZOHO_MAIL_ACCOUNT,
            toAddress: process.env.ZOHO_MAIL_ACCOUNT,
            subject: `${subject}: ${name}`,
            content: `Nimi: ${name}<br>Sähköposti: ${email}<br><br>${message}`
        };

        await axios.post("https://mail.zoho.eu/api/accounts/6603764000000002002/messages", emailData, {
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