import ICustomersRepository from '@modules/customers/repositories/ICustomersRepository';
import IProductsRepository from '@modules/products/repositories/IProductsRepository';
import { CUSTOMERS_REPO, ORDERS_REPO, PRODUCTS_REPO } from '@shared/container';
import AppError from '@shared/errors/AppError';
import { inject, injectable } from 'tsyringe';
import Order from '../infra/typeorm/entities/Order';
import IOrdersRepository from '../repositories/IOrdersRepository';

interface IProduct {
  id: string;
  quantity: number;
}

interface IRequest {
  customer_id: string;
  products: IProduct[];
}

@injectable()
class CreateOrderService {
  constructor(
    @inject(ORDERS_REPO) private ordersRepository: IOrdersRepository,
    @inject(PRODUCTS_REPO) private productsRepository: IProductsRepository,
    @inject(CUSTOMERS_REPO) private customersRepository: ICustomersRepository,
  ) {}

  public async execute({ customer_id, products }: IRequest): Promise<Order> {
    const customer = await this.customersRepository.findById(customer_id);

    if (!customer) {
      throw new AppError('Invalid customer id');
    }

    const storedProducts = await this.productsRepository.findAllById(products);

    if (!storedProducts.length) {
      throw new AppError('No products found for the given ids');
    }

    const storedProductsIds = storedProducts.map(p => p.id);

    const checkInexistentProducts = products.filter(
      product => !storedProductsIds.includes(product.id),
    );

    if (checkInexistentProducts.length > 0) {
      throw new AppError(`${checkInexistentProducts} have invalid ids`);
    }

    let findProductsWithoutStock = [];

    findProductsWithoutStock = storedProducts.filter(product => {
      const productToCompare = products.find(({ id }) => id === product.id);

      if (productToCompare && product.quantity < productToCompare.quantity) {
        return product;
      }
    });

    if (findProductsWithoutStock.length > 0) {
      throw new AppError(
        `${findProductsWithoutStock.length} product doesn't have enough stock`,
      );
    }

    const order = await this.ordersRepository.create({
      customer,
      products: products.map((product, index) => ({
        product_id: product.id,
        quantity: product.quantity,
        price: storedProducts[index].price,
      })),
    });

    const { order_products } = order;

    const productsToUpdate = storedProducts.map((product, index) => ({
      id: product.id,
      quantity: product.quantity - order_products[index].quantity,
    }));

    await this.productsRepository.updateQuantity(productsToUpdate);

    return order;
  }
}

export default CreateOrderService;
