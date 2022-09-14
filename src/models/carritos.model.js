const { writeFile , readFile } = require("fs").promises;

// Horario de ahora
const now = Date.now();

// ****************************************************************************
// ----- Inicio de clase contenedor para manejo de archivos en filesystem -----
// ****************************************************************************
class cartModel {
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
  // *************************************************************************
// ----- Fin de clase contenedor para manejo de archivos en filesystem -----
// *************************************************************************

module.exports = {
  cartModel
}