import * as Yup from 'yup';
import {
  isWithinInterval,
  parseISO,
  setHours,
  setMinutes,
  setSeconds,
} from 'date-fns';
import Order from '../models/Order';
import File from '../models/File';
import DeliveryMan from '../models/DeliveryMan';
import Recipient from '../models/Recipient';
import NewOrderMail from '../jobs/NewOrderMail';
import Queue from '../../lib/Queue';

class OrderController {
  async index(req, res) {
    const { page = 1 } = req.query;

    const orders = await Order.findAll({
      attributes: ['id', 'product', 'start_date', 'end_date', 'canceled_at'],
      limit: 20,
      offset: (page - 1) * 20,
      include: [
        {
          model: DeliveryMan,
          as: 'deliveryman',
          attributes: ['name', 'email'],
        },
        {
          model: Recipient,
          as: 'recipient',
          attributes: [
            'name',
            'street',
            'number',
            'complement',
            'city',
            'state',
            'zip_code',
          ],
        },
        {
          model: File,
          as: 'signature',
          attributes: ['name', 'path', 'url'],
        },
      ],
    });

    return res.json(orders);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      product: Yup.string().required(),
      recipient_id: Yup.number()
        .integer()
        .positive()
        .required(),
      deliveryman_id: Yup.number()
        .integer()
        .positive()
        .required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails!' });
    }

    const { product, recipient_id, deliveryman_id } = req.body;

    const recipient = await Recipient.findByPk(recipient_id);
    if (!recipient)
      return res.status(400).json({ error: 'Recipient not found!' });

    const deliveryMan = await DeliveryMan.findByPk(deliveryman_id);
    if (!deliveryMan)
      return res.status(400).json({ error: 'DeliveryMan not found!' });

    const order = await Order.create({
      product,
      recipient_id,
      deliveryman_id,
    });

    await Queue.add(NewOrderMail.key, {
      order,
    });

    return res.json({ order });
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      signature_id: Yup.number()
        .integer()
        .positive(),
      start_date: Yup.date(),
      end_date: Yup.date(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails!' });
    }

    const { signature_id, start_date } = req.body;

    if (signature_id) {
      const signature = File.findByPk(signature_id);
      if (!signature)
        return res.status(400).json({ error: 'Signature not found!' });
    }

    if (start_date) {
      let startPeriod = new Date();
      startPeriod = setHours(startPeriod, '08');
      startPeriod = setMinutes(startPeriod, '00');
      startPeriod = setSeconds(startPeriod, '00');

      let endPeriod = new Date();
      endPeriod = setHours(endPeriod, '18');
      endPeriod = setMinutes(endPeriod, '00');
      endPeriod = setSeconds(endPeriod, '00');

      const startDate = parseISO(start_date);

      if (!isWithinInterval(startDate, startPeriod, endPeriod))
        return res
          .status(400)
          .json({ error: 'Pickup date need is between 08:00 and 18:00!' });
    }

    const order = await Order.update(req.body);

    return res.json({ order });
  }

  async delete(req, res) {
    const order = await Order.findByPk(req.params.id);

    if (!order) {
      return res.status(500).json({ error: 'Order not found!' });
    }

    order.canceled_at = new Date();
    await order.save();

    return res.json(order);
  }
}

export default new OrderController();
