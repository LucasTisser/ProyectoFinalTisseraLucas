const { Router } = require("express");
const { productsRouter } = require("./productos.route");
const { cartsRouter } = require("./carritos.route");
const apiRouter = Router();

// Rutas alojadas en routers
apiRouter.use("/productos", productsRouter);
apiRouter.use("/carritos", cartsRouter);

// apiRouter
module.exports = {
  apiRouter,
};
