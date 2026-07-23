import type {Plan} from "./plans"

export interface CostBreakdown {
	planId: string
	baseCost: number
	excessDataCost: number
	excessVoiceCost: number
	excessSMSCost: number
	totalCost: number
	isThrottled: boolean
	throttleSpeed?: string
}

/**
 * Calculates the total cost breakdown for a specific plan based on user usage.
 *
 * @param plan The telecom plan configuration.
 * @param dataGB Estimated monthly data usage in GB.
 * @param voiceMins Estimated monthly voice call usage in minutes.
 * @param smsCount Estimated monthly SMS usage.
 * @param isContracted Whether the user selects the 24-month contract discount (10% off monthly fee).
 */
export function calculatePlanCost(
	plan: Plan,
	dataGB: number,
	voiceMins: number,
	smsCount: number,
	isContracted: boolean,
): CostBreakdown {
	// 1. Calculate Base Cost (Apply 10% discount if contracted, rounded to nearest NT$ integer)
	let baseCost = plan.monthlyFee
	if (isContracted) {
		baseCost = Math.round(plan.monthlyFee * 0.9)
	}

	// 2. Calculate Excess Data Cost
	let excessDataCost = 0
	let isThrottled = false
	let throttleSpeed: string | undefined

	if (plan.includedDataGB !== -1) {
		// If not unlimited data
		if (dataGB > plan.includedDataGB) {
			if (plan.excessDataFeePerGB > 0) {
				// Plan A charges for excess data
				const excessData = dataGB - plan.includedDataGB
				excessDataCost = Math.round(excessData * plan.excessDataFeePerGB)
			} else {
				// Plan C has free throttled excess data
				isThrottled = true
				throttleSpeed = "10 Mbps"
			}
		}
	}

	// Basic throttling indication for Plan A (since it降速 to 128kbps if excess isn't paid,
	// but if excess is paid they get normal speed. In our calculator, they pay for excess, so they aren't throttled,
	// unless they choose not to pay. For Plan A, we assume they pay excess data fee, so no throttling.)

	// 3. Calculate Excess Voice Cost
	let excessVoiceCost = 0
	if (voiceMins > plan.includedVoiceMins) {
		const excessMins = voiceMins - plan.includedVoiceMins

		// ==========================================
		// ✍️ 【實戰練習任務 - 請在此實作你的計費邏輯】
		// ==========================================
		// 請針對「學生青春無敵方案 (plan-d)」實作超量語音分級計費邏輯：
		// - 超額的前 30 分鐘（含 30 分鐘）：每分鐘 NT$ 5
		// - 超額的第 31 分鐘起：每分鐘 NT$ 3
		//
		// 其他方案（plan-a, plan-b, plan-c）仍維持原先邏輯：
		// - 費率直接乘上 plan.excessVoiceFeePerMin
		//
		// 提示：
		// 1. 可以使用 if (plan.id === "plan-d") 來區分
		// 2. 完成後請在終端機執行 `npm run test`，看著測試紅燈轉為綠燈！
		// ==========================================

		if (plan.id === "plan-d") {
			if (excessMins <= 30) {
				excessVoiceCost = excessMins * 5
			} else {
				excessVoiceCost = 30 * 5 + (excessMins - 30) * 3
			}
		} else {
			excessVoiceCost = Math.round(excessMins * plan.excessVoiceFeePerMin)
		}
		// 【修改這行，實作你的分級費率計算】：
	}

	// 4. Calculate Excess SMS Cost
	let excessSMSCost = 0
	if (smsCount > plan.includedSMS) {
		const excessSMS = smsCount - plan.includedSMS
		excessSMSCost = Math.round(excessSMS * plan.excessSMSFeePerSMS)
	}

	// 5. Total Cost
	const totalCost = baseCost + excessDataCost + excessVoiceCost + excessSMSCost

	return {
		planId: plan.id,
		baseCost,
		excessDataCost,
		excessVoiceCost,
		excessSMSCost,
		totalCost,
		isThrottled,
		throttleSpeed,
	}
}

/**
 * Finds the most cost-effective plan from a list of breakdowns.
 * Ties are broken by monthly fee (lower base fee first) then id.
 */
export function findBestPlan(breakdowns: CostBreakdown[], plans: Plan[]): string {
	if (breakdowns.length === 0) return ""

	let best = breakdowns[0]

	for (let i = 1; i < breakdowns.length; i++) {
		const current = breakdowns[i]
		if (current.totalCost < best.totalCost) {
			best = current
		} else if (current.totalCost === best.totalCost) {
			// Tie breaker: compare original monthly fee
			const currentPlan = plans.find(p => p.id === current.planId)
			const bestPlan = plans.find(p => p.id === best.planId)
			if (currentPlan && bestPlan && currentPlan.monthlyFee < bestPlan.monthlyFee) {
				best = current
			}
		}
	}

	return best.planId
}
