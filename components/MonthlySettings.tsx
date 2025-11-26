
import React, { useState, useEffect } from 'react';
import type { MonthlySettings as MonthlySettingsType, Session } from '../types';
import { CalendarIcon } from './icons/CalendarIcon';

interface MonthlySettingsProps {
    currentMonthKey: string;
    settings: MonthlySettingsType | undefined;
    onUpdateSettings: (settings: MonthlySettingsType) => void;
    onGenerateSessions: (sessions: Array<Omit<Session, 'id' | 'playerIds'> & { date: string }>) => void;
}

const MonthlySettings: React.FC<MonthlySettingsProps> = ({ currentMonthKey, settings, onUpdateSettings, onGenerateSessions }) => {
    const [monthlyCourtFee, setMonthlyCourtFee] = useState('');
    const [monthlyShuttlecockPrice, setMonthlyShuttlecockPrice] = useState('');
    const [sessionWaterPrice, setSessionWaterPrice] = useState('');
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        if (settings) {
            setMonthlyCourtFee(settings.monthlyCourtFee.toString());
            setMonthlyShuttlecockPrice(settings.monthlyShuttlecockPrice.toString());
            setSessionWaterPrice(settings.sessionWaterPrice.toString());
        } else {
            setMonthlyCourtFee('');
            setMonthlyShuttlecockPrice('');
            setSessionWaterPrice('');
        }
    }, [settings, currentMonthKey]);

    // Generate all Monday and Wednesday dates for the month
    const generateMonWedSessions = (year: number, month: number, settings: MonthlySettingsType) => {
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const mondays: Date[] = [];
        const wednesdays: Date[] = [];

        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day);
            const dayOfWeek = date.getDay();
            if (dayOfWeek === 1) { // Monday
                mondays.push(date);
            } else if (dayOfWeek === 3) { // Wednesday
                wednesdays.push(date);
            }
        }

        const totalSessions = mondays.length + wednesdays.length;
        if (totalSessions === 0) return [];

        // Court price is equally distributed
        const courtPricePerSession = Math.ceil(settings.monthlyCourtFee / totalSessions / 1000) * 1000;

        // Shuttlecock price uses weights: Monday=1, Wednesday=1.4
        const totalWeight = (mondays.length * 1) + (wednesdays.length * 1.4);
        const shuttlecockBasePrice = settings.monthlyShuttlecockPrice / totalWeight;
        const mondayShuttlecockPrice = Math.ceil((shuttlecockBasePrice * 1) / 1000) * 1000;
        const wednesdayShuttlecockPrice = Math.ceil((shuttlecockBasePrice * 1.4) / 1000) * 1000;

        const sessions = [
            ...mondays.map(date => ({
                date: date.toISOString(),
                courtPrice: courtPricePerSession,
                shuttlecockPrice: mondayShuttlecockPrice,
                waterPrice: settings.sessionWaterPrice,
                drinkPrice: 0,
                isHoliday: false,
            })),
            ...wednesdays.map(date => ({
                date: date.toISOString(),
                courtPrice: courtPricePerSession,
                shuttlecockPrice: wednesdayShuttlecockPrice,
                waterPrice: settings.sessionWaterPrice,
                drinkPrice: 0,
                isHoliday: false,
            }))
        ];

        // Sort by date
        return sessions.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const newSettings: MonthlySettingsType = {
            monthKey: currentMonthKey,
            monthlyCourtFee: parseFloat(monthlyCourtFee) || 0,
            monthlyShuttlecockPrice: parseFloat(monthlyShuttlecockPrice) || 0,
            sessionWaterPrice: parseFloat(sessionWaterPrice) || 0,
        };
        onUpdateSettings(newSettings);

        // Generate sessions for all Mondays and Wednesdays in the month
        const [year, month] = currentMonthKey.split('-').map(Number);
        const sessions = generateMonWedSessions(year, month - 1, newSettings);
        onGenerateSessions(sessions);

        setIsEditing(false);
    };

    const formatCurrency = (amount: number) => {
        return Math.ceil(amount / 1000) * 1000;
    };

    const getMonthName = (monthKey: string) => {
        const [year, month] = monthKey.split('-');
        return new Date(parseInt(year), parseInt(month) - 1).toLocaleString('default', { month: 'long', year: 'numeric' });
    };

    if (!isEditing && settings) {
        return (
            <div className="bg-gray-800 p-6 rounded-lg shadow-xl border border-gray-700">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold flex items-center gap-2">
                        <CalendarIcon className="w-6 h-6 text-cyan-400"/>
                        Monthly Settings
                    </h3>
                    <button
                        onClick={() => setIsEditing(true)}
                        className="text-sm text-cyan-400 hover:text-cyan-300 font-semibold"
                    >
                        Edit
                    </button>
                </div>
                <div className="space-y-3">
                    <div className="flex justify-between items-center text-gray-300">
                        <span>Month:</span>
                        <span className="font-semibold text-white">{getMonthName(currentMonthKey)}</span>
                    </div>
                    <div className="flex justify-between items-center text-gray-300">
                        <span>Monthly Court Fee:</span>
                        <span className="font-semibold text-white">{formatCurrency(settings.monthlyCourtFee).toLocaleString()} VND</span>
                    </div>
                    <div className="flex justify-between items-center text-gray-300">
                        <span>Monthly Shuttlecock:</span>
                        <span className="font-semibold text-white">{formatCurrency(settings.monthlyShuttlecockPrice).toLocaleString()} VND</span>
                    </div>
                    <div className="flex justify-between items-center text-gray-300">
                        <span>Session Water:</span>
                        <span className="font-semibold text-white">{settings.sessionWaterPrice.toLocaleString()} VND</span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gray-800 p-6 rounded-lg shadow-xl border border-gray-700">
            <h3 className="text-xl font-bold flex items-center gap-2 mb-4">
                <CalendarIcon className="w-6 h-6 text-cyan-400"/>
                Monthly Settings - {getMonthName(currentMonthKey)}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="monthlyCourtFee" className="block text-sm font-medium text-gray-300 mb-1">
                        Monthly Court Fee (VND)
                    </label>
                    <input
                        type="number"
                        id="monthlyCourtFee"
                        value={monthlyCourtFee}
                        onChange={(e) => setMonthlyCourtFee(e.target.value)}
                        placeholder="e.g., 2000000"
                        className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                        required
                    />
                </div>
                <div>
                    <label htmlFor="monthlyShuttlecockPrice" className="block text-sm font-medium text-gray-300 mb-1">
                        Monthly Shuttlecock Price (VND)
                    </label>
                    <input
                        type="number"
                        id="monthlyShuttlecockPrice"
                        value={monthlyShuttlecockPrice}
                        onChange={(e) => setMonthlyShuttlecockPrice(e.target.value)}
                        placeholder="e.g., 1000000"
                        className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                        required
                    />
                </div>
                <div>
                    <label htmlFor="sessionWaterPrice" className="block text-sm font-medium text-gray-300 mb-1">
                        Session Water Price (VND per session)
                    </label>
                    <input
                        type="number"
                        id="sessionWaterPrice"
                        value={sessionWaterPrice}
                        onChange={(e) => setSessionWaterPrice(e.target.value)}
                        placeholder="e.g., 10000"
                        className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                        required
                    />
                </div>
                <div className="flex justify-end space-x-3 pt-2">
                    {settings && (
                        <button
                            type="button"
                            onClick={() => setIsEditing(false)}
                            className="py-2 px-4 bg-gray-600 hover:bg-gray-500 text-white font-semibold rounded-md transition"
                        >
                            Cancel
                        </button>
                    )}
                    <button
                        type="submit"
                        className="py-2 px-4 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold rounded-md transition"
                    >
                        Save & Generate Sessions
                    </button>
                </div>
                <p className="text-xs text-gray-400 mt-2">
                    Saving will auto-generate sessions for all Mondays and Wednesdays in {getMonthName(currentMonthKey)}
                </p>
            </form>
        </div>
    );
};

export default MonthlySettings;
