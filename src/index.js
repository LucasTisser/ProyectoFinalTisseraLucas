// Configuracion inicial en express de node.js

const express = require("express");
const { apiRouter } = require('./routes/api.route');
const app = express();
const PORT = 8080 || process.env.PORT;

// app.use(express.static("public"));
// app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use("/api/",apiRouter)

app.listen(PORT, () => {
  console.log("Server on " + PORT);
});
