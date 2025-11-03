
export interface Player {
    id: string;
    name: string;
}

export interface MonthlySettings {
    monthKey: string; // Format: "YYYY-MM"
    monthlyCourtFee: number;
    monthlyShuttlecockPrice: number;
    sessionWaterPrice: number;
}

export interface Session {
    id:string;
    date: string; // ISO string format
    courtPrice: number;
    shuttlecockPrice: number;
    waterPrice: number;
    drinkPrice: number;
    playerIds: string[];
    isHoliday: boolean;
}
