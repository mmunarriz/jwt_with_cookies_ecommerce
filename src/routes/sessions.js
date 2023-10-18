import { Router } from 'express';
import jwt from 'jsonwebtoken';
import userModel from '../dao/models/users.js';
import requireAuth from '../controllers/auth.js';
import { createHash, isValidPassword } from '../utils.js'

const router = Router();

router.get("/", (req, res) => {
    return res.json({ message: "Hello World" });
});

router.post('/register', async (req, res) => {
    try {
        const { first_name, last_name, email, age, password } = req.body;

        // Verifica los campos obligatorios en la solicitud.
        if (!first_name || !last_name || !email || !password) {
            return res.status(400).json({ status: "error", error: "Missing required fields" });
        }

        // Verifica si el "email" ya existe en la DB
        const exists = await userModel.findOne({ email });
        if (exists) {
            return res.status(400).json({ status: "error", error: "User already exists" });
        }

        // Crea el usuario en la DB
        const user = {
            first_name,
            last_name,
            email,
            age,
            password: createHash(password)
        }
        const result = await userModel.create(user);
        return res.status(200).json({ status: "success", message: "User registered" });
    } catch (error) {
        console.error("User registration error:", error);
        return res.status(500).json({ status: "error", error: "Internal Server Error" });
    }
});

router.post("/login", async (req, res) => {
    const { email, password } = req.body;

    // Comprueba si los datos coinciden con estos.
    if (email === "adminCoder@coder.com" && password === "adminCod3r123") {
        // Inicia una sesión de usuario Administrador.
        req.session.user = {
            name: "Admin Coderhouse",
            email: email,
            rol: "admin"
        }
        const userRole = "admin";
        // Genera un token JWT y establece la cookie.
        const token = jwt.sign({ email, rol: userRole }, "ECOMMERCE_SECRET_KEY", {
            expiresIn: '1h', // Tiempo de expiración de 1 hora
        });

        return res
            .cookie("access_token", token, {
                httpOnly: true,
            })
            .status(200)
            .json({ status: "success", payload: req.session.user, message: "Logged in successfully" });
    }

    // Si no coinciden los datos locales, verifica en la base de datos.
    try {
        // Busca el usuario en la base de datos.
        const user = await userModel.findOne({ email });

        if ((!user) || (!isValidPassword(user, password))) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        // Inicia una sesión de usuario.
        req.session.user = {
            name: `${user.first_name} ${user.last_name}`,
            email: user.email,
            rol: user.role
        }

        const userRole = user.role;
        // Genera un token JWT y establece la cookie.
        const token = jwt.sign({ email, rol: userRole }, "ECOMMERCE_SECRET_KEY", {
            expiresIn: '1h', // Tiempo de expiración de 1 hora
        });

        return res
            .cookie("access_token", token, {
                httpOnly: true,
            })
            .status(200)
            .json({ status: "success", payload: req.session.user, message: "Logged in successfully" });

    } catch (error) {
        // Maneja errores en la base de datos.
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
});

router.get("/protected", requireAuth, (req, res) => {
    return res.json({ user: { email: req.userEmail, rol: req.userRol } });
});

router.get("/logout", requireAuth, (req, res) => {
    // Accede al ID de la sesión desde la sesión actual
    const sessionId = req.sessionID;

    // Destruye la sesión actual en la base de datos MongoDB Atlas
    req.session.destroy((err) => {
        if (err) {
            console.error('Error destroying session in MongoDB:', err);
            return res.status(500).json({ message: "Internal server error" });
        }

        // Elimina la cookie con el token JWT
        res.clearCookie("access_token");

        // Elimina la cookie "connect.sid"
        res.clearCookie("connect.sid");

        // Respuesta exitosa
        return res.status(200).json({ message: "Successfully logged out" });
    });
});


export default router;
