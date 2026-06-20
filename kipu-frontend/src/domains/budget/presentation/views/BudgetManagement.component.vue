  <script setup>
  import { ref, onMounted, computed, watch } from 'vue';
  import { useI18n } from 'vue-i18n';
  import { useRouter, useRoute } from 'vue-router';
  import { BudgetApi } from '../../infrastructure/budget-api.js';
  import { useProjectsStore } from '@/domains/project-management/data/useProjectsStore.js';

  const { t } = useI18n();
  const router = useRouter();
  const route = useRoute();
  const repository = new BudgetApi();
  const projectsStore = useProjectsStore();

  const summary = ref({ total: 0, executed: 0, available: 0, percentage: 0 });
  const recentMovements = ref([]);
  const budgetItems = ref([]);

  const projectRecentMovements = computed(() => {
    return recentMovements.value.filter(mv => String(mv.projectId) === String(projectsStore.currentProjectId));
  });

  const calculateUsedPercentage = (executed, assigned) => {
    const exec = Number(executed || 0);
    const assign = Number(assigned || 0);
    if (assign <= 0) return 0;
    return Math.round((exec / assign) * 100);
  };

  const isNewItem = (item) => {
    return Number(item.assignedBudget || 0) === 0;
  };

  const isBudgetDepleted = (item) => {
    const assign = Number(item.assignedBudget || 0);
    const exec = Number(item.executedAmount || 0);
    return assign > 0 && (assign - exec <= 0);
  };

  const loadDashboardData = async () => {
    if (!projectsStore.hasProjectSelected) return;

    try {
      summary.value = await repository.getProjectSummary();
      const allItems = await repository.findAll();

      budgetItems.value = allItems.filter(item =>
          String(item.projectId) === String(projectsStore.currentProjectId)
      );

      recentMovements.value = budgetItems.value.filter(item => (item.assignedBudget > 0) || (item.executedAmount > 0));
    } catch (error) {
      console.error("Dashboard Load Error:", error);
    }
  };

  const scrollToItem = (id) => {
    const element = document.getElementById(`advance-budget-${id}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      element.classList.add('bg-blue-50', 'border-blue-400');
      setTimeout(() => element.classList.remove('bg-blue-50', 'border-blue-400'), 2000);
    }
  };

  // ADDED: Intercept item clicks to block access to unbudgeted items
  const handleItemClick = (item) => {
    if (isNewItem(item)) {
      // Show popup alert if the item has no budget assigned yet
      alert(t('budget.errors.requiresBudget'));
    } else {
      // Proceed to details if it already has a budget (even if depleted)
      router.push({ name: 'BudgetDetail', params: { id: item.id } });
    }
  };

  onMounted(loadDashboardData);

  watch(() => projectsStore.currentProjectId, loadDashboardData);

  watch(() => route.fullPath, () => {
    if (route.name === 'BudgetManagement') {
      loadDashboardData();
    }
  });
  </script>

  <template>
    <div class="budget-container p-4 md:p-6 bg-slate-50 min-h-screen font-sans">
      <header class="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div class="text-left">
          <h1 class="text-2xl font-black text-slate-900">{{ t('budget.title') }}</h1>
          <p class="text-sm text-slate-500 font-medium">{{ projectsStore.currentProjectName }}</p>
        </div>
        <div class="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <button class="w-full sm:w-auto px-5 py-2.5 bg-white border border-slate-200 text-slate-700 font-bold rounded-lg hover:bg-slate-50 transition-all shadow-sm text-sm" @click="router.push({ name: 'RequestExtension' })">
            {{ t('budget.extension.btn') }}
          </button>
          <button class="w-full sm:w-auto px-5 py-2.5 bg-sky-600 text-white font-bold rounded-lg hover:bg-sky-700 transition-all shadow-sm text-sm" @click="router.push({ name: 'RegisterTransaction' })">
            {{ t('budget.register.btn') }}
          </button>
        </div>
      </header>

      <section class="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8 bg-white p-6 rounded-xl border border-slate-100 shadow-sm text-left">
        <div>
          <span class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{{ t('budget.overview.total') }}</span>
          <strong class="text-2xl font-black text-slate-800 block mt-1">S/ {{ summary.total.toLocaleString() }}</strong>
        </div>
        <div class="border-y sm:border-y-0 sm:border-x border-slate-100 py-4 sm:py-0 sm:px-6">
          <span class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{{ t('budget.overview.executed') }}</span>
          <strong class="text-2xl font-black text-emerald-600 block mt-1">S/ {{ summary.executed.toLocaleString() }}</strong>
        </div>
        <div class="sm:px-6">
          <span class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{{ t('budget.overview.available') }}</span>
          <strong class="text-2xl font-black text-sky-500 block mt-1">S/ {{ summary.available.toLocaleString() }}</strong>
        </div>
        <div class="col-span-1 sm:col-span-3 mt-4">
          <div class="flex justify-between text-xs font-bold text-slate-500 mb-1.5">
            <span>{{ t('budget.overview.status') }}</span>
            <span>{{ summary.percentage }}%</span>
          </div>
          <div class="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
            <div class="bg-emerald-500 h-full transition-all duration-500" :style="{ width: summary.percentage + '%' }"></div>
          </div>
        </div>
      </section>

      <div class="flex flex-col lg:flex-row gap-6 text-left">
        <main class="flex-1 flex flex-col gap-4">
          <h2 class="text-base font-black text-slate-700 uppercase tracking-wide mb-1">{{ t('budget.items.title') }}</h2>

          <div v-for="(item, index) in budgetItems" :key="item.id" :id="`advance-budget-${item.id}`"
               @click="handleItemClick(item)"
               class="p-4 sm:p-5 cursor-pointer rounded-xl border transition-all flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0 duration-300"
               :class="isBudgetDepleted(item) ? 'bg-rose-50 border-rose-400 shadow-sm hover:border-rose-500' : 'bg-white border-slate-200 shadow-sm hover:border-sky-400'">
            <div>
              <h3 class="font-bold text-slate-800 text-base flex flex-wrap items-center gap-2">
                <span v-if="isNewItem(item)" class="px-2 py-0.5 bg-sky-100 text-sky-700 text-[10px] uppercase font-black rounded border border-sky-200">
                  {{ t('budget.items.newBadge') }}
                </span>
                <span v-else class="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs font-black rounded border border-slate-200"
                      :class="isBudgetDepleted(item) ? 'bg-rose-100 text-rose-700 border-rose-200' : ''">
                  {{ String(index + 1).padStart(2, '0') }}
                </span>
                {{ item.activityName || item.activity }}
              </h3>
              <p class="text-xs mt-1 font-medium" :class="isBudgetDepleted(item) ? 'text-rose-500' : 'text-slate-400'">
                {{ item.details || item.sector }}
              </p>
            </div>

            <div class="flex flex-wrap sm:flex-nowrap gap-4 sm:gap-6 items-center w-full sm:w-auto justify-between sm:justify-end">
              <div class="text-left sm:text-right">
                <span class="block text-[10px] font-bold uppercase" :class="isBudgetDepleted(item) ? 'text-rose-400' : 'text-slate-400'">{{ t('budget.items.budgeted') }}</span>
                <strong class="text-sm font-bold" :class="isBudgetDepleted(item) ? 'text-rose-800' : 'text-slate-700'">S/ {{ (item.assignedBudget || 0).toLocaleString() }}</strong>
              </div>
              <div class="text-left sm:text-right">
                <span class="block text-[10px] font-bold uppercase" :class="isBudgetDepleted(item) ? 'text-rose-400' : 'text-slate-400'">{{ t('budget.items.executed') }}</span>
                <strong class="text-sm font-bold" :class="isBudgetDepleted(item) ? 'text-rose-800' : 'text-slate-700'">S/ {{ (item.executedAmount || 0).toLocaleString() }}</strong>
              </div>
              <div class="px-2 py-1 font-black text-xs rounded whitespace-nowrap" :class="isBudgetDepleted(item) ? 'text-rose-700 bg-rose-200' : 'text-emerald-600 bg-emerald-50'">
                {{ calculateUsedPercentage(item.executedAmount, item.assignedBudget) }}%
              </div>
            </div>
          </div>
        </main>

        <aside class="w-full lg:w-80 flex flex-col gap-4">
          <h2 class="text-base font-black text-slate-700 uppercase tracking-wide mb-1">{{ t('budget.recent.title') }}</h2>
          <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-2.5">
            <div v-for="mv in projectRecentMovements" :key="mv.id"
                 class="p-3 bg-slate-50 border border-slate-100 rounded-lg hover:bg-slate-100 transition-all cursor-pointer flex justify-between items-center"
                 @click="scrollToItem(mv.id)">
              <div>
                <strong class="text-xs text-slate-700 block font-bold">{{ mv.activityName || mv.activity }}</strong>
                <span class="text-[10px] font-medium text-slate-400">{{ t('budget.recent.clickToLocate') }}</span>
              </div>
              <strong class="text-xs font-bold" :class="mv.executedAmount > 0 ? 'text-rose-600' : 'text-emerald-600'">
                {{ mv.executedAmount > 0 ? '-' : '+' }} S/ {{ (mv.executedAmount || mv.assignedBudget).toLocaleString() }}
              </strong>
            </div>
            <div v-if="projectRecentMovements.length === 0" class="text-center py-6 text-xs text-slate-400 font-medium italic">
              {{ t('budget.recent.empty') }}
            </div>
          </div>
        </aside>
      </div>
    </div>
  </template>