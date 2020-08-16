import { CUSTOMERS_REPO } from '@shared/container';
import AppError from '@shared/errors/AppError';
import { inject, injectable } from 'tsyringe';
import Customer from '../infra/typeorm/entities/Customer';
import ICustomersRepository from '../repositories/ICustomersRepository';

interface IRequest {
  name: string;
  email: string;
}

@injectable()
class CreateCustomerService {
  constructor(
    @inject(CUSTOMERS_REPO)
    private customersRepository: ICustomersRepository,
  ) {}

  public async execute({ name, email }: IRequest): Promise<Customer> {
    const userExists = await this.customersRepository.findByEmail(email);

    if (userExists) {
      throw new AppError('This email is already in use', 400);
    }
    const customer = await this.customersRepository.create({ name, email });

    return customer;
  }
}

export default CreateCustomerService;
