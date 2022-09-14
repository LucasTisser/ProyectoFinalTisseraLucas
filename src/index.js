// Configuracion inicial en express de node.js
const express = require("express");
const { Router } = express;
const app = express();
app.use(express.json());
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

const { promises: fs } = require("fs");

// Routers
const productos = Router();
const carrito = Router();

// Rutas alojadas en routers
app.use("/api/productos", productos);
app.use("/api/carrito", carrito);

// Horario de ahora
const now = Date.now();

// ****************************************************************************
// ----- Inicio de clase contenedor para manejo de archivos en filesystem -----
// ****************************************************************************
class Contenedor {
  constructor(ruta) {
    this.ruta = ruta;
  }
  async save(nuevoObjeto) {
    // obtener todos los datos que ya existen en el archivo
    const objetos = await this.getAll();
      
    let newId;
    if (objetos.length == 0) {
      newId = 1;
    } else {
      const ultimoId = Number(objetos.length);
      newId = ultimoId + 1;
    }
    // agregar el nuevo objeto al array que existe en el archivo
    objetos.push({ ...nuevoObjeto, id: newId });
    // guardar el nuevo array con el nuevo objeto agregado
    try {
      await fs.writeFile(this.ruta, JSON.stringify(objetos, null, 2));
      return newId;
    } catch (error) {
      throw new Error(`Error al guardar: ${error}`);
    }
  }
  async getById(id) {
    // obtener todos los datos que ya existen en el archivo
    const objetos = await this.getAll();
    let itemId = objetos.filter((item) => item.id === id);
    if (itemId.length > 0) {
      return itemId;
    } else {
      console.log("No se encontro un item con dicho id");
    }
  }
  async getAll() {
    try {
      const objetos = await fs.readFile(this.ruta, "utf-8");
      return JSON.parse(objetos);
    } catch (error) {
      return [];
    }
  }
  async deleteById(id) {
    // obtener todos los datos que ya existen en el archivo
    const objetos = await this.getAll();
    // filtrar los datos para identificar el objeto a eliminar y eliminarlo
    const nuevoObjeto = objetos.filter((elemento) => elemento.id !== id);
    if (nuevoObjeto.length == objetos.length) {
      console.log("No se encontro un item con dicho id para eliminar");
    } else {
      // guardar el nuevo array con el nuevo objeto agregado
      try {
        await fs.writeFile(this.ruta, JSON.stringify(nuevoObjeto, null, 2));
      } catch (error) {
        throw new Error(`Error al guardar: ${error}`);
      }
    }
  }
  async deleteAll() {
    fs.writeFile("productos.txt", "[]", function (err) {
      if (err) throw err;
    });
  }
}
const manejoArchivosCarrito = new Contenedor("./public/Carritos.json");
const manejoArchivosProductos = new Contenedor("./public/productos.json");

// *************************************************************************
// ----- Fin de clase contenedor para manejo de archivos en filesystem -----
// *************************************************************************

// constantes de admin y user para poder acceder a los endpoints correspondientes
const administrador = true;
const user = false;

// *********************************************
//  ----- inicio de endpoints de productos -----
// *********************************************

// Me permite listar todos los productos disponibles o un producto por su id (disponible para usuarios y administradores)
productos.get("/:id?", async (req, res) => {
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
productos.post("/",(req, res, next) => {
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
productos.put("/:id",async (req, res) => {
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
productos.delete("/:id", async (req, res) => {
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

// ---------------------------------------------

// *********************************************
//  -----  inicio de endpoints del carrito -----
// *********************************************

// Crea un carrito y devuelve su id
carrito.post("/", async (req, res) => {
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
carrito.delete("/:id", async (req, res) => {
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
carrito.get("/:id/productos", async (req, res) => {
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
carrito.post("/:id/productos", async (req, res) => {
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
carrito.delete("/:id/productos/:id_prod", (req, res) => {
  // Eliminar un producto del carrito por su id de carrito y de producto
  if (administrador || user) {
  }
});
// ******************************************
//  ----- Fin de endpoints del carrito -----
// ******************************************

const PORT = 8080 || process.env.PORT;
app.listen(PORT, () => {
  console.log("Server on " + PORT);
});
