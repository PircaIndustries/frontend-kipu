<script setup>
/**
 * AuthBanner component.
 * Displays the branded sidebar panel used across identity views (Login, Register).
 * Features the Kipu logo, tagline, and key platform highlights.
 */
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const features = [
    {
        icon: 'pi pi-shield',
        titleKey: 'identity.banner_control_title',
        descKey: 'identity.banner_control_desc'
    },
    {
        icon: 'pi pi-desktop',
        titleKey: 'identity.banner_platform_title',
        descKey: 'identity.banner_platform_desc'
    },
    {
        icon: 'pi pi-chart-line',
        titleKey: 'identity.banner_tracking_title',
        descKey: 'identity.banner_tracking_desc'
    }
];
</script>

<template>
    <div class="auth-banner">
        <div class="auth-banner__content">
            <div class="auth-banner__branding">
                <h1 class="auth-banner__logo">Kipu</h1>
                <p class="auth-banner__tagline">{{ t('identity.banner_system_desc') }}</p>
            </div>

            <div class="auth-banner__features">
                <div
                    v-for="feature in features"
                    :key="feature.titleKey"
                    class="auth-banner__feature"
                >
                    <div class="auth-banner__feature-icon">
                        <i :class="feature.icon"></i>
                    </div>
                    <div class="auth-banner__feature-text">
                        <span class="auth-banner__feature-title">{{ t(feature.titleKey) }}</span>
                        <span class="auth-banner__feature-desc">{{ t(feature.descKey) }}</span>
                    </div>
                </div>
            </div>
        </div>

        <div class="auth-banner__decoration">
            <div class="auth-banner__circle auth-banner__circle--large"></div>
            <div class="auth-banner__circle auth-banner__circle--small"></div>
        </div>
    </div>
</template>

<style scoped>
.auth-banner {
    display: flex;
    flex-direction: column;
    justify-content: center;
    width: 50%;
    padding: 3rem;
    background: linear-gradient(135deg, #2c3e50 0%, #1a252f 50%, #0f1923 100%);
    color: white;
    position: relative;
    overflow: hidden;
}

.auth-banner__content {
    position: relative;
    z-index: 1;
    display: flex;
    flex-direction: column;
    gap: 3rem;
}

.auth-banner__branding {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.auth-banner__logo {
    font-size: 2.5rem;
    font-weight: 800;
    letter-spacing: -0.025em;
    margin: 0;
    background: linear-gradient(135deg, #3498db, #6fc3ff);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
}

.auth-banner__tagline {
    font-size: 0.95rem;
    color: #95a5a6;
    margin: 0;
    font-weight: 400;
}

.auth-banner__features {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}

.auth-banner__feature {
    display: flex;
    align-items: flex-start;
    gap: 1rem;
    padding: 1rem;
    border-radius: 0.75rem;
    background: rgba(52, 152, 219, 0.08);
    border: 1px solid rgba(52, 152, 219, 0.15);
    transition: background 0.3s ease, border-color 0.3s ease;
}

.auth-banner__feature:hover {
    background: rgba(52, 152, 219, 0.15);
    border-color: rgba(52, 152, 219, 0.3);
}

.auth-banner__feature-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 2.5rem;
    height: 2.5rem;
    border-radius: 0.5rem;
    background: rgba(52, 152, 219, 0.2);
    color: #3498db;
    font-size: 1.1rem;
    flex-shrink: 0;
}

.auth-banner__feature-text {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
}

.auth-banner__feature-title {
    font-size: 0.9rem;
    font-weight: 600;
    color: #ecf0f1;
}

.auth-banner__feature-desc {
    font-size: 0.8rem;
    color: #95a5a6;
    line-height: 1.4;
}

/* Decorative background circles */
.auth-banner__decoration {
    position: absolute;
    inset: 0;
    pointer-events: none;
}

.auth-banner__circle {
    position: absolute;
    border-radius: 50%;
    border: 1px solid rgba(52, 152, 219, 0.1);
}

.auth-banner__circle--large {
    width: 20rem;
    height: 20rem;
    bottom: -5rem;
    right: -5rem;
    background: radial-gradient(circle, rgba(52, 152, 219, 0.05) 0%, transparent 70%);
}

.auth-banner__circle--small {
    width: 10rem;
    height: 10rem;
    top: -3rem;
    left: -3rem;
    background: radial-gradient(circle, rgba(52, 152, 219, 0.08) 0%, transparent 70%);
}

@media (max-width: 768px) {
    .auth-banner {
        width: 100%;
        padding: 2rem;
    }

    .auth-banner__features {
        display: none;
    }
}
</style>
