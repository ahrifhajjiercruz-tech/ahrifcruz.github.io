// ===================================
// DATA STORAGE & STATE
// ===================================

let testCases = [];
let currentTestId = null;

// Load data from localStorage on page load
function loadData() {
    const savedData = localStorage.getItem('testCases');
    if (savedData) {
        testCases = JSON.parse(savedData);
    }
    updateUI();
}

// Save data to localStorage
function saveData() {
    localStorage.setItem('testCases', JSON.stringify(testCases));
}

// ===================================
// TAB SWITCHING
// ===================================

const tabButtons = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');

tabButtons.forEach(button => {
    button.addEventListener('click', () => {
        // Remove active class from all buttons and contents
        tabButtons.forEach(btn => btn.classList.remove('active'));
        tabContents.forEach(content => content.classList.remove('active'));
        
        // Add active class to clicked button
        button.classList.add('active');
        
        // Show corresponding content
        const tabName = button.getAttribute('data-tab');
        document.getElementById(tabName).classList.add('active');
        
        // Update UI when switching to dashboard or test-cases
        if (tabName === 'dashboard' || tabName === 'test-cases') {
            updateUI();
        }
    });
});

// ===================================
// GENERATE TEST ID
// ===================================

function generateTestId() {
    const existingIds = testCases.map(tc => {
        const match = tc.id.match(/TC-(\d+)/);
        return match ? parseInt(match[1]) : 0;
    });
    
    const maxId = existingIds.length > 0 ? Math.max(...existingIds) : 0;
    const newId = maxId + 1;
    return `TC-${String(newId).padStart(3, '0')}`;
}

// ===================================
// CREATE TEST CASE
// ===================================

const testCaseForm = document.getElementById('testCaseForm');

testCaseForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const newTestCase = {
        id: generateTestId(),
        title: document.getElementById('testTitle').value,
        module: document.getElementById('testModule').value,
        priority: document.getElementById('testPriority').value,
        status: document.getElementById('testStatus').value,
        preconditions: document.getElementById('testPreconditions').value,
        steps: document.getElementById('testSteps').value,
        expectedResult: document.getElementById('testExpected').value,
        actualResult: document.getElementById('testActual').value,
        createdDate: new Date().toISOString(),
        lastUpdated: new Date().toISOString()
    };
    
    testCases.push(newTestCase);
    saveData();
    
    // Show success message
    alert(`✅ Test Case ${newTestCase.id} created successfully!`);
    
    // Reset form
    testCaseForm.reset();
    
    // Update UI
    updateUI();
    updateModuleDatalist();
    
    // Switch to test cases tab
    document.querySelector('[data-tab="test-cases"]').click();
});

// ===================================
// UPDATE UI - STATISTICS
// ===================================

function updateStatistics() {
    const total = testCases.length;
    const passed = testCases.filter(tc => tc.status === 'pass').length;
    const failed = testCases.filter(tc => tc.status === 'fail').length;
    const blocked = testCases.filter(tc => tc.status === 'blocked').length;
    
    document.getElementById('totalTests').textContent = total;
    document.getElementById('passedTests').textContent = passed;
    document.getElementById('failedTests').textContent = failed;
    document.getElementById('blockedTests').textContent = blocked;
}

// ===================================
// UPDATE DASHBOARD
// ===================================

function updateDashboard() {
    // Update progress bar
    const total = testCases.length;
    const executed = testCases.filter(tc => tc.status !== 'not-run').length;
    const percentage = total > 0 ? Math.round((executed / total) * 100) : 0;
    
    document.getElementById('progressFill').style.width = percentage + '%';
    document.getElementById('progressText').textContent = `${percentage}% Complete (${executed}/${total})`;
    
    // Update module breakdown
    const moduleBreakdown = {};
    testCases.forEach(tc => {
        if (!moduleBreakdown[tc.module]) {
            moduleBreakdown[tc.module] = 0;
        }
        moduleBreakdown[tc.module]++;
    });
    
    const moduleBreakdownDiv = document.getElementById('moduleBreakdown');
    if (Object.keys(moduleBreakdown).length === 0) {
        moduleBreakdownDiv.innerHTML = '<p class="empty-state">No test cases yet. Create your first one!</p>';
    } else {
        moduleBreakdownDiv.innerHTML = '';
        Object.entries(moduleBreakdown).forEach(([module, count]) => {
            const moduleItem = document.createElement('div');
            moduleItem.className = 'module-item';
            moduleItem.innerHTML = `
                <span class="module-name">${module}</span>
                <span class="module-count">${count}</span>
            `;
            moduleBreakdownDiv.appendChild(moduleItem);
        });
    }
    
    // Update recent tests (last 5)
    const recentTestsDiv = document.getElementById('recentTests');
    const recentTests = [...testCases].reverse().slice(0, 5);
    
    if (recentTests.length === 0) {
        recentTestsDiv.innerHTML = '<p class="empty-state">No recent activity</p>';
    } else {
        recentTestsDiv.innerHTML = '';
        recentTests.forEach(tc => {
            const recentItem = document.createElement('div');
            recentItem.className = 'recent-item';
            recentItem.onclick = () => viewTestCase(tc.id);
            recentItem.innerHTML = `
                <div class="recent-info">
                    <div class="recent-id">${tc.id}</div>
                    <div class="recent-title">${tc.title}</div>
                    <div class="recent-meta">${tc.module} • ${formatDate(tc.createdDate)}</div>
                </div>
                <span class="status-badge status-${tc.status}">${tc.status.replace('-', ' ')}</span>
            `;
            recentTestsDiv.appendChild(recentItem);
        });
    }
}

