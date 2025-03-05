import { AppDataSource } from '../config/data-source';
import { User } from '../entities/User';

export class UserService {
  private userRepository = AppDataSource.getRepository(User);

  async getOrCreateUser(telegramId: string, name: string): Promise<User> {
    let user = await this.userRepository.findOne({ where: { telegramId } });

    if (!user) {
      user = this.userRepository.create({ telegramId, name });
      await this.userRepository.save(user);
    }

    return user;
  }

  async getUserWithHabits(telegramId: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { telegramId },
      relations: ['habits'],
    });
  }
}
