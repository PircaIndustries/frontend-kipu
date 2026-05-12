<script setup>
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { BudgetRepository } from '../../infrastructure/budget.repository.js';

const router = useRouter();
const repository = new BudgetRepository();

const budgetItems = computed(() => repository.findAll());
const summary = computed(() => repository.getProjectSummary());

const goToDetail = (id) => router.push({ name: 'BudgetDetail', params: { id } });
</script>

<template>
  <div class="budget-container">
    <header class="main-header">
      <div class="header-info">
        <h1>Gestión de Presupuesto</h1>
        <p>Torre Empresarial Centenario</p>
      </div>
      <button class="btn-primary" @click="router.push({ name: 'RegisterTransaction' })">
        + Registrar Gasto
      </button>
    </header>

    <section class="summary-grid">
      <div class="card summary-card">
        <span class="card-label">PRESUPUESTO TOTAL</span>
        <div class="amount-row">
          <span class="total-val">S/ {{ summary.total.toLocaleString() }}</span>
          <span class="exec-val">S/ {{ summary.executed.toLocaleString() }}</span>
        </div>
        <div class="progress-bar-bg">
          <div class="progress-fill green" :style="{ width: summary.percentage + '%' }"></div>
        </div>
        <div class="progress-labels">
          <span>{{ summary.percentage }}% ejecutado</span>
          <span class="avail">S/ {{ summary.available.toLocaleString() }} disponibles</span>
        </div>
      </div>

      <div class="card alert-summary-card" v-if="summary.executed > summary.total * 0.9">
        <span class="card-label">ALERTAS</span>
        <div class="alert-item">
          <strong>Crítico:</strong> Presupuesto próximo al límite.
        </div>
      </div>
    </section>

    <h2 class="section-title">Presupuesto por Partidas</h2>
    <div class="items-list">
      <div v-for="item in budgetItems" :key="item.id"
           class="item-row"
           :class="{ 'is-risk': item.status === 'AT_RISK' }"
           @click="goToDetail(item.id)">

        <div class="item-main-info">
          <div class="id-badge">{{ item.id }}</div>
          <div class="name-group">
            <h3>{{ item.name }}</h3>
            <p>{{ item.description }}</p>
          </div>
        </div>

        <div class="item-metrics">
          <div class="metric">
            <span>PRESUPUESTADO</span>
            <strong>S/ {{ item.budgeted.toLocaleString() }}</strong>
          </div>
          <div class="metric">
            <span>EJECUTADO</span>
            <strong :class="{ 'text-danger': item.status === 'AT_RISK' }">
              S/ {{ item.executed.toLocaleString() }}
            </strong>
          </div>
          <div class="status-tag" :class="item.status.toLowerCase()">
            {{ item.status === 'AT_RISK' ? 'En riesgo' : 'Normal' }}
          </div>
        </div>

        <div v-if="item.status === 'AT_RISK'" class="row-alert">
          <i class="pi pi-exclamation-triangle"></i> {{ item.alertMessage }}
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.budget-container { padding: 2rem; font-family: sans-serif; background: #f9fafb; color: #1a1a1a; min-h: 100vh; }
.main-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
.header-info h1 { margin: 0; font-size: 1.8rem; color: #111; }
.header-info p { margin: 4px 0 0; color: #666; }

.btn-primary { background: #e11d48; color: white; border: none; padding: 0.8rem 1.5rem; border-radius: 8px; font-weight: bold; cursor: pointer; }

.summary-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem; margin-bottom: 2.5rem; }
.card { background: white; padding: 1.5rem; border-radius: 12px; border: 1px solid #e5e7eb; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
.card-label { font-size: 0.75rem; font-weight: 800; color: #6b7280; }

.amount-row { display: flex; justify-content: space-between; align-items: baseline; margin: 1rem 0; }
.total-val { font-size: 2rem; font-weight: 800; }
.exec-val { font-size: 1.5rem; font-weight: 700; color: #10b981; }

.progress-bar-bg { background: #e5e7eb; height: 10px; border-radius: 5px; overflow: hidden; margin-bottom: 0.5rem; }
.progress-fill { height: 100%; transition: width 0.3s; }
.progress-fill.green { background: #10b981; }

.items-list { display: flex; flex-direction: column; gap: 1rem; }
.item-row { background: white; padding: 1.5rem; border-radius: 12px; border: 1px solid #e5e7eb; cursor: pointer; transition: transform 0.2s; position: relative; }
.item-row:hover { transform: translateY(-2px); border-color: #3b82f6; }
.item-row.is-risk { background: #fff1f2; border-color: #fecaca; }

.item-main-info { display: flex; gap: 1rem; align-items: center; margin-bottom: 1rem; }
.id-badge { background: #f3f4f6; padding: 0.5rem 0.8rem; border-radius: 6px; font-weight: 800; }
.name-group h3 { margin: 0; font-size: 1.1rem; }
.name-group p { margin: 2px 0 0; font-size: 0.9rem; color: #666; }

.item-metrics { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 1rem; }
.metric span { display: block; font-size: 0.7rem; font-weight: 700; color: #9ca3af; margin-bottom: 4px; }
.metric strong { font-size: 1.2rem; }

.status-tag { justify-self: end; padding: 0.4rem 0.8rem; border-radius: 20px; font-size: 0.8rem; font-weight: bold; }
.status-tag.normal { background: #dcfce7; color: #166534; }
.status-tag.at_risk { background: #fee2e2; color: #991b1b; }

.row-alert { margin-top: 1rem; padding: 0.8rem; background: #fee2e2; color: #991b1b; border-radius: 6px; font-size: 0.85rem; font-weight: bold; }

@media (max-width: 768px) {
  .main-header { flex-direction: column; align-items: flex-start; gap: 1rem; }
  .item-metrics { grid-template-columns: 1fr 1fr; }
}
</style>