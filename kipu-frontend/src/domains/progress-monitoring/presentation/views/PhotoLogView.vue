<script setup>
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useProjectsStore } from '@/domains/project-management/data/useProjectsStore.js';
import { usePhotoLogStore } from '@/domains/progress-monitoring/application/photoLogStore.js';
import { cloudinaryService } from '@/shared/infrastructure/cloudinary.service.js';

import Dialog from 'primevue/dialog';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';

const { t } = useI18n();

const projectsStore = useProjectsStore();
const photoLogStore = usePhotoLogStore();

const currentProjectId = computed(() => projectsStore.currentProjectId);
const projectPhotos = computed(() => photoLogStore.getPhotosByProject(currentProjectId.value));

// Upload State
const showUploadDialog = ref(false);
const isUploading = ref(false);
const uploadFile = ref(null);
const uploadPreview = ref(null);
const uploadTitle = ref('');

// Edit State
const showEditDialog = ref(false);
const editPhotoItem = ref(null);
const editTitle = ref('');

// Delete State
const showDeleteDialog = ref(false);
const deletePhotoItem = ref(null);
const isDeleting = ref(false);

const handleExport = () => alert(t('execution.advances.photoLog.exportNotice'));

// ---- Upload Methods ----
const openUpload = () => {
  uploadFile.value = null;
  uploadPreview.value = null;
  uploadTitle.value = '';
  isUploading.value = false;
  showUploadDialog.value = true;
};

const handleFileSelect = (event) => {
  const file = event.target.files[0];
  if (file) {
    uploadFile.value = file;
    const reader = new FileReader();
    reader.onload = (e) => uploadPreview.value = e.target.result;
    reader.readAsDataURL(file);
  }
};

const handleUploadSubmit = async () => {
  if (!uploadFile.value || !currentProjectId.value || !uploadTitle.value) return;

  isUploading.value = true;
  try {
    const result = await cloudinaryService.uploadImage(uploadFile.value);
    photoLogStore.addPhoto({
      projectId: currentProjectId.value,
      url: result.url,
      publicId: result.public_id,
      title: uploadTitle.value
    });
    showUploadDialog.value = false;
  } catch (error) {
    console.error('Error uploading photo:', error);
    alert('Error uploading photo');
  } finally {
    isUploading.value = false;
  }
};

// ---- Edit Methods ----
const openEdit = (photo) => {
  editPhotoItem.value = photo;
  editTitle.value = photo.title;
  showEditDialog.value = true;
};

const handleEditSubmit = () => {
  if (editPhotoItem.value && editTitle.value) {
    photoLogStore.updatePhoto(editPhotoItem.value.id, { title: editTitle.value });
    showEditDialog.value = false;
  }
};

// ---- Delete Methods ----
const openDelete = (photo) => {
  deletePhotoItem.value = photo;
  showDeleteDialog.value = true;
};

const handleDeleteSubmit = async () => {
  if (!deletePhotoItem.value) return;
  
  isDeleting.value = true;
  try {
    if (deletePhotoItem.value.publicId) {
      await cloudinaryService.deleteImage(deletePhotoItem.value.publicId);
    }
    photoLogStore.deletePhoto(deletePhotoItem.value.id);
    showDeleteDialog.value = false;
  } catch (error) {
    console.error('Error deleting photo:', error);
    alert('Error deleting photo');
  } finally {
    isDeleting.value = false;
  }
};
</script>

