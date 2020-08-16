import { container } from 'tsyringe';

import ICustomersRepository from '@modules/customers/repositories/ICustomersRepository';
import CustomersRepository from '@modules/customers/infra/typeorm/repositories/CustomersRepository';

import IProductsRepository from '@modules/products/repositories/IProductsRepository';
import ProductsRepository from '@modules/products/infra/typeorm/repositories/ProductsRepository';

import IOrdersRepository from '@modules/orders/repositories/IOrdersRepository';
import OrdersRepository from '@modules/orders/infra/typeorm/repositories/OrdersRepository';

export const CUSTOMERS_REPO = 'CustomersRepository';
export const PRODUCTS_REPO = 'ProductsRepository';
export const ORDERS_REPO = 'OrdersRepository';

container.registerSingleton<ICustomersRepository>(
  CUSTOMERS_REPO,
  CustomersRepository,
);

container.registerSingleton<IProductsRepository>(
  PRODUCTS_REPO,
  ProductsRepository,
);

container.registerSingleton<IOrdersRepository>(ORDERS_REPO, OrdersRepository);
