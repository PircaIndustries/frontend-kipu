import { allProjects } from '../../data/projectsStore';
import { Project } from '../../domain/models/Project';

export const ProjectService = {
    validateDates(start, end) {
        if (start && end && new Date(end) < new Date(start)) {
            return 'project-management.create.errors.dateLogic';
        }
        return null;
    },

    create(formData) {
        const newProjectData = new Project({
            id: String(Date.now()),
            name: formData.name,
            location: formData.location,
            startDate: formData.startDate?.toISOString().split('T')[0],
            endDate: formData.endDate?.toISOString().split('T')[0],
            budget: formData.budget,
            image: formData.imageUrl,
            status: formData.status
        });

        allProjects.value.unshift(newProjectData);
        return newProjectData;
    }
};