import * as dotenv from 'dotenv';
import 'reflect-metadata';
import { Telegraf } from 'telegraf';
import { AppDataSource } from '../config/data-source';
import { HabitService } from '../services/habit.service';
import { UserService } from '../services/user.service';

dotenv.config();

const bot = new Telegraf(process.env.BOT_TOKEN || '');
const userService = new UserService();
const habitService = new HabitService();

bot.start(async (ctx) => {
  const telegramId = ctx.from.id.toString();
  const name = ctx.from.first_name || 'User';

  try {
    const user = await userService.getOrCreateUser(telegramId, name);
    ctx.reply(`Welcome, ${user.name}!`);
  } catch (error) {
    console.error('Database error:', error);
    ctx.reply('Something went wrong, please try again later.');
  }
});

bot.command('addhabit', async (ctx) => {
  const telegramId = ctx.from.id.toString();
  const habitName = ctx.message.text.split(' ').slice(1).join(' ');

  if (!habitName) {
    ctx.reply('Please provide a habit name. Example: /addhabit Drink water');
    return;
  }

  try {
    const user = await userService.getUserWithHabits(telegramId);

    if (!user) {
      ctx.reply('Please start the bot first with /start');
      return;
    }

    const habit = await habitService.addHabit(user, habitName);
    ctx.reply(`Habit "${habit.name}" added successfully!`);
  } catch (error) {
    console.error('Database error:', error);
    ctx.reply('Something went wrong, please try again later.');
  }
});

bot.command('listhabits', async (ctx) => {
  const telegramId = ctx.from.id.toString();

  try {
    const user = await userService.getUserWithHabits(telegramId);
    if (!user) {
      ctx.reply('Please start the bot first with /start');
      return;
    }

    if (!user.habits || user.habits.length === 0) {
      ctx.reply('You don’t have any habits yet. Add one with /addhabit!');
      return;
    }

    const habitsList = user.habits
      .map((habit, index) => `${index + 1}. ${habit.name} ${habit.completed ? '✅' : '❌'}`)
      .join('\n');
    ctx.reply(`Your habits:\n${habitsList}`);
  } catch (error) {
    console.error('Database error:', error);
    ctx.reply('Something went wrong, please try again later.');
  }
});

bot.command('deletehabit', async (ctx) => {
  const telegramId = ctx.from.id.toString();
  const habitNumber = parseInt(ctx.message.text.split(' ')[1], 10);

  if (isNaN(habitNumber) || habitNumber < 1) {
    ctx.reply('Please provide a valid habit number. Example: /deletehabit 1');
    return;
  }

  try {
    const user = await userService.getUserWithHabits(telegramId);
    if (!user) {
      ctx.reply('Please start the bot first with /start');
      return;
    }

    if (!user.habits || user.habits.length === 0) {
      ctx.reply('You don’t have any habits to delete. Add one with /addhabit!');
      return;
    }

    const habitIndex = habitNumber - 1;
    if (habitIndex >= user.habits.length || habitIndex < 0) {
      ctx.reply(`Habit number ${habitNumber} does not exist. Check your habits with /listhabits.`);
      return;
    }

    const habitToDelete = user.habits[habitIndex];
    await habitService.deleteHabit(habitToDelete.id);
    ctx.reply(`Habit "${habitToDelete.name}" deleted successfully!`);
  } catch (error) {
    console.error('Database error:', error);
    ctx.reply('Something went wrong, please try again later.');
  }
});

bot.command('markhabit', async (ctx) => {
  const telegramId = ctx.from.id.toString();
  const habitNumber = parseInt(ctx.message.text.split(' ')[1], 10);

  if (isNaN(habitNumber) || habitNumber < 1) {
    ctx.reply('Please provide a valid habit number. Example: /markhabit 1');
    return;
  }

  try {
    const user = await userService.getUserWithHabits(telegramId);

    if (!user) {
      ctx.reply('Please start the bot first with /start');
      return;
    }

    if (!user.habits || user.habits.length === 0) {
      ctx.reply('You don’t have any habits to mark. Add one with /addhabit!');
      return;
    }

    const habitIndex = habitNumber - 1;

    if (habitIndex >= user.habits.length || habitIndex < 0) {
      ctx.reply(`Habit number ${habitNumber} does not exist. Check your habits with /listhabits.`);
      return;
    }

    const habitToMark = user.habits[habitIndex];

    if (habitToMark.completed) {
      ctx.reply(`Habit "${habitToMark.name}" is already marked as completed!`);
      return;
    }

    const updatedHabit = await habitService.markHabit(habitToMark.id);
    ctx.reply(`Habit "${updatedHabit.name}" marked as completed!`);
  } catch (error) {
    console.error('Database error:', error);
    ctx.reply('Something went wrong, please try again later.');
  }
});

bot.command('unmarkhabit', async (ctx) => {
  const telegramId = ctx.from.id.toString();
  const habitNumber = parseInt(ctx.message.text.split(' ')[1], 10);

  if (isNaN(habitNumber) || habitNumber < 1) {
    ctx.reply('Please provide a valid habit number. Example: /unmarkhabit 1');
    return;
  }

  try {
    const user = await userService.getUserWithHabits(telegramId);

    if (!user) {
      ctx.reply('Please start the bot first with /start');
      return;
    }

    if (!user.habits || user.habits.length === 0) {
      ctx.reply('You don’t have any habits to unmark. Add one with /addhabit!');
      return;
    }

    const habitIndex = habitNumber - 1;
    if (habitIndex >= user.habits.length || habitIndex < 0) {
      ctx.reply(`Habit number ${habitNumber} does not exist. Check your habits with /listhabits.`);
      return;
    }

    const habitToUnmark = user.habits[habitIndex];
    if (!habitToUnmark.completed) {
      ctx.reply(`Habit "${habitToUnmark.name}" is not marked as completed!`);
      return;
    }

    const updatedHabit = await habitService.unmarkHabit(habitToUnmark.id);
    ctx.reply(`Habit "${updatedHabit.name}" unmarked successfully!`);
  } catch (error) {
    console.error('Database error:', error);
    ctx.reply('Something went wrong, please try again later.');
  }
});

bot.command('help', (ctx) => {
  const helpMessage = `
Available commands:
/start - Start the bot and register
/addhabit <name> - Add a new habit (e.g., /addhabit Drink water)
/listhabits - List your habits
/deletehabit <number> - Delete a habit by its number (e.g., /deletehabit 1)
/markhabit <number> - Mark a habit as completed (e.g., /markhabit 1)
/unmarkhabit <number> - Unmark a completed habit (e.g., /unmarkhabit 1)
/help - Show this menu
  `;
  ctx.reply(helpMessage.trim());
});

export const initBot = async () => {
  try {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }

    console.log('Database connection is ready');
    await bot.launch();
    console.log('Bot started');
  } catch (error) {
    console.error('Startup error:', error);
    throw error;
  }
};

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
