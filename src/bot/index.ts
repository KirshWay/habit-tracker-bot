import 'reflect-metadata';
import { Telegraf } from 'telegraf';
import { AppDataSource } from '../config/data-source';
import { requireEnv } from '../config/env';
import { HabitService } from '../services/habit.service';
import { UserService } from '../services/user.service';

const MAX_HABIT_NAME_LENGTH = 120;
const TELEGRAM_SAFE_MESSAGE_LIMIT = 3800;
const MAX_VISIBLE_HABITS = 500;

const bot = new Telegraf(requireEnv('BOT_TOKEN'));
const userService = new UserService();
const habitService = new HabitService();

bot.start(async (ctx) => {
  const telegramId = ctx.from.id.toString();
  const name = ctx.from.first_name || 'User';

  try {
    const user = await userService.getOrCreateUser(telegramId, name);
    await ctx.reply(`Welcome, ${user.name}!`);
  } catch (error) {
    logError('Database error in /start', error);
    await ctx.reply('Something went wrong, please try again later.');
  }
});

bot.command('addhabit', async (ctx) => {
  const telegramId = ctx.from.id.toString();
  const habitName = getCommandTail(ctx.message.text).trim();

  if (!habitName) {
    await ctx.reply('Please provide a habit name. Example: /addhabit Drink water');
    return;
  }

  if (habitName.length > MAX_HABIT_NAME_LENGTH) {
    await ctx.reply(`Habit name is too long. Maximum length is ${MAX_HABIT_NAME_LENGTH} characters.`);
    return;
  }

  try {
    const user = await userService.getUserWithHabits(telegramId);

    if (!user) {
      await ctx.reply('Please start the bot first with /start');
      return;
    }

    const habit = await habitService.addHabit(user, habitName);
    await ctx.reply(`Habit "${habit.name}" added successfully!`);
  } catch (error) {
    logError('Database error in /addhabit', error);
    await ctx.reply('Something went wrong, please try again later.');
  }
});

bot.command('listhabits', async (ctx) => {
  const telegramId = ctx.from.id.toString();

  try {
    const user = await userService.getUserWithHabits(telegramId);
    if (!user) {
      await ctx.reply('Please start the bot first with /start');
      return;
    }

    if (!user.habits || user.habits.length === 0) {
      await ctx.reply('You don’t have any habits yet. Add one with /addhabit!');
      return;
    }

    const habitsToShow = user.habits.slice(0, MAX_VISIBLE_HABITS);
    const habitsList = habitsToShow
      .map((habit, index) => `${index + 1}. ${habit.name} ${habit.completed ? '✅' : '❌'}`)
      .join('\n');

    const hiddenHabitsCount = user.habits.length - habitsToShow.length;
    const overflowNotice = hiddenHabitsCount > 0
      ? `\n...and ${hiddenHabitsCount} more habits. Showing first ${MAX_VISIBLE_HABITS}.`
      : '';

    await replyInChunks(ctx, `Your habits:\n${habitsList}${overflowNotice}`);
  } catch (error) {
    logError('Database error in /listhabits', error);
    await ctx.reply('Something went wrong, please try again later.');
  }
});

bot.command('deletehabit', async (ctx) => {
  const telegramId = ctx.from.id.toString();
  const habitNumber = parseHabitNumber(ctx.message.text);

  if (!habitNumber) {
    await ctx.reply('Please provide a valid habit number. Example: /deletehabit 1');
    return;
  }

  try {
    const user = await userService.getUserWithHabits(telegramId);
    if (!user) {
      await ctx.reply('Please start the bot first with /start');
      return;
    }

    if (!user.habits || user.habits.length === 0) {
      await ctx.reply('You don’t have any habits to delete. Add one with /addhabit!');
      return;
    }

    const habitIndex = habitNumber - 1;
    if (habitIndex >= user.habits.length || habitIndex < 0) {
      await ctx.reply(`Habit number ${habitNumber} does not exist. Check your habits with /listhabits.`);
      return;
    }

    const habitToDelete = user.habits[habitIndex];
    await habitService.deleteHabit(user.id, habitToDelete.id);
    await ctx.reply(`Habit "${habitToDelete.name}" deleted successfully!`);
  } catch (error) {
    logError('Database error in /deletehabit', error);
    await ctx.reply('Something went wrong, please try again later.');
  }
});

bot.command('markhabit', async (ctx) => {
  const telegramId = ctx.from.id.toString();
  const habitNumber = parseHabitNumber(ctx.message.text);

  if (!habitNumber) {
    await ctx.reply('Please provide a valid habit number. Example: /markhabit 1');
    return;
  }

  try {
    const user = await userService.getUserWithHabits(telegramId);

    if (!user) {
      await ctx.reply('Please start the bot first with /start');
      return;
    }

    if (!user.habits || user.habits.length === 0) {
      await ctx.reply('You don’t have any habits to mark. Add one with /addhabit!');
      return;
    }

    const habitIndex = habitNumber - 1;

    if (habitIndex >= user.habits.length || habitIndex < 0) {
      await ctx.reply(`Habit number ${habitNumber} does not exist. Check your habits with /listhabits.`);
      return;
    }

    const habitToMark = user.habits[habitIndex];

    if (habitToMark.completed) {
      await ctx.reply(`Habit "${habitToMark.name}" is already marked as completed!`);
      return;
    }

    const updatedHabit = await habitService.markHabit(user.id, habitToMark.id);
    await ctx.reply(`Habit "${updatedHabit.name}" marked as completed!`);
  } catch (error) {
    logError('Database error in /markhabit', error);
    await ctx.reply('Something went wrong, please try again later.');
  }
});

