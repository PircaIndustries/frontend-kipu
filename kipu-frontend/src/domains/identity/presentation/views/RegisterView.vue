<script setup>
/**
 * RegisterView — User registration page.
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

const name = ref('');
const email = ref('');
const password = ref('');
const role = ref('');
const rememberMe = ref(false);
const showSuccessDialog = ref(false);

const touched = ref({ name: false, email: false, password: false, role: false });
const emailChecking = ref(false);
const emailDuplicated = ref(false);
let emailCheckTimeout = null;

const roleOptions = computed(() => [
    { label: t('identity.role_manager'), value: 'Gestor Operativo' },
    { label: t('identity.role_logistics'), value: 'Logística y Administración' }
]);

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
                    <h2 class="auth-panel__title">{{ t('identity.register_title') }}</h2>
                    <p class="auth-panel__subtitle">{{ t('identity.register_description') }}</p>
                    <form class="auth-form" @submit.prevent="onSubmit">
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
                            <Password id="register-password" v-model="password" :feedback="false" toggleMask fluid :invalid="!!passwordError" @blur="touched.password = true" />
                            <small v-if="passwordError" class="auth-form__error">{{ passwordError }}</small>
                        </div>
                        <div class="auth-form__field">
                            <label for="register-role">{{ t('identity.role') }}</label>
                            <Select id="register-role" v-model="role" :options="roleOptions" optionLabel="label" optionValue="value" :placeholder="t('identity.role_placeholder')" fluid :invalid="!!roleError" @blur="touched.role = true" />
                            <small v-if="roleError" class="auth-form__error">{{ roleError }}</small>
                        </div>
                        <div class="auth-form__checkbox-row">
                            <Checkbox v-model="rememberMe" inputId="register-remember" :binary="true" />
                            <label for="register-remember" class="auth-form__checkbox-label">{{ t('identity.remember_me') }}</label>
                        </div>
                        <Button type="submit" :label="t('identity.register_button')" :disabled="!isFormValid" class="auth-form__submit" />
                        <div class="auth-form__divider-row">
                            <Divider /><span class="auth-form__divider-text">{{ t('identity.continue') }}</span><Divider />
                        </div>
                        <div class="auth-form__social">
                            <Button type="button" outlined class="auth-form__social-btn"><span class="auth-form__social-letter">G</span> Google</Button>
                            <Button type="button" outlined class="auth-form__social-btn"><span class="auth-form__social-letter">M</span> Microsoft</Button>
                        </div>
                        <p class="auth-form__footer">
                            {{ t('identity.has_account') }}
                            <router-link to="/login" class="auth-form__link">{{ t('identity.login_link') }}</router-link>
                        </p>
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
.auth-form__social-letter { font-weight: 700; color: #374151; }
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
