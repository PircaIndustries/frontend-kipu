<script setup>
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { allBudgets } from '../../application/budgetStore.js';

const props = defineProps({ id: String });
const router = useRouter();

const item = computed(() => allBudgets.value.find(b => b.id === props.id));

const progressPercentage = computed(() => {
  if (!item.value) return 0;
  return Math.min(Math.round((item.value.executed / item.value.budgeted) * 100), 100);
});
</script>

<template>
  <div v-if="item" class="detail-wrapper">
    <nav class="top-nav">
      <button class="back-link" @click="router.back()">
        <i class="pi pi-arrow-left"></i> Volver al listado
      </button>
      <div class="breadcrumb">
        <span>Presupuesto</span> / <span>Detalle de Partida</span> / <span class="active">{{ item.id }}</span>
      </div>
    </nav>

    <header class="page-header">
      <div class="header-content">
        <div class="title-group">
          <div class="badge-id">{{ item.id }}</div>
          <h1>{{ item.name }}</h1>
        </div>
        <p class="description">{{ item.description }}</p>
      </div>
      <div class="header-actions">
        <button class="btn-action secondary">Exportar PDF</button>
        <button class="btn-action primary" @click="router.push({ name: 'RegisterTransaction', query: { partidaId: item.id } })">
          + Nuevo Gasto
        </button>
      </div>
    </header>

    <div class="dashboard-grid">
      <div class="main-panel">
        <div class="stats-row">
          <div class="stat-card">
            <span class="stat-label">PRESUPUESTO ASIGNADO</span>
            <span class="stat-value">S/ {{ item.budgeted.toLocaleString() }}</span>
          </div>
          <div class="stat-card">
            <span class="stat-label">EJECUCIÓN ACTUAL</span>
            <span class="stat-value highlight">S/ {{ item.executed.toLocaleString() }}</span>
            <div class="mini-progress">
              <div class="fill" :style="{ width: progressPercentage + '%' }"></div>
            </div>
          </div>
          <div class="stat-card">
            <span class="stat-label">SALDO DISPONIBLE</span>
            <span class="stat-value success">S/ {{ (item.budgeted - item.executed).toLocaleString() }}</span>
          </div>
        </div>

        <div v-if="item.status === 'AT_RISK'" class="alert-box-modern">
          <div class="alert-icon">
            <i class="pi pi-exclamation-circle"></i>
          </div>
          <div class="alert-text">
            <h3>Atención: Umbral superado</h3>
            <p>{{ item.alertMessage }}</p>
          </div>
          <button class="btn-alert-action">Revisar Solicitud</button>
        </div>

        <div class="card progress-section">
          <div class="card-header">
            <h3>Estado de Ejecución</h3>
            <span class="pct-badge">{{ progressPercentage }}%</span>
          </div>
          <div class="large-progress-bar">
            <div class="bar-fill" :class="{ 'risk': item.status === 'AT_RISK' }" :style="{ width: progressPercentage + '%' }"></div>
          </div>
          <div class="bar-legend">
            <span>0%</span>
            <span>Meta de eficiencia: 90%</span>
            <span>100%</span>
          </div>
        </div>
      </div>

      <aside class="side-panel">
        <div class="card policy-card">
          <div class="icon-circle">
            <i class="pi pi-shield"></i>
          </div>
          <h4>Control Presupuestal</h4>
          <p>Las compras que excedan el <strong>10%</strong> del presupuesto requieren autorización especial del residente.</p>
        </div>

        <div class="card info-box">
          <h4>Detalles de Registro</h4>
          <div class="info-item">
            <span>Última modificación:</span>
            <strong>Hoy, 5:06 PM</strong>
          </div>
          <div class="info-item">
            <span>Estado:</span>
            <strong :class="item.status === 'AT_RISK' ? 'text-risk' : 'text-success'">
              {{ item.status === 'AT_RISK' ? 'En Riesgo' : 'Saludable' }}
            </strong>
          </div>
        </div>
      </aside>
    </div>
  </div>
</template>

<style scoped>
/* Contenedor Principal */
.detail-wrapper {
  padding: 1.5rem 2.5rem;
  background-color: #f8fafc;
  min-height: 100vh;
  color: #1e293b;
  font-family: 'Inter', system-ui, sans-serif;
}

