const { writeFile, readFile } = require("fs").promises;

class cartModel {
  constructor() {
    this.fileName = "./src/models/carritos.model.json";
  }

  async saveCarts(newCart) {
    try {
      // obtener todos los datos que ya existen en el archivo
      const stringData = JSON.stringify(newCart, null, 2);
      await writeFile(this.fileName, stringData);
      return true;
    } catch (error) {
      throw new Error(`Error al guardar: ${error}`);
    }
  }

  async readCarts() {
    try {
      const stringCarts = await readFile(this.fileName, "utf-8");
      const parsedCarts = JSON.parse(stringCarts);
      return parsedCarts;
    } catch (error) {
      const dataBase = {
        nextId: 1,
        cartsList: [],
      };
      this.saveCarts(dataBase);
      return dataBase;
    }
  }

  async createNewCart() {
    const cartDB = await this.readCarts();
    const newCart = {
      id: cartDB.nextId,
      timestamp: Date.now(),
      products: [],
    };
    cartDB.nextId++;
    cartDB.cartsList.push(newCart);
    const wasCreated = await this.saveCarts(cartDB);
    if (wasCreated) {
      return newCart;
    } else {
      return false;
    }
  }

  async deleteCartById(id) {
    const cartDB = await this.readCarts();
    const { cartsList } = cartDB;
    const cartIndex = cartsList.findIndex((cart) => cart.id === id);

    if (cartIndex >= 0) {
      cartsList.splice(cartIndex, 1);
      const wasSaved = await this.saveCarts(cartDB);
      return wasSaved;
    }
    return false;
  }

  async getCartById(id) {
    const { cartsList } = await this.readCarts();
    const cart = cartsList.find((cart) => cart.id == id);
    cart ? cart : "No se encontro el carrito";
    return cart;
  }

  async addProductToCart(cartId, productId) {
    const cartDB = await this.readCarts();
    const { cartsList } = cartDB;
    const cart = cartsList.find((cart) => cart.id === cartId);
    if (cart) {
      const product = cart.products.find(
        (product) => product.productId === productId
      );
      if (product) {
        product.cantidad++;
      } else {
        const newProduct = {
          productId,
          cantidad: 1,
        };
        cart.products.push(newProduct);
      }
      const wasSaved = await this.saveCarts(cartDB);
      if (wasSaved) {
        return product;
      } else {
        return false;
      }
    }
  }
  
  async deleteProductToCart(cartId, productId) {
    const cartDB = await this.readCarts();
    const { cartsList } = cartDB;
    const cart = cartsList.find((cart) => cart.id == cartId);

    if (cart) {
      const product = cart.products.find(
        (product) => product.productId == productId
      );

      if (product) {
        if (product.cantidad > 1) {
          product.cantidad--;
        } else {
          const productIndex = cart.products.findIndex(
            (product) => product.productId == productId
          );
          cart.products.splice(productIndex, 1);
        }
      } else {
        return "El producto no se encuentra en su carrito";
      }

      const wasSaved = await this.saveCarts(cartDB);
      if (wasSaved) {
        return "Se ha eliminado un producto";
      } else {
        return false;
      }
    }
  }
}

module.exports = {
  cartModel,
};
