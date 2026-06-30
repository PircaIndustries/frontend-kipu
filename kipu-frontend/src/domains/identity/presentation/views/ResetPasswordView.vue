<script setup>
/**
 * ResetPasswordView — Interface to define a new password.
 * Shows an inline success dialog after reset.
 * No social buttons (per design correction).
 */
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import AuthBanner from '@/shared/presentation/components/AuthBanner.vue';
import Password from 'primevue/password';
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import InputText from 'primevue/inputtext';
import { identityApi } from '../../infrastructure/identity.api';
import { useRoute } from 'vue-router';

const { t } = useI18n();
const route = useRoute();
const router = useRouter();

const email = computed(() => route.query.email || '');
const code = ref('');
const password = ref('');
const confirmPassword = ref('');
const isSubmitting = ref(false);
const showSuccessDialog = ref(false);
const submitError = ref('');

const touched = ref({
    code: false,
    password: false,
    confirmPassword: false
});

const codeError = computed(() => {
    if (!touched.value.code) return '';
    if (!code.value) return 'El código es requerido';
    if (code.value.length !== 6) return 'El código debe tener 6 dígitos';
    return '';
});

const passwordError = computed(() => {
    if (!touched.value.password) return '';
    if (!password.value) return t('identity.err_password_required');
    if (password.value.length < 8) return t('identity.err_password_min');
    return '';
});

const confirmPasswordError = computed(() => {
    if (!touched.value.confirmPassword) return '';
    if (!confirmPassword.value) return t('identity.err_password_required');
    if (confirmPassword.value !== password.value) return 'Las contraseñas no coinciden';
    return '';
});

const isFormValid = computed(() =>
    code.value.length === 6 &&
    password.value.length >= 8 &&
    confirmPassword.value === password.value &&
    !isSubmitting.value
);

async function onSubmit() {
    touched.value.code = true;
    touched.value.password = true;
    touched.value.confirmPassword = true;
    submitError.value = '';
    if (!isFormValid.value) return;

    isSubmitting.value = true;
    try {
        await identityApi.resetPassword(email.value, code.value, password.value);
        showSuccessDialog.value = true;
    } catch (error) {
        submitError.value = 'El código es inválido o expiró.';
    } finally {
        isSubmitting.value = false;
    }
}

function onSuccessClose() {
    showSuccessDialog.value = false;
    router.push('/login');
}
</script>

<template>
    <div class="auth-page">
        <div class="auth-card">
            <AuthBanner />

            <div class="auth-panel">
                <div class="auth-panel__body">
                    <h2 class="auth-panel__title">{{ t('identity.reset_title') }}</h2>
                    <p class="auth-panel__subtitle">{{ t('identity.reset_desc') }}</p>

                    <form class="auth-form" @submit.prevent="onSubmit">
                        <div class="auth-form__field">
                            <label for="reset-code">Código de Verificación</label>
                            <InputText
                                id="reset-code"
                                v-model="code"
                                placeholder="Ingresa el código de 6 dígitos"
                                fluid
                                :invalid="!!codeError"
                                @blur="touched.code = true"
                            />
                            <small v-if="codeError" class="auth-form__error">{{ codeError }}</small>
                        </div>
                        
                        <!-- New Password -->
                        <div class="auth-form__field">
                            <label for="reset-password">{{ t('identity.new_password') }}</label>
                            <Password
                                id="reset-password"
                                v-model="password"
                                :feedback="false"
                                toggleMask
                                fluid
                                :invalid="!!passwordError"
                                @blur="touched.password = true"
                            />
                            <small v-if="passwordError" class="auth-form__error">{{ passwordError }}</small>
                        </div>

                        <!-- Confirm Password -->
                        <div class="auth-form__field">
                            <label for="reset-confirm">{{ t('identity.confirm_password') }}</label>
                            <Password
                                id="reset-confirm"
                                v-model="confirmPassword"
                                :feedback="false"
                                toggleMask
                                fluid
                                :invalid="!!confirmPasswordError"
                                @blur="touched.confirmPassword = true"
                            />
                            <small v-if="confirmPasswordError" class="auth-form__error">{{ confirmPasswordError }}</small>
                        </div>

                        <small v-if="submitError" class="auth-form__error auth-form__error--center">{{ submitError }}</small>

                        <!-- Submit -->
                        <Button
                            type="submit"
                            :label="t('identity.reset_button')"
                            :disabled="!isFormValid"
                            :loading="isSubmitting"
                            class="auth-form__submit"
                        />

                        <!-- Back to home -->
                        <p class="auth-form__footer">
                            {{ t('identity.back_to_home_1') }}<router-link to="/login" class="auth-form__link">{{ t('identity.back_to_home_link') }}</router-link>{{ t('identity.back_to_home_2') }}
                        </p>
                    </form>
                </div>
            </div>
        </div>

        <!-- Success Dialog -->
        <Dialog
            v-model:visible="showSuccessDialog"
            modal
            :closable="false"
            :style="{ width: '26rem' }"
            :pt="{ root: { style: 'background: #1e2a38; border: none;' } }"
        >
            <div class="reset-success">
                <div class="reset-success__icon-wrapper">
                    <i class="pi pi-check reset-success__icon"></i>
                </div>
                <h2 class="reset-success__title">{{ t('identity.reset_success_title') }}</h2>
                <p class="reset-success__desc">{{ t('identity.reset_success_desc') }}</p>
                <Button
                    :label="t('identity.continue_button')"
                    @click="onSuccessClose"
                    class="reset-success__btn"
                />
            </div>
        </Dialog>
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
    margin-top: 0.25rem;
}

.auth-form__footer {
    text-align: center;
    font-size: 0.78rem;
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

/* Success dialog — dark card style */
.reset-success {
    padding: 2rem 1.5rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    text-align: center;
    background: #1e2a38;
    border-radius: 0.5rem;
}

.reset-success__icon-wrapper {
    width: 4rem;
    height: 4rem;
    border-radius: 50%;
    background: rgba(39, 174, 96, 0.15);
    display: flex;
    align-items: center;
    justify-content: center;
}

.reset-success__icon {
    font-size: 2rem;
    color: #27ae60;
}

.reset-success__title {
    font-size: 1.1rem;
    font-weight: 700;
    color: #ecf0f1;
    margin: 0;
}

.reset-success__desc {
    font-size: 0.82rem;
    color: #95a5a6;
    margin: 0;
    line-height: 1.5;
}

.reset-success__btn {
    width: 100%;
    margin-top: 0.5rem;
}

@media (max-width: 680px) {
    .auth-card { flex-direction: column; }
    .auth-panel { width: 100%; }
    .auth-panel__body { padding: 2rem 1.5rem; }
}
</style>
