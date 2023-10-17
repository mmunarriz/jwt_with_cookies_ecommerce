import { Router } from 'express';
import jwt from 'jsonwebtoken';
import userModel from '../dao/models/users.js';
import requireAuth from '../controllers/auth.js';

const router = Router();

router.get("/", (req, res) => {
    return res.json({ message: "Hello World 🇵🇹 🤘" });
});

router.post("/login", async (req, res) => {
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
        // Maneja errores en la base de datos.
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
});

router.get("/protected", requireAuth, (req, res) => {
    return res.json({ user: { email: req.userEmail, password: req.userPassword } });
});

router.get("/logout", requireAuth, (req, res) => {
    return res
        .clearCookie("access_token")
        .status(200)
        .json({ message: "Successfully logged out 😏 🍀" });
});

export default router;
