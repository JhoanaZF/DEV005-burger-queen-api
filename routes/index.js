import auth from './auth.js';
import users from './users.js';
import products from './products.js';
import orders from './orders.js';

// Controlador de la ruta raíz '/'
const root = (app, next) => {
  const pkg = app.get('pkg');
  app.get('/', (req, res) => res.json({ name: pkg.name, version: pkg.version })); 
  app.all('*', (req, resp, nextAll) => nextAll(404)); 
  return next();
};

// Función recursiva para registrar rutas
const register = (app, routes, cb) => {
  if (!routes.length) {
    return cb(); 
  }

  routes[0](app, (err) => {
    if (err) {
      return cb(err); 
    }
    return register(app, routes.slice(1), cb); 
  });
};

// Función principal para registrar todas las rutas
const registerRoutes = (app, next) => register(app, [auth, users, products, orders, root], next);

export default registerRoutes;