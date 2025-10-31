// Navigation functionality
document.addEventListener('DOMContentLoaded', function () {
    // Smooth navigation
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('section');

    // Update active navigation link based on scroll position
    window.addEventListener('scroll', () => {
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (scrollY >= (sectionTop - 200)) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    });

    // Load projects
    loadProjects();
});

// Load projects from embedded data
function loadProjects() {
    const projectsGrid = document.getElementById('projects-grid');

    // Show loading state
    projectsGrid.innerHTML = '<div class="loading">Loading projects...</div>';

    try {
        console.log('Loading projects from embedded data...');

        // Use embedded projects data if available, otherwise fallback
        const projects = typeof PROJECTS_DATA !== 'undefined' ? PROJECTS_DATA : [
            {
                "name": "jsontomodel",
                "description": "Use our free JSON to Model converter to instantly generate type-safe data models in popular languages like Swift, Kotlin, Dart, TypeScript, Python, Rust, and more. Whether you're building mobile or backend apps, this code generator will save you time and ensure consistency.",
                "shortDescription": "Free JSON to Model converter for multiple languages"
            },
            {
                "name": "flags-game",
                "description": "An engaging educational game that helps you learn world flags through interactive gameplay and quizzes.",
                "shortDescription": "Educational flag learning game"
            },
            {
                "name": "hint-master",
                "description": "It's a simple but fun and challenging game that can be played by people of all ages and can be a fun activity with friends and family or a challenging competition with a group of colleagues or classmates.",
                "shortDescription": "Fun group game for all ages"
            },
            {
                "name": "util-master",
                "description": "Learn CS2 lineups for smokes, flashes, and molotovs on all Counter-Strike maps. Master the art of utility usage with precise positioning and timing guides to improve your tactical gameplay.",
                "shortDescription": "CS2 utility lineup trainer"
            }
        ];

        console.log('Projects loaded successfully:', projects);
        displayProjects(projects);
    } catch (error) {
        console.error('Error loading projects:', error);
        projectsGrid.innerHTML = `
            <div style="text-align: center; padding: 2rem; color: #666;">
                <p>Unable to load projects at the moment.</p>
                <p>Error: ${error.message}</p>
                <p>Please check back later or contact us directly.</p>
                <button onclick="loadProjects()" style="margin-top: 1rem; padding: 0.5rem 1rem; background: #1A2E49; color: white; border: none; border-radius: 4px; cursor: pointer;">Retry</button>
            </div>
        `;
    }
}

// Display projects in the grid
function displayProjects(projects) {
    const projectsGrid = document.getElementById('projects-grid');

    if (!projects || projects.length === 0) {
        projectsGrid.innerHTML = `
            <div style="text-align: center; padding: 2rem; color: #666;">
                <p>No projects available at the moment.</p>
                <p>Check back soon for new projects!</p>
            </div>
        `;
        return;
    }

    const projectsHTML = projects.map(project => {
        // Always use hash-based routing since PHP router redirects to hash URLs
        const projectUrl = `#${project.name}`;

        return `
            <div class="project-card">
                <h3 class="project-title">${project.name}</h3>
                <p class="project-description">${project.description}</p>
                <a href="${projectUrl}" class="project-link">View Project</a>
            </div>
        `;
    }).join('');

    projectsGrid.innerHTML = projectsHTML;
}

// HTMX functionality for dynamic content loading
document.addEventListener('htmx:load', function () {
    // Re-initialize any necessary functionality after HTMX content loads
    console.log('HTMX content loaded');
});

// Add HTMX attributes for dynamic project loading
function addHtmxAttributes() {
    // Example of how to add HTMX attributes for future dynamic loading
    const projectLinks = document.querySelectorAll('.project-link');
    projectLinks.forEach(link => {
        link.setAttribute('hx-get', link.href);
        link.setAttribute('hx-target', '#main-content');
        link.setAttribute('hx-push-url', 'true');
    });
} 