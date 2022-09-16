const { Router } = require("express");
const productsRouter = Router();

const { productPostValidator } = require("../middlewares/product.middleware");
const { authValidator } = require("../middlewares/auth.middleware");
const { productsModel } = require("../models/productos.model");

const myProductsModel = new productsModel();

// Me permite listar todos los productos disponibles o un producto por su id (disponible para usuarios y administradores)
productsRouter.get("/:id?", async (req, res) => {
  const { id } = req.params;

  try {
    if (id > 0) {
      // Muestra el producto pedido por su id
      const productFinded = await myProductsModel.getProductById(Number(id));
      productFinded
        ? res.send(productFinded)
        : res.status(404).send("No se ha encontrado el producto");
    } else {
      // Devuelve todos los productos disponibles
      const productList = await myProductsModel.getProducts();
      res.send(productList);
    }
  } catch {
    res.status(400).send({
      error: -1,
      descripcion: "Bad Request",
    });
  }
});
// Para incorporar productos al listado (disponible para administradores)
productsRouter.post(
  "/",
  authValidator,
  productPostValidator,
  async (req, res) => {
    const newProduct = req.body;

    try {
      const result = await myProductsModel.createProduct(newProduct);
      console.log(result);
      res.send(result);
    } catch (error) {
      console.log(error);
      res.status(400).send("Bad Request");
    }
  }
);
// Actualiza un producto por su id (disponible para administradores)
productsRouter.put("/:id", authValidator, async (req, res) => {
  try {
    const productId = Number(req.params.id);
    const newData = req.body;

    const updateProduct = await myProductsModel.updateProduct(
      productId,
      newData
    );
    const productList = await myProductsModel.getProducts();
    let index = await myProductsModel.getProductById(productId);

    if (index.id <= productList.length) {
      res.send(index);
    } else {
      res.status(400).send({
        error: -1,
        descripcion: "Producto no encontrado",
      });
    }
  } catch {
    res.status(400).send("Bad Request");
  }
});
// Borra un producto por su id (disponible para administradores)
productsRouter.delete("/:id", authValidator, async (req, res) => {
  // Elimina un producto segun su id
  const id = Number(req.params.id);

  try {
    const productsList = await myProductsModel.getProducts();
    if (productsList.length >= id) {
      await myProductsModel.deleteById(id);
      res.send("Producto Eliminado");
    } else {
      res.send("No se encuentra este producto para eliminar");
    }
  } catch {
    res.status(400).send("Bad Request");
  }
});

module.exports = {
  productsRouter,
};
