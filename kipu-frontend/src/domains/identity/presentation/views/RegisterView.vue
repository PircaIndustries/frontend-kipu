<script setup>
/**
 * RegisterView — User registration page.
 */
import { onMounted } from 'vue';
import { PublicClientApplication } from '@azure/msal-browser';
import { useTokenClient } from 'vue3-google-signin';
import { ref, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { identityApi } from '../../infrastructure/identity.api';
import AuthBanner from '@/shared/presentation/components/AuthBanner.vue';
import InputText from 'primevue/inputtext';
import Password from 'primevue/password';
import Select from 'primevue/select';
import Button from 'primevue/button';
import Divider from 'primevue/divider';
import Dialog from 'primevue/dialog';
import axios from 'axios';

const { t } = useI18n();
const router = useRouter();

const name = ref('');
const email = ref('');
const password = ref('');
const role = ref('');
const showSuccessDialog = ref(false);

const touched = ref({ name: false, email: false, password: false, role: false });
const emailChecking = ref(false);
const emailDuplicated = ref(false);
let emailCheckTimeout = null;

const roleOptions = computed(() => [
    { label: t('identity.role_manager'), value: 'Gestor Operativo' },
    { label: t('identity.role_logistics'), value: 'Logística y Administración' }
]);

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

    const oauthUser = history.state?.oauthUser;
    if (oauthUser) {
        oauthEmail.value = oauthUser.email;
        oauthProvider.value = oauthUser.provider;
        if (oauthUser.givenName && oauthUser.familyName) {
            oauthFirstName.value = oauthUser.givenName;
            oauthLastName.value = oauthUser.familyName;
        } else {
            const nameParts = (oauthUser.name || '').trim().split(/\s+/);
            oauthFirstName.value = nameParts[0] || '';
            oauthLastName.value = nameParts.slice(1).join(' ') || '';
        }
        oauthRole.value = '';
        showOAuthRegister.value = true;
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

// --- First-time OAuth Registration ---
const showOAuthRegister = ref(false);
const oauthFirstName = ref('');
const oauthLastName = ref('');
const oauthEmail = ref('');
const oauthRole = ref('');
const oauthProvider = ref('');
const isSubmittingOAuth = ref(false);

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
        
        // 2. Not registered yet: Show profile details confirmation form
        oauthEmail.value = emailVal;
        oauthProvider.value = userInfo.provider;
        
        if (userInfo.givenName && userInfo.familyName) {
            oauthFirstName.value = userInfo.givenName;
            oauthLastName.value = userInfo.familyName;
        } else {
            const nameParts = (userInfo.name || '').trim().split(/\s+/);
            oauthFirstName.value = nameParts[0] || '';
            oauthLastName.value = nameParts.slice(1).join(' ') || '';
        }
        
        oauthRole.value = '';
        showOAuthRegister.value = true;
    } catch (error) {
        console.error("Error handling OAuth success flow:", error);
    }
}

function handleBackToLogin() {
    showOAuthRegister.value = false;
    router.push('/login');
}

const isOAuthRegisterFormValid = computed(() => {
    return oauthFirstName.value.trim() && oauthLastName.value.trim() && oauthRole.value;
});

async function onOAuthRegisterSubmit() {
    if (!isOAuthRegisterFormValid.value) return;
    isSubmittingOAuth.value = true;
    try {
        const newUser = {
            name: `${oauthFirstName.value.trim()} ${oauthLastName.value.trim()}`,
            email: oauthEmail.value,
            password: `OAuth-${oauthProvider.value}-${Math.random().toString(36).slice(-8)}`,
            role: oauthRole.value
        };
        const createdUser = await identityApi.register(newUser);
        localStorage.setItem('currentUser', JSON.stringify(createdUser));
        router.push('/projects');
    } catch (error) {
        console.error("Error registering OAuth user:", error);
    } finally {
        isSubmittingOAuth.value = false;
    }
}

const nameError = computed(() => (!touched.value.name || name.value.trim()) ? '' : t('identity.err_name_required'));
const emailError = computed(() => {
    if (!touched.value.email) return '';
    if (!email.value.trim()) return t('identity.err_email_required');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) return t('identity.err_email_invalid');
    if (emailDuplicated.value) return t('identity.err_email_taken');
    return '';
});
const passwordError = computed(() => {
    if (!touched.value.password) return '';
    if (!password.value) return t('identity.err_password_required');
    if (password.value.length < 8) return t('identity.err_password_min');
    return '';
});
const roleError = computed(() => (!touched.value.role || role.value) ? '' : t('identity.err_role_required'));

const isFormValid = computed(() =>
    name.value.trim() &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value) &&
    !emailDuplicated.value &&
    password.value.length >= 8 &&
    role.value &&
    !emailChecking.value
);

