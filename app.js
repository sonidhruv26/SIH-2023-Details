const express = require("express");
const path = require("path");
const app = express();
const homeRoutes = require("./routes/homeRoutes");
const filterRoutes = require("./routes/filterRoutes");
const searchRoutes = require("./routes/searchRoutes");

require("dotenv").config();

app.set("view engine", "ejs");
app.set("views", "Views");

app.use(express.static(path.join(__dirname, "Public")));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get("/", homeRoutes);
app.get("/filter", filterRoutes);
app.get("/search", searchRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
