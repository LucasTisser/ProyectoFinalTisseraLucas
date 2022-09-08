// Configuracion inicial en express de node.js
const express = require('express')
const {Router} = express
const app = express()
app.use(express.json())
app.use(express.static('public'))
app.use(express.urlencoded({extended:true}))

// Routers
const productos = Router()
const carrito = Router()

// Rutas alojadas en routers
app.use('/api/productos',productos)
app.use('api/carrito',carrito)

// Horario de ahora
const now = Date.now()


// Array de productos agregados
let listaProductos = [
    {
        'id':1,
        'timestamp' : `Horario ${now}`, // Agregar  
        'nombre':'Shampoo',
        'descripcion': 'descripcion', // Agregar 
        'codigo': 1234556, // Agregar 
        'foto': 'URL', // Agregar 
        'precio':'5USD',
        'stock': 50 // Agregar 
    }]

// constantes de admin y user para poder acceder a los endpoints correspondientes
const administrador = true
const user = false

// inicio de endpoints de productos

// Me permite listar todos los productos disponibles o un producto por su id (disponible para usuarios y administradores)
productos.get('/:id?', (req,res)=>{
    if (administrador || user) {
        const id = Number(req.params.id)
        if (id > 0) {
            // Muestra el producto pedido por su id
            const productoBuscado = listaProductos.filter(producto=>producto.id === id)
            if(listaProductos.length < id){
            res.status(404).send('No se ha encontrado un producto con dicho ID')
            } else {
            res.send(productoBuscado)
    }
        } else {
            // Devuelve todos los productos disponibles
            res.send(listaProductos)
        }
    } else {
        res.status(400).send({error:-1,descripcion:"ruta api/productos/id? metodo:GET no autorizada" })
    }
})
// Para incorporar productos al listado (disponible para administradores)
productos.post('/',(req,res,next) => {
    // Incorpora productos al listado siempre que administrador sea true
    if (administrador){
        const {nombre ,precio} = req.body
        if(!nombre || !precio){
        res.status(400).send({error:"Producto no guardado por falta de datos"})
        }
        next()
    }else {
        res.status(400).send({error:-1,descripcion:"ruta api/productos metodo:POST no autorizada" })
    }
},(req, res) => {
            const {nombre ,precio} = req.body
            if(nombre && precio){
                const id = Number(listaProductos[listaProductos.length-1].id) + 1
            listaProductos.push({nombre,precio,id})
            res.send('producto guardado con exito')
            }
    }
)
// Actualiza un producto por su id (disponible para administradores)
productos.put('/:id',(req,res) => {
    if(administrador){
        const id = Number(req.params.id)
        const {nombre,precio} = req.body;
        const index = listaProductos.findIndex(producto=>producto.id === id)
        if (index >= 0 ){
            listaProductos[index] = {nombre,precio, id}
            res.send(listaProductos[index])
        } else {
            res.status(404).send({error:"Producto no encontrado"})
        }
    } else {
        res.status(400).send({error:-1,descripcion:"ruta api/productos/:id metodo:PUT no autorizada" })
    }
})
// Borra un producto por su id (disponible para administradores)
productos.delete('/:id',(req,res) => {
    if(administrador){
        // Elimina un producto segun su id
        const id = Number(req.params.id)
        // filtrar los datos para identificar el objeto a eliminar y eliminarlo
        let listaFiltrada = listaProductos.filter((elemento) => elemento.id !== id);
        if (listaFiltrada.length == listaProductos.length) {
            res.status(404).send({error:"Producto no encontrado"})
        } else {
        // guardar el nuevo array con el nuevo objeto agregado
        listaProductos = listaFiltrada 
        res.send("Elemento eliminado")
        }
    } else {
        res.status(400).send({error:-1,descripcion:"ruta api/productos/:id metodo:DELETE no autorizada" })
    }
})
// Fin de endpoints productos


const PORT = 8080 || process.env.PORT
app.listen(PORT, ()=> {
    console.log('Server on '+ PORT)
})