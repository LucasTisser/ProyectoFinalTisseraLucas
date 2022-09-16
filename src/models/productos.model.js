const { writeFile, readFile } = require("fs").promises;

class productsModel {
  constructor() {
    this.fileName = "./src/models/productos.model.json";
  }

  async saveProducts(newProduct) {
    try {
      const stringData = JSON.stringify(newProduct, null, 2);
      await writeFile(this.fileName, stringData);
      return true;
    } catch (error) {
      throw new Error(`Error al guardar: ${error}`);
    }
  }

  async readProducts() {
    try {
      const stringProducts = await readFile(this.fileName, "utf-8");
      const parsedProducts = JSON.parse(stringProducts);
      return parsedProducts;
    } catch (error) {
      const dataBase = {
        nextId: 1,
        productsList: [],
      };
      this.saveProducts(dataBase);
      return dataBase;
    }
  }

  async createProduct(newProduct) {

    const productsDB  = await this.readProducts();
    const id = productsDB.nextId;
    productsDB.nextId++;
    const timeStamp = Date.now();
    newProduct.stock = newProduct.stock || 1;

    const completeNewProduct = {
      ...newProduct,
      id,
      timeStamp,
    };
    productsDB.productsList.push(completeNewProduct);
    const wasCreated = await this.saveProducts(productsDB);
    if (wasCreated) return completeNewProduct;
    return wasCreated;
  }

  async getProducts() {
    const { productsList } = await this.readProducts();
    return productsList;
  }

  async getProductById(id) {
    // obtener todos los datos que ya existen en el archivo
    const { productsList } = await this.readProducts();
    const product = productsList.find((product) => product.id == id );
    // console.log(product)
    product ? product : "No se encontro el producto a modificar"
    return product;
  }

  async updateProduct(productId, newData) {
    const productDB = await this.readProducts();
    const { productsList } = productDB;
    const product = productsList.find((product) => product.id === productId);

    if (product) {
      Object.keys(newData).forEach((key) => {
        product[key] = newData[key];
      });
    } else return false;

    const wasUpdated = await this.saveProducts(productDB);
    if (wasUpdated) return product;
    return wasUpdated;
  }

  async deleteById(id) {
    const productDB = await this.readProducts();
    const { productsList } = productDB;
    const index = productsList.findIndex((product) => product.id === id);

    if (index >= 0) {
      productsList.splice(index, 1);
      const wasSaved = await this.saveProducts(productDB);
      return wasSaved;
    }
    return false;
  }
}

module.exports = {
  productsModel,
};