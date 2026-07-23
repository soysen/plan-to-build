import "./style.css";
import { TELECOM_PLANS } from "./core/plans";
import { calculatePlanCost, findBestPlan } from "./core/calculator";
import type { CostBreakdown } from "./core/calculator";

// ==========================================
// 1. 全域狀態管理 (Global Application State)
// ==========================================
interface State {
  dataGB: number;
  voiceMins: number;
  smsCount: number;
  isContracted: boolean;
  comparisonSet: Set<string>; // 儲存選中加入對比的 Plan ID
}

const state: State = {
  dataGB: 20,
  voiceMins: 45,
  smsCount: 15,
  isContracted: false,
  comparisonSet: new Set<string>()
};

// ==========================================
// 2. DOM 元素選取器 (DOM Element Selectors)
// ==========================================
const inputElements = {
  dataSlider: document.getElementById("input-data") as HTMLInputElement,
  voiceSlider: document.getElementById("input-voice") as HTMLInputElement,
  smsSlider: document.getElementById("input-sms") as HTMLInputElement,
  contractToggle: document.getElementById("contract-toggle") as HTMLInputElement,
};

const displayElements = {
  dataValue: document.getElementById("value-data") as HTMLElement,
  voiceValue: document.getElementById("value-voice") as HTMLElement,
  smsValue: document.getElementById("value-sms") as HTMLElement,
  planListContainer: document.getElementById("plan-list") as HTMLElement,
  comparisonPanel: document.getElementById("comparison-panel") as HTMLElement,
  comparisonTableContainer: document.getElementById("comparison-table-container") as HTMLElement,
};

// ==========================================
// 3. 效能優化：使用 requestAnimationFrame 進行繪製排程 (Throttling)
// ==========================================
let renderPending = false;

function scheduleUIRender() {
  if (renderPending) return;
  renderPending = true;
  
  requestAnimationFrame(() => {
    updateUI();
    renderPending = false;
  });
}

// ==========================================
// 4. 核心邏輯 - 計算費用並更新 DOM (Read/Calculate/Write Split)
// ==========================================
function updateUI() {
  // --- A. 讀取階段 (Read Phase) ---
  state.dataGB = parseInt(inputElements.dataSlider.value, 10);
  state.voiceMins = parseInt(inputElements.voiceSlider.value, 10);
  state.smsCount = parseInt(inputElements.smsSlider.value, 10);
  state.isContracted = inputElements.contractToggle.checked;

  // 更新滑桿旁的數值顯示 (這也是 DOM 寫入，但先更新文字可維持流暢性)
  displayElements.dataValue.textContent = `${state.dataGB} GB`;
  displayElements.voiceValue.textContent = `${state.voiceMins} 分鐘`;
  displayElements.smsValue.textContent = `${state.smsCount} 則`;

  // --- B. 運算階段 (Calculate Phase) ---
  const planCosts = TELECOM_PLANS.map(plan => 
    calculatePlanCost(plan, state.dataGB, state.voiceMins, state.smsCount, state.isContracted)
  );
  
  // 計算出最划算的方案 ID
  const bestPlanId = findBestPlan(planCosts, TELECOM_PLANS);

  // --- C. 寫入階段 (Write Phase) ---
  renderPlanCards(planCosts, bestPlanId);
  renderComparisonSection();
}

/**
 * 渲染方案卡片列表
 */