bot.command('unmarkhabit', async (ctx) => {
  const telegramId = ctx.from.id.toString();
  const habitNumber = parseHabitNumber(ctx.message.text);

  if (!habitNumber) {
    await ctx.reply('Please provide a valid habit number. Example: /unmarkhabit 1');
    return;
  }

  try {
    const user = await userService.getUserWithHabits(telegramId);

    if (!user) {
      await ctx.reply('Please start the bot first with /start');
      return;
    }

    if (!user.habits || user.habits.length === 0) {
      await ctx.reply('You don’t have any habits to unmark. Add one with /addhabit!');
      return;
    }

    const habitIndex = habitNumber - 1;
    if (habitIndex >= user.habits.length || habitIndex < 0) {
      await ctx.reply(`Habit number ${habitNumber} does not exist. Check your habits with /listhabits.`);
      return;
    }

    const habitToUnmark = user.habits[habitIndex];
    if (!habitToUnmark.completed) {
      await ctx.reply(`Habit "${habitToUnmark.name}" is not marked as completed!`);
      return;
    }

    const updatedHabit = await habitService.unmarkHabit(user.id, habitToUnmark.id);
    await ctx.reply(`Habit "${updatedHabit.name}" unmarked successfully!`);
  } catch (error) {
    logError('Database error in /unmarkhabit', error);
    await ctx.reply('Something went wrong, please try again later.');
  }
});

bot.command('help', (ctx) => {
  const helpMessage = `
Available commands:
/start - Start the bot and register
/addhabit <name> - Add a new habit (max ${MAX_HABIT_NAME_LENGTH} chars)
/listhabits - List your habits
/deletehabit <number> - Delete a habit by its number (e.g., /deletehabit 1)
/markhabit <number> - Mark a habit as completed (e.g., /markhabit 1)
/unmarkhabit <number> - Unmark a completed habit (e.g., /unmarkhabit 1)
/help - Show this menu
  `;
  void ctx.reply(helpMessage.trim());
});

bot.catch(async (error, ctx) => {
  logError('Unhandled bot error', error);
  await ctx.reply('Something went wrong, please try again later.');
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
    logError('Startup error', error);
    throw error;
  }
};

process.once('SIGINT', () => {
  void stopGracefully('SIGINT');
});
process.once('SIGTERM', () => {
  void stopGracefully('SIGTERM');
});

function parseHabitNumber(text: string): number | null {
  const numberToken = text.split(' ')[1];
  const parsed = Number.parseInt(numberToken || '', 10);

  if (Number.isNaN(parsed) || parsed < 1) {
    return null;
  }

  return parsed;
}

function getCommandTail(text: string): string {
  return text.split(' ').slice(1).join(' ');
}

function splitIntoChunks(text: string, maxLength: number): string[] {
  if (text.length <= maxLength) {
    return [text];
  }

  const chunks: string[] = [];
  const lines = text.split('\n');
  let currentChunk = '';

  for (const line of lines) {
    const nextChunk = currentChunk ? `${currentChunk}\n${line}` : line;

    if (nextChunk.length <= maxLength) {
      currentChunk = nextChunk;
      continue;
    }

    if (currentChunk) {
      chunks.push(currentChunk);
      currentChunk = '';
    }

    if (line.length <= maxLength) {
      currentChunk = line;
      continue;
    }

    for (let index = 0; index < line.length; index += maxLength) {
      chunks.push(line.slice(index, index + maxLength));
    }
  }

  if (currentChunk) {
    chunks.push(currentChunk);
  }

  return chunks;
}

async function replyInChunks(ctx: { reply: (message: string) => Promise<unknown> }, text: string): Promise<void> {
  const chunks = splitIntoChunks(text, TELEGRAM_SAFE_MESSAGE_LIMIT);

  for (const chunk of chunks) {
    await ctx.reply(chunk);
  }
}

function logError(prefix: string, error: unknown): void {
  if (error instanceof Error) {
    const message = `${prefix}: ${error.name}: ${error.message}`;
    if (process.env.NODE_ENV === 'production') {
      console.error(message);
    } else {
      console.error(message, error.stack);
    }
    return;
  }

  console.error(`${prefix}:`, error);
}

async function stopGracefully(signal: 'SIGINT' | 'SIGTERM'): Promise<void> {
  bot.stop(signal);

  if (AppDataSource.isInitialized) {
    await AppDataSource.destroy();
    console.log('Database connection closed');
  }
}
