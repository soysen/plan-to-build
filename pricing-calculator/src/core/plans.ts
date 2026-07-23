export interface Plan {
  id: string;
  name: string;
  monthlyFee: number;
  includedDataGB: number;   // -1 represents unlimited
  excessDataFeePerGB: number;
  includedVoiceMins: number;
  excessVoiceFeePerMin: number;
  includedSMS: number;
  excessSMSFeePerSMS: number;
  networkType: "4G" | "5G";
  features: string[];
  recommendationReason: string;
}

export const TELECOM_PLANS: Plan[] = [
  {
    id: "plan-a",
    name: "輕量小資方案 (Light User)",
    monthlyFee: 299,
    includedDataGB: 10,
    excessDataFeePerGB: 50,
    includedVoiceMins: 30,
    excessVoiceFeePerMin: 6,
    includedSMS: 10,
    excessSMSFeePerSMS: 2,
    networkType: "4G",
    features: [
      "月租超低無負擔",
      "適合基本 LINE 聊天與輕度瀏覽",
      "上網超額降速至 128 kbps"
    ],
    recommendationReason: "輕度上網、平常有家用 Wi-Fi，想省荷包的首選！"
  },
  {
    id: "plan-b",
    name: "5G 飆速無限方案 (Unlimited 5G)",
    monthlyFee: 999,
    includedDataGB: -1, // Unlimited
    excessDataFeePerGB: 0,
    includedVoiceMins: 120,
    excessVoiceFeePerMin: 3,
    includedSMS: 50,
    excessSMSFeePerSMS: 1,
    networkType: "5G",
    features: [
      "極速 5G 吃到飽不降速",
      "熱點分享無限用",
      "網外/市話大方送 120 分鐘"
    ],
    recommendationReason: "重度追劇、手遊玩家、熱點分享需求者最佳選擇！"
  },
  {
    id: "plan-c",
    name: "影音娛樂雙享方案 (Moderate 5G)",
    monthlyFee: 599,
    includedDataGB: 60,
    excessDataFeePerGB: 0, // Free throttled excess
    includedVoiceMins: 60,
    excessVoiceFeePerMin: 4,
    includedSMS: 30,
    excessSMSFeePerSMS: 1.5,
    networkType: "5G",
    features: [
      "60 GB 超大 5G 流量",
      "用完降速至 10 Mbps 吃到飽",
      "資費固定不超載，免超額上網費"
    ],
    recommendationReason: "通勤看影音、聽音樂，追求高 CP 值資費首選！"
  },
  {
    id: "plan-d",
    name: "學生青春無敵方案 (Student Plan)",
    monthlyFee: 499,
    includedDataGB: 36,
    excessDataFeePerGB: 0,
    includedVoiceMins: 40,
    excessVoiceFeePerMin: 5,
    includedSMS: 20,
    excessSMSFeePerSMS: 1.5,
    networkType: "5G",
    features: [
      "青春校園專屬特惠 (限學生/教職員)",
      "5G 高速 36 GB，用完降速 5 Mbps 吃到飽",
      "超量語音分級優惠：超額前 30 分鐘以 NT$ 5/分計，31 分鐘起以 NT$ 3/分計"
    ],
    recommendationReason: "校園教職員與學生的超值 CP 選擇！"
  }
];
