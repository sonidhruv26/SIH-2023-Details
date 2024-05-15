const express = require("express");
const path = require("path");
const app = express();
const homeRoutes = require("./routes/homeRoutes");
const filterRoutes = require("./routes/filterRoutes");
const searchRoutes = require("./routes/searchRoutes");

require("dotenv").config();

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.static(path.join(__dirname, "public")));

app.use("/", homeRoutes);
app.use("/", filterRoutes);
app.use("/", searchRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
