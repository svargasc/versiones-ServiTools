const express = require('express');
let mysql = require('mysql');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const app = express();
//se habilita a express para analizar y leer diferentes datos de la solicitud, por ejemplo
//formularios
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');//se establece express para que maneje plantillas ejs
app.use('/public/', express.static('./public'));//en la carpeta public cargaremos los archivos
//estaticos
const port = 10101;
const pool = mysql.createPool({
    connectionLimit: 100,
    host: 'localhost',
    user: 'root',
    password: 'Sena1234',
    database: 'servitools',
    debug: false
});
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    auth: {
        user: 'servi.tools22@gmail.com',
        pass: 'izmthaseotcktbwc'
    }
});
app.get('/', (req, res) => {
    res.render('index')//se retorna la plantilla llamada index al cliente
})
app.get('/registro', (req, res) => {
    //se retorna la plantilla llamada registro que contiene
    //el formulario de registro
    res.render('registro')
})
app.get('/login', (req, res) => {
    res.render('login');
})
app.get('/seleccion', (req,res)=>{
    res.render('seleccion');
})
app.get('/productos', (req,res)=>{
    res.render('productos');
})

app.post('/registro', (req, res) => {
    //se obtienen los valores de los inputs del
    //formulario
    //de registro
    let nombres = req.body.nombres;
    let apellidos = req.body.apellidos;
    let usuario = req.body.usuario;
    let contrasena = req.body.contrasena;
    let correo = req.body.correo;
    const saltRounds = 10;
    const salt = bcrypt.genSaltSync(saltRounds);
    //convertimos a hash el password del usuario
    const hash = bcrypt.hashSync(contrasena, salt);
    pool.query("INSERT INTO registro VALUES (?, ?, ?, ?, ?)", [nombres, apellidos, usuario, hash, correo],
        (error) => {
            if (error) throw error;
            res.redirect('/');
            transporter.sendMail({
                from: 'servi.tools22@gmail.com',
                to: `${correo}`,
                subject: 'Confirmación de correo',
                html: '<h1>Gracias por registrarte! UwU</h1> <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSL14vd2g6r-QSkK6NRJ9Rdc2svG3auTMQuORMe9SxkCJf2xJRsSCPaVOZAnsYVCSny7VY&usqp=CAU">'
            }).then((res) => { console.log(res); }).catch((err) => { console.log(err); });
        });
})

// app.get('/interfaz-login', (req, res) => {
//     //se retorna la plantilla llamada login que contiene
//     //el formulario de login
//     res.render('login')
// })
app.post('/login', (req, res) => {
    //se obtienen los valores de los inputs del formulario
    //de login
    let usuario = req.body.usuario;
    let contrasena = req.body.contrasena;
    pool.query("SELECT contraseña FROM registro WHERE usuario=?", [usuario], (error, data) => {
        if (error) throw error;
        //si existe un correo igual al correo que llega en el formulario de login...
        if (data.length > 0) {
            let contrasenaEncriptada = data[0].contraseña;
            //si la contraseña enviada por el usuario, al comparar su hash generado,
            //coincide con el hash guardado en la base de datos del usuario, hacemos login
            if (bcrypt.compareSync(contrasena, contrasenaEncriptada)) {
                return res.redirect('/seleccion');
            }
            //si la contraseña enviada por el usuario es incorrecta...
            return res.send('Usuario o contraseña incorrecta');
        }
        //si no existe el usuario en la base de datos...
        return res.send('Usuario o contraseña incorrecta');
    });
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
});