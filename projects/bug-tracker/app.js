// Bug Tracker Application
let currentEditId = null;

// DOM Elements
const modal = document.getElementById('bugModal');
const bugForm = document.getElementById('bugForm');
const newBugBtn = document.getElementById('newBugBtn');
const viewAllBtn = document.getElementById('viewAllBtn');
const closeModalBtn = document.getElementById('closeModal');
const cancelBtn = document.getElementById('cancelBtn');
const bugListSection = document.getElementById('bugListSection');
const bugList = document.getElementById('bugList');
const statusFilter = document.getElementById('statusFilter');
const severityFilter = document.getElementById('severityFilter');
const modalTitle = document.getElementById('modalTitle');

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    updateStats();
    renderBugs();
    
    // Event Listeners
    newBugBtn.addEventListener('click', openNewBugModal);
    viewAllBtn.addEventListener('click', toggleBugList);
    closeModalBtn.addEventListener('click', closeModal);
    cancelBtn.addEventListener('click', closeModal);
    bugForm.addEventListener('submit', handleFormSubmit);
    statusFilter.addEventListener('change', renderBugs);
    severityFilter.addEventListener('change', renderBugs);
    
    // Close modal when clicking outside
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });
});

// Open modal for new bug
function openNewBugModal() {
    currentEditId = null;
    modalTitle.textContent = 'Report New Bug';
    bugForm.reset();
    modal.classList.add('active');
}

// Open modal for editing bug
function openEditBugModal(id) {
    currentEditId = id;
    modalTitle.textContent = 'Edit Bug';
    const bug = BugData.getBugById(id);
    
    if (bug) {
        document.getElementById('bugTitle').value = bug.title;
        document.getElementById('bugDescription').value = bug.description;
        document.getElementById('bugSeverity').value = bug.severity;
        document.getElementById('bugStatus').value = bug.status;
        document.getElementById('bugSteps').value = bug.steps || '';
        document.getElementById('bugAssignedTo').value = bug.assignedTo || '';
    }
    
    modal.classList.add('active');
}

// Close modal
function closeModal() {
    modal.classList.remove('active');
    bugForm.reset();
    currentEditId = null;
}

// Toggle bug list visibility
function toggleBugList() {
    bugListSection.classList.toggle('active');
    if (bugListSection.classList.contains('active')) {
        viewAllBtn.textContent = '❌ Hide Bug List';
        renderBugs();
    } else {
        viewAllBtn.textContent = '📋 View All Bugs';
    }
}

// Handle form submission
function handleFormSubmit(e) {
    e.preventDefault();
    
    const bugData = {
        title: document.getElementById('bugTitle').value,
        description: document.getElementById('bugDescription').value,
        severity: document.getElementById('bugSeverity').value,
        status: document.getElementById('bugStatus').value,
        steps: document.getElementById('bugSteps').value,
        assignedTo: document.getElementById('bugAssignedTo').value
    };
    
    if (currentEditId) {
        BugData.updateBug(currentEditId, bugData);
    } else {
        BugData.addBug(bugData);
    }
    
    closeModal();
    updateStats();
    renderBugs();
    
    // Show success message
    alert(currentEditId ? 'Bug updated successfully!' : 'Bug reported successfully!');
}

// Update statistics
function updateStats() {
    const stats = BugData.getStats();
    document.getElementById('totalBugs').textContent = stats.total;
    document.getElementById('openBugs').textContent = stats.open;
    document.getElementById('progressBugs').textContent = stats.inProgress;
    document.getElementById('resolvedBugs').textContent = stats.resolved;
    document.getElementById('closedBugs').textContent = stats.closed;
}

// Render bugs
function renderBugs() {
    let bugs = BugData.getAllBugs();
    
    // Apply filters
    const statusFilterValue = statusFilter.value;
    const severityFilterValue = severityFilter.value;
    
    if (statusFilterValue !== 'all') {
        bugs = bugs.filter(bug => bug.status === statusFilterValue);
    }
    
    if (severityFilterValue !== 'all') {
        bugs = bugs.filter(bug => bug.severity === severityFilterValue);
    }
    
    // Sort by creation date (newest first)
    bugs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    if (bugs.length === 0) {
        bugList.innerHTML = `
            <div class="empty-state">
                <h3>No bugs found</h3>
                <p>Start by reporting your first bug!</p>
            </div>
        `;
        return;
    }
    
    bugList.innerHTML = bugs.map(bug => createBugCard(bug)).join('');
    
    // Add event listeners to action buttons
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = e.target.dataset.id;
            openEditBugModal(id);
        });
    });
    
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = e.target.dataset.id;
            if (confirm('Are you sure you want to delete this bug?')) {
                BugData.deleteBug(id);
                updateStats();
                renderBugs();
            }
        });
    });
}

// Create bug card HTML
function createBugCard(bug) {
    const createdDate = new Date(bug.createdAt).toLocaleDateString();
    
    return `
        <div class="bug-item">
            <div class="bug-header">
                <div class="bug-title">${bug.title}</div>
                <div class="bug-badges">
                    <span class="badge ${bug.severity}">${bug.severity}</span>
                    <span class="badge ${bug.status}">${bug.status.replace('-', ' ')}</span>
                </div>
            </div>
            <div class="bug-description">${bug.description}</div>
            ${bug.steps ? `<div class="bug-steps"><strong>Steps:</strong> ${bug.steps}</div>` : ''}
            <div class="bug-meta">
                <span>Created: ${createdDate}</span>
                ${bug.assignedTo ? `<span>Assigned to: ${bug.assignedTo}</span>` : ''}
                <div class="bug-actions">
                    <button class="edit-btn" data-id="${bug.id}">✏️ Edit</button>
                    <button class="delete-btn" data-id="${bug.id}">🗑️ Delete</button>
                </div>
            </div>
        </div>
    `;
}
