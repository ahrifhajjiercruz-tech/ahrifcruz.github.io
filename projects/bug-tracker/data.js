// Data Management for Bug Tracker
const BugData = {
    // Get all bugs from localStorage
    getAllBugs() {
        const bugs = localStorage.getItem('bugs');
        return bugs ? JSON.parse(bugs) : [];
    },

    // Save bugs to localStorage
    saveBugs(bugs) {
        localStorage.setItem('bugs', JSON.stringify(bugs));
    },

    // Add a new bug
    addBug(bugData) {
        const bugs = this.getAllBugs();
        const newBug = {
            id: Date.now().toString(),
            ...bugData,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        bugs.push(newBug);
        this.saveBugs(bugs);
        return newBug;
    },

    // Update an existing bug
    updateBug(id, updatedData) {
        const bugs = this.getAllBugs();
        const index = bugs.findIndex(bug => bug.id === id);
        if (index !== -1) {
            bugs[index] = {
                ...bugs[index],
                ...updatedData,
                updatedAt: new Date().toISOString()
            };
            this.saveBugs(bugs);
            return bugs[index];
        }
        return null;
    },

    // Delete a bug
    deleteBug(id) {
        const bugs = this.getAllBugs();
        const filteredBugs = bugs.filter(bug => bug.id !== id);
        this.saveBugs(filteredBugs);
        return true;
    },

    // Get bug by ID
    getBugById(id) {
        const bugs = this.getAllBugs();
        return bugs.find(bug => bug.id === id);
    },

    // Get bugs by status
    getBugsByStatus(status) {
        const bugs = this.getAllBugs();
        if (status === 'all') return bugs;
        return bugs.filter(bug => bug.status === status);
    },

    // Get bugs by severity
    getBugsBySeverity(severity) {
        const bugs = this.getAllBugs();
        if (severity === 'all') return bugs;
        return bugs.filter(bug => bug.severity === severity);
    },

    // Get statistics
    getStats() {
        const bugs = this.getAllBugs();
        return {
            total: bugs.length,
            open: bugs.filter(b => b.status === 'open').length,
            inProgress: bugs.filter(b => b.status === 'in-progress').length,
            resolved: bugs.filter(b => b.status === 'resolved').length,
            closed: bugs.filter(b => b.status === 'closed').length
        };
    }
};
