
import React, { useMemo, useState } from 'react';
import type { Player, Session } from '../types';
import { ChartBarIcon } from './icons/ChartBarIcon';
import { ChevronLeftIcon } from './icons/ChevronLeftIcon';
import { ChevronRightIcon } from './icons/ChevronRightIcon';

interface MonthlySummaryProps {
    sessions: Session[];
    players: Player[];
}

const MonthlySummary: React.FC<MonthlySummaryProps> = ({ sessions, players }) => {
    const [currentDate, setCurrentDate] = useState(new Date());

    const monthlyCosts = useMemo(() => {
        const costs: { [playerId: string]: number } = {};
        players.forEach(player => costs[player.id] = 0);

        const currentMonth = currentDate.getMonth();
        const currentYear = currentDate.getFullYear();

        const filteredSessions = sessions.filter(session => {
            const sessionDate = new Date(session.date);
            return sessionDate.getMonth() === currentMonth && sessionDate.getFullYear() === currentYear;
        });

        filteredSessions.forEach(session => {
            const totalCost = session.courtPrice + session.shuttlecockPrice + session.waterPrice + (session.drinkPrice || 0);
            const numPlayers = session.playerIds.length;
            if (numPlayers > 0) {
                const costPerPlayer = totalCost / numPlayers;
                session.playerIds.forEach(playerId => {
                    if (costs[playerId] !== undefined) {
                        costs[playerId] += costPerPlayer;
                    }
                });
            }
        });

        return players
            .map(player => ({
                ...player,
                totalOwed: costs[player.id] || 0,
            }))
            .filter(p => p.totalOwed > 0)
            .sort((a, b) => b.totalOwed - a.totalOwed);

    }, [sessions, players, currentDate]);

    const changeMonth = (offset: number) => {
        setCurrentDate(prevDate => {
            const newDate = new Date(prevDate);
            newDate.setMonth(newDate.getMonth() + offset);
            return newDate;
        });
    };
    
    const formatCurrency = (amount: number) => {
        const rounded = Math.ceil(amount / 1000) * 1000;
        return rounded.toLocaleString() + ' VND';
    };

    return (
        <div className="bg-gray-800 p-6 rounded-lg shadow-xl border border-gray-700">
            <div className="flex justify-between items-center mb-4">
                 <h3 className="text-xl font-bold flex items-center gap-2"><ChartBarIcon className="w-6 h-6 text-cyan-400"/> Monthly Summary</h3>
                 <div className="flex items-center">
                    <button onClick={() => changeMonth(-1)} className="p-1 text-gray-400 hover:text-white"><ChevronLeftIcon className="w-5 h-5"/></button>
                    <span className="w-32 text-center font-semibold">{currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</span>
                    <button onClick={() => changeMonth(1)} className="p-1 text-gray-400 hover:text-white"><ChevronRightIcon className="w-5 h-5"/></button>
                 </div>
            </div>
            
            <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
                {monthlyCosts.length > 0 ? monthlyCosts.map(player => (
                    <div key={player.id} className="flex justify-between items-center bg-gray-700 p-3 rounded-md">
                        <span className="font-medium text-gray-200">{player.name}</span>
                        <span className="font-bold text-cyan-400">{formatCurrency(player.totalOwed)}</span>
                    </div>
                )) : <p className="text-gray-400 text-center py-4">No costs recorded for this month.</p>}
            </div>
        </div>
    );
};

export default MonthlySummary;
