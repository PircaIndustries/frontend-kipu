<script setup>
/**
 * LoginView — User authentication page.
 * Follows the same compact card layout as all identity views.
 */
import { onMounted } from 'vue';
import { PublicClientApplication } from '@azure/msal-browser';
import { useTokenClient } from 'vue3-google-signin';
import { ref, computed, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { identityApi } from '../../infrastructure/identity.api';
import AuthBanner from '@/shared/presentation/components/AuthBanner.vue';
import InputText from 'primevue/inputtext';
import Password from 'primevue/password';
import Button from 'primevue/button';
import Checkbox from 'primevue/checkbox';
import Divider from 'primevue/divider';
import axios from 'axios';

const { t } = useI18n();
const router = useRouter();

const email = ref('');
const password = ref('');
const rememberMe = ref(false);
const loginError = ref('');
const isSubmitting = ref(false);

const touched = ref({ email: false, password: false });

// --- Google OAuth Configuration ---

const handleOnSuccess = async (response) => {
  console.log("Google Token obtained:", response.access_token);
  try {
    const userInfo = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${response.access_token}` }
    });
    console.log("Google user info:", userInfo.data);
    await handleOAuthSuccess({
      name: userInfo.data.name,
      email: userInfo.data.email,
      givenName: userInfo.data.given_name,
      familyName: userInfo.data.family_name,
      provider: 'google'
    });
  } catch (error) {
    console.error("Error getting Google user info:", error);
  }
};

const handleOnError = (errorResponse) => {
  console.error("Error on Google authentication:", errorResponse);
};

const { isReady, login } = useTokenClient({
  onSuccess: handleOnSuccess,
  onError: handleOnError,
});

// --- Microsoft MSAL Configuration ---
const msalConfig = {
    auth: {
        clientId: import.meta.env.VITE_MICROSOFT_CLIENT_ID,
        authority: "https://login.microsoftonline.com/common",
        redirectUri: window.location.origin,
    },
    cache: {
        cacheLocation: "sessionStorage",
        storeAuthStateInCookie: false,
    }
};

const msalInstance = new PublicClientApplication(msalConfig);

onMounted(async () => {
    try {
        await msalInstance.initialize();
        const response = await msalInstance.handleRedirectPromise();
        if (response) {
            console.log("Microsoft Token obtained via redirect:", response.accessToken);
            const account = response.account;
            await handleOAuthSuccess({
                name: account.name,
                email: account.username,
                provider: 'microsoft'
            });
        }
    } catch (error) {
        console.error("Error on MSAL initialization/redirect:", error);
    }
});

const loginWithMicrosoft = async () => {
    try {
        const loginRequest = {
            scopes: ["user.read"]
        };
        await msalInstance.loginRedirect(loginRequest);
    } catch (error) {
        console.error("Error on Microsoft redirect authentication:", error);
    }
};

async function handleOAuthSuccess(userInfo) {
    const emailVal = userInfo.email;
    try {
        // 1. Check if email exists in system database
        const exists = await identityApi.checkEmailExists(emailVal);
        if (exists) {
            // Log in normally
            const response = await axios.get(`${import.meta.env.VITE_API_KIPU_BASEURL || 'http://localhost:3000/api/v1'}/identities`, {
                params: { email: emailVal }
            });
            const user = response.data.find(u => u.email === emailVal);
            if (user) {
                localStorage.setItem('currentUser', JSON.stringify(user));
                router.push('/projects');
                return;
            }
        }
        
        // 2. Not registered yet: Redirect to RegisterView passing user information in state
        router.push({
            name: 'Register',
            state: {
                oauthUser: {
                    name: userInfo.name,
                    email: userInfo.email,
                    givenName: userInfo.givenName,
                    familyName: userInfo.familyName,
                    provider: userInfo.provider
                }
            }
        });
    } catch (error) {
        console.error("Error handling OAuth success flow:", error);
    }
}

// Verification States
const showVerification = ref(false);
const verificationCode = ref('');
const isVerifying = ref(false);
const timer = ref(0);
const resendInterval = ref(null);
const showResendDialog = ref(false);
const authenticatedUser = ref(null);

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

function startResendTimer() {
    timer.value = 15;
    if (resendInterval.value) clearInterval(resendInterval.value);
    resendInterval.value = setInterval(() => {
        if (timer.value > 0) {
            timer.value--;
        } else {
            clearInterval(resendInterval.value);
            resendInterval.value = null;
        }
    }, 1000);
}

function stopResendTimer() {
    if (resendInterval.value) {
        clearInterval(resendInterval.value);
        resendInterval.value = null;
    }
    timer.value = 0;
}

onUnmounted(() => {
    stopResendTimer();
});

function handleResend() {
    if (timer.value > 0) return;
    showResendDialog.value = true;
    startResendTimer();
}

function handleBackToLogin() {
    showVerification.value = false;
    verificationCode.value = '';
    stopResendTimer();
}

const isVerificationValid = computed(() => {
    return verificationCode.value && verificationCode.value.length === 6 && !isVerifying.value;
});

async function onVerifySubmit() {
    if (!isVerificationValid.value) return;
    isVerifying.value = true;
    setTimeout(() => {
        isVerifying.value = false;
        if (authenticatedUser.value) {
            localStorage.setItem('currentUser', JSON.stringify(authenticatedUser.value));
            router.push('/projects');
        }
    }, 800);
}

async function onSubmit() {
    touched.value = { email: true, password: true };
    loginError.value = '';
    if (!isFormValid.value) return;

    isSubmitting.value = true;
    try {
        const user = await identityApi.login({ email: email.value, password: password.value });
        if (user) {
            authenticatedUser.value = user;
            showVerification.value = true;
            startResendTimer();
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
                    <h2 class="auth-panel__title">
                        {{ t('identity.login_title') }}
                    </h2>
                    <p class="auth-panel__subtitle">
                        {{ t('identity.login_description') }}
                    </p>

                    <form v-if="!showVerification" class="auth-form" @submit.prevent="onSubmit">
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
                                :placeholder="t('identity.password_placeholder')"
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
                            <Button type="button" outlined class="auth-form__social-btn" @click="() => login()" :disabled="!isReady">
                                <i class="pi pi-google auth-form__social-icon auth-form__social-icon--google"></i> Google
                            </Button>
                            <Button type="button" outlined class="auth-form__social-btn" @click="loginWithMicrosoft">
                                <i class="pi pi-microsoft auth-form__social-icon auth-form__social-icon--microsoft"></i> Microsoft
                            </Button>
                        </div>

                        <!-- Register link -->
                        <p class="auth-form__footer">
                            {{ t('identity.no_account') }}
                            <router-link to="/register" class="auth-form__link">{{ t('identity.register_link') }}</router-link>
                        </p>
                    </form>

                    <!-- OTP Verification Container -->
                    <form v-else class="verification-box" @submit.prevent="onVerifySubmit">
                        <div class="verification-box__header">
                            <h3 class="verification-box__code-title">{{ t('identity.verification_code_title') }}</h3>
                            <p class="verification-box__code-desc">
                                {{ t('identity.verification_code_desc') }}<br>
                                <strong>{{ email }}</strong>
                            </p>
                        </div>
                        
                        <pv-inputotp v-model="verificationCode" :length="6" class="verification-box__otp" />
                        
                        <Button
                            type="submit"
                            :label="t('identity.verify_button')"
                            :disabled="!isVerificationValid"
                            :loading="isVerifying"
                            class="verification-box__submit"
                        />
                        
                        <div class="verification-box__footer">
                            <span v-if="timer > 0" class="verification-box__wait-text">
                                {{ t('identity.resend_code_wait') }}{{ timer }}s
                            </span>
                            <a v-else href="#" @click.prevent="handleResend" class="verification-box__link">
                                {{ t('identity.resend_code') }}
                            </a>
                        </div>

                        <div class="verification-box__back">
                            <a href="#" @click.prevent="handleBackToLogin" class="verification-box__back-link">
                                <i class="pi pi-arrow-left"></i> {{ t('identity.edit_email') }}
                            </a>
                        </div>
                    </form>
                </div>
            </div>
        </div>

        <pv-dialog v-model:visible="showResendDialog" modal :header="t('identity.resend_code_success_title')" :style="{ width: '22rem' }">
            <p class="resend-desc">{{ t('identity.resend_code_success_desc') }}</p>
            <template #footer>
                <Button label="OK" @click="showResendDialog = false" autofocus />
            </template>
        </pv-dialog>
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

.auth-form__social-icon {
    font-size: 1rem;
    display: inline-flex;
    align-items: center;
    justify-content: center;
}

.auth-form__social-icon--google {
    color: #ea4335;
}

.auth-form__social-icon--microsoft {
    color: #00a4ef;
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

.verification-box {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1.25rem;
    background: #ffffff;
    border: 1px solid #e2e8f0;
    border-radius: 0.5rem;
    padding: 1.5rem;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
}

.verification-box__header {
    text-align: center;
}

.verification-box__code-title {
    font-size: 0.95rem;
    font-weight: 600;
    color: #1e293b;
    margin: 0 0 0.25rem;
}

.verification-box__code-desc {
    font-size: 0.8rem;
    color: #64748b;
    margin: 0;
    line-height: 1.4;
}

.verification-box__code-desc strong {
    color: #0f172a;
}

.verification-box__otp {
    justify-content: center;
}

:deep(.p-inputotp) {
    gap: 0.375rem;
}

:deep(.p-inputotp-input) {
    width: 2.25rem;
    height: 2.75rem;
    text-align: center;
    font-size: 1.1rem;
    font-weight: 600;
    border: 1.5px solid #cbd5e1;
    border-radius: 0.375rem;
    background-color: #ffffff;
    color: #1e293b;
    transition: border-color 0.2s, box-shadow 0.2s;
}

:deep(.p-inputotp-input:focus) {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
}

.verification-box__submit {
    width: 100%;
}

.verification-box__footer {
    text-align: center;
}

.verification-box__wait-text {
    font-size: 0.78rem;
    color: #94a3b8;
}

.verification-box__link {
    font-size: 0.78rem;
    color: #3b82f6;
    text-decoration: underline;
    font-weight: 500;
}

.verification-box__link:hover {
    color: #2563eb;
}

.verification-box__back {
    text-align: center;
    margin-top: -0.25rem;
}

.verification-box__back-link {
    font-size: 0.78rem;
    color: #64748b;
    text-decoration: none;
    font-weight: 500;
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    transition: color 0.2s;
}

.verification-box__back-link:hover {
    color: #0f172a;
}

.resend-desc {
    margin: 0;
    color: #4b5563;
    font-size: 0.875rem;
    line-height: 1.5;
}

@media (max-width: 680px) {
    .auth-card { flex-direction: column; }
    .auth-panel { width: 100%; }
    .auth-panel__body { padding: 2rem 1.5rem; }
}
</style>
