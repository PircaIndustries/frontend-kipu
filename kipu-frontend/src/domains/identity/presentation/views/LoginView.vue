<script setup>
/**
 * LoginView — User authentication page.
 * Provides email/password login with reactive validation.
 * Follows the same visual structure as RegisterView.
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

// ── Form state ──
const email = ref('');
const password = ref('');
const rememberMe = ref(false);
const loginError = ref('');
const isSubmitting = ref(false);

// ── Validation state ──
const touched = ref({
    email: false,
    password: false
});

// ── Validation computed properties ──
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

const isFormValid = computed(() => {
    return email.value.trim() &&
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value) &&
        password.value &&
        !isSubmitting.value;
});

// ── Form submission ──
function markAllTouched() {
    touched.value = {
        email: true,
        password: true
    };
}

async function onSubmit() {
    markAllTouched();
    loginError.value = '';

    if (!isFormValid.value) return;

    isSubmitting.value = true;

    try {
        const user = await identityApi.login({
            email: email.value,
            password: password.value
        });

        if (user) {
            localStorage.setItem('currentUser', JSON.stringify(user));
            router.push('/dashboard');
        } else {
            loginError.value = t('identity.err_email_invalid');
        }
    } catch (error) {
        console.error('Login failed:', error);
        loginError.value = t('identity.err_email_invalid');
    } finally {
        isSubmitting.value = false;
    }
}
</script>

<template>
    <div class="login-page">
        <div class="login-card">
            <AuthBanner />

            <div class="login-form-container">
                <h2 class="login-form-container__title">{{ t('identity.login_title') }}</h2>
                <p class="login-form-container__subtitle">{{ t('identity.login_description') }}</p>

                <form class="login-form" @submit.prevent="onSubmit">
                    <!-- Email -->
                    <div class="login-form__field">
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
                        <small v-if="emailError" class="login-form__error">{{ emailError }}</small>
                    </div>

                    <!-- Password -->
                    <div class="login-form__field">
                        <label for="login-password">{{ t('identity.password') }}</label>
                        <Password
                            id="login-password"
                            v-model="password"
                            :placeholder="t('identity.password_placeholder')"
                            :feedback="false"
                            toggleMask
                            fluid
                            :invalid="!!passwordError"
                            @blur="touched.password = true"
                        />
                        <small v-if="passwordError" class="login-form__error">{{ passwordError }}</small>
                    </div>

                    <!-- Remember me + Forgot password -->
                    <div class="login-form__options">
                        <div class="login-form__checkbox-row">
                            <Checkbox v-model="rememberMe" inputId="login-remember" :binary="true" />
                            <label for="login-remember" class="login-form__checkbox-label">
                                {{ t('identity.remember_me') }}
                            </label>
                        </div>
                        <router-link to="/forgot-password" class="login-form__link login-form__link--forgot">
                            {{ t('identity.forgot_password') }}
                        </router-link>
                    </div>

                    <!-- Login error message -->
                    <small v-if="loginError" class="login-form__error login-form__error--general">
                        {{ loginError }}
                    </small>

                    <!-- Submit -->
                    <Button
                        type="submit"
                        :label="t('identity.login_button')"
                        :disabled="!isFormValid"
                        :loading="isSubmitting"
                        class="login-form__submit"
                    />

                    <!-- Divider -->
                    <div class="login-form__divider">
                        <Divider />
                        <span class="login-form__divider-text">{{ t('identity.continue') }}</span>
                        <Divider />
                    </div>

                    <!-- Social buttons -->
                    <div class="login-form__social">
                        <Button type="button" outlined class="login-form__social-btn">
                            <span class="login-form__social-icon">G</span> Google
                        </Button>
                        <Button type="button" outlined class="login-form__social-btn">
                            <span class="login-form__social-icon">M</span> Microsoft
                        </Button>
                    </div>

                    <!-- Register link -->
                    <p class="login-form__footer-text">
                        {{ t('identity.no_account') }}
                        <router-link to="/register" class="login-form__link">
                            {{ t('identity.register_link') }}
                        </router-link>
                    </p>
                </form>
            </div>
        </div>
    </div>
</template>

<style scoped>
.login-page {
    min-height: 100vh;
    background-color: #1a252f;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1rem;
    font-family: 'Inter', sans-serif;
}

.login-card {
    background: white;
    border-radius: 1rem;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.4);
    display: flex;
    flex-direction: row;
    width: 100%;
    max-width: 64rem;
    overflow: hidden;
}

.login-form-container {
    width: 50%;
    padding: 3rem;
    background: #f8f9fa;
    display: flex;
    flex-direction: column;
    justify-content: center;
}

.login-form-container__title {
    font-size: 1.75rem;
    font-weight: 700;
    color: #212529;
    margin: 0 0 0.25rem;
}

.login-form-container__subtitle {
    color: #6c757d;
    margin: 0 0 2rem;
    font-size: 0.875rem;
}

.login-form {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
}

.login-form__field {
    display: flex;
    flex-direction: column;
    gap: 0.375rem;
}

.login-form__field label {
    font-size: 0.85rem;
    font-weight: 600;
    color: #34495e;
}

.login-form__error {
    color: #e74c3c;
    font-size: 0.75rem;
}

.login-form__error--general {
    text-align: center;
    font-size: 0.8rem;
}

.login-form__options {
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.login-form__checkbox-row {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.login-form__checkbox-label {
    font-size: 0.85rem;
    color: #4b5563;
    cursor: pointer;
}

.login-form__link {
    color: #3498db;
    text-decoration: none;
    font-weight: 500;
}

.login-form__link:hover {
    text-decoration: underline;
}

.login-form__link--forgot {
    font-size: 0.8rem;
}

.login-form__submit {
    width: 100%;
    padding: 0.875rem;
    font-size: 1rem;
    font-weight: 600;
}

.login-form__divider {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin: 0.25rem 0;
}

.login-form__divider-text {
    font-size: 0.75rem;
    color: #9ca3af;
    white-space: nowrap;
}

.login-form__social {
    display: flex;
    gap: 1rem;
}

.login-form__social-btn {
    flex: 1;
    padding: 0.75rem;
    justify-content: center;
}

.login-form__social-icon {
    font-weight: 700;
    margin-right: 0.5rem;
    color: #374151;
}

.login-form__footer-text {
    text-align: center;
    font-size: 0.8rem;
    color: #6c757d;
    margin-top: 0.25rem;
}

@media (max-width: 768px) {
    .login-card {
        flex-direction: column;
    }

    .login-form-container {
        width: 100%;
        padding: 2rem;
    }
}
</style>
