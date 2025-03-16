/**
 * Dashboard Functionality
 * This script handles the dashboard charts and data visualization
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize pie chart
    createDepartmentPieChart();
    
    // Set up quick access cards functionality
    initQuickAccessCards();
    
    // Add notification functionality
    initNotifications();
});

/**
 * Create a pie chart showing employee distribution by department
 */
function createDepartmentPieChart() {
    const chartContainer = document.querySelector('.chart-container');
    if (!chartContainer) return;
    
    // Clear existing content if any
    chartContainer.innerHTML = `
        <div class="chart-wrapper">
            <h3>Phân bố nhân viên theo phòng ban</h3>
            <div class="pie-chart-container">
                <canvas id="distribution-chart"></canvas>
            </div>
        </div>
    `;
    
    // Sample data
    const departments = ['IT', 'HR', 'Finance', 'Marketing', 'Sales', 'Production', 'R&D'];
    const employeeCounts = [28, 15, 18, 22, 30, 35, 12];
    const departmentColors = [
        'rgba(54, 162, 235, 0.8)',
        'rgba(75, 192, 192, 0.8)',
        'rgba(255, 206, 86, 0.8)',
        'rgba(153, 102, 255, 0.8)',
        'rgba(255, 159, 64, 0.8)',
        'rgba(255, 99, 132, 0.8)',
        'rgba(201, 203, 207, 0.8)'
    ];
    
    // Create pie chart without animations
    const pieCtx = document.getElementById('distribution-chart');
    if (!pieCtx) return;
    
    new Chart(pieCtx, {
        type: 'pie',
        data: {
            labels: departments,
            datasets: [{
                data: employeeCounts,
                backgroundColor: departmentColors,
                borderColor: '#ffffff',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true, // Prevent auto-stretching
            animation: false, // Disable animations
            layout: {
                padding: 20
            },
            plugins: {
                legend: {
                    position: 'right',
                    labels: {
                        boxWidth: 15,
                        padding: 15,
                        font: {
                            size: 12
                        }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.parsed || 0;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = Math.round((value / total) * 100);
                            return `${label}: ${value} nhân viên (${percentage}%)`;
                        }
                    }
                }
            },
            transitions: {
                active: {
                    animation: {
                        duration: 0 // Disable hover animations
                    }
                }
            }
        }
    });
}

/**
 * Initialize quick access cards functionality
 */
function initQuickAccessCards() {
    const quickCards = document.querySelectorAll('.quick-card');
    
    quickCards.forEach(card => {
        card.addEventListener('click', function() {
            const link = this.getAttribute('data-link');
            if (link) {
                window.location.href = link;
            }
        });
    });
}

/**
 * Initialize notifications functionality
 */
function initNotifications() {
    const notificationIcon = document.querySelector('.notification');
    
    if (notificationIcon) {
        notificationIcon.addEventListener('click', function() {
            // In a real application, this would show a dropdown with notifications
            alert('Chức năng thông báo sẽ được triển khai trong phiên bản tiếp theo.');
        });
    }
    
    // Make notification items clickable
    const notificationItems = document.querySelectorAll('.notification-item');
    
    notificationItems.forEach(item => {
        item.addEventListener('click', function() {
            const title = this.querySelector('h4')?.textContent || '';
            alert(`Bạn đã click vào thông báo: ${title}`);
        });
    });
} 