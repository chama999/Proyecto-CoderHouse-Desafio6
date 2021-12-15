const express = require("express")
const path=require('path')
const libsDir=path.normalize(__dirname + "/libs/lib.js")
const Lib = require(libsDir)
const { Router } = express;
const router = Router();
const multer = require('multer')
const urlLista = "http://localhost/" + process.env.PORT||3000 + "/list"


let visitCounter = 0
let requestCounter = 0
const app = express();
const lib = new Lib()

var message = {
    user: "admin",
    message: "Bienvenido al chat",
    date: dateIni = new Date().toLocaleDateString()
}


//middlewares
app.use(express.static(__dirname +"/public"));
app.use(express.json())
app.use(express.urlencoded({
    extended: true
}))
app.use('/files', express.static('uploads'))

//configuración storage del multer.
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'uploads')
    },
    filename: function(req, file, cb) {
        cb(null, file.originalname)
    }
})

//multer para subir archivos
const upload = multer({ storage })

// SET TEMPLATE ENGINE
app.set('views', './views')
app.set('view engine', 'ejs')

//imprimo fecha hora en cada visita y genero contador.
app.use(function(req, res, next) {
    console.log("Time: ", Date.now())
    visitCounter++
    next()
    })

//por cada request, creo arc-hivo y guardo contador.
router.use(function (req, res, next) {
    lib.createFile()
    requestCounter++
    next()
})

app.get('/', (req, res) => {
    let listaProductos = lib.getAllObjects()

    res.render('ejs/main',{list: listaProductos,visitCounter,requestCounter,urlLista})
})

app.get('/list', (req, res) => {
    let listaProductos = lib.getAllObjects()
    res.render('ejs/list',{list: listaProductos,visitCounter,requestCounter,urlLista})
})

router.get('/:id', (req, res) => {
    try {
        console.log("GET por ID")
        let productos = lib.getAllObjects()
        let id = req.params.id;
        console.log("Id a buscar: "+ id)
        let producto = productos.find(c => c.id == id)
        if (producto == undefined) {
            throw new Error(`Producto ${id} no encontrado`)

        } else {
            console.log(`El producto con ${id} es: ${producto}`)
            res.json(producto)
        }
    } catch (error) {  
        res.status(404).send({
            error: {
            status: 404,
            message: error.message
            }
        })  
    }
})

router.post("/", upload.single('thumbail'), (req, res) => {
    console.log("Inicio Guardado de Producto: "+ JSON.stringify(req.body));
    let obj = req.body
    const file = req.file
    console.log("Nombre Archivo: "+ file)
    obj.thumbail = "/files/" + file.filename;
    console.log("Producto guardado" + obj.thumbail)

    lib.saveObjects(obj)
    console.log("Producto guardado" + JSON.stringify(obj))

    return res.redirect("/")
})

router.put('/:id', (req, res) => {
    try{
        console.log("------new put request-------")
        let productos = lib.getAllObjects()
        let id = req.params.id;
        console.log("-------------------------")
        console.log("Id a buscar: "+ id)
        let productIndex = productos.findIndex(c => c.id == id)
        console.log("-------------------------")
        console.log("Index a buscar: "+ productIndex)
        if (productIndex<0) {
            throw new Error(`No se encontro el producto con ${id}`) 
        }
    else {
        console.log(`El producto con id ${id} es: ${productos[productIndex]}`)
        console.log("-------------------------")
        console.log(JSON.stringify(productos[productIndex]))
        lib.updateObjectById(req.body, id)
        console.log("-------------------------")
        console.log(JSON.stringify(productos[productIndex]))
        res.json({
            resultCode: '200',
            message: 'Producto actualizado',
            nuevo: req.body
        })}
    } catch (error) {
        res.status(404).send({
            error: {
            status: 404,
            message: error.message
            }
        })
    }
    })




router.delete('/:id', (req, res) => {
    try {
        //delete from object listaProductos
        let listaProductos = lib.getAllObjects()
        let id = req.params.id;
        console.log("Id a borrar: "+ id)
        let producto = listaProductos.find(c => c.id == id)
        if (producto == undefined) {
            res.status(400).send(
                {
                    error: "400",
                    errorMessage: `Producto id: ${id} no encontrado`
                }
            )
        }
        else {
            console.log(`El producto con ${id} es: ${producto}`)
            lib.deleteObjectById(id)
            res.send({
                resultCode: '200',
                title: producto.title,
                id: producto.id,
                message: 'Producto borrado'
            })
    }
    } catch (error) {
        res.status(404).send({
            error: {
            status: 404,
            message: error.message
            }
})
    }
})




app.use('/api/productos', router)

//websockets connection
const server = app.listen(process.env.PORT || 3000, () => {
    console.log("Server running on port 3000")
})
const io = require('socket.io')(server)

io.on('connection', (socket) => {
    // Se ejecuta una sola vez, cuando se conecta
    // el cliente
    let now = new Date().toLocaleTimeString();
    console.log("--------------------------")
    console.log(`[${now}] Se abrió una nueva conexión !!`)
    console.log(`[${JSON.stringify(message)}] Se abrió una nueva conexión !!`)
    socket.emit('message', message)
    
    // Cada vez que llega un mensaje al evento 'message'
   
    socket.on("message", data => {
        console.log(data);
        io.sockets.emit("message", data)
    })

})

app.use(function(err, req, res, next) {
    //res.status(400).send("Pagina no disponible en este momento. Por favor, intente más tarde.")
    res.status(err.status || 404).send({
        err: {
        status: err.status || 404,
        message: err.message || "Pagina no encontrada."
        }
    })  
})