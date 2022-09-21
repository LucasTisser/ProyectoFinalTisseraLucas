const { Router } = require("express");
const { cartModel } = require("../models/carritos.model");
const cartsRouter = Router();
const myCartsModel = new cartModel();


// Crea un carrito y devuelve su id
cartsRouter.post("/", async (req, res) => {
  try {
    const wasCreated = await myCartsModel.createNewCart();
    if (wasCreated) {
      res.send(wasCreated);
    } else {
      res.send("No se logro crear el carrito");
    }
  } catch (err) {
    res.status(400).send("bad request" + err);
  }
});

// Vacia un carrito y lo elimina
cartsRouter.delete("/:id", async (req, res) => {
  const id = Number(req.params.id);
  try {
    const carts = await myCartsModel.readCarts();
    const { cartsList } = carts;
    if (cartsList.length >= id) {
      await myCartsModel.deleteCartById(id);
      res.send("Carrito Eliminado");
    } else {
      res.send("No se encontro el carrito a eliminar");
    }
  } catch (err) {
    res.status(400).send("bad request" + err);
  }
});

// // Me permite listar todos los productos guardados en el carrito
cartsRouter.get("/:id/productos", async (req, res) => {
  const { id } = req.params;
  try {
    const cart = await myCartsModel.getCartById(id);
    const { products } = cart;
    products.length > 0
      ? res.send(products)
      : res.send("Su carrito esta vacio");
  } catch (err) {
    res.status(400).send("Bad Request");
  }
});

// Para incorporar productos al carrito por su id de producto
cartsRouter.post("/:id/productos", async (req, res) => {
  try {
    const cartId = Number(req.params.id);
    const { productId } = req.body;
    if (cartId && productId) {
      const wasAdded = await myCartsModel.addProductToCart(cartId, productId);
      res.send(wasAdded);
    } else {
      res.status(400).send("Faltan datos para completar la operacion");
    }
  } catch (err) {
    res.status(400).send("bad request" + err);
  }
});

// Eliminar un producto del carrito por su id de carrito y de producto
cartsRouter.delete("/:id/productos/:id_prod", async (req, res) => {
  try {
    const cartId = Number(req.params.id);
    const productId = Number(req.params.id_prod);
    if (cartId && productId) {
      const wasDeleted = await myCartsModel.deleteProductToCart(
        cartId,
        productId
      );
      res.send(wasDeleted);
    } else {
      res.status(400).send("Faltan datos para completar la operacion");
    }
  } catch (err) {
    res.status(400).send("Bad request" + err);
  }
});

module.exports = {
  cartsRouter,
};
