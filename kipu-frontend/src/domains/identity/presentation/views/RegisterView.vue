<script setup>
/**
 * RegisterView — User registration page.
 * Migrated from Angular's RegisterComponent.
 * Uses PrimeVue components (InputText, Password, Select, Button, Checkbox, Divider, Dialog).
 */
import { ref, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { identityApi } from '../../infrastructure/identity.api';

import AuthBanner from '@/shared/presentation/components/AuthBanner.vue';
import InputText from 'primevue/inputtext';
import Password from 'primevue/password';
import Select from 'primevue/select';
import Button from 'primevue/button';
import Checkbox from 'primevue/checkbox';
import Divider from 'primevue/divider';
import Dialog from 'primevue/dialog';

const { t } = useI18n();
const router = useRouter();

// ── Form state ──
const name = ref('');
const email = ref('');
const password = ref('');
const role = ref('');
const rememberMe = ref(false);

// ── Validation state ──
const touched = ref({
    name: false,
    email: false,
    password: false,
    role: false
});

const emailChecking = ref(false);
const emailDuplicated = ref(false);
let emailCheckTimeout = null;

// ── Dialog state ──
const showSuccessDialog = ref(false);

// ── Role options ──
const roleOptions = computed(() => [
    { label: t('identity.role_manager'), value: 'Gestor Operativo' },
    { label: t('identity.role_logistics'), value: 'Logística y Administración' }
]);

// ── Validation computed properties ──
const nameError = computed(() => {
    if (!touched.value.name) return '';
    if (!name.value.trim()) return t('identity.err_name_required');
    return '';
});

const emailError = computed(() => {
    if (!touched.value.email) return '';
    if (!email.value.trim()) return t('identity.err_email_required');
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.value)) return t('identity.err_email_invalid');
    if (emailDuplicated.value) return t('identity.err_email_taken');
    return '';
});

const passwordError = computed(() => {
    if (!touched.value.password) return '';
    if (!password.value) return t('identity.err_password_required');
    if (password.value.length < 8) return t('identity.err_password_min');
    return '';
});

const roleError = computed(() => {
    if (!touched.value.role) return '';
    if (!role.value) return t('identity.err_role_required');
    return '';
});

const isFormValid = computed(() => {
    return name.value.trim() &&
        email.value.trim() &&
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value) &&
        !emailDuplicated.value &&
        password.value.length >= 8 &&
        role.value &&
        !emailChecking.value;
});

// ── Async email duplication check with debounce ──
watch(email, (newEmail) => {
    emailDuplicated.value = false;
    if (emailCheckTimeout) clearTimeout(emailCheckTimeout);

    if (!newEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) {
        emailChecking.value = false;
        return;
    }

    emailChecking.value = true;
    emailCheckTimeout = setTimeout(async () => {
        try {
            const exists = await identityApi.checkEmailExists(newEmail);
            emailDuplicated.value = exists;
        } catch {
            emailDuplicated.value = false;
        } finally {
            emailChecking.value = false;
        }
    }, 500);
});

// ── Form submission ──
function markAllTouched() {
    touched.value = {
        name: true,
        email: true,
        password: true,
        role: true
    };
}

async function onSubmit() {
    markAllTouched();

    if (!isFormValid.value) return;

    try {
        await identityApi.register({
            name: name.value,
            email: email.value,
            password: password.value,
            role: role.value
        });
        showSuccessDialog.value = true;
    } catch (error) {
        console.error('Error registering account:', error);
        alert('Error crítico al intentar registrar la cuenta.');
    }
}

function onSuccessClose() {
    showSuccessDialog.value = false;
    router.push('/login');
}
</script>

