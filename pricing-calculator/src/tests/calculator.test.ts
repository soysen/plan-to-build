import { describe, it, expect } from "vitest";
import { TELECOM_PLANS } from "../core/plans";
import { calculatePlanCost, findBestPlan } from "../core/calculator";

describe("Tariff Calculator Pricing Engine", () => {
  const planA = TELECOM_PLANS[0]; // Light: NT$ 299 (10GB, 30m, 10s)
  const planB = TELECOM_PLANS[1]; // Unlimited 5G: NT$ 999 (Unlimited, 120m, 50s)
  const planC = TELECOM_PLANS[2]; // Moderate: NT$ 599 (60GB, 60m, 30s)

  it("should calculate correct base cost with no usage and no contract", () => {
    const costA = calculatePlanCost(planA, 0, 0, 0, false);
    const costB = calculatePlanCost(planB, 0, 0, 0, false);
    const costC = calculatePlanCost(planC, 0, 0, 0, false);

    expect(costA.totalCost).toBe(299);
    expect(costB.totalCost).toBe(999);
    expect(costC.totalCost).toBe(599);
  });

  it("should apply 10% contract discount correctly (rounded to integer)", () => {
    const costA = calculatePlanCost(planA, 0, 0, 0, true);
    const costB = calculatePlanCost(planB, 0, 0, 0, true);
    const costC = calculatePlanCost(planC, 0, 0, 0, true);

    expect(costA.baseCost).toBe(269); // 299 * 0.9 = 269.1 -> 269
    expect(costB.baseCost).toBe(899); // 999 * 0.9 = 899.1 -> 899
    expect(costC.baseCost).toBe(539); // 599 * 0.9 = 539.1 -> 539
  });

  it("should calculate excess charges correctly for Plan A (charges for everything)", () => {
    // Usage: 12GB (2GB excess), 45 mins (15m excess), 15 SMS (5s excess)
    // Base: 299
    // Data: 2 * 50 = 100
    // Voice: 15 * 6 = 90
    // SMS: 5 * 2 = 10
    // Expected total: 299 + 100 + 90 + 10 = 499
    const cost = calculatePlanCost(planA, 12, 45, 15, false);

    expect(cost.excessDataCost).toBe(100);
    expect(cost.excessVoiceCost).toBe(90);
    expect(cost.excessSMSCost).toBe(10);
    expect(cost.totalCost).toBe(499);
    expect(cost.isThrottled).toBe(false);
  });

  it("should calculate excess charges correctly for Plan B (unlimited data, charges voice/SMS)", () => {
    // Usage: 150GB (0 excess data), 150 mins (30m excess), 60 SMS (10s excess)
    // Base: 999
    // Data: 0
    // Voice: 30 * 3 = 90
    // SMS: 10 * 1 = 10
    // Expected total: 999 + 90 + 10 = 1099
    const cost = calculatePlanCost(planB, 150, 150, 60, false);

    expect(cost.excessDataCost).toBe(0);
    expect(cost.excessVoiceCost).toBe(90);
    expect(cost.excessSMSCost).toBe(10);
    expect(cost.totalCost).toBe(1099);
    expect(cost.isThrottled).toBe(false);
  });

  it("should calculate excess charges correctly for Plan C (free throttled data, charges voice/SMS)", () => {
    // Usage: 70GB (10GB excess -> throttled to 10Mbps), 80 mins (20m excess), 35 SMS (5s excess)
    // Base: 599
    // Data: 0 (free throttled)
    // Voice: 20 * 4 = 80
    // SMS: 5 * 1.5 = 7.5 -> 8 (rounded)
    // Expected total: 599 + 0 + 80 + 8 = 687
    const cost = calculatePlanCost(planC, 70, 80, 35, false);

    expect(cost.excessDataCost).toBe(0);
    expect(cost.excessVoiceCost).toBe(80);
    expect(cost.excessSMSCost).toBe(8);
    expect(cost.totalCost).toBe(687);
    expect(cost.isThrottled).toBe(true);
    expect(cost.throttleSpeed).toBe("10 Mbps");
  });

  it("should recommend the correct cheapest plan based on usage", () => {
    const plans = TELECOM_PLANS;

    // 1. Light usage -> Plan A is best
    const runs1 = plans.map(p => calculatePlanCost(p, 5, 10, 2, false));
    expect(findBestPlan(runs1, plans)).toBe("plan-a"); // 299 vs 999 vs 599

    // 2. High data, moderate voice -> Plan D is best (because Plan D's base fee is NT$ 499, and it has free throttled excess data)
    // Plan A: 299 + 90 * 50 = 4799
    // Plan B: 999
    // Plan C: 599
    // Plan D: 499
    const runs2 = plans.map(p => calculatePlanCost(p, 100, 40, 5, false));
    expect(findBestPlan(runs2, plans)).toBe("plan-d");

    // 3. Heavy voice usage -> Plan B is best
    // Usage: 100GB data, 300 mins voice, 10 SMS
    // Plan B: 999 + 180 * 3 = 1539
    // Plan C: 599 + 240 * 4 = 1559
    const runs3 = plans.map(p => calculatePlanCost(p, 100, 300, 10, false));
    expect(findBestPlan(runs3, plans)).toBe("plan-b");

    // 4. High data, voice usage at 61 mins -> Plan C is best (because Plan D's excess voice rates make it slightly more expensive)
    // Plan C: 599 + 1 * 4 = 603
    // Plan D: 499 + 21 * 5 = 604
    const runs4 = plans.map(p => calculatePlanCost(p, 100, 61, 5, false));
    expect(findBestPlan(runs4, plans)).toBe("plan-c");
  });

  it("should calculate correct excess voice cost for Plan D (tiered voice pricing)", () => {
    const planD = TELECOM_PLANS[3]; // Student Plan: NT$ 499 (36GB, 40m, 20s)
    
    // Case 1: No excess (30 mins voice -> 0 excess)
    const cost1 = calculatePlanCost(planD, 10, 30, 0, false);
    expect(cost1.excessVoiceCost).toBe(0);
    expect(cost1.totalCost).toBe(499);

    // Case 2: Under 30 mins excess (50 mins voice -> 10 mins excess)
    // 10 mins * 5 = 50
    const cost2 = calculatePlanCost(planD, 10, 50, 0, false);
    expect(cost2.excessVoiceCost).toBe(50);
    expect(cost2.totalCost).toBe(499 + 50);

    // Case 3: Over 30 mins excess (80 mins voice -> 40 mins excess)
    // First 30 mins * 5 = 150
    // Remaining 10 mins * 3 = 30
    // Total expected: 150 + 30 = 180
    const cost3 = calculatePlanCost(planD, 10, 80, 0, false);
    expect(cost3.excessVoiceCost).toBe(180);
    expect(cost3.totalCost).toBe(499 + 180);
  });
});
