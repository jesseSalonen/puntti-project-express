const express = require("express");
const cors = require("cors");
const { errorHandler } = require("./middleware/errorMiddleware");
const dotenv = require("dotenv").config();
const colors = require("colors");
const connectDB = require("./config/db");
const PORT = process.env.PORT || 5000;

connectDB();

// init app & middleware
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// routes
app.use("/api", require("./routes/api"));

app.use(errorHandler);
