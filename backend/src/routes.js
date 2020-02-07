import { Router } from 'express';
import authMiddleware from './app/middlewares/auth';
import UserController from './app/controllers/UserController';
import SessionController from './app/controllers/SessionController';
import RecipientController from './app/controllers/RecipientController';
import managerMiddleware from './app/middlewares/manager';

const routes = new Router();

routes.post('/sessions', SessionController.store);
routes.use(authMiddleware);

routes.post('/users', UserController.store);
routes.put('/users', UserController.update);

routes.get('/recipients/', RecipientController.index);
routes.post('/recipients', managerMiddleware, RecipientController.store);
routes.put('/recipients/:id', managerMiddleware, RecipientController.update);
routes.delete('/recipients/:id', managerMiddleware, RecipientController.delete);

export default routes;
