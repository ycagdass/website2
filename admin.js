// admin.js

// Global window assignments for admin functionality
window.admin = {
    token: null,
    statusElement: document.getElementById('status'),
    tokenInput: document.getElementById('tokenInput'),
    syncButton: document.getElementById('syncButton'),
    clearButton: document.getElementById('clearButton'),
    testButton: document.getElementById('testButton'),
};

// Save GitHub Token
admin.saveGitHubToken = function() {
    this.token = this.tokenInput.value;
    localStorage.setItem('githubToken', this.token);
    this.showSuccessMessage('Token saved successfully!');
};

// Test GitHub Connection
admin.testGitHubConnection = async function() {
    try {
        const response = await fetch('https://api.github.com/user', {
            headers: {
                Authorization: `token ${this.token}`
            }
        });
        if (response.ok) {
            this.showSuccessMessage('Connection successful!');
        } else {
            this.showErrorMessage('Connection failed!');
        }
    } catch (error) {
        this.showErrorMessage('Error testing connection: ' + error.message);
    }
};

// Toggle Token Visibility
admin.toggleTokenVisibility = function() {
    const type = this.tokenInput.type === 'password' ? 'text' : 'password';
    this.tokenInput.type = type;
};

// Sync to GitHub
admin.syncToGitHub = async function() {
    // Implement the sync logic here
    this.showSuccessMessage('Syncing to GitHub...');
};

// Clear GitHub Token
admin.clearGitHubToken = function() {
    this.token = null;
    localStorage.removeItem('githubToken');
    this.tokenInput.value = '';
    this.showSuccessMessage('Token cleared successfully!');
};

// Show Success Message
admin.showSuccessMessage = function(message) {
    this.statusElement.textContent = message;
    this.statusElement.style.color = 'green';
};

// Show Error Message
admin.showErrorMessage = function(message) {
    this.statusElement.textContent = message;
    this.statusElement.style.color = 'red';
};

// Update GitHub Status
admin.updateGitHubStatus = function(status) {
    // Update status logic
    this.statusElement.textContent = status;
};

// Initialize Navigation
admin.initializeNavigation = function() {
    // Navigation initialization logic
};

// Show Section
admin.showSection = function(sectionId) {
    // Logic to display specific section
    document.querySelectorAll('.admin-section').forEach(section => {
        section.style.display = 'none';
    });
    document.getElementById(sectionId).style.display = 'block';
};

// Event listeners for buttons
window.onload = function() {
    admin.tokenInput.value = localStorage.getItem('githubToken') || '';
    admin.syncButton.addEventListener('click', () => admin.syncToGitHub());
    admin.clearButton.addEventListener('click', () => admin.clearGitHubToken());
    admin.testButton.addEventListener('click', () => admin.testGitHubConnection());
};
