const { Router } = require('express')
const productsRouter = Router()
const { productsModel } = require('../models/productos.model')

const administrador = true;
const user = false;

const manejoArchivosProductos = new productsModel("./public/productos.json");

// *********************************************
//  ----- inicio de endpoints de productos -----
// *********************************************

// Me permite listar todos los productos disponibles o un producto por su id (disponible para usuarios y administradores)
productsRouter.get("/:id?",  async (req, res) => {
    try{
    if (administrador || user) {
        const id = Number(req.params.id);
        if (id > 0) {
          // Muestra el producto pedido por su id
          const productoBuscado = await manejoArchivosProductos.getById(id)
          const productList = await manejoArchivosProductos.getAll()
          if (productList.length < id) {
            res.status(404).send("No se ha encontrado un producto con dicho ID");
          } else {
            res.send(productoBuscado);
          }
        } else {
          // Devuelve todos los productos disponibles
          const productList = await manejoArchivosProductos.getAll()
          res.send(productList);
        }
      } else {
        res
          .status(400)
          .send({
            error: -1,
            descripcion: "ruta api/productos/id? metodo:GET no autorizada",
          });
      }
    } catch{
      res.status(400).send("Bad Request")
    }
    
  });
// Para incorporar productos al listado (disponible para administradores)
productsRouter.post("/",(req, res, next) => {
      // Incorpora productos al listado siempre que administrador sea true
      if (administrador) {
        const { nombre, descripcion, foto, precio, stock } = req.body;
        if (!nombre || !precio || !descripcion || !foto || !stock) {
          res
            .status(400)
            .send({ error: "Producto no guardado por falta de datos" });
        }
        next();
      } else {
        res
          .status(400)
          .send({
            error: -1,
            descripcion: "ruta api/productos metodo:POST no autorizada",
          });
      }
    },
     async (req, res) => {
      try{
        const { nombre, descripcion, codigo, foto, precio, stock } = req.body;
        if (nombre && descripcion && codigo && foto && precio && stock) {
          const timestamp = Date.now();
          const productsLength = await manejoArchivosProductos.getAll()
          console.log(productsLength)
          // Si el array de productos esta vacio, el condicional asignara la primera id y pushea la informacion
          if (productsLength < 1) {
            const id = 1;
            const productToSubmit = 
            {
              id: id,
              timestamp:timestamp,
              nombre:nombre,
              descripcion:descripcion,
              codigo:codigo,
              foto:foto,
              precio:precio,
              stock:stock,
            };
            const productSubmit = await manejoArchivosProductos.save(productToSubmit)
            res.send("producto guardado con exito");
          } else {
            const id = Number(productsLength[productsLength.length - 1].id) + 1;
            const productToSubmit = 
            {
              id: id,
              timestamp:timestamp,
              nombre:nombre,
              descripcion:descripcion,
              codigo:codigo,
              foto:foto,
              precio:precio,
              stock:stock,
            };
            const productSubmit = await manejoArchivosProductos.save(productToSubmit)
            res.send("producto guardado con exito");
          }
        }
      } catch {
        res.status(400).send("Bad Request")
      }
    }
  );
// Actualiza un producto por su id (disponible para administradores)
productsRouter.put("/:id",async (req, res) => {
  // en mantenimiento, hay que sobreescribir la informacion con fs
    try{
    if (administrador) {
        const id = Number(req.params.id);
        const { nombre, precio, timestamp, descripcion, codigo, foto, stock } =
          req.body;
        let index = await manejoArchivosProductos.getById(id)
        // console.log(index[0].id)
  
        if (index[0].id >= 1) {
          let productToPut = 
          {
            nombre:nombre,
            precio:precio,
            timestamp:timestamp,
            descripcion:descripcion,
            codigo:codigo,
  
            foto:foto,
            stock:stock,
          };
        productToPut = index[0]
          res.send(index[0]);
        } else {
          res.status(404).send({ error: "Producto no encontrado" });
        }
      } else {
        res
          .status(400)
          .send({
            error: -1,
            descripcion: "ruta api/productos/:id metodo:PUT no autorizada",
          });
      }
    } catch{
      res.status(400).send("Bad Request")
    }
    // en mantenimiento, hay que sobreescribir la informacion con fs
  });
// Borra un producto por su id (disponible para administradores)
productsRouter.delete("/:id", async (req, res) => {
    try{
    if (administrador) {
      // Elimina un producto segun su id
      const id = Number(req.params.id);
      // filtrar los datos para identificar el objeto a eliminar y eliminarlo
      const productsLength = await manejoArchivosProductos.getAll()
      if (productsLength.length >= id){
      await manejoArchivosProductos.deleteById(id)
        res.send("Producto Eliminado")
      } else {
        res.send("No se encuentra este producto para eliminar")
      }
    } else {
      res
        .status(400)
        .send({
          error: -1,
          descripcion: "ruta api/productos/:id metodo:DELETE no autorizada",
        });
    }  
    } catch{
      res.status(400).send("Bad Request")
    }
    
  });
  
// *********************************************
//  -----  Fin de endpoints de productos -----
// *********************************************