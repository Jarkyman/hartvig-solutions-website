// Navigation functionality
const TOOL_DESCRIPTION_FALLBACKS = {
    'flutter': 'Hartvig Solutions uses Flutter to ship pixel-perfect cross-platform apps with a single codebase, letting startups hire one Flutter developer and reach iOS, Android, web, and desktop faster.',
    'dart': 'Dart powers our Flutter builds with type-safe, null-safe code that compiles to native ARM for App Store and Google Play, ensuring every UI stays fast and SEO-friendly.',
    'swift': 'Swift is our tool for premium iOS development—clean, performant code that integrates Apple services so your product feels like a first-class native app.',
    'kotlin': 'We rely on Kotlin to craft modern Android experiences, combining concise syntax with Jetpack libraries to deliver stable apps to Google Play.',
    'android': 'Android Studio and the Android SDK let us profile, automate, and optimize every feature so Android users get polished interactions and fast updates.',
    'ios': 'Native iOS tooling ensures Hartvig Solutions delivers apps that meet Apple’s UX standards, support the newest devices, and feel instantly familiar to users.',
    'xcode': 'Xcode is where we compile, profile, and archive native builds, keeping CI/CD tight and ensuring every TestFlight or App Store release is stable.',
    'python': 'Python backs our automation scripts and backend services, powering data processing, API integrations, and ETL flows that keep your product running.',
    'firebase': 'Firebase gives clients instant backend essentials—Auth, Firestore, Storage, Analytics—so we can launch MVPs with Google-grade reliability.',
    'supabase': 'Supabase is our open-source Postgres stack for products that need SQL, auth, storage, and edge functions without the vendor lock-in.',
    'next.js': 'Next.js helps us build SEO-ready marketing sites, dashboards, and web apps with hybrid rendering so search engines and users get instant load times.',
    'react': 'React is our go-to for component-driven UIs across web and native, letting us reuse patterns and maintain large codebases predictably.',
    'typescript': 'TypeScript keeps large projects safe: we model every API and UI contract in types so refactors stay predictable and bugs are caught before production.',
    'node.js': 'Node.js powers our APIs, webhooks, and tooling—perfect for real-time features, serverless functions, and scalable backend services.',
    'figma': 'Figma keeps design and engineering aligned; we deliver interactive prototypes, component libraries, and frictionless handoff straight into code.',
    'github': 'GitHub manages our version control, code reviews, and CI workflows, giving clients transparency and automated testing on every branch.',
    'docker': 'Docker lets us mirror production locally, orchestrate services for staging, and deploy consistent containers to any cloud.',
    'postman': 'Postman is our API Swiss Army knife for designing, testing, documenting, and monitoring every endpoint before it reaches customers.'
};

