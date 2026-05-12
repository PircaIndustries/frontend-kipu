<script setup>
/**
 * LoginView — User authentication page.
 * Follows the same compact card layout as all identity views.
 */
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { identityApi } from '../../infrastructure/identity.api';
import AuthBanner from '@/shared/presentation/components/AuthBanner.vue';
import InputText from 'primevue/inputtext';
import Password from 'primevue/password';
import Button from 'primevue/button';
import Checkbox from 'primevue/checkbox';
import Divider from 'primevue/divider';

const { t } = useI18n();
const router = useRouter();

const email = ref('');
const password = ref('');
const rememberMe = ref(false);
const loginError = ref('');
const isSubmitting = ref(false);

const touched = ref({ email: false, password: false });

const emailError = computed(() => {
    if (!touched.value.email) return '';
    if (!email.value.trim()) return t('identity.err_email_required');
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.value)) return t('identity.err_email_invalid');
    return '';
});

const passwordError = computed(() => {
    if (!touched.value.password) return '';
    if (!password.value) return t('identity.err_password_required');
    return '';
});

const isFormValid = computed(() =>
    email.value.trim() &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value) &&
    password.value &&
    !isSubmitting.value
);

async function onSubmit() {
    touched.value = { email: true, password: true };
    loginError.value = '';
    if (!isFormValid.value) return;

    isSubmitting.value = true;
    try {
        const user = await identityApi.login({ email: email.value, password: password.value });
        if (user) {
            localStorage.setItem('currentUser', JSON.stringify(user));
            router.push('/dashboard');
        } else {
            loginError.value = t('identity.err_invalid_credentials');
        }
    } catch {
        loginError.value = t('identity.err_invalid_credentials');
    } finally {
        isSubmitting.value = false;
    }
}
</script>

<template>
    <div class="auth-page">
        <div class="auth-card">
            <AuthBanner />

            <div class="auth-panel">
                <div class="auth-panel__body">
                    <h2 class="auth-panel__title">{{ t('identity.login_title') }}</h2>
                    <p class="auth-panel__subtitle">{{ t('identity.login_description') }}</p>

                    <form class="auth-form" @submit.prevent="onSubmit">
                        <!-- Email -->
                        <div class="auth-form__field">
                            <label for="login-email">{{ t('identity.email') }}</label>
                            <InputText
                                id="login-email"
                                v-model="email"
                                type="email"
                                :placeholder="t('identity.email_placeholder')"
                                fluid
                                :invalid="!!emailError"
                                @blur="touched.email = true"
                            />
                            <small v-if="emailError" class="auth-form__error">{{ emailError }}</small>
                        </div>

                        <!-- Password -->
                        <div class="auth-form__field">
                            <label for="login-password">{{ t('identity.password') }}</label>
                            <Password
                                id="login-password"
                                v-model="password"
                                :feedback="false"
                                toggleMask
                                fluid
                                :invalid="!!passwordError"
                                @blur="touched.password = true"
                            />
                            <small v-if="passwordError" class="auth-form__error">{{ passwordError }}</small>
                        </div>

                        <!-- Remember me + Forgot -->
                        <div class="auth-form__options">
                            <div class="auth-form__checkbox-row">
                                <Checkbox v-model="rememberMe" inputId="login-remember" :binary="true" />
                                <label for="login-remember" class="auth-form__checkbox-label">
                                    {{ t('identity.remember_me') }}
                                </label>
                            </div>
                            <router-link to="/forgot-password" class="auth-form__link auth-form__link--small">
                                {{ t('identity.forgot_password') }}
                            </router-link>
                        </div>

                        <!-- General error -->
                        <small v-if="loginError" class="auth-form__error auth-form__error--center">{{ loginError }}</small>

                        <!-- Submit -->
                        <Button
                            type="submit"
                            :label="t('identity.login_button')"
                            :disabled="!isFormValid"
                            :loading="isSubmitting"
                            class="auth-form__submit"
                        />

                        <!-- Divider -->
                        <div class="auth-form__divider-row">
                            <Divider />
                            <span class="auth-form__divider-text">{{ t('identity.continue') }}</span>
                            <Divider />
                        </div>

                        <!-- Social buttons -->
                        <div class="auth-form__social">
                            <Button type="button" outlined class="auth-form__social-btn">
                                <span class="auth-form__social-letter">G</span> Google
                            </Button>
                            <Button type="button" outlined class="auth-form__social-btn">
                                <span class="auth-form__social-letter">M</span> Microsoft
                            </Button>
                        </div>

                        <!-- Register link -->
                        <p class="auth-form__footer">
                            {{ t('identity.no_account') }}
                            <router-link to="/register" class="auth-form__link">{{ t('identity.register_link') }}</router-link>
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
    min-height: 32rem;
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
    color: #6c757d;
    margin: 0 0 1.75rem;
}

.auth-form {
    display: flex;
    flex-direction: column;
    gap: 1rem;
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

.auth-form__error--center {
    text-align: center;
}

.auth-form__options {
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.auth-form__checkbox-row {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.auth-form__checkbox-label {
    font-size: 0.82rem;
    color: #4b5563;
    cursor: pointer;
}

.auth-form__submit {
    width: 100%;
    margin-top: 0.25rem;
}

.auth-form__divider-row {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin: 0.25rem 0;
}

.auth-form__divider-text {
    font-size: 0.72rem;
    color: #9ca3af;
    white-space: nowrap;
}

.auth-form__social {
    display: flex;
    gap: 0.75rem;
}

.auth-form__social-btn {
    flex: 1;
    justify-content: center;
    font-size: 0.82rem;
    gap: 0.375rem;
}

.auth-form__social-letter {
    font-weight: 700;
    color: #374151;
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
    font-size: 0.82rem;
}

.auth-form__link--small {
    font-size: 0.78rem;
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