watch(email, (newEmail) => {
    emailDuplicated.value = false;
    if (emailCheckTimeout) clearTimeout(emailCheckTimeout);
    if (!newEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) { emailChecking.value = false; return; }
    emailChecking.value = true;
    emailCheckTimeout = setTimeout(async () => {
        try { emailDuplicated.value = await identityApi.checkEmailExists(newEmail); }
        catch { emailDuplicated.value = false; }
        finally { emailChecking.value = false; }
    }, 500);
});

async function onSubmit() {
    touched.value = { name: true, email: true, password: true, role: true };
    if (!isFormValid.value) return;
    try {
        await identityApi.register({ name: name.value, email: email.value, password: password.value, role: role.value });
        showSuccessDialog.value = true;
    } catch (e) { console.error('Error registering account:', e); }
}
function onSuccessClose() { showSuccessDialog.value = false; router.push('/login'); }
</script>

<template>
    <div class="auth-page">
        <div class="auth-card">
            <AuthBanner />
            <div class="auth-panel">
                <div class="auth-panel__body">
                    <h2 class="auth-panel__title">
                        {{ showOAuthRegister ? t('identity.oauth_register_title') : t('identity.register_title') }}
                    </h2>
                    <p class="auth-panel__subtitle">
                        {{ showOAuthRegister ? t('identity.oauth_register_desc') : t('identity.register_description') }}
                    </p>

                    <form v-if="!showOAuthRegister" class="auth-form" @submit.prevent="onSubmit">
                        <div class="auth-form__field">
                            <label for="register-name">{{ t('identity.name') }}</label>
                            <InputText id="register-name" v-model="name" :placeholder="t('identity.name_placeholder')" fluid :invalid="!!nameError" @blur="touched.name = true" />
                            <small v-if="nameError" class="auth-form__error">{{ nameError }}</small>
                        </div>
                        <div class="auth-form__field">
                            <label for="register-email">{{ t('identity.email') }}</label>
                            <InputText id="register-email" v-model="email" type="email" :placeholder="t('identity.email_placeholder')" fluid :invalid="!!emailError" @blur="touched.email = true" />
                            <small v-if="emailChecking" class="auth-form__hint">{{ t('identity.hint_checking_email') }}</small>
                            <small v-if="emailError" class="auth-form__error">{{ emailError }}</small>
                        </div>
                        <div class="auth-form__field">
                            <label for="register-password">{{ t('identity.password') }}</label>
                            <Password id="register-password" v-model="password" :placeholder="t('identity.password_placeholder')" :feedback="false" toggleMask fluid :invalid="!!passwordError" @blur="touched.password = true" />
                            <small v-if="passwordError" class="auth-form__error">{{ passwordError }}</small>
                        </div>
                        <div class="auth-form__field">
                            <label for="register-role">{{ t('identity.role') }}</label>
                            <Select id="register-role" v-model="role" :options="roleOptions" optionLabel="label" optionValue="value" :placeholder="t('identity.role_placeholder')" fluid :invalid="!!roleError" @blur="touched.role = true" />
                            <small v-if="roleError" class="auth-form__error">{{ roleError }}</small>
                        </div>
                        <Button type="submit" :label="t('identity.register_button')" :disabled="!isFormValid" class="auth-form__submit" />
                        <div class="auth-form__divider-row">
                            <Divider /><span class="auth-form__divider-text">{{ t('identity.continue') }}</span><Divider />
                        </div>
                        <div class="auth-form__social">
                            <Button type="button" outlined class="auth-form__social-btn" @click="() => login()" :disabled="!isReady">
                                <i class="pi pi-google auth-form__social-icon auth-form__social-icon--google"></i> Google
                            </Button>
                            <Button type="button" outlined class="auth-form__social-btn" @click="loginWithMicrosoft">
                                <i class="pi pi-microsoft auth-form__social-icon auth-form__social-icon--microsoft"></i> Microsoft
                            </Button>
                        </div>
                        <p class="auth-form__footer">
                            {{ t('identity.has_account') }}
                            <router-link to="/login" class="auth-form__link">{{ t('identity.login_link') }}</router-link>
                        </p>
                    </form>

                    <!-- OAuth First-Time Registration Form -->
                    <form v-else class="auth-form" @submit.prevent="onOAuthRegisterSubmit">
                        <div class="auth-form__field">
                            <label for="oauth-first-name">{{ t('identity.oauth_first_name') }}</label>
                            <InputText
                                id="oauth-first-name"
                                v-model="oauthFirstName"
                                :placeholder="t('identity.name_placeholder')"
                                fluid
                            />
                        </div>

                        <div class="auth-form__field">
                            <label for="oauth-last-name">{{ t('identity.oauth_last_name') }}</label>
                            <InputText
                                id="oauth-last-name"
                                v-model="oauthLastName"
                                :placeholder="t('identity.name_placeholder')"
                                fluid
                            />
                        </div>

                        <div class="auth-form__field">
                            <label for="oauth-role">{{ t('identity.role') }}</label>
                            <Select
                                id="oauth-role"
                                v-model="oauthRole"
                                :options="roleOptions"
                                optionLabel="label"
                                optionValue="value"
                                :placeholder="t('identity.role_placeholder')"
                                fluid
                            />
                        </div>

                        <Button
                            type="submit"
                            :label="t('identity.continue_button')"
                            :disabled="!isOAuthRegisterFormValid"
                            :loading="isSubmittingOAuth"
                            class="auth-form__submit"
                        />

                        <div class="verification-box__back">
                            <a href="#" @click.prevent="handleBackToLogin" class="verification-box__back-link">
                                <i class="pi pi-arrow-left"></i> {{ t('identity.back_to_login') }}
                            </a>
                        </div>
                    </form>
                </div>
            </div>
        </div>
        <Dialog v-model:visible="showSuccessDialog" modal :closable="false" :style="{ width: '26rem' }">
            <div class="register-success">
                <div class="register-success__icon-wrapper"><i class="pi pi-check register-success__icon"></i></div>
                <h2 class="register-success__title">{{ t('identity.register_success_title') }}</h2>
                <p class="register-success__desc">{{ t('identity.register_success_desc') }}</p>
                <Button :label="t('identity.continue_button')" @click="onSuccessClose" class="register-success__btn" />
            </div>
        </Dialog>
    </div>