// ===================================
// UPDATE TEST TABLE
// ===================================

function updateTestTable(filteredTests = null) {
    const tests = filteredTests || testCases;
    const tbody = document.getElementById('testTableBody');
    
    if (tests.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="empty-state">No test cases found.</td></tr>';
        return;
    }
    
    tbody.innerHTML = '';
    tests.forEach(tc => {
        const row = document.createElement('tr');
        row.onclick = () => viewTestCase(tc.id);
        row.innerHTML = `
            <td class="test-id">${tc.id}</td>
            <td>${tc.title}</td>
            <td>${tc.module}</td>
            <td><span class="priority-badge priority-${tc.priority}">${tc.priority}</span></td>
            <td><span class="status-badge status-${tc.status}">${tc.status.replace('-', ' ')}</span></td>
            <td>${formatDate(tc.createdDate)}</td>
            <td>
                <button class="action-btn" onclick="event.stopPropagation(); viewTestCase('${tc.id}')">👁️ View</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// ===================================
// SEARCH & FILTER
// ===================================

const searchInput = document.getElementById('searchInput');
const filterModule = document.getElementById('filterModule');
const filterStatus = document.getElementById('filterStatus');

function filterTests() {
    const searchTerm = searchInput.value.toLowerCase();
    const moduleFilter = filterModule.value;
    const statusFilter = filterStatus.value;
    
    let filtered = testCases;
    
    // Search filter
    if (searchTerm) {
        filtered = filtered.filter(tc => 
            tc.title.toLowerCase().includes(searchTerm) ||
            tc.id.toLowerCase().includes(searchTerm) ||
            tc.module.toLowerCase().includes(searchTerm)
        );
    }
    
    // Module filter
    if (moduleFilter !== 'all') {
        filtered = filtered.filter(tc => tc.module === moduleFilter);
    }
    
    // Status filter
    if (statusFilter !== 'all') {
        filtered = filtered.filter(tc => tc.status === statusFilter);
    }
    
    updateTestTable(filtered);
}

searchInput.addEventListener('input', filterTests);
filterModule.addEventListener('change', filterTests);
filterStatus.addEventListener('change', filterTests);

// Update module filter dropdown
function updateModuleFilter() {
    const modules = [...new Set(testCases.map(tc => tc.module))];
    const currentValue = filterModule.value;
    
    filterModule.innerHTML = '<option value="all">All Modules</option>';
    modules.forEach(module => {
        const option = document.createElement('option');
        option.value = module;
        option.textContent = module;
        filterModule.appendChild(option);
    });
    
    filterModule.value = currentValue;
}

// Update module datalist for autocomplete
function updateModuleDatalist() {
    const modules = [...new Set(testCases.map(tc => tc.module))];
    const datalist = document.getElementById('moduleList');
    
    datalist.innerHTML = '';
    modules.forEach(module => {
        const option = document.createElement('option');
        option.value = module;
        datalist.appendChild(option);
    });
}

// ===================================
// VIEW TEST CASE MODAL
// ===================================

const modal = document.getElementById('testModal');
const modalBody = document.getElementById('modalBody');
const closeModalBtn = document.getElementById('closeModal');
const closeModalBtn2 = document.getElementById('closeModalBtn');
const modalOverlay = document.querySelector('.modal-overlay');
const editTestBtn = document.getElementById('editTestBtn');
const deleteTestBtn = document.getElementById('deleteTestBtn');

function viewTestCase(testId) {
    const testCase = testCases.find(tc => tc.id === testId);
    if (!testCase) return;
    
    currentTestId = testId;
    
    document.getElementById('modalTitle').textContent = `Test Case: ${testCase.id}`;
    
    modalBody.innerHTML = `
        <div class="detail-row">
            <div class="detail-label">Title</div>
            <div class="detail-value">${testCase.title}</div>
        </div>
        <div class="detail-row">
            <div class="detail-label">Module</div>
            <div class="detail-value">${testCase.module}</div>
        </div>
        <div class="detail-row">
            <div class="detail-label">Priority</div>
            <div class="detail-value"><span class="priority-badge priority-${testCase.priority}">${testCase.priority}</span></div>
        </div>
        <div class="detail-row">
            <div class="detail-label">Status</div>
            <div class="detail-value">
                <select id="statusUpdate" class="form-group" style="width: 200px; padding: 8px; background: var(--medium-gray); border: 1px solid var(--light-gray); color: white; border-radius: 5px;">
                    <option value="not-run" ${testCase.status === 'not-run' ? 'selected' : ''}>Not Run</option>
                    <option value="pass" ${testCase.status === 'pass' ? 'selected' : ''}>Pass</option>
                    <option value="fail" ${testCase.status === 'fail' ? 'selected' : ''}>Fail</option>
                    <option value="blocked" ${testCase.status === 'blocked' ? 'selected' : ''}>Blocked</option>
                </select>
            </div>
        </div>
        <div class="detail-row">
            <div class="detail-label">Preconditions</div>
            <div class="detail-value">${testCase.preconditions || 'None'}</div>
        </div>
        <div class="detail-row">
            <div class="detail-label">Test Steps</div>
            <div class="detail-value">${testCase.steps}</div>
        </div>
        <div class="detail-row">
            <div class="detail-label">Expected Result</div>
            <div class="detail-value">${testCase.expectedResult}</div>
        </div>
        <div class="detail-row">
            <div class="detail-label">Actual Result</div>
            <div class="detail-value">
                <textarea id="actualResultUpdate" style="width: 100%; min-height: 80px; background: var(--medium-gray); border: 1px solid var(--light-gray); color: white; padding: 10px; border-radius: 5px; font-family: inherit;">${testCase.actualResult || ''}</textarea>
            </div>
        </div>
        <div class="detail-row">
            <div class="detail-label">Created Date</div>
            <div class="detail-value">${formatDate(testCase.createdDate)}</div>
        </div>
        <div class="detail-row">
            <div class="detail-label">Last Updated</div>
            <div class="detail-value">${formatDate(testCase.lastUpdated)}</div>
        </div>
    `;
    
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    // Add event listener for status update
    document.getElementById('statusUpdate').addEventListener('change', (e) => {
        updateTestStatus(testId, e.target.value);
    });
    
    // Add event listener for actual result update
    document.getElementById('actualResultUpdate').addEventListener('blur', (e) => {
        updateActualResult(testId, e.target.value);
    });
}

function closeModal() {
    modal.classList.remove('active');
    document.body.style.overflow = 'auto';
    currentTestId = null;
}

closeModalBtn.addEventListener('click', closeModal);
closeModalBtn2.addEventListener('click', closeModal);
modalOverlay.addEventListener('click', closeModal);

// Close modal with ESC key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('active')) {
        closeModal();
    }
});

// ===================================
// UPDATE TEST STATUS & ACTUAL RESULT
// ===================================

function updateTestStatus(testId, newStatus) {
    const testCase = testCases.find(tc => tc.id === testId);
    if (testCase) {
        testCase.status = newStatus;
        testCase.lastUpdated = new Date().toISOString();
        saveData();
        updateUI();
    }
}

function updateActualResult(testId, actualResult) {
    const testCase = testCases.find(tc => tc.id === testId);
    if (testCase) {
        testCase.actualResult = actualResult;
        testCase.lastUpdated = new Date().toISOString();
        saveData();
        updateUI();
    }
}

// ===================================
// DELETE TEST CASE
// ===================================

deleteTestBtn.addEventListener('click', () => {
    if (!currentTestId) return;
    
    const confirmed = confirm(`Are you sure you want to delete test case ${currentTestId}? This action cannot be undone.`);
    
    if (confirmed) {
        testCases = testCases.filter(tc => tc.id !== currentTestId);
        saveData();
        closeModal();
        updateUI();
        alert(`✅ Test case ${currentTestId} deleted successfully!`);
    }
});

// ===================================
// EDIT TEST CASE
// ===================================

editTestBtn.addEventListener('click', () => {
    if (!currentTestId) return;
    
    const testCase = testCases.find(tc => tc.id === currentTestId);
    if (!testCase) return;
    
    // Fill form with test case data
    document.getElementById('testTitle').value = testCase.title;
    document.getElementById('testModule').value = testCase.module;
    document.getElementById('testPriority').value = testCase.priority;
    document.getElementById('testStatus').value = testCase.status;
    document.getElementById('testPreconditions').value = testCase.preconditions;
    document.getElementById('testSteps').value = testCase.steps;
    document.getElementById('testExpected').value = testCase.expectedResult;
    document.getElementById('testActual').value = testCase.actualResult;
    
    // Delete the old test case
    testCases = testCases.filter(tc => tc.id !== currentTestId);
    saveData();
    
    // Close modal and switch to create tab
    closeModal();
    document.querySelector('[data-tab="create"]').click();
    
    alert(`Editing ${currentTestId}. Make your changes and click "Create Test Case" to save.`);
});

// ===================================
// UTILITY FUNCTIONS
// ===================================

function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

function updateUI() {
    updateStatistics();
    updateDashboard();
    updateTestTable();
    updateModuleFilter();
}

// ===================================
// INITIALIZE APP
// ===================================

window.addEventListener('load', () => {
    loadData();
    console.log('🧪 Test Case Management Tool Loaded!');
    console.log(`📊 Total Test Cases: ${testCases.length}`);
});
