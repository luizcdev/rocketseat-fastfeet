import Mail from '../../lib/Mail';

class NewOrderMail {
  get key() {
    return 'NewOrderMail';
  }

  async handle({ data }) {
    const { order } = data;

    await Mail.sendMail({
      to: `${order.deliveryMan.name} <${order.deliveryMan.email}>`,
      subject: `Nova entrega`,
      template: 'neworder',
      context: {
        deliveryMan: order.deliveryMan,
        client: order.recipient.name,
        product: order.product,
        address: `${order.recipient.street}, ${order.recipient.number} - ${order.recipient.complement}, ${order.recipient.city}/${order.recipient.state}`,
        zipCode: order.recipient.zip_code,
      },
    });
  }
}

export default new NewOrderMail();
