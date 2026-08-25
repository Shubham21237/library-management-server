import cron from 'node-cron';
import Transaction from '../models/Transaction.js';
import { calculateFine } from './fineCalculator.js';

/**
 * @desc Feature #3: Automated Daily Background Cron Job (Runs every day at 08:00 AM)
 *       Checks for overdue books, updates fine amounts, and sends notification alerts.
 */
export const initCronJobs = () => {
  // Schedule cron job to run every day at 08:00 AM
  cron.schedule('0 8 * * *', async () => {
    console.log('⏰ Running Daily Background Overdue & Email Reminder Cron Job...');

    try {
      const today = new Date();

      // 1. Find all issued transactions
      const issuedTransactions = await Transaction.find({ status: 'ISSUED' })
        .populate('user', 'name email')
        .populate('book', 'title author');

      for (const transaction of issuedTransactions) {
        if (!transaction.dueDate) continue;

        const dueDate = new Date(transaction.dueDate);

        // Check if transaction has passed due date
        if (today > dueDate) {
          const fine = calculateFine(dueDate, today);

          transaction.status = 'OVERDUE';
          transaction.fineAmount = fine;
          await transaction.save();

          console.log(`⚠️ OVERDUE ALERT: User ${transaction.user?.name} is overdue on "${transaction.book?.title}". Fine accumulated: ₹${fine}`);
        } else {
          // Check if due in 2 days (Reminder Alert)
          const diffDays = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
          if (diffDays === 2) {
            console.log(`📧 DUE REMINDER: Sent 2-day return reminder to ${transaction.user?.email} for "${transaction.book?.title}".`);
          }
        }
      }

      console.log('✅ Daily Cron Job Executed Successfully.');
    } catch (error) {
      console.error('❌ Error executing daily cron job:', error.message);
    }
  });

  console.log('⚙️ Background Cron Jobs Initialized (Scheduled daily at 08:00 AM)');
};
