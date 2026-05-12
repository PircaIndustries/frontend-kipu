<script setup>
/**
 * VerificationView — 6-digit OTP entry with 15s resend timer.
 */
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import AuthBanner from '@/shared/presentation/components/AuthBanner.vue';
import InputOtp from 'primevue/inputotp';
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';

const { t } = useI18n();
const router = useRouter();

const code = ref('');
const isSubmitting = ref(false);
const phoneNumber = '+51 987 654 321';
const timer = ref(0);
const resendInterval = ref(null);
const showResendDialog = ref(false);

const isFormValid = computed(() => code.value && code.value.length === 6 && !isSubmitting.value);

async function onSubmit() {
    if (!isFormValid.value) return;
    isSubmitting.value = true;
    setTimeout(() => { isSubmitting.value = false; router.push('/dashboard'); }, 800);
}

function handleResend() {
    if (timer.value > 0) return;
    showResendDialog.value = true;
    timer.value = 15;
    if (resendInterval.value) clearInterval(resendInterval.value);
    resendInterval.value = setInterval(() => {
        if (timer.value > 0) { timer.value--; }
        else { clearInterval(resendInterval.value); }
    }, 1000);
}
</script>

<template>
    <div class="auth-page">
        <div class="auth-card">
            <AuthBanner />
            <div class="auth-panel">
                <div class="auth-panel__body">
                    <h2 class="auth-panel__title">{{ t('identity.verification_title') }}</h2>
                    <p class="auth-panel__subtitle">{{ t('identity.verification_desc') }}</p>

                    <form class="verification-box" @submit.prevent="onSubmit">
                        <div class="verification-box__header">
                            <p class="verification-box__code-title">{{ t('identity.verification_code_title') }}</p>
                            <p class="verification-box__code-desc">
                                {{ t('identity.verification_code_desc') }}<br>
                                <strong>{{ phoneNumber }}</strong>
                            </p>
                        </div>
                        <InputOtp v-model="code" :length="6" class="verification-box__otp" />
                        <Button type="submit" :label="t('identity.verify_button')" :disabled="!isFormValid" :loading="isSubmitting" class="verification-box__submit" />
                        <div class="verification-box__footer">
                            <span v-if="timer > 0" class="verification-box__wait-text">
                                {{ t('identity.resend_code_wait') }}{{ timer }}s
                            </span>
                            <a v-else href="#" @click.prevent="handleResend" class="verification-box__link">
                                {{ t('identity.resend_code') }}
                            </a>
                        </div>
                    </form>
                </div>
            </div>
        </div>

        <Dialog v-model:visible="showResendDialog" modal :header="t('identity.resend_code_success_title')" :style="{ width: '22rem' }">
            <p class="resend-desc">{{ t('identity.resend_code_success_desc') }}</p>
            <template #footer>
                <Button label="OK" @click="showResendDialog = false" autofocus />
            </template>
        </Dialog>
    </div>
</template>

<style scoped>
.auth-page { min-height: 100vh; background-color: #1e2a38; display: flex; align-items: center; justify-content: center; padding: 1.5rem; font-family: 'Inter', sans-serif; }
.auth-card { display: flex; width: 100%; max-width: 52rem; min-height: 30rem; border-radius: 0.75rem; overflow: hidden; box-shadow: 0 20px 60px rgba(0,0,0,0.5); }
.auth-panel { width: 50%; background: #ffffff; display: flex; align-items: center; justify-content: center; }
.auth-panel__body { width: 100%; max-width: 22rem; padding: 3rem 2.5rem; }
.auth-panel__title { font-size: 1.5rem; font-weight: 700; color: #212529; margin: 0 0 0.25rem; text-align: center; }
.auth-panel__subtitle { font-size: 0.82rem; color: #6c757d; margin: 0 0 1.75rem; text-align: center; }

.verification-box { display: flex; flex-direction: column; align-items: center; gap: 1.5rem; background: #f8f9fa; border: 1px solid #e9ecef; border-radius: 0.75rem; padding: 2rem; }
.verification-box__header { text-align: center; }
.verification-box__code-title { font-size: 0.95rem; font-weight: 600; color: #3498db; margin: 0 0 0.375rem; }
.verification-box__code-desc { font-size: 0.82rem; color: #6c757d; margin: 0; line-height: 1.5; }
.verification-box__otp { justify-content: center; }
:deep(.p-inputotp) { gap: 0.5rem; }
:deep(.p-inputotp-input) { width: 2.5rem; height: 3rem; text-align: center; font-size: 1.2rem; font-weight: 600; }
.verification-box__submit { width: 100%; }
.verification-box__footer { text-align: center; }
.verification-box__wait-text { font-size: 0.82rem; color: #95a5a6; }
.verification-box__link { font-size: 0.82rem; color: #3498db; text-decoration: none; font-weight: 500; }
.verification-box__link:hover { text-decoration: underline; }
.resend-desc { margin: 0; color: #4b5563; font-size: 0.875rem; line-height: 1.5; }
@media (max-width: 680px) { .auth-card { flex-direction: column; } .auth-panel { width: 100%; } .auth-panel__body { padding: 2rem 1.5rem; } }
</style>
