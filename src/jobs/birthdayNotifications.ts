import { PrismaClient } from '@prisma/client';

// For standalone jobs, create a PrismaClient instance
const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

/**
 * Birthday notification job
 * Runs daily to send birthday notifications to users
 * Should be triggered by a cron job scheduler (e.g., node-cron, cron, or external scheduler)
 */
export async function sendBirthdayNotifications(): Promise<void> {
  try {
    const today = new Date();
    const month = today.getMonth() + 1; // 1-12
    const day = today.getDate();

    // Find all users whose birthday is today
    const usersWithBirthdays = await prisma.user.findMany({
      where: {
        birthday: {
          not: null,
        },
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        username: true,
        email: true,
        birthday: true,
      },
    });

    // Filter users whose birthday matches today (month and day)
    const todaysBirthdays = usersWithBirthdays.filter((user) => {
      if (!user.birthday) return false;
      const birthday = new Date(user.birthday);
      return birthday.getMonth() + 1 === month && birthday.getDate() === day;
    });

    console.log(`Found ${todaysBirthdays.length} users with birthdays today`);

    // For each user with a birthday, notify their friends
    for (const birthdayUser of todaysBirthdays) {
      // Get all followers (friends) of this user
      const followers = await prisma.follow.findMany({
        where: {
          followingId: birthdayUser.id,
        },
        include: {
          follower: {
            select: {
              id: true,
              email: true,
              firstName: true,
            },
          },
        },
      });

      console.log(
        `User ${birthdayUser.username || birthdayUser.email} has ${followers.length} followers to notify`
      );

      // TODO: Implement actual notification sending
      // This could be:
      // - Email notification via SendGrid/AWS SES
      // - Push notification via Firebase/APNs
      // - In-app notification stored in database
      // - WebSocket notification for real-time updates

      for (const follow of followers) {
        // Example: Send notification
        console.log(
          `Notifying ${follow.follower.email} that ${birthdayUser.firstName || birthdayUser.username} has a birthday today!`
        );

        // In a real implementation, you would:
        // 1. Store notification in database
        // 2. Send email
        // 3. Send push notification
        // 4. Emit WebSocket event
      }
    }

    console.log('Birthday notification job completed successfully');
  } catch (error) {
    console.error('Error in birthday notification job:', error);
    throw error;
  } finally {
    // Disconnect Prisma when done (for standalone jobs)
    await prisma.$disconnect();
  }
}

/**
 * Schedule birthday notifications using node-cron
 * Run this function once when the server starts
 */
export function scheduleBirthdayNotifications(): void {
  // This requires node-cron package to be installed
  // For now, this is a placeholder that shows how it would be implemented
  // To use: import cron from 'node-cron'; cron.schedule('0 9 * * *', sendBirthdayNotifications);
  // This runs daily at 9 AM

  console.log('Birthday notification scheduler initialized');
  console.log('Note: Install node-cron and uncomment the schedule line to enable automatic daily runs');
}
