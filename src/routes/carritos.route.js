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
// cartsRouter.delete("/:id", async (req, res) => {
//     try{
//     if (administrador || user) {
//         const id = Number(req.params.id)
//         const CartToDelete = await manejoArchivosCarrito.getById(id)
//         if (CartToDelete){
//         manejoArchivosCarrito.deleteById(id)
//         res.send(`Se elimino el carrito N°${id}`)
//         } else {
//           res.send("No existe el carrito")
//         }
//       }
//     } catch {
//       res.status(400).send("bad request")
//     }
//   });
// // Me permite listar todos los productos guardados en el carrito
// cartsRouter.get("/:id/productos", async (req, res) => {
//     try{
//     if (administrador || user) {
//       const idCart = Number(req.params.id)
//       const cartProducts = await manejoArchivosCarrito.getById(idCart)
//       if(idCart === cartProducts[0].id){
//           cartProducts.forEach(product => {
//             const productsCart = product[0].productos
//           res.send(productsCart)
//         });
//       }
//       }
//     } catch {
//       res.status(400).send("bad request")
//     }

//   });
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
// cartsRouter.delete("/:id/productos/:id_prod", (req, res) => {
//   });

module.exports = {
  cartsRouter,
};