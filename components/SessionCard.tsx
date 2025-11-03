
import React, { useMemo } from 'react';
import type { Player, Session } from '../types';
import { CalendarIcon } from './icons/CalendarIcon';
import { PriceTagIcon } from './icons/PriceTagIcon';
import { TrashIcon } from './icons/TrashIcon';

interface SessionCardProps {
    session: Session;
    allPlayers: Player[];
    onUpdatePlayers: (sessionId: string, playerIds: string[]) => void;
    onUpdateHoliday: (sessionId: string, isHoliday: boolean) => void;
    onDeleteSession: (sessionId: string) => void;
}

const SessionCard: React.FC<SessionCardProps> = ({ session, allPlayers, onUpdatePlayers, onUpdateHoliday, onDeleteSession }) => {
    const totalCost = useMemo(() => {
        return session.courtPrice + session.shuttlecockPrice + session.waterPrice + (session.drinkPrice || 0);
    }, [session]);

    const costPerPlayer = useMemo(() => {
        return session.playerIds.length > 0 ? totalCost / session.playerIds.length : 0;
    }, [totalCost, session.playerIds.length]);

    const handlePlayerToggle = (playerId: string) => {
        const newPlayerIds = session.playerIds.includes(playerId)
            ? session.playerIds.filter(id => id !== playerId)
            : [...session.playerIds, playerId];
        onUpdatePlayers(session.id, newPlayerIds);
    };
    
    const formatCurrency = (amount: number) => {
        const rounded = Math.ceil(amount / 1000) * 1000;
        return rounded.toLocaleString() + ' VND';
    };

    return (
        <div className="bg-gray-800 rounded-lg shadow-xl border border-gray-700 overflow-hidden transition-shadow hover:shadow-cyan-500/20">
            <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                        <div className="flex items-center text-gray-400 text-sm mb-2">
                            <CalendarIcon className="w-4 h-4 mr-2" />
                            <span>{new Date(session.date).toLocaleString()}</span>
                            {session.isHoliday && (
                                <span className="ml-2 px-2 py-0.5 bg-yellow-600/30 border border-yellow-600 text-yellow-400 text-xs rounded-full">Holiday/Off</span>
                            )}
                        </div>
                        <div className="flex items-center space-x-2 mb-3">
                            <input
                                type="checkbox"
                                id={`holiday-${session.id}`}
                                checked={session.isHoliday}
                                onChange={(e) => onUpdateHoliday(session.id, e.target.checked)}
                                className="h-4 w-4 rounded bg-gray-600 border-gray-500 text-yellow-600 focus:ring-yellow-500"
                            />
                            <label htmlFor={`holiday-${session.id}`} className="text-sm text-gray-300 cursor-pointer select-none">
                                Mark as Holiday/Off (exclude from cost calculations)
                            </label>
                        </div>
                        <div className="flex items-center text-2xl font-bold text-cyan-400">
                             <PriceTagIcon className="w-6 h-6 mr-2" />
                            <span>Total: {formatCurrency(totalCost)}</span>
                        </div>
                        {session.playerIds.length > 0 && (
                            <p className="text-lg text-gray-300 mt-1">Cost per player: <span className="font-semibold text-white">{formatCurrency(costPerPlayer)}</span></p>
                        )}
                    </div>
                     <button onClick={() => onDeleteSession(session.id)} className="text-gray-500 hover:text-red-400 p-1.5 rounded-full transition-colors">
                        <TrashIcon className="w-5 h-5"/>
                    </button>
                </div>
                
                <div className="border-t border-gray-700 mt-4 pt-4">
                    <h4 className="font-semibold mb-3 text-gray-200">Check-in Players ({session.playerIds.length})</h4>
                    {allPlayers.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                            {allPlayers.map(player => (
                                <label key={player.id} className={`flex items-center space-x-2 p-2 rounded-md cursor-pointer transition-colors ${session.playerIds.includes(player.id) ? 'bg-cyan-800' : 'bg-gray-700 hover:bg-gray-600'}`}>
                                    <input
                                        type="checkbox"
                                        checked={session.playerIds.includes(player.id)}
                                        onChange={() => handlePlayerToggle(player.id)}
                                        className="h-4 w-4 rounded bg-gray-600 border-gray-500 text-cyan-600 focus:ring-cyan-500"
                                    />
                                    <span className="text-sm text-white select-none">{player.name}</span>
                                </label>
                            ))}
                        </div>
                    ) : (
                         <p className="text-gray-400 text-sm">Add players to the roster to check them in.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SessionCard;
