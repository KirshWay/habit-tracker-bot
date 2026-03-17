import { AppDataSource } from '../config/data-source';
import { User } from '../entities/User';

export class UserService {
  private userRepository = AppDataSource.getRepository(User);

  async getOrCreateUser(telegramId: string, name: string): Promise<User> {
    let user = await this.userRepository.findOne({ where: { telegramId } });

    if (!user) {
      try {
        user = this.userRepository.create({ telegramId, name });
        await this.userRepository.save(user);
      } catch (error) {
        if (!isUniqueViolation(error)) {
          throw error;
        }

        const existingUser = await this.userRepository.findOne({ where: { telegramId } });

        if (!existingUser) {
          throw error;
        }

        user = existingUser;
      }
    }

    return user;
  }

  async getUserWithHabits(telegramId: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { telegramId },
      relations: { habits: true },
      order: { habits: { id: 'ASC' } },
    });
  }
}

function isUniqueViolation(error: unknown): boolean {
  if (!error || typeof error !== 'object') {
    return false;
  }

  const code = (error as { code?: string; driverError?: { code?: string } }).code
    || (error as { code?: string; driverError?: { code?: string } }).driverError?.code;

  return code === '23505';
}