function renderPlanCards(costs: CostBreakdown[], bestPlanId: string) {
  const container = displayElements.planListContainer;
  container.innerHTML = "";

  TELECOM_PLANS.forEach(plan => {
    const costInfo = costs.find(c => c.planId === plan.id)!;
    const isBest = plan.id === bestPlanId;
    const isChecked = state.comparisonSet.has(plan.id);

    // 建立卡片外包裝 (設定 Container Type)
    const cardWrapper = document.createElement("div");
    cardWrapper.className = "plan-card-wrapper";

    // 建立卡片內容 (Glassmorphism + Recommended 狀態)
    const card = document.createElement("article");
    card.className = `plan-card ${isBest ? "recommended" : ""}`;
    card.setAttribute("aria-label", `${plan.name}，估算月費為 NT$ ${costInfo.totalCost} 元`);

    // 若是最划算方案，加上小獎章
    const recommendationBadge = isBest
      ? `<span class="recommend-badge" aria-hidden="true">🏆 最划算推薦</span>`
      : "";

    // 產生超出用量明細
    const excessDataStr = plan.includedDataGB === -1 
      ? `<span class="price-val free">無限吃到飽</span>` 
      : costInfo.excessDataCost > 0 
        ? `<span class="price-val">+ NT$ ${costInfo.excessDataCost}</span>`
        : `<span class="price-val free">免額外費</span>`;

    const excessVoiceStr = costInfo.excessVoiceCost > 0
      ? `<span class="price-val">+ NT$ ${costInfo.excessVoiceCost}</span>`
      : `<span class="price-val free">免額外費</span>`;

    const excessSMSStr = costInfo.excessSMSCost > 0
      ? `<span class="price-val">+ NT$ ${costInfo.excessSMSCost}</span>`
      : `<span class="price-val free">免額外費</span>`;

    // 降速警示區塊
    const throttleWarningHtml = costInfo.isThrottled && costInfo.throttleSpeed
      ? `<div class="throttle-warning" role="alert">
          <span>⚠️ 數據量已超額，將輕速限制於 ${costInfo.throttleSpeed} 吃到飽</span>
         </div>`
      : "";

    card.innerHTML = `
      ${recommendationBadge}
      <!-- 卡片頂部資訊 -->
      <div class="plan-card-header">
        <div class="plan-title-area">
          <h4>${plan.name}</h4>
          <span class="network-badge net-${plan.networkType.toLowerCase()}">${plan.networkType} 飆速</span>
        </div>
        <div class="price-block">
          <span class="price-tag">${costInfo.totalCost}</span>
          <span class="price-period">估算實付 / 月</span>
        </div>
      </div>

      <!-- 方案內含服務 -->
      <ul class="plan-features-list">
        ${plan.features.map(f => `<li>${f}</li>`).join("")}
      </ul>

      <!-- 右側 / 下方資訊面板 -->
      <div class="plan-right-pane">
        <!-- 計費費用明細 -->
        <div class="plan-breakdown">
          <div class="breakdown-row">
            <span>月租費底價 (${state.isContracted ? "綁約折抵後" : "單門號"})</span>
            <span class="price-val">NT$ ${costInfo.baseCost}</span>
          </div>
          <div class="breakdown-row">
            <span>超出上網費</span>
            ${excessDataStr}
          </div>
          <div class="breakdown-row">
            <span>超出語音費</span>
            ${excessVoiceStr}
          </div>
          <div class="breakdown-row">
            <span>超出簡訊費</span>
            ${excessSMSStr}
          </div>
          <div class="breakdown-row total-row">
            <span>應付總額</span>
            <span class="price-val">NT$ ${costInfo.totalCost}</span>
          </div>
        </div>

        ${throttleWarningHtml}
      </div>

      <!-- 卡片底部對比操作區 -->
      <div class="plan-card-actions">
        <label class="compare-label" for="chk-${plan.id}" id="lbl-chk-${plan.id}">
          <input 
            type="checkbox" 
            id="chk-${plan.id}" 
            class="plan-checkbox sr-only" 
            ${isChecked ? "checked" : ""} 
            aria-checked="${isChecked ? "true" : "false"}"
          />
          <span class="custom-checkbox" aria-hidden="true"></span>
          <span>加入方案規格對比</span>
        </label>
      </div>
    `;

    // 5.2 鍵盤 A11y 控制器：為 label 設定 tabindex="0"，監聽鍵盤 Space/Enter 切換
    const compareLabel = card.querySelector(".compare-label") as HTMLLabelElement;
    const checkbox = card.querySelector(".plan-checkbox") as HTMLInputElement;

    compareLabel.setAttribute("tabindex", "0");
    compareLabel.addEventListener("keydown", (e: KeyboardEvent) => {
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault(); // 防止空白鍵往下滾動網頁
        checkbox.checked = !checkbox.checked;
        checkbox.dispatchEvent(new Event("change"));
      }
    });

    // 監聽對比勾選事件
    checkbox.addEventListener("change", () => {
      if (checkbox.checked) {
        state.comparisonSet.add(plan.id);
      } else {
        state.comparisonSet.delete(plan.id);
      }
      // 更新 Aria 狀態
      checkbox.setAttribute("aria-checked", checkbox.checked ? "true" : "false");
      
      // 更新 UI 與對比區塊 (CSS :has 會在此時自動變更卡片半透明狀態，免去手動寫 class 的麻煩)
      renderComparisonSection();
    });

    cardWrapper.appendChild(card);
    container.appendChild(cardWrapper);
  });
}