</template>

<style scoped>
.auth-page { min-height: 100vh; background-color: #1e2a38; display: flex; align-items: center; justify-content: center; padding: 1.5rem; font-family: 'Inter', sans-serif; }
.auth-card { display: flex; width: 100%; max-width: 52rem; border-radius: 0.75rem; overflow: hidden; box-shadow: 0 20px 60px rgba(0,0,0,0.5); }
.auth-panel { width: 50%; background: #ffffff; display: flex; align-items: center; justify-content: center; }
.auth-panel__body { width: 100%; max-width: 22rem; padding: 2.5rem; }
.auth-panel__title { font-size: 1.5rem; font-weight: 700; color: #212529; margin: 0 0 0.25rem; }
.auth-panel__subtitle { font-size: 0.82rem; color: #6c757d; margin: 0 0 1.5rem; }
.auth-form { display: flex; flex-direction: column; gap: 0.875rem; }
.auth-form__field { display: flex; flex-direction: column; gap: 0.3rem; }
.auth-form__field label { font-size: 0.82rem; font-weight: 500; color: #495057; }
.auth-form__error { color: #e74c3c; font-size: 0.72rem; }
.auth-form__hint { color: #3498db; font-size: 0.72rem; }
.auth-form__checkbox-row { display: flex; align-items: center; gap: 0.5rem; }
.auth-form__checkbox-label { font-size: 0.82rem; color: #4b5563; cursor: pointer; }
.auth-form__submit { width: 100%; margin-top: 0.25rem; }
.auth-form__divider-row { display: flex; align-items: center; gap: 0.75rem; }
.auth-form__divider-text { font-size: 0.72rem; color: #9ca3af; white-space: nowrap; }
.auth-form__social { display: flex; gap: 0.75rem; }
.auth-form__social-btn { flex: 1; justify-content: center; font-size: 0.82rem; gap: 0.375rem; }
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

.auth-form__footer { text-align: center; font-size: 0.78rem; color: #6c757d; margin: 0; }
.auth-form__link { color: #3498db; text-decoration: none; font-weight: 500; font-size: 0.82rem; }
.auth-form__link:hover { text-decoration: underline; }
.register-success { padding: 2rem 1.5rem; display: flex; flex-direction: column; align-items: center; gap: 1rem; text-align: center; }
.register-success__icon-wrapper { width: 4rem; height: 4rem; border-radius: 50%; background: rgba(39,174,96,0.12); display: flex; align-items: center; justify-content: center; }
.register-success__icon { font-size: 2rem; color: #27ae60; }
.register-success__title { font-size: 1.1rem; font-weight: 700; color: #212529; margin: 0; }
.register-success__desc { font-size: 0.82rem; color: #6c757d; margin: 0; line-height: 1.5; }
.register-success__btn { width: 100%; margin-top: 0.5rem; }
@media (max-width: 680px) { .auth-card { flex-direction: column; } .auth-panel { width: 100%; } .auth-panel__body { padding: 2rem 1.5rem; } }
</style>
