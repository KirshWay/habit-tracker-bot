import { AppDataSource } from '../config/data-source';
import { Habit } from '../entities/Habit';
import { User } from '../entities/User';

export class HabitService {
  private habitRepository = AppDataSource.getRepository(Habit);

  async addHabit(user: User, name: string): Promise<Habit> {
    const habit = this.habitRepository.create({
      name,
      user,
    });

    return this.habitRepository.save(habit);
  }

  async listHabits(user: User): Promise<Habit[]> {
    return this.habitRepository.find({ where: { user: { id: user.id } } });
  }

  async deleteHabit(habitId: number): Promise<void> {
    await this.habitRepository.delete(habitId);
  }

  async markHabit(habitId: number): Promise<Habit> {
    const habit = await this.habitRepository.findOne({ where: { id: habitId } });

    if (!habit) throw new Error('Habit not found');

    habit.completed = true;
    habit.completedAt = new Date();

    return this.habitRepository.save(habit);
  }

  async unmarkHabit(habitId: number): Promise<Habit> {
    const habit = await this.habitRepository.findOne({ where: { id: habitId } });

    if (!habit) throw new Error('Habit not found');

    habit.completed = false;
    habit.completedAt = null;

    return this.habitRepository.save(habit);
  }
}