document.addEventListener('DOMContentLoaded', function () {
    // Smooth navigation
    const navLinks = document.querySelectorAll('.nav-link');
    const header = document.querySelector('.header');

    const smoothScrollTo = (targetId) => {
        const target = document.querySelector(targetId);
        if (!target) return;

        const headerOffset = header ? header.offsetHeight + 12 : 0;
        const elementPosition = target.getBoundingClientRect().top + window.scrollY;
        const offsetPosition = Math.max(elementPosition - headerOffset, 0);

        window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
        });
    };

    navLinks.forEach(link => {
        const href = link.getAttribute('href') || '';
        if (!href.startsWith('#')) {
            return;
        }

        link.addEventListener('click', (event) => {
            event.preventDefault();
            smoothScrollTo(href);
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

    const rawTools = typeof TOOLS_DATA !== 'undefined' ? TOOLS_DATA : defaultTools;

    const tools = rawTools.map(tool => {
        const name = tool.name || 'Tool';
        const description = tool.description || getToolDescription(name);
        let seoDescription = description;

        switch (name.toLowerCase()) {
            case 'flutter':
                seoDescription = 'Need a Flutter developer? Hartvig Solutions builds production apps with Flutter that share 95% of code between iOS, Android, and web so you launch faster, cheaper, and with native performance.';
                break;
            case 'dart':
                seoDescription = 'Our Dart expertise powers advanced Flutter architecture—null-safe code, layered domains, and lightning-fast compiles that keep your product stable from MVP to scale.';
                break;
            case 'swift':
                seoDescription = 'When a feature demands native iOS precision, we build it in Swift with Combine, SwiftUI, and native SDKs so your Apple users get the premium experience they expect.';
                break;
            case 'kotlin':
                seoDescription = 'Hartvig Solutions pairs Kotlin with Jetpack Compose and modern Android tooling to deliver robust apps that feel perfectly at home on every Google Play device.';
                break;
            default:
                break;
        }

        return {
            name,
            image: tool.image || '',
            description: seoDescription
        };
    });

    const toolsHTML = tools.map((tool, index) => {
        const loadingAttr = index === 0 ? 'eager' : 'lazy';
        return `
            <div class="tool-card" data-tool="${tool.name}">
                <img src="${tool.image}" alt="${tool.name}" class="tool-image" loading="${loadingAttr}" draggable="false" />
                <span class="tool-label">${tool.name}</span>
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
    const toolInfoMap = new Map(tools.map(tool => [tool.name.toLowerCase(), tool]));

    toolCards.forEach((card, index) => {
        if (index >= tools.length) {
            card.setAttribute('aria-hidden', 'true');
            card.setAttribute('tabindex', '-1');
        } else {
            card.setAttribute('tabindex', '0');
        }

        const info = toolInfoMap.get((card.dataset.tool || '').toLowerCase());
        if (!info) {
            return;
        }

        card.setAttribute('role', 'button');
        card.setAttribute('aria-label', `Read more about ${info.name}`);

        const handleOpen = (event) => {
            if (event) {
                event.preventDefault();
            }
            openToolModal(info);
        };

        card.addEventListener('click', (event) => {
            const grid = card.closest('.tools-grid');
            if (grid) {
                const lastDragTime = Number(grid.dataset.lastDragTime || '0');
                if (performance.now() - lastDragTime < 220) {
                    return;
                }
            }
            handleOpen(event);
        });

        card.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                handleOpen();
            }
        });
    });

    setupToolModalListeners();

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
    const effectiveClones = Math.max(clones, 1);
    let segmentWidth = Math.max(track.scrollWidth / effectiveClones, 1);
    const hasBufferClones = effectiveClones > 2;
    let minOffset = hasBufferClones ? segmentWidth : 0;
    let maxOffset = hasBufferClones ? segmentWidth * (effectiveClones - 1) : segmentWidth;
    let offset = minOffset;
    let rafId = null;
    let paused = false;
    let isPointerDown = false;
    let lastPointerX = 0;
    let pointerId = null;
    let resumeTimeout = null;
    let dragStartX = 0;
    let hasDragged = false;
    const dragThreshold = 20;
    const dragDelayMs = 140;
    let dragStartTime = 0;
    let lastDragTimestamp = 0;
    container.dataset.lastDragTime = '0';

    const updateSegmentWidth = () => {
        segmentWidth = Math.max(track.scrollWidth / effectiveClones, 1);
        if (hasBufferClones) {
            minOffset = segmentWidth;
            maxOffset = segmentWidth * (effectiveClones - 1);
            offset = normalizeOffset(offset);
        } else {
            minOffset = 0;
            maxOffset = segmentWidth;
            offset = normalizeOffset(offset);
        }
    };

    const normalizeOffset = (value) => {
        if (hasBufferClones) {
            let normalized = value;
            while (normalized >= maxOffset) {
                normalized -= segmentWidth;
            }
            while (normalized < minOffset) {
                normalized += segmentWidth;
            }
            return normalized;
        }

        if (segmentWidth === 0) {
            return 0;
        }
        let normalized = value % segmentWidth;
        if (normalized < 0) {
            normalized += segmentWidth;
        }
        return normalized;
    };

    const setOffset = (value) => {
        offset = normalizeOffset(value);
        track.style.transform = `translate3d(${-offset}px, 0, 0)`;
    };

    const adjustOffset = (delta) => {
        setOffset(offset + delta);
    };

    const step = () => {
        if (!paused && !isPointerDown) {
            adjustOffset(speed);
        }
        rafId = requestAnimationFrame(step);
    };

    const pause = () => {
        paused = true;
    };

    const resume = () => {
        paused = false;
    };

    const resumeWithDelay = (delay = 800) => {
        clearTimeout(resumeTimeout);
        resumeTimeout = setTimeout(() => {
            if (!isPointerDown) {
                resume();
            }
        }, delay);
    };

    const handleResize = () => {
        const previousSegment = segmentWidth;
        updateSegmentWidth();
        if (segmentWidth !== previousSegment) {
            setOffset(offset);
        }
    };

    const markDragActive = () => {
        if (!hasDragged) {
            hasDragged = true;
            container.classList.add('is-dragging');
        }
        lastDragTimestamp = performance.now();
        container.dataset.lastDragTime = `${lastDragTimestamp}`;
    };

    const releaseDragState = () => {
        container.classList.remove('is-dragging');
        hasDragged = false;
    };

    const handlePointerDown = (event) => {
        if (event.pointerType === 'mouse' && event.button !== 0) {
            return;
        }
        isPointerDown = true;
        pointerId = event.pointerId;
        pause();
        container.classList.remove('is-dragging');
        lastPointerX = event.clientX;
        dragStartX = event.clientX;
        hasDragged = false;
        dragStartTime = performance.now();
    };

    const handlePointerMove = (event) => {
        if (!isPointerDown || event.pointerId !== pointerId) {
            return;
        }
        const totalDelta = event.clientX - dragStartX;
        const elapsed = performance.now() - dragStartTime;
        if (!hasDragged && Math.abs(totalDelta) >= dragThreshold && elapsed >= dragDelayMs) {
            markDragActive();
        }
        if (!hasDragged) {
            return;
        }
        event.preventDefault();
        const delta = event.clientX - lastPointerX;
        lastPointerX = event.clientX;
        adjustOffset(-delta);
    };

    const handlePointerUp = (event) => {
        if (!isPointerDown || event.pointerId !== pointerId) {
            return;
        }
        isPointerDown = false;
        pointerId = null;
        releaseDragState();
        resumeWithDelay();
    };

    const handlePointerLeave = (event) => {
        if (!isPointerDown || event.pointerId !== pointerId) {
            return;
        }
        isPointerDown = false;
        pointerId = null;
        releaseDragState();
        resumeWithDelay();
    };

    const handleWheel = (event) => {
        let delta = event.deltaX;
        if (delta === 0 && event.shiftKey) {
            delta = event.deltaY;
        }
        if (delta === 0) {
            return;
        }

        if (!event.shiftKey && Math.abs(event.deltaX) <= Math.abs(event.deltaY)) {
            return;
        }

        markDragActive();
        event.preventDefault();
        pause();
        adjustOffset(delta);
        resumeWithDelay();
        setTimeout(() => {
            container.classList.remove('is-dragging');
            hasDragged = false;
        }, 180);
    };

    container.addEventListener('mouseenter', pause);
    container.addEventListener('mouseleave', resume);
    container.addEventListener('focusin', pause);
    container.addEventListener('focusout', resume);
    window.addEventListener('resize', handleResize);
    container.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    container.addEventListener('pointerleave', handlePointerLeave);
    window.addEventListener('pointercancel', handlePointerLeave);
    container.addEventListener('wheel', handleWheel, { passive: false });

    updateSegmentWidth();
    setOffset(offset);
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
        container.removeEventListener('pointerdown', handlePointerDown);
        window.removeEventListener('pointermove', handlePointerMove);
        window.removeEventListener('pointerup', handlePointerUp);
        container.removeEventListener('pointerleave', handlePointerLeave);
        window.removeEventListener('pointercancel', handlePointerLeave);
        container.removeEventListener('wheel', handleWheel);
        clearTimeout(resumeTimeout);
        container.dataset.lastDragTime = '0';
    };
}

function getToolDescription(name = 'Tool') {
    const key = name.toLowerCase();
    return TOOL_DESCRIPTION_FALLBACKS[key] || `${name} is part of my daily toolkit for building reliable software across mobile and web.`;
}

let toolModalInitialized = false;

function setupToolModalListeners() {
    if (toolModalInitialized) {
        return;
    }
    const modal = document.getElementById('tool-modal');
    if (!modal) {
        return;
    }

    const closeButtons = modal.querySelectorAll('[data-modal-close]');
    closeButtons.forEach(btn => btn.addEventListener('click', closeToolModal));

    modal.addEventListener('click', (event) => {
        if (event.target === modal) {
            closeToolModal();
        }
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            closeToolModal();
        }
    });

    toolModalInitialized = true;
}

function openToolModal(tool) {
    const modal = document.getElementById('tool-modal');
    if (!modal) {
        return;
    }

    const titleEl = document.getElementById('tool-modal-title');
    const descEl = document.getElementById('tool-modal-description');
    const imgEl = document.getElementById('tool-modal-image');

    if (titleEl) {
        titleEl.textContent = tool.name;
    }
    if (descEl) {
        descEl.textContent = tool.description;
    }
    if (imgEl) {
        imgEl.src = tool.image;
        imgEl.alt = tool.name;
    }

    modal.setAttribute('aria-hidden', 'false');
    modal.classList.add('is-visible');
    document.body.style.overflow = 'hidden';
}

function closeToolModal() {
    const modal = document.getElementById('tool-modal');
    if (!modal) {
        return;
    }
    modal.setAttribute('aria-hidden', 'true');
    modal.classList.remove('is-visible');
    document.body.style.overflow = '';
}
