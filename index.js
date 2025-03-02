const express = require("express");
const cors = require("cors");
const { errorHandler } = require("./middleware/errorMiddleware");
const dotenv = require("dotenv").config();
const colors = require("colors");
const connectDB = require("./config/db");
const { logRequest } = require("./middleware/logMiddleware");
const PORT = process.env.PORT || 5000;

connectDB();

// init app & middleware
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());


app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// logging middleware
app.use(logRequest);

// routes
app.use("/api", require("./routes/api"));

// error handler = send user the error res when error thrown
app.use(errorHandler);

