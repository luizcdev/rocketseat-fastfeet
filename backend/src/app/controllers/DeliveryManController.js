import * as Yup from 'yup';
import DeliveryMan from '../models/DeliveryMan';
import File from '../models/File';

class DeliveryManController {
  async index(req, res) {
    const { page = 1 } = req.query;

    const deliveryMans = await DeliveryMan.findAll({
      attributes: ['id', 'nem', 'email'],
      limit: 20,
      offset: (page - 1) * 20,
      include: [
        {
          model: File,
          as: 'avatar',
          attributes: ['name', 'path', 'url'],
        },
      ],
    });

    return res.json(deliveryMans);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      email: Yup.email().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails!' });
    }

    const { name, email } = req.body;

    const deliveryMan = await DeliveryMan.create({
      name,
      email,
    });

    return res.json({ deliveryMan });
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      id: Yup.number(),
      name: Yup.string(),
      email: Yup.email(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails!' });
    }

    const deliveryMan = await DeliveryMan.update(req.body);

    return res.json({ deliveryMan });
  }

  async delete(req, res) {
    const deliveryMan = await DeliveryMan.findByPk(req.params.id);

    if (!deliveryMan) {
      return res.status(500).json({ error: 'Delivery man not found!' });
    }

    await deliveryMan.delete();

    return res.status(200);
  }
}

export default new DeliveryManController();
