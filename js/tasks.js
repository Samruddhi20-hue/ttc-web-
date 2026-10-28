/* Task helpers shared by the TeamSpace UI. */
(function () {
  const labels = { open: 'Open', in_progress: 'In progress', done: 'Done' };
  function statusLabel(status) { return labels[status] || 'Open'; }
  function isComplete(task) { return task?.status === 'done'; }
  window.TeamSpaceTaskHelpers = { statusLabel, isComplete };
})();
