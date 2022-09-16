const productPostValidator = (req,res,next) => {
    const {
        nombre,
        descripcion,
        codigo,
        stock,
        foto,
        precio,
    } = req.body

    if (nombre && descripcion && codigo && stock && foto && precio) {
        next()
    } else {
        res.status(400).send("Faltan datos obligatorios para crear nuevo producto")
        }
}

module.exports = {
    productPostValidator
}