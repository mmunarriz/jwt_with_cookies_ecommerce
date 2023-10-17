import { Router } from 'express';
import jwt from 'jsonwebtoken';
import userModel from '../dao/models/users.js';
import requireAuth from '../controllers/auth.js';
import { createHash, isValidPassword } from '../utils.js'

const router = Router();

router.get("/", (req, res) => {
    return res.json({ message: "Hello World" });
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
    return res
        .clearCookie("access_token")
        .status(200)
        .json({ message: "Successfully logged out" });
});

export default router;
