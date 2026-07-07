import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const usePhotoLogStore = defineStore('photoLog', () => {
    // Array to hold the photo log items
    // Shape: { id, projectId, url, publicId, title, date }
    const photos = ref(JSON.parse(localStorage.getItem('photo_logs') || '[]'));

    // Keep it synced to localStorage
    const savePhotos = () => {
        localStorage.setItem('photo_logs', JSON.stringify(photos.value));
    };

    const getPhotosByProject = (projectId) => {
        return photos.value.filter(p => String(p.projectId) === String(projectId));
    };

    const addPhoto = (photoData) => {
        const newPhoto = {
            id: `photo-${Date.now()}`,
            ...photoData,
            date: new Date().toISOString()
        };
        photos.value.unshift(newPhoto);
        savePhotos();
        return newPhoto;
    };

    const updatePhoto = (photoId, updates) => {
        const index = photos.value.findIndex(p => String(p.id) === String(photoId));
        if (index !== -1) {
            photos.value[index] = { ...photos.value[index], ...updates };
            savePhotos();
        }
    };

    const deletePhoto = (photoId) => {
        photos.value = photos.value.filter(p => String(p.id) !== String(photoId));
        savePhotos();
    };

    return {
        photos,
        getPhotosByProject,
        addPhoto,
        updatePhoto,
        deletePhoto
    };
});
