import jwt from 'jsonwebtoken';

const authorization = (req, res, next) => {
    const token = req.cookies.access_token;
    if (!token) {
        return res.sendStatus(403);
    }
    try {
        const data = jwt.verify(token, "ECOMMERCE_SECRET_KEY");
        req.userEmail = data.email;
        req.userRol = data.rol;
        return next();
    } catch {
        return res.sendStatus(403);
    }
};

export default authorization;