/**
 * 渲染對比表格區塊
 */
function renderComparisonSection() {
  const panel = displayElements.comparisonPanel;
  const tableContainer = displayElements.comparisonTableContainer;

  // 必須勾選至少兩個方案，才顯示對比表格
  if (state.comparisonSet.size < 2) {
    panel.style.display = "none";
    return;
  }

  // 取得勾選的方案靜態資料與最新計算結果
  const selectedPlans = TELECOM_PLANS.filter(p => state.comparisonSet.has(p.id));
  const planCosts = selectedPlans.map(plan => 
    calculatePlanCost(plan, state.dataGB, state.voiceMins, state.smsCount, state.isContracted)
  );

  panel.style.display = "block";
  
  // 建立對比 HTML 表格
  let tableHtml = `
    <table class="comparison-table" role="grid" aria-label="選定方案詳細對比">
      <thead>
        <tr>
          <th scope="col">比較項目</th>
          ${selectedPlans.map(p => `<th scope="col" class="plan-col-header">${p.name}</th>`).join("")}
        </tr>
      </thead>
      <tbody>
        <tr>
          <th scope="row">網速規格</th>
          ${selectedPlans.map(p => `<td><span class="network-badge net-${p.networkType.toLowerCase()}">${p.networkType}</span></td>`).join("")}
        </tr>
        <tr>
          <th scope="row">原始月租費</th>
          ${selectedPlans.map(p => `<td>NT$ ${p.monthlyFee} / 月</td>`).join("")}
        </tr>
        <tr>
          <th scope="row">包含上網量</th>
          ${selectedPlans.map(p => `<td>${p.includedDataGB === -1 ? "無限不降速" : `${p.includedDataGB} GB`}</td>`).join("")}
        </tr>
        <tr>
          <th scope="row">超出上網計費</th>
          ${selectedPlans.map(p => `<td>${p.includedDataGB === -1 ? "無" : p.excessDataFeePerGB === 0 ? "免費 (限速 10Mbps)" : `NT$ ${p.excessDataFeePerGB} / GB`}</td>`).join("")}
        </tr>
        <tr>
          <th scope="row">內含語音分鐘</th>
          ${selectedPlans.map(p => `<td>${p.includedVoiceMins} 分鐘</td>`).join("")}
        </tr>
        <tr>
          <th scope="row">超出語音費率</th>
          ${selectedPlans.map(p => `<td>NT$ ${p.excessVoiceFeePerMin} / 分鐘</td>`).join("")}
        </tr>
        <tr>
          <th scope="row">內含簡訊額度</th>
          ${selectedPlans.map(p => `<td>${p.includedSMS} 則</td>`).join("")}
        </tr>
        <tr>
          <th scope="row">預估本月實付</th>
          ${planCosts.map(cost => `<td class="table-price-highlight">NT$ ${cost.totalCost}</td>`).join("")}
        </tr>
      </tbody>
    </table>
  `;

  tableContainer.innerHTML = tableHtml;
}

// ==========================================
// 5. 事件監聽設定 (Event Listeners & Initialization)
// ==========================================
function init() {
  // 監聽滑桿輸入事件 (使用節流優化)
  inputElements.dataSlider.addEventListener("input", scheduleUIRender);
  inputElements.voiceSlider.addEventListener("input", scheduleUIRender);
  inputElements.smsSlider.addEventListener("input", scheduleUIRender);
  
  // 監聽綁約折扣切換
  inputElements.contractToggle.addEventListener("change", scheduleUIRender);

  // 初始化第一次渲染
  updateUI();
}

// 啟動應用程式
document.addEventListener("DOMContentLoaded", init);
// 如果 DOM 已經加載完畢，直接啟動
if (document.readyState === "interactive" || document.readyState === "complete") {
  init();
}
