// Configuracion inicial en express de node.js
const express = require("express");
const { apiRouter } = require('./routes/api.route');
const app = express();
const PORT =process.env.PORT || 8080;
app.use(express.json());
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

app.use("/api/",apiRouter)

app.listen(PORT, () => {
  console.log("Server on " + PORT);
});
