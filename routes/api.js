const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const {
  getExercises,
  addExercise,
  updateExercise,
  deleteExercise,
  getExercise,
} = require("../controllers/exerciseController");
const {
  registerUser,
  loginUser,
  getMe,
} = require("../controllers/userController");
const {
  getMuscles,
  addMuscle,
  updateMuscle,
  deleteMuscle,
} = require("../controllers/muscleController");
const {
  getWorkouts,
  addWorkout,
  updateWorkout,
  deleteWorkout,
} = require("../controllers/workoutController");
const { getPrograms, addProgram } = require("../controllers/programController");

// Exercises
router
  .route("/exercises")
  .get(protect, getExercises)
  .post(protect, addExercise);
router
  .route("/exercises/:id")
  .get(protect, getExercise)
  .put(protect, updateExercise)
  .delete(protect, deleteExercise);

// Workouts
router.route("/workouts").get(protect, getWorkouts).post(protect, addWorkout);
router
  .route("/workouts/:id")
  .put(protect, updateWorkout)
  .delete(protect, deleteWorkout);

// Programs
router.route("/programs").get(protect, getPrograms).post(protect, addProgram);
router.route;

// Users
router.post("/users", registerUser);
router.post("/users/login", loginUser);
router.get("/users/me", protect, getMe);

// Muscles
router.route("/muscles").get(protect, getMuscles).post(protect, addMuscle);
router
  .route("/muscles/:id")
  .put(protect, updateMuscle)
  .delete(protect, deleteMuscle);

const ZOHO_CLIENT_ID = process.env.ZOHO_CLIENT_ID;
const ZOHO_CLIENT_SECRET = process.env.ZOHO_CLIENT_SECRET;
const ZOHO_REFRESH_TOKEN = process.env.ZOHO_REFRESH_TOKEN;
const ZOHO_MAIL_ACCOUNT = process.env.ZOHO_MAIL_ACCOUNT;

// Hae uusi access token
async function getZohoAccessToken() {
  try {
      const response = await axios.post("https://accounts.zoho.com/oauth/v2/token", null, {
          params: {
              refresh_token: ZOHO_REFRESH_TOKEN,
              client_id: ZOHO_CLIENT_ID,
              client_secret: ZOHO_CLIENT_SECRET,
              grant_type: "refresh_token"
          }
      });
      return response.data.access_token;
  } catch (error) {
      console.error("Virhe hakiessa Zoho Access Tokenia:", error.response ? error.response.data : error.message);
      return null;
  }
}

router.post("/send-email", async (req, res) => {
  const { name, email, message } = req.body;

  const accessToken = await getZohoAccessToken();
  if (!accessToken) {
      return res.status(500).json({ success: false, message: "Ei voitu hakea Access Tokenia." });
  }

  try {
      const emailData = {
          fromAddress: ZOHO_MAIL_ACCOUNT,
          toAddress: ZOHO_MAIL_ACCOUNT, // Lähetetään omaan sähköpostiin
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

      return res.json({ success: true, message: "Sähköposti lähetetty onnistuneesti!" });
  } catch (error) {
      console.error("Sähköpostin lähetys epäonnistui:", error.response ? error.response.data : error.message);
      return res.status(500).json({ success: false, message: "Sähköpostin lähetys epäonnistui." });
  }
});

module.exports = router;
