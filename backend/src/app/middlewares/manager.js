import User from '../models/User';

export default async (req, res, next) => {
  if (req.userId) {
    const user = await User.findOne({ where: { id: req.userId } });
    if (!(user && user.manager)) {
      return res.status(401).json({ error: 'Acesso negado' });
    }

    return next();
  }
};
