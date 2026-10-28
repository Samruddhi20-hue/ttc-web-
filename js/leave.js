/* Leave helpers shared by the TeamSpace UI. */
(function () {
  function overlapsMonth(startDate, endDate, year, monthIndex) {
    const monthStart = new Date(year, monthIndex, 1);
    const monthEnd = new Date(year, monthIndex + 1, 0);
    const start = new Date(`${startDate}T12:00:00`);
    const end = new Date(`${endDate}T12:00:00`);
    return start <= monthEnd && end >= monthStart;
  }
  function daysInMonth(startDate, endDate, year, monthIndex, leaveType) {
    const monthStart = new Date(year, monthIndex, 1);
    const monthEnd = new Date(year, monthIndex + 1, 0);
    const start = new Date(`${startDate}T12:00:00`);
    const end = new Date(`${endDate}T12:00:00`);
    const from = start > monthStart ? start : monthStart;
    const to = end < monthEnd ? end : monthEnd;
    if (from > to) return 0;
    const days = Math.round((to - from) / 86400000) + 1;
    return leaveType === 'half_day' ? days * 0.5 : days;
  }
  window.TeamSpaceLeaveHelpers = { overlapsMonth, daysInMonth };
})();
