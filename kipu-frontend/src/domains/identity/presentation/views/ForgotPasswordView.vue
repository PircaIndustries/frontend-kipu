<script setup>
/**
 * ForgotPasswordView — Interface to request password recovery.
 * On submit, navigates to /reset-password.
 */
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import AuthBanner from '@/shared/presentation/components/AuthBanner.vue';
import InputText from 'primevue/inputtext';
import Button from 'primevue/button';

const { t } = useI18n();
const router = useRouter();

const email = ref('');
const isSubmitting = ref(false);
const touched = ref({ email: false });

const emailError = computed(() => {
    if (!touched.value.email) return '';
    if (!email.value.trim()) return t('identity.err_email_required');
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.value)) return t('identity.err_email_invalid');
    return '';
});

const isFormValid = computed(() =>
    email.value.trim() &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)
);

async function onSubmit() {
    touched.value.email = true;
    if (!isFormValid.value) return;

    isSubmitting.value = true;
    // Simulate email dispatch (500ms) then navigate to reset-password
    setTimeout(() => {
        isSubmitting.value = false;
        router.push('/reset-password');
    }, 500);
}
</script>

<template>
    <div class="auth-page">
        <div class="auth-card">
            <AuthBanner />

            <div class="auth-panel">
                <div class="auth-panel__body">
                    <h2 class="auth-panel__title">{{ t('identity.forgot_title') }}</h2>
                    <p class="auth-panel__subtitle">{{ t('identity.forgot_desc') }}</p>

                    <form class="auth-form" @submit.prevent="onSubmit">
                        <div class="auth-form__field">
                            <label for="forgot-email">{{ t('identity.email') }}</label>
                            <InputText
                                id="forgot-email"
                                v-model="email"
                                type="email"
                                :placeholder="t('identity.email_placeholder')"
                                fluid
                                :invalid="!!emailError"
                                @blur="touched.email = true"
                            />
                            <small v-if="emailError" class="auth-form__error">{{ emailError }}</small>
                        </div>

                        <Button
                            type="submit"
                            :label="t('identity.continue_button')"
                            :disabled="!isFormValid"
                            :loading="isSubmitting"
                            class="auth-form__submit"
                        />

                        <p class="auth-form__footer">
                            <router-link to="/login" class="auth-form__link">
                                {{ t('identity.back_to_login') }}
                            </router-link>
                        </p>
                    </form>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.auth-page {
    min-height: 100vh;
    background-color: #1e2a38;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1.5rem;
    font-family: 'Inter', sans-serif;
}

.auth-card {
    display: flex;
    width: 100%;
    max-width: 52rem;
    min-height: 30rem;
    border-radius: 0.75rem;
    overflow: hidden;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
}

.auth-panel {
    width: 50%;
    background: #ffffff;
    display: flex;
    align-items: center;
    justify-content: center;
}

.auth-panel__body {
    width: 100%;
    max-width: 22rem;
    padding: 3rem 2.5rem;
}

.auth-panel__title {
    font-size: 1.5rem;
    font-weight: 700;
    color: #212529;
    margin: 0 0 0.25rem;
}

.auth-panel__subtitle {
    font-size: 0.82rem;
    color: #3498db;
    margin: 0 0 2rem;
}

.auth-form {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
}

.auth-form__field {
    display: flex;
    flex-direction: column;
    gap: 0.375rem;
}

.auth-form__field label {
    font-size: 0.82rem;
    font-weight: 500;
    color: #495057;
}

.auth-form__error {
    color: #e74c3c;
    font-size: 0.72rem;
}

.auth-form__submit {
    width: 100%;
}

.auth-form__footer {
    text-align: center;
    font-size: 0.8rem;
    color: #6c757d;
    margin: 0;
}

.auth-form__link {
    color: #3498db;
    text-decoration: none;
    font-weight: 500;
}

.auth-form__link:hover {
    text-decoration: underline;
}

@media (max-width: 680px) {
    .auth-card { flex-direction: column; }
    .auth-panel { width: 100%; }
    .auth-panel__body { padding: 2rem 1.5rem; }
}
</style>
