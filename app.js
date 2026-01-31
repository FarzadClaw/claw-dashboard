// The Claw's Dashboard - Live Updates
// Data is loaded from data.json which is updated by the sync script

const DATA_URL = 'data.json';
const REFRESH_INTERVAL = 60000; // 1 minute

async function loadData() {
    try {
        const response = await fetch(DATA_URL + '?t=' + Date.now());
        if (!response.ok) throw new Error('Failed to load data');
        return await response.json();
    } catch (error) {
        console.error('Error loading data:', error);
        return null;
    }
}

function updateStatus(data) {
    if (!data || !data.status) return;
    
    const status = data.status;
    
    document.getElementById('currentThought').textContent = 
        status.currentThought || 'No current thought';
    
    document.getElementById('lastAction').textContent = 
        status.lastAction || 'None';
    
    document.getElementById('lastUpdated').textContent = 
        status.lastActionTime ? new Date(status.lastActionTime).toLocaleString() : 'Unknown';
}

function updateStats(data) {
    if (!data || !data.stats) return;
    
    const stats = data.stats;
    
    document.getElementById('tasksCompleted').textContent = 
        stats.tasksCompleted || 0;
    
    document.getElementById('queueSize').textContent = 
        stats.queueSize || 0;
    
    document.getElementById('researchFiles').textContent = 
        stats.researchFiles || 0;
    
    document.getElementById('toolsBuilt').textContent = 
        stats.toolsBuilt || 0;
}

function updateActivity(data) {
    if (!data || !data.status || !data.status.recentActivity) return;
    
    const list = document.getElementById('recentActivity');
    const activities = data.status.recentActivity;
    
    if (activities.length === 0) {
        list.innerHTML = '<li>No recent activity</li>';
        return;
    }
    
    list.innerHTML = activities
        .map(activity => `<li>${activity}</li>`)
        .join('');
}

function updateFiles(data, type = 'research') {
    if (!data || !data.files) return;
    
    const list = document.getElementById('filesList');
    const files = data.files[type] || [];
    
    if (files.length === 0) {
        list.innerHTML = `<li>No ${type} files yet</li>`;
        return;
    }
    
    list.innerHTML = files
        .slice(0, 10) // Show latest 10
        .map(file => `<li>${file.name} <span style="color: var(--text-secondary)">(${file.date})</span></li>`)
        .join('');
}

function updateBriefing(data) {
    if (!data || !data.briefing) {
        document.getElementById('briefingContent').textContent = 'No briefing available';
        return;
    }
    
    document.getElementById('briefingContent').textContent = data.briefing;
}

async function refresh() {
    const data = await loadData();
    if (data) {
        updateStatus(data);
        updateStats(data);
        updateActivity(data);
        updateFiles(data, 'research');
        updateBriefing(data);
    }
}

// Tab switching
document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', async () => {
        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        
        const data = await loadData();
        if (data) {
            updateFiles(data, tab.dataset.tab);
        }
    });
});

// Initial load
refresh();

// Auto-refresh
setInterval(refresh, REFRESH_INTERVAL);

console.log('🦞 The Claw Dashboard loaded');
