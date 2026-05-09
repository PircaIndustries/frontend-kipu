export class Project {
    constructor({ id, name, location, startDate, endDate, budget, progress = 0, status = 'Planificación', image = '', members = 1, rnc = 0, pending = 0 }) {
        this.id = id;
        this.name = name;
        this.location = location;
        this.startDate = startDate;
        this.endDate = endDate;
        this.budget = budget;
        this.progress = progress;
        this.status = status;
        this.image = image || 'https://images.unsplash.com/photo-1503387762-592dea58ef23?q=80&w=500';
        this.members = members;
        this.rnc = rnc;
        this.pending = pending;
    }
}