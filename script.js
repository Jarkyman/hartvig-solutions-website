// Navigation functionality
const TOOL_DESCRIPTION_FALLBACKS = {
    'flutter': 'Flutter is my preferred UI toolkit for building pixel-perfect, multi-platform apps from a single codebase with native performance.',
    'dart': 'Dart powers my Flutter projects with a modern, null-safe language optimized for fast, reliable mobile and web apps.',
    'swift': 'Swift lets me craft high-performance, native iOS experiences with strong safety guarantees and expressive syntax.',
    'kotlin': 'Kotlin enables concise, reliable Android development with full interoperability and multiplatform reach.',
    'android': 'Android Studio and the Android SDK help me deliver polished experiences to the world’s largest mobile ecosystem.',
    'ios': 'iOS development combines Apple’s best practices with robust tooling to reach engaged, high-value users.',
    'xcode': 'Xcode is my go-to IDE for compiling, profiling, and shipping native Apple platform apps.',
    'python': 'Python accelerates backend services, data processing, and automation with its vast ecosystem.',
    'firebase': 'Firebase provides production-ready authentication, databases, and analytics that keep apps scalable from day one.',
    'supabase': 'Supabase delivers an open-source backend stack—Postgres, auth, storage—perfect for rapid MVP iterations.',
    'next.js': 'Next.js powers fast, SEO-ready web apps with hybrid rendering and an ergonomic developer experience.',
    'react': 'React’s component-driven model lets me ship dynamic interfaces quickly across web and native targets.',
    'typescript': 'TypeScript catches bugs early and keeps complex codebases maintainable with powerful static typing.',
    'node.js': 'Node.js enables highly performant APIs and tooling built on the ubiquitous JavaScript runtime.',
    'figma': 'Figma keeps design and engineering in sync with collaborative UI workflows and precise handoff.',
    'github': 'GitHub manages version control, reviews, and automated deployments across every project.',
    'docker': 'Docker guarantees consistent environments from local development to production with lightweight containers.',
    'postman': 'Postman streamlines API design, testing, and collaboration so services stay reliable as they grow.'
};

document.addEventListener('DOMContentLoaded', function () {
    // Smooth navigation
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('section');
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

    const highlightSection = () => {
        const scrollCenter = window.scrollY + (window.innerHeight / 2);
        const pageBottom = Math.ceil(window.innerHeight + window.scrollY) >= document.documentElement.scrollHeight - 2;
        let current = '';

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionBottom = sectionTop + sectionHeight;

            if (scrollCenter >= sectionTop && scrollCenter < sectionBottom) {
                current = section.getAttribute('id');
            }
        });

        if (pageBottom && sections.length) {
            const lastSection = sections[sections.length - 1];
            current = lastSection.getAttribute('id') || current;
        }

        navLinks.forEach(link => {
            link.classList.toggle('active', link.getAttribute('href') === `#${current}`);
        });
    };

    window.addEventListener('scroll', highlightSection);
    highlightSection();

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
                seoDescription = 'Flutter is my preferred UI toolkit for crafting pixel-perfect, multi-platform apps with shared UI, hot reload, and native performance for iOS, Android, desktop, and web.';
                break;
            case 'dart':
                seoDescription = 'Dart powers my Flutter work with a modern, null-safe language optimized for reactive UIs, enabling fast compilation to native ARM, x64, and highly-performant web output.';
                break;
            case 'swift':
                seoDescription = 'Swift lets me build native iOS apps with strong type safety, blazing performance, and language features that scale from lean prototypes to production-ready platforms.';
                break;
            case 'kotlin':
                seoDescription = 'Kotlin is my go-to for Android development thanks to its concise syntax, multiplatform reach, and full interoperability with existing Java codebases.';
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
                <img src="${tool.image}" alt="${tool.name}" class="tool-image" loading="${loadingAttr}" />
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
        }

        const info = toolInfoMap.get((card.dataset.tool || '').toLowerCase());
        if (!info) {
            return;
        }

        if (card.getAttribute('aria-hidden') === 'true') {
            return;
        }

        card.setAttribute('tabindex', '0');
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
            if (grid && grid.dataset.preventClick === 'true') {
                return;
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
    const dragThreshold = 6;

    if (!container.dataset.preventClick) {
        container.dataset.preventClick = 'false';
    }

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
            container.dataset.preventClick = 'true';
        }
    };

    const releaseDragState = () => {
        container.classList.remove('is-dragging');
        const reset = () => {
            container.dataset.preventClick = 'false';
        };
        if (hasDragged) {
            setTimeout(reset, 120);
        } else {
            reset();
        }
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
    };

    const handlePointerMove = (event) => {
        if (!isPointerDown || event.pointerId !== pointerId) {
            return;
        }
        const totalDelta = event.clientX - dragStartX;
        if (!hasDragged && Math.abs(totalDelta) >= dragThreshold) {
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
            container.dataset.preventClick = 'false';
            hasDragged = false;
        }, 250);
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
        container.dataset.preventClick = 'false';
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