/* Navegación y Breadcrumbs */
.top-nav { display: flex; justify-content: space-between; margin-bottom: 2rem; font-size: 0.9rem; }
.back-link {
  background: none; border: none; color: #64748b; font-weight: 600; cursor: pointer;
  display: flex; align-items: center; gap: 0.5rem; transition: color 0.2s;
}
.back-link:hover { color: #0f172a; }
.breadcrumb { color: #94a3b8; }
.breadcrumb .active { color: #64748b; font-weight: 600; }

/* Header */
.page-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 2.5rem; }
.title-group { display: flex; align-items: center; gap: 1rem; }
.badge-id { background: #e2e8f0; color: #475569; padding: 0.25rem 0.75rem; border-radius: 6px; font-weight: 700; font-size: 0.85rem; }
.page-header h1 { margin: 0; font-size: 2.25rem; font-weight: 800; letter-spacing: -0.025em; }
.description { margin: 0.5rem 0 0; color: #64748b; font-size: 1.1rem; }

/* Botones */
.header-actions { display: flex; gap: 0.75rem; }
.btn-action { padding: 0.75rem 1.25rem; border-radius: 10px; font-weight: 600; cursor: pointer; transition: all 0.2s; border: none; }
.btn-action.primary { background-color: #0f172a; color: white; }
.btn-action.primary:hover { background-color: #1e293b; transform: translateY(-1px); }
.btn-action.secondary { background-color: white; color: #475569; border: 1px solid #e2e8f0; }

/* Dashboard Grid */
.dashboard-grid { display: grid; grid-template-columns: 1fr 320px; gap: 2rem; }

/* Cards de Estadísticas */
.stats-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.25rem; margin-bottom: 1.5rem; }
.stat-card { background: white; padding: 1.5rem; border-radius: 16px; border: 1px solid #e2e8f0; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
.stat-label { font-size: 0.75rem; font-weight: 700; color: #94a3b8; letter-spacing: 0.05em; }
.stat-value { display: block; font-size: 1.5rem; font-weight: 800; margin-top: 0.5rem; }
.stat-value.highlight { color: #0f172a; }
.stat-value.success { color: #10b981; }

.mini-progress { background: #f1f5f9; height: 6px; border-radius: 3px; margin-top: 1rem; overflow: hidden; }
.mini-progress .fill { background: #3b82f6; height: 100%; border-radius: 3px; }

/* Alertas Modernas */
.alert-box-modern {
  background-color: #fef2f2; border: 1px solid #fee2e2; padding: 1.5rem; border-radius: 16px;
  display: flex; align-items: center; gap: 1.25rem; margin-bottom: 1.5rem;
}
.alert-icon { background: #ef4444; color: white; width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; }
.alert-text h3 { margin: 0; font-size: 1rem; color: #991b1b; }
.alert-text p { margin: 0.25rem 0 0; color: #b91c1c; font-size: 0.9rem; }
.btn-alert-action { margin-left: auto; background: #991b1b; color: white; border: none; padding: 0.6rem 1rem; border-radius: 8px; font-weight: 600; cursor: pointer; }

/* Progress Card */
.card { background: white; padding: 1.5rem; border-radius: 16px; border: 1px solid #e2e8f0; }
.card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
.card-header h3 { margin: 0; font-size: 1.1rem; font-weight: 700; }
.pct-badge { background: #eff6ff; color: #1e40af; font-weight: 700; padding: 0.25rem 0.75rem; border-radius: 20px; font-size: 0.9rem; }

.large-progress-bar { background: #f1f5f9; height: 24px; border-radius: 12px; overflow: hidden; }
.bar-fill { height: 100%; background: #3b82f6; transition: width 0.8s cubic-bezier(0.4, 0, 0.2, 1); }
.bar-fill.risk { background: #ef4444; }
.bar-legend { display: flex; justify-content: space-between; margin-top: 0.75rem; color: #94a3b8; font-size: 0.8rem; font-weight: 600; }

/* Sidebar */
.side-panel { display: flex; flex-direction: column; gap: 1.25rem; }
.policy-card { background: #f8fafc; border-style: dashed; border-color: #cbd5e1; text-align: center; padding: 2rem 1.5rem; }
.icon-circle { background: #e2e8f0; width: 50px; height: 50px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 1rem; font-size: 1.25rem; color: #475569; }
.policy-card h4 { margin: 0 0 0.5rem; }
.policy-card p { font-size: 0.85rem; color: #64748b; line-height: 1.5; margin: 0; }

.info-item { display: flex; justify-content: space-between; font-size: 0.85rem; margin-top: 0.75rem; padding-top: 0.75rem; border-top: 1px solid #f1f5f9; }
.text-risk { color: #ef4444; }
.text-success { color: #10b981; }

@media (max-width: 1024px) {
  .dashboard-grid { grid-template-columns: 1fr; }
  .stats-row { grid-template-columns: 1fr; }
}
</style>