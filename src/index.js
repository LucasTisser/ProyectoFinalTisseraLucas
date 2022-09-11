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
      console.log(itemId);
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
const manejoArchivos = new Contenedor("./public/productos.txt");
// *************************************************************************
// ----- Fin de clase contenedor para manejo de archivos en filesystem -----
// *************************************************************************

// Array de productos agregados y carrito
let listaProductos = [
  {
    id: 1,
    timestamp: `Horario ${now}`,
    nombre: "Shampoo",
    descripcion: "descripcion",
    codigo: 1234556,
    foto: "URL",
    precio: "5USD",
    stock: 50,
  },
];

// constantes de admin y user para poder acceder a los endpoints correspondientes
const administrador = true;
const user = false;

// *********************************************
//  ----- inicio de endpoints de productos -----
// *********************************************

// Me permite listar todos los productos disponibles o un producto por su id (disponible para usuarios y administradores)
productos.get("/:id?", (req, res) => {
  if (administrador || user) {
    const id = Number(req.params.id);
    if (id > 0) {
      // Muestra el producto pedido por su id
      const productoBuscado = listaProductos.filter(
        (producto) => producto.id === id
      );
      if (listaProductos.length < id) {
        res.status(404).send("No se ha encontrado un producto con dicho ID");
      } else {
        res.send(productoBuscado);
      }
    } else {
      // Devuelve todos los productos disponibles
      res.send(listaProductos);
    }
  } else {
    res
      .status(400)
      .send({
        error: -1,
        descripcion: "ruta api/productos/id? metodo:GET no autorizada",
      });
  }
});
// Para incorporar productos al listado (disponible para administradores)
productos.post(
  "/",
  (req, res, next) => {
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
  (req, res) => {
    const { nombre, descripcion, codigo, foto, precio, stock } = req.body;
    if (nombre && descripcion && codigo && foto && precio && stock) {
      const timestamp = Date.now();
      const productsLength = listaProductos.length;
      // Si el array de productos esta vacio, el condicional asignara la primera id y pushea la informacion
      if (productsLength < 1) {
        const id = 1;
        listaProductos.push({
          id,
          timestamp,
          nombre,
          descripcion,
          codigo,
          foto,
          precio,
          stock,
        });
        res.send("producto guardado con exito");
      } else {
        const id = Number(listaProductos[listaProductos.length - 1].id) + 1;
        listaProductos.push({
          id,
          timestamp,
          nombre,
          descripcion,
          codigo,
          foto,
          precio,
          stock,
        });
        res.send("producto guardado con exito");
      }
    }
  }
);
// Actualiza un producto por su id (disponible para administradores)
productos.put("/:id", (req, res) => {
  if (administrador) {
    const id = Number(req.params.id);
    const { nombre, precio, timestamp, descripcion, codigo, foto, stock } =
      req.body;
    const index = listaProductos.findIndex((producto) => producto.id === id);
    if (index >= 0) {
      listaProductos[index] = {
        nombre,
        precio,
        timestamp,
        descripcion,
        codigo,
        foto,
        stock,
      };
      res.send(listaProductos[index]);
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
});
// Borra un producto por su id (disponible para administradores)
productos.delete("/:id", (req, res) => {
  if (administrador) {
    // Elimina un producto segun su id
    const id = Number(req.params.id);
    // filtrar los datos para identificar el objeto a eliminar y eliminarlo
    let listaFiltrada = listaProductos.filter((elemento) => elemento.id !== id);
    if (listaFiltrada.length == listaProductos.length) {
      res.status(404).send({ error: "Producto no encontrado" });
    } else {
      // guardar el nuevo array con el nuevo objeto agregado
      listaProductos = listaFiltrada;
      res.send("Elemento eliminado");
    }
  } else {
    res
      .status(400)
      .send({
        error: -1,
        descripcion: "ruta api/productos/:id metodo:DELETE no autorizada",
      });
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
      // Inicio de mantenimiento
      const cart = await manejoArchivos.getAll();
      if (cart.length < 1) {
        const id = 1;
        const carritoUser = manejoArchivos.save([
          {
            id: id,
            timestamp: `Horario ${now}`,
            productos: listaProductos,
          },
        ]);
        res.send(carritoUser)
      } else {
        const id = Number(cart.length) + 1;
        const carritoUser = manejoArchivos.save([
          {
            id: id,
            timestamp: `Horario ${now}`,
            productos: listaProductos,
          },
        ]);
        res.send(carritoUser)
      }
    }    
  } catch {
    res.status(400).send("bad request")
  }
    // // Fin de mantenimiento
  
});
carrito.delete("/:id", (req, res) => {
  // Vacia un carrito y lo elimina
  if (administrador || user) {
  }
});
carrito.get("/:id/productos", (req, res) => {
  // Me permite listar todos los productos guardados en el carrito
  if (administrador || user) {
  }
});
carrito.post("/:id/productos", (req, res) => {
  // Para incorporar productos al carrito por su id de producto
  if (administrador || user) {
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
