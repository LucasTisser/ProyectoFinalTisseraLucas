
const { Router } =require("express");
const apiRouter = Router()
// Routers
const { productosRouter } = require('./productos.route')
const { carritosRouter } = require('./carritos.route')

// Rutas alojadas en routers
apiRouter.use("/productos", productosRouter);
apiRouter.use("/carritos", carritosRouter);

module.exports = {
    apiRouter
}