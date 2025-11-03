
export interface Player {
    id: string;
    name: string;
}

export interface Session {
    id:string;
    date: string; // ISO string format
    courtPrice: number;
    shuttlecockPrice: number;
    waterPrice: number;
    playerIds: string[];
}
