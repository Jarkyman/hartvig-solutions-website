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
    loadTools();
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

    const projectsTrack = document.createElement('div');
    projectsTrack.className = 'projects-track';
    const clones = 3;
    projectsTrack.innerHTML = Array.from({ length: clones }, () => projectsHTML).join('');

    projectsGrid.innerHTML = '';
    projectsGrid.appendChild(projectsTrack);

    const projectCards = projectsTrack.querySelectorAll('.project-card');
    projectCards.forEach((card, index) => {
        if (index >= projects.length) {
            card.setAttribute('aria-hidden', 'true');
            const link = card.querySelector('.project-link');
            if (link) {
                link.setAttribute('tabindex', '-1');
            }
        }
    });

    if (typeof projectsGrid.__marqueeCleanup === 'function') {
        projectsGrid.__marqueeCleanup();
    }

    requestAnimationFrame(() => {
        projectsGrid.__marqueeCleanup = startMarquee(projectsGrid, projectsTrack, { clones, speed: 0.2 });
    });
}

// Load tools from embedded data
function loadTools() {
    const toolsGrid = document.getElementById('tools-grid');
    if (!toolsGrid) {
        return;
    }

    const defaultTools = [
        { name: 'Flutter', image: 'assets/tools/flutter.png' },
        { name: 'Dart', image: 'assets/tools/dart.png' },
        { name: 'Swift', image: 'assets/tools/swift.png' },
        { name: 'Kotlin', image: 'assets/tools/kotlin.png' },
        { name: 'Android', image: 'assets/tools/android.png' },
        { name: 'iOS', image: 'assets/tools/ios.png' },
        { name: 'Xcode', image: 'assets/tools/xcode.png' },
        { name: 'Python', image: 'assets/tools/python.png' },
        { name: 'Firebase', image: 'assets/tools/firebase.png' },
        { name: 'Supabase', image: 'assets/tools/supabase.png' },
        { name: 'Next.js', image: 'assets/tools/next.png' },
        { name: 'React', image: 'assets/tools/react.png' },
        { name: 'TypeScript', image: 'assets/tools/typescript.png' },
        { name: 'Node.js', image: 'assets/tools/node.png' },
        { name: 'Figma', image: 'assets/tools/figma.png' },
        { name: 'GitHub', image: 'assets/tools/github.png' },
        { name: 'Docker', image: 'assets/tools/docker.png' },
        { name: 'Postman', image: 'assets/tools/postman.png' }
    ];

    const tools = typeof TOOLS_DATA !== 'undefined' ? TOOLS_DATA : defaultTools;

    const toolsHTML = tools.map((tool, index) => {
        const imagePath = tool.image || '';
        const name = tool.name || 'Tool';
        const loadingAttr = index === 0 ? 'eager' : 'lazy';
        return `
            <div class="tool-card" data-tool="${name}">
                <img src="${imagePath}" alt="${name}" class="tool-image" loading="${loadingAttr}" />
                <span class="tool-label">${name}</span>
            </div>
        `;
    }).join('');

    const toolsTrack = document.createElement('div');
    toolsTrack.className = 'tools-track';
    const clones = 3;
    toolsTrack.innerHTML = Array.from({ length: clones }, () => toolsHTML).join('');

    toolsGrid.innerHTML = '';
    toolsGrid.appendChild(toolsTrack);

    const toolCards = toolsTrack.querySelectorAll('.tool-card');
    toolCards.forEach((card, index) => {
        if (index >= tools.length) {
            card.setAttribute('aria-hidden', 'true');
        }
    });

    const images = Array.from(toolsTrack.querySelectorAll('img')).slice(0, tools.length);
    const startMarqueeForTools = () => {
        if (typeof toolsGrid.__marqueeCleanup === 'function') {
            toolsGrid.__marqueeCleanup();
        }
        requestAnimationFrame(() => {
            toolsGrid.__marqueeCleanup = startMarquee(toolsGrid, toolsTrack, { clones, speed: 0.4 });
        });
    };

    if (images.length === 0) {
        startMarqueeForTools();
    } else {
        const imagePromises = images.map(img => {
            if (img.complete && img.naturalWidth !== 0) {
                return Promise.resolve();
            }
            return new Promise(resolve => {
                img.addEventListener('load', resolve, { once: true });
                img.addEventListener('error', resolve, { once: true });
            });
        });

        Promise.all(imagePromises).then(startMarqueeForTools);
        setTimeout(startMarqueeForTools, 1000);
    }
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

function startMarquee(container, track, options = {}) {
    const { clones = 2, speed = 0.6 } = options;
    let offset = 0;
    let rafId = null;
    let paused = false;
    let segmentWidth = Math.max(track.scrollWidth / clones, 1);

    const updateSegmentWidth = () => {
        const width = track.scrollWidth / clones;
        segmentWidth = Math.max(width, 1);
    };

    const step = () => {
        if (!paused) {
            offset += speed;
            if (offset >= segmentWidth) {
                offset -= segmentWidth;
            }
            track.style.transform = `translate3d(${-offset}px, 0, 0)`;
        }
        rafId = requestAnimationFrame(step);
    };

    const pause = () => {
        paused = true;
    };

    const resume = () => {
        paused = false;
    };

    const handleResize = () => {
        const previousSegment = segmentWidth;
        updateSegmentWidth();
        if (segmentWidth !== previousSegment) {
            offset = offset % segmentWidth;
        }
    };

    container.addEventListener('mouseenter', pause);
    container.addEventListener('mouseleave', resume);
    container.addEventListener('focusin', pause);
    container.addEventListener('focusout', resume);
    window.addEventListener('resize', handleResize);

    updateSegmentWidth();
    step();

    return () => {
        if (rafId !== null) {
            cancelAnimationFrame(rafId);
        }
        container.removeEventListener('mouseenter', pause);
        container.removeEventListener('mouseleave', resume);
        container.removeEventListener('focusin', pause);
        container.removeEventListener('focusout', resume);
        window.removeEventListener('resize', handleResize);
    };
}
