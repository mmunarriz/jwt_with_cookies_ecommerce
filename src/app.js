import express from 'express';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import mongoose from 'mongoose';
import handlebars from 'express-handlebars';
import __dirname from './utils.js';
import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken';
import requireAuth from './controllers/auth.js';
import config from './config/config.js';
import userModel from './dao/models/users.js';

const urlMongo = config.mongoUrl
const PORT = config.port

const app = express();
app.use(cookieParser());
const connection = mongoose.connect(urlMongo, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/public'))
app.use(session({
    store: new MongoStore({
        mongoUrl: urlMongo,
        ttl: 3600
    }),
    secret: "3c0mm3rc3l0g1n",
    resave: false,
    saveUninitialized: false
}))

app.engine('handlebars', handlebars.engine());
app.set('views', __dirname + '/views');
app.set('view engine', 'handlebars');

app.get("/", (req, res) => {
    return res.json({ message: "Hello World 🇵🇹 🤘" });
});

app.post("/login", async (req, res) => {
    const { email, password } = req.body;

    try {
        // Busca el usuario en la base de datos.
        const user = await userModel.findOne({ email });

        if (user && user.password === password) {
            // Las credenciales son válidas, genera un token JWT y establece la cookie.
            const token = jwt.sign({ email, password }, "ECOMMERCE_SECRET_KEY", {
                expiresIn: '1h', // Tiempo de expiración de 1 hora
            });
            return res
                .cookie("access_token", token, {
                    httpOnly: true,
                })
                .status(200)
                .json({ message: "Logged in successfully 😊 👌" });
        } else {
            // Credenciales incorrectas.
            return res.status(401).json({ message: "Invalid credentials" });
        }
    } catch (error) {
        // Maneja errores de base de datos.
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
});


app.get("/protected", requireAuth, (req, res) => {
    return res.json({ user: { email: req.userEmail, password: req.userPassword } });
});

app.get("/logout", requireAuth, (req, res) => {
    return res
        .clearCookie("access_token")
        .status(200)
        .json({ message: "Successfully logged out 😏 🍀" });
});

const server = app.listen(PORT, () => console.log("Listening on port " + PORT))
