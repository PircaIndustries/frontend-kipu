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
 * Returns a deterministic project image path based on a string (like id or name).
 * @param {string|number} identifier 
 * @returns {string}
 */
export function getRandomProjectImage(identifier) {
    if (!identifier) return PROJECT_IMAGES[0];
    const str = String(identifier);
    const hash = [...str].reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return PROJECT_IMAGES[hash % PROJECT_IMAGES.length];
}

/**
 * Domain entity representing a construction project.
 */
export class ProjectEntity {
    constructor(data = {}) {
        this.id = data.id || data.Id || '';
        this.name = data.name || data.Name || '';
        this.description = data.description || data.Description || '';
        this.location = data.location || data.Location || '';
        this.startDate = data.startDate || data.StartDate || '';
        this.endDate = data.endDate || data.EndDate || '';
        this.budget = Number(data.budget || data.Budget || 0);
        this.progress = Number(data.progress || data.Progress || 0);
        this.status = data.status || data.Status || 'Planificación';
        this.statusJustification = data.statusJustification || data.StatusJustification || '';
        this.image = data.image || data.Image || getRandomProjectImage(this.id || this.name);
        this.members = Number(data.members || data.Members || 1);
        this.rnc = Number(data.rnc || data.Rnc || 0);
        this.pending = Number(data.pending || data.Pending || 0);
        this.statusLogs = data.statusLogs || data.StatusLogs || [];
        this.documents = data.documents || data.Documents || [];
    }
}
