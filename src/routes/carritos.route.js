const { Router } = require('express')
const cartsRouter = Router();
const { cartsModel } = require('../models/carritos.model')

const administrador = true;
const user = false;

const manejoArchivosCarrito = new cartsModel("./public/Carritos.json");

// *********************************************
//  -----  inicio de endpoints del carrito -----
// *********************************************

// Crea un carrito y devuelve su id
cartsRouter.post("/", async (req, res) => {
    try{
      if (administrador || user) {
        const cart = await manejoArchivosCarrito.getAll();
        
        if (cart.length < 1) {
          const id = 1;
          
          const carritoUser = manejoArchivosCarrito.save([
            {
              id: id,
              timestamp: `Horario ${now}`,
            },
          ]);
          res.send(carritoUser)
        } else {
          const id = Number(cart.length) + 1;
          const carritoUser = manejoArchivosCarrito.save([
            {
              id: id,
              timestamp: `Horario ${now}`,
            },
          ]);
          res.send(carritoUser)
        }
      }    
    } catch {
      res.status(400).send("bad request")
    }  
  });
// Vacia un carrito y lo elimina
cartsRouter.delete("/:id", async (req, res) => {
    try{
    if (administrador || user) {
        const id = Number(req.params.id)
        const CartToDelete = await manejoArchivosCarrito.getById(id)
        if (CartToDelete){
        manejoArchivosCarrito.deleteById(id)
        res.send(`Se elimino el carrito N°${id}`)
        } else {
          res.send("No existe el carrito")
        }
      }
    } catch {
      res.status(400).send("bad request")
    }
  });
// Me permite listar todos los productos guardados en el carrito
cartsRouter.get("/:id/productos", async (req, res) => {
    try{
    if (administrador || user) {
      const idCart = Number(req.params.id)
      const cartProducts = await manejoArchivosCarrito.getById(idCart)
      if(idCart === cartProducts[0].id){
          cartProducts.forEach(product => {
            const productsCart = product[0].productos
          res.send(productsCart) 
        });
      } 
      }
    } catch {
      res.status(400).send("bad request")
    }
    
  });
// Para incorporar productos al carrito por su id de producto
cartsRouter.post("/:id/productos", async (req, res) => {
    try{
      // MANTENIMIENTO
    // if (administrador || user) {
      const idCart = Number(req.params.id)
      const {id} = req.body
  // producto para añadir
      const productToAdd = await manejoArchivosProductos.getById(id)
      const objetsLength = await manejoArchivosProductos.getAll()
      // console.log(objetsLength)
      if(objetsLength.length >= id){
        // const cart = await manejoArchivosCarrito.getById(idCart)
        const carts = await manejoArchivosCarrito.getAll()
        res.send()
      }
  
    //   if (idProductToAdd > objetsLength.length){
    //     res.send("El producto no existe")
    //   } else {
    //     res.send("Producto añadido")
    //   }
    // }
      // MANTENIMIENTO
    } catch {
      res.status(400).send("bad request")
    }
  
  });
cartsRouter.delete("/:id/productos/:id_prod", (req, res) => {
    // Eliminar un producto del carrito por su id de carrito y de producto
    if (administrador || user) {
    }
  });

// ******************************************
//  ----- Fin de endpoints del carrito -----
// ******************************************