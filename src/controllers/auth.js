import jwt from 'jsonwebtoken';

const authorization = (req, res, next) => {
    const token = req.cookies.access_token;
    if (!token) {
        return res.redirect('/login');
    }
    try {
        const data = jwt.verify(token, "ECOMMERCE_SECRET_KEY");
        req.userEmail = data.email;
        req.userRol = data.rol;
        return next();
    } catch {
        return res.redirect('/login');
    }
};

export default authorization;
