// Project page functionality
document.addEventListener('DOMContentLoaded', function () {
    // Get project name from URL path
    const pathSegments = window.location.pathname.split('/');
    const projectName = pathSegments[pathSegments.length - 1];

    if (projectName && projectName !== '' && projectName !== 'project') {
        loadProjectData(projectName);
    } else {
        showError('Project not found');
    }
});

// Load project data from info.json
async function loadProjectData(projectName) {
    try {
        const response = await fetch(`${projectName}/info.json`);
        if (!response.ok) {
            throw new Error('Failed to load project data');
        }

        const projectData = await response.json();
        displayProjectData(projectData);
        loadProjectImages(projectName);
    } catch (error) {
        console.error('Error loading project data:', error);
        showError('Unable to load project information');
    }
}

// Display project data
function displayProjectData(data) {
    // Update page title
    document.title = `${data.name} - Hartvig Solutions`;

    // Update project title and description
    const titleElement = document.getElementById('project-title');
    const descriptionElement = document.getElementById('project-description');

    if (titleElement) {
        titleElement.textContent = data.name;
    }

    if (descriptionElement) {
        descriptionElement.textContent = data.description;
    }

    // Create action buttons
    createActionButtons(data);

    // Load privacy policy if available
    if (data.privacyPolicy) {
        loadPrivacyPolicy(data.privacyPolicy);
    }
}

// Create action buttons based on available links
function createActionButtons(data) {
    const actionButtonsContainer = document.getElementById('action-buttons');
    const buttons = [];

    if (data.appStore) {
        buttons.push(`
            <a href="${data.appStore}" target="_blank" class="action-button">
                Get on App Store
            </a>
        `);
    }

    if (data.googlePlay) {
        buttons.push(`
            <a href="${data.googlePlay}" target="_blank" class="action-button">
                Get on Google Play
            </a>
        `);
    }

    if (data.website) {
        buttons.push(`
            <a href="${data.website}" target="_blank" class="action-button secondary">
                Visit Website
            </a>
        `);
    }

    if (data.privacyPolicy) {
        buttons.push(`
            <button onclick="togglePrivacyPolicy()" class="action-button outline">
                Privacy Policy
            </button>
        `);
    }

    if (buttons.length > 0) {
        actionButtonsContainer.innerHTML = buttons.join('');
    } else {
        actionButtonsContainer.innerHTML = `
            <div style="text-align: center; color: #666;">
                <p>No download links available at the moment.</p>
            </div>
        `;
    }
}

// Load project images
async function loadProjectImages(projectName) {
    console.log('Loading images for project:', projectName);
    const galleryContainer = document.getElementById('gallery-container');
    console.log('Gallery container:', galleryContainer);

    // Common image extensions to try
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
    const imageNames = ['screenshot1', 'screenshot2', 'screenshot3', 'screenshot4', 'screenshot5', 'image1', 'image2', 'image3', 'image4', 'image5'];

    let loadedImages = [];

    // Try to load images with different names and extensions
    for (let name of imageNames) {
        for (let ext of imageExtensions) {
            const imageUrl = `${projectName}/images/${name}.${ext}`;
            console.log('Trying image:', imageUrl);
            try {
                const response = await fetch(imageUrl, { method: 'HEAD' });
                console.log('Response for', imageUrl, ':', response.status);
                if (response.ok) {
                    console.log('Found image:', imageUrl);
                    loadedImages.push(imageUrl);
                    break; // Found this image, try next name
                }
            } catch (error) {
                console.log('Error loading', imageUrl, ':', error);
                // Continue to next extension
            }
        }
    }

    console.log('Total loaded images:', loadedImages);

    if (loadedImages.length > 0) {
        const imageHTML = loadedImages.map(imageUrl => `
            <div class="gallery-item">
                <img src="${imageUrl}" alt="Project Screenshot" loading="lazy">
            </div>
        `).join('');

        console.log('Image HTML:', imageHTML);
        galleryContainer.innerHTML = imageHTML;
    } else {
        console.log('No images found, showing no images message');
        showNoImages();
    }
}

// Show no images message
function showNoImages() {
    const galleryContainer = document.getElementById('gallery-container');
    galleryContainer.innerHTML = `
        <div style="text-align: center; padding: 2rem; color: #666; grid-column: 1 / -1;">
            <p>No images available for this project.</p>
        </div>
    `;
}

// Load privacy policy
async function loadPrivacyPolicy(policyContent) {
    const privacySection = document.getElementById('privacy-section');
    const privacyContent = document.getElementById('privacy-content');

    if (typeof policyContent === 'string') {
        // If it's a markdown string, convert it to HTML
        privacyContent.innerHTML = convertMarkdownToHtml(policyContent);
    } else {
        // If it's a file path, load it
        try {
            const response = await fetch(policyContent);
            if (response.ok) {
                const markdown = await response.text();
                privacyContent.innerHTML = convertMarkdownToHtml(markdown);
            }
        } catch (error) {
            privacyContent.innerHTML = '<p>Privacy policy not available.</p>';
        }
    }
}

// Toggle privacy policy visibility
function togglePrivacyPolicy() {
    const privacySection = document.getElementById('privacy-section');
    const isVisible = privacySection.style.display !== 'none';

    privacySection.style.display = isVisible ? 'none' : 'block';
}

// Simple markdown to HTML converter
function convertMarkdownToHtml(markdown) {
    return markdown
        .replace(/^### (.*$)/gim, '<h3>$1</h3>')
        .replace(/^## (.*$)/gim, '<h2>$1</h2>')
        .replace(/^# (.*$)/gim, '<h1>$1</h1>')
        .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
        .replace(/\*(.*)\*/gim, '<em>$1</em>')
        .replace(/\n/gim, '<br>');
}

// Show error message
function showError(message) {
    const mainContent = document.querySelector('.project-main .container');
    mainContent.innerHTML = `
        <div class="error-state">
            <h2>Error</h2>
            <p>${message}</p>
            <a href="../index.html" class="action-button">Back to Home</a>
        </div>
    `;
}

// HTMX functionality for dynamic content
document.addEventListener('htmx:load', function () {
    console.log('HTMX content loaded on project page');
}); 