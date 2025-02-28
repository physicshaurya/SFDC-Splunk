// Saves options to chrome.storage
function save_options() {
  var skillGroup = document.getElementById('skillGroup').value;

  chrome.storage.sync.set({
    assignedSkill: skillGroup
  }, function() {
    // Update status to let user know options were saved.
    var status = document.getElementById('status');
    status.textContent = 'Options saved.';
    setTimeout(function() {
      status.textContent = '';
    }, 750);
  });
}

function restore_options() {

  chrome.storage.sync.get({
    assignedSkill: 'Unassigned'
  }, function(items) {
    document.getElementById('skillGroup').value = items.assignedSkill;

  });
}
document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click',
    save_options);