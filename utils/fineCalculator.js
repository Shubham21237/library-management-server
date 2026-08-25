/**
 * @desc    Calculates fine amount for overdue books
 * @param   {Date|string} dueDate - Agreed return due date
 * @param   {Date|string} returnDate - Actual return date (defaults to today)
 * @param   {number} ratePerDay - Fine charge per day overdue (default ₹5)
 * @returns {number} - Total calculated fine in Rupees
 */
export const calculateFine = (dueDate, returnDate = new Date(), ratePerDay = 5) => {
  if (!dueDate) return 0;

  const due = new Date(dueDate);
  const actualReturn = new Date(returnDate);

  // If returned on or before due date, fine is 0
  if (actualReturn <= due) {
    return 0;
  }

  // Calculate difference in milliseconds and convert to full days
  const diffTime = actualReturn.getTime() - due.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays * ratePerDay;
};
