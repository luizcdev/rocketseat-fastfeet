import { Router } from 'express';
import multer from 'multer';
import multerConfig from './config/multer';
import authMiddleware from './app/middlewares/auth';
import UserController from './app/controllers/UserController';
import SessionController from './app/controllers/SessionController';
import RecipientController from './app/controllers/RecipientController';
import DeliveryManController from './app/controllers/DeliveryManController';
import OrderController from './app/controllers/OrderController';
import managerMiddleware from './app/middlewares/manager';

const routes = new Router();
const upload = multer(multerConfig);

routes.post('/sessions', SessionController.store);
routes.use(authMiddleware);

routes.post('/users', UserController.store);
routes.put('/users', UserController.update);

routes.put('/file', upload.single('file'), (req, res) => {
  return res.json({ ok: true });
});

routes.get('/recipients/', managerMiddleware, RecipientController.index);
routes.post('/recipients', managerMiddleware, RecipientController.store);
routes.put('/recipients/:id', managerMiddleware, RecipientController.update);
routes.delete('/recipients/:id', managerMiddleware, RecipientController.delete);

routes.get('/deliverymans/', managerMiddleware, DeliveryManController.index);
routes.post('/deliverymans', managerMiddleware, DeliveryManController.store);
routes.put(
  '/deliverymans/:id',
  managerMiddleware,
  DeliveryManController.update
);
routes.delete(
  '/deliverymans/:id',
  managerMiddleware,
  DeliveryManController.delete
);

routes.get('/orders/', managerMiddleware, OrderController.index);
routes.post('/orders', managerMiddleware, OrderController.store);
routes.put('/orders/:id', managerMiddleware, OrderController.update);
routes.delete('/orders/:id', managerMiddleware, OrderController.delete);

export default routes;