<template>
    <div class="register-page">
        <div class="register-card">
            <AuthBanner />

            <div class="register-form-container">
                <h2 class="register-form-container__title">{{ t('identity.register_title') }}</h2>
                <p class="register-form-container__subtitle">{{ t('identity.register_description') }}</p>

                <form class="register-form" @submit.prevent="onSubmit">
                    <!-- Name -->
                    <div class="register-form__field">
                        <label for="register-name">{{ t('identity.name') }}</label>
                        <InputText
                            id="register-name"
                            v-model="name"
                            :placeholder="t('identity.name_placeholder')"
                            fluid
                            :invalid="!!nameError"
                            @blur="touched.name = true"
                        />
                        <small v-if="nameError" class="register-form__error">{{ nameError }}</small>
                    </div>

                    <!-- Email -->
                    <div class="register-form__field">
                        <label for="register-email">{{ t('identity.email') }}</label>
                        <InputText
                            id="register-email"
                            v-model="email"
                            type="email"
                            :placeholder="t('identity.email_placeholder')"
                            fluid
                            :invalid="!!emailError"
                            @blur="touched.email = true"
                        />
                        <small v-if="emailChecking" class="register-form__hint">
                            {{ t('identity.hint_checking_email') }}
                        </small>
                        <small v-if="emailError" class="register-form__error">{{ emailError }}</small>
                    </div>

                    <!-- Password -->
                    <div class="register-form__field">
                        <label for="register-password">{{ t('identity.password') }}</label>
                        <Password
                            id="register-password"
                            v-model="password"
                            :placeholder="t('identity.password_placeholder')"
                            :feedback="false"
                            toggleMask
                            fluid
                            :invalid="!!passwordError"
                            @blur="touched.password = true"
                        />
                        <small v-if="passwordError" class="register-form__error">{{ passwordError }}</small>
                    </div>

                    <!-- Role -->
                    <div class="register-form__field">
                        <label for="register-role">{{ t('identity.role') }}</label>
                        <Select
                            id="register-role"
                            v-model="role"
                            :options="roleOptions"
                            optionLabel="label"
                            optionValue="value"
                            :placeholder="t('identity.role_placeholder')"
                            fluid
                            :invalid="!!roleError"
                            @blur="touched.role = true"
                        />
                        <small v-if="roleError" class="register-form__error">{{ roleError }}</small>
                    </div>

                    <!-- Remember me -->
                    <div class="register-form__checkbox-row">
                        <Checkbox v-model="rememberMe" inputId="register-remember" :binary="true" />
                        <label for="register-remember" class="register-form__checkbox-label">
                            {{ t('identity.remember_me') }}
                        </label>
                    </div>

                    <!-- Submit -->
                    <Button
                        type="submit"
                        :label="t('identity.register_button')"
                        :disabled="!isFormValid"
                        class="register-form__submit"
                    />

                    <!-- Divider -->
                    <div class="register-form__divider">
                        <Divider />
                        <span class="register-form__divider-text">{{ t('identity.continue') }}</span>
                        <Divider />
                    </div>

                    <!-- Social buttons -->
                    <div class="register-form__social">
                        <Button type="button" outlined class="register-form__social-btn">
                            <span class="register-form__social-icon">G</span> Google
                        </Button>
                        <Button type="button" outlined class="register-form__social-btn">
                            <span class="register-form__social-icon">M</span> Microsoft
                        </Button>
                    </div>

                    <!-- Login link -->
                    <p class="register-form__footer-text">
                        {{ t('identity.has_account') }}
                        <router-link to="/login" class="register-form__link">
                            {{ t('identity.login_link') }}
                        </router-link>
                    </p>
                </form>
            </div>
        </div>

        <!-- Success Dialog -->
        <Dialog
            v-model:visible="showSuccessDialog"
            modal
            :closable="false"
            :style="{ width: '28rem' }"
        >
            <div class="register-success">
                <div class="register-success__icon">
                    <i class="pi pi-check-circle"></i>
                </div>
                <h2 class="register-success__title">{{ t('identity.register_success_title') }}</h2>
                <p class="register-success__desc">{{ t('identity.register_success_desc') }}</p>
                <Button
                    :label="t('identity.continue_button')"
                    @click="onSuccessClose"
                    class="register-success__btn"
                />
            </div>
        </Dialog>
    </div>
</template>

<style scoped>
.register-page {
    min-height: 100vh;
    background-color: #1a252f;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1rem;
    font-family: 'Inter', sans-serif;
}

.register-card {
    background: white;
    border-radius: 1rem;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.4);
    display: flex;
    flex-direction: row;
    width: 100%;
    max-width: 64rem;
    overflow: hidden;
}

.register-form-container {
    width: 50%;
    padding: 3rem;
    background: #f8f9fa;
    display: flex;
    flex-direction: column;
    justify-content: center;
}

.register-form-container__title {
    font-size: 1.75rem;
    font-weight: 700;
    color: #212529;
    margin: 0 0 0.25rem;
}

.register-form-container__subtitle {
    color: #6c757d;
    margin: 0 0 2rem;
    font-size: 0.875rem;
}

.register-form {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.register-form__field {
    display: flex;
    flex-direction: column;
    gap: 0.375rem;
}

.register-form__field label {
    font-size: 0.85rem;
    font-weight: 600;
    color: #34495e;
}

.register-form__error {
    color: #e74c3c;
    font-size: 0.75rem;
}

.register-form__hint {
    color: #3498db;
    font-size: 0.75rem;
}

.register-form__checkbox-row {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.register-form__checkbox-label {
    font-size: 0.85rem;
    color: #4b5563;
    cursor: pointer;
}

.register-form__submit {
    width: 100%;
    padding: 0.875rem;
    font-size: 1rem;
    font-weight: 600;
    margin-top: 0.5rem;
}

.register-form__divider {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin: 0.5rem 0;
}

.register-form__divider-text {
    font-size: 0.75rem;
    color: #9ca3af;
    white-space: nowrap;
}

.register-form__social {
    display: flex;
    gap: 1rem;
}

.register-form__social-btn {
    flex: 1;
    padding: 0.75rem;
    justify-content: center;
}

.register-form__social-icon {
    font-weight: 700;
    margin-right: 0.5rem;
    color: #374151;
}

.register-form__footer-text {
    text-align: center;
    font-size: 0.8rem;
    color: #6c757d;
    margin-top: 0.5rem;
}

.register-form__link {
    color: #3498db;
    text-decoration: none;
    font-weight: 500;
}

.register-form__link:hover {
    text-decoration: underline;
}

/* Success dialog */
.register-success {
    padding: 2rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    text-align: center;
}

.register-success__icon {
    font-size: 4rem;
    color: #27ae60;
}

.register-success__title {
    font-size: 1.25rem;
    font-weight: 700;
    color: #212529;
    margin: 0;
}

.register-success__desc {
    font-size: 0.875rem;
    color: #6c757d;
    margin: 0;
    line-height: 1.5;
}

.register-success__btn {
    margin-top: 0.5rem;
    width: 100%;
}

@media (max-width: 768px) {
    .register-card {
        flex-direction: column;
    }

    .register-form-container {
        width: 100%;
        padding: 2rem;
    }
}
</style>