<template>
  <div class="bg-white p-6 rounded-b-xl shadow-sm">
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
      <div class="flex flex-wrap gap-2">
        <!-- Optional tags -->
      </div>
      <div class="flex flex-wrap gap-2 w-full md:w-auto justify-end">
        <button @click="handleExport" class="text-gray-500 flex items-center gap-2 px-4 py-2 hover:bg-gray-100 rounded-md font-bold text-sm transition-colors">
          <i class="pi pi-download"></i> {{ t('execution.advances.photoLog.export') }}
        </button>
        <button @click="openUpload" class="bg-gray-800 text-white flex items-center gap-2 px-4 py-2 rounded-md font-bold text-sm hover:bg-gray-900 transition-colors">
          <i class="pi pi-plus"></i> {{ t('execution.advances.photoLog.upload_photos') }}
        </button>
      </div>
    </div>

    <!-- Gallery -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div v-for="photo in projectPhotos" :key="photo.id"
           class="bg-gray-100 rounded-xl relative overflow-hidden shadow-sm group">
        <div class="h-48 bg-cover bg-center" :style="{ backgroundImage: `url(${photo.url})` }"></div>
        <div class="p-3 bg-white flex justify-between items-center border-t border-gray-100">
          <span class="font-semibold text-gray-800 text-sm truncate pr-2">{{ photo.title }}</span>
          <div class="flex gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
            <button @click="openEdit(photo)" class="p-2 text-blue-500 hover:bg-blue-50 rounded-full transition-colors">
              <i class="pi pi-pencil"></i>
            </button>
            <button @click="openDelete(photo)" class="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors">
              <i class="pi pi-trash"></i>
            </button>
          </div>
        </div>
      </div>

      <div @click="openUpload" class="h-60 border-2 border-dashed border-gray-300 rounded-xl flex flex-col gap-2 items-center justify-center text-gray-400 cursor-pointer hover:bg-gray-50 hover:border-[#3498DB] hover:text-[#3498DB] transition-all">
        <i class="pi pi-camera text-4xl"></i>
        <span class="font-medium text-sm">{{ t('execution.advances.photoLog.upload_new_photo') }}</span>
      </div>
    </div>

    <!-- Upload Dialog -->
    <Dialog v-model:visible="showUploadDialog" modal :header="t('execution.advances.photoLog.uploadTitle')" :style="{ width: '450px' }">
      <div class="flex flex-col gap-4 py-4">
        <div class="field">
          <label class="block mb-2 font-medium">{{ t('execution.advances.photoLog.imageTitleLabel') }}</label>
          <InputText v-model="uploadTitle" fluid :placeholder="t('execution.advances.photoLog.upload_placeholder')" />
        </div>
        <div class="field">
          <label class="block mb-2 font-medium">{{ t('execution.advances.photoLog.file') }}</label>
          <input type="file" @change="handleFileSelect" accept="image/*" class="w-full text-sm text-gray-500 border border-gray-300 rounded-md cursor-pointer bg-gray-50 focus:outline-none p-2" />
        </div>
        <div v-if="uploadPreview" class="w-full h-40 bg-cover bg-center rounded-md border" :style="{ backgroundImage: 'url(' + uploadPreview + ')' }"></div>
      </div>
      <template #footer>
        <Button :label="t('execution.advances.photoLog.btnCancel')" severity="secondary" text @click="showUploadDialog = false" />
        <Button :label="isUploading ? t('execution.advances.photoLog.uploading') : t('execution.advances.photoLog.btnUpload')" :loading="isUploading" :disabled="!uploadFile || !uploadTitle.trim()" severity="primary" @click="handleUploadSubmit" />
      </template>
    </Dialog>

    <!-- Edit Dialog -->
    <Dialog v-model:visible="showEditDialog" modal :header="t('execution.advances.photoLog.editTitle')" :style="{ width: '400px' }">
      <div class="flex flex-col gap-4 py-4">
        <div class="field">
          <label class="block mb-2 font-medium">{{ t('execution.advances.photoLog.imageTitleLabel') }}</label>
          <InputText v-model="editTitle" fluid />
        </div>
      </div>
      <template #footer>
        <Button :label="t('execution.advances.photoLog.btnCancel')" severity="secondary" text @click="showEditDialog = false" />
        <Button label="Guardar" severity="success" :disabled="!editTitle.trim()" @click="handleEditSubmit" />
      </template>
    </Dialog>

    <!-- Delete Confirmation Dialog -->
    <Dialog v-model:visible="showDeleteDialog" modal :header="t('execution.advances.photoLog.deleteConfirmTitle')" :style="{ width: '380px' }">
      <div class="flex items-center gap-4 py-4">
        <i class="pi pi-exclamation-triangle text-red-500 text-4xl"></i>
        <p class="m-0 text-gray-700">{{ t('execution.advances.photoLog.deleteConfirmMsg') }}</p>
      </div>
      <template #footer>
        <Button :label="t('execution.advances.photoLog.btnCancel')" severity="secondary" text @click="showDeleteDialog = false" />
        <Button label="Eliminar" severity="danger" :loading="isDeleting" @click="handleDeleteSubmit" />
      </template>
    </Dialog>
  </div>
</template>