/**
 * Available local project images from public/assets.
 */
const PROJECT_IMAGES = [
    '/assets/project-image1.png',
    '/assets/project-image2.png',
    '/assets/project-image3.png',
    '/assets/project-image4.png',
    '/assets/project-image5.png'
];

/**
 * Returns a random project image path from the available assets.
 * @returns {string}
 */
export function getRandomProjectImage() {
    return PROJECT_IMAGES[Math.floor(Math.random() * PROJECT_IMAGES.length)];
}

/**
 * Domain entity representing a construction project.
 */
export class ProjectEntity {
    constructor({
        id = '',
        name = '',
        description = '',
        location = '',
        startDate = '',
        endDate = '',
        budget = 0,
        progress = 0,
        status = 'Planificación',
        statusJustification = '',
        image = '',
        members = 1,
        rnc = 0,
        pending = 0
    } = {}) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.location = location;
        this.startDate = startDate;
        this.endDate = endDate;
        this.budget = budget;
        this.progress = progress;
        this.status = status;
        this.statusJustification = statusJustification;
        this.image = image || getRandomProjectImage();
        this.members = members;
        this.rnc = rnc;
        this.pending = pending;
    }
}
