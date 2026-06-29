export const dateCalculations = {
  /**
   * Calculate the number of days between two dates
   */
  getDaysBetweenDates(startDate, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays + 1; // Include both start and end dates
  },

  /**
   * Calculate months between two dates
   */
  getMonthsBetweenDates(startDate, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const months = (end.getFullYear() - start.getFullYear()) * 12 +
      (end.getMonth() - start.getMonth());
    return Math.max(0, months);
  },

  /**
   * Calculate years between two dates
   */
  getYearsBetweenDates(startDate, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const years = end.getFullYear() - start.getFullYear();
    return Math.max(0, years);
  },

  /**
   * Calculate annual leave accrued based on start date
   * 2.08 days per month
   */
  calculateAnnualLeaveAccrued(startDate, currentDate = new Date()) {
    const months = this.getMonthsBetweenDates(startDate, currentDate);
    return months * 2.08;
  },

  /**
   * Calculate sick leave quota (30 days per year)
   */
  calculateSickLeaveQuota(startDate, currentDate = new Date()) {
    const years = this.getYearsBetweenDates(startDate, currentDate);
    return years * 30;
  },

  /**
   * Calculate study leave quota (12 days per year)
   */
  calculateStudyLeaveQuota(startDate, currentDate = new Date()) {
    const years = this.getYearsBetweenDates(startDate, currentDate);
    return years * 12;
  },

  /**
   * Calculate family responsibility leave quota (5 days per year)
   */
  calculateFamilyLeaveQuota(startDate, currentDate = new Date()) {
    const years = this.getYearsBetweenDates(startDate, currentDate);
    return years * 5;
  },

  /**
   * Format date to YYYY-MM-DD
   */
  formatDate(date) {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  },

  /**
   * Check if a date range is valid
   */
  isValidDateRange(startDate, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return start <= end;
  },

  /**
   * Check if dates overlap with existing requests
   */
  hasDateOverlap(newStart, newEnd, existingRequests) {
    const newStartDate = new Date(newStart);
    const newEndDate = new Date(newEnd);
    
    return existingRequests.some(request => {
      const existingStart = new Date(request.start_date);
      const existingEnd = new Date(request.end_date);
      
      return (
        (newStartDate <= existingEnd && newEndDate >= existingStart) &&
        request.status === 'approved'
      );
    });
  },

  /**
   * Get business days between dates (excluding weekends)
   */
  getBusinessDaysBetweenDates(startDate, endDate) {
    let start = new Date(startDate);
    const end = new Date(endDate);
    let businessDays = 0;
    
    while (start <= end) {
      const dayOfWeek = start.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        businessDays++;
      }
      start.setDate(start.getDate() + 1);
    }
    
    return businessDays;
  },

  /**
   * Get leave year start date (based on employment start)
   */
  getLeaveYearStart(employmentStartDate, currentDate = new Date()) {
    const employmentStart = new Date(employmentStartDate);
    const current = new Date(currentDate);
    const yearStart = new Date(current.getFullYear(), employmentStart.getMonth(), employmentStart.getDate());
    
    if (yearStart > current) {
      yearStart.setFullYear(yearStart.getFullYear() - 1);
    }
    
    return yearStart;
  },

  /**
   * Get leave year end date
   */
  getLeaveYearEnd(leaveYearStart) {
    const end = new Date(leaveYearStart);
    end.setFullYear(end.getFullYear() + 1);
    end.setDate(end.getDate() - 1);
    return end;
  }
};

export default dateCalculations;