
import React, { useState, useMemo } from 'react';
import type { Session, MonthlySettings } from '../types';
import { PlusCircleIcon } from './icons/PlusCircleIcon';

interface AddSessionFormProps {
    onAddSession: (sessionData: Omit<Session, 'id' | 'playerIds'> & { date: string }) => void;
    monthlySettings?: MonthlySettings;
    existingSessions: Session[];
}

// Helper function to count Monday and Wednesday sessions in a month (excluding holidays)
const countMonWedInMonth = (year: number, month: number, existingSessions: Session[]): { mondays: number, wednesdays: number, totalSessions: number } => {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    let mondays = 0;
    let wednesdays = 0;

    // Get existing holiday dates in this month
    const holidayDates = new Set(
        existingSessions
            .filter(s => {
                const sessionDate = new Date(s.date);
                return s.isHoliday &&
                       sessionDate.getFullYear() === year &&
                       sessionDate.getMonth() === month;
            })
            .map(s => new Date(s.date).getDate())
    );

    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);
        const dayOfWeek = date.getDay();
        if (holidayDates.has(day)) continue;

        if (dayOfWeek === 1) { // Monday
            mondays++;
        } else if (dayOfWeek === 3) { // Wednesday
            wednesdays++;
        }
    }
    return { mondays, wednesdays, totalSessions: mondays + wednesdays };
};

const AddSessionForm: React.FC<AddSessionFormProps> = ({ onAddSession, monthlySettings, existingSessions }) => {
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [waterPrice, setWaterPrice] = useState('');
    const [drinkPrice, setDrinkPrice] = useState('');
    const [isHoliday, setIsHoliday] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);

    const calculatedPrices = useMemo(() => {
        if (!monthlySettings) {
            return { courtPrice: 0, shuttlecockPrice: 0, waterPrice: 0 };
        }

        const date = new Date(selectedDate);
        const year = date.getFullYear();
        const month = date.getMonth();
        const dayOfWeek = date.getDay();

        // Check if selected date is Monday or Wednesday
        const isMonday = dayOfWeek === 1;
        const isWednesday = dayOfWeek === 3;
        const isMonOrWed = isMonday || isWednesday;

        if (!isMonOrWed || isHoliday) {
            return { courtPrice: 0, shuttlecockPrice: 0, waterPrice: 0 };
        }

        const counts = countMonWedInMonth(year, month, existingSessions);

        if (counts.totalSessions === 0) {
            return { courtPrice: 0, shuttlecockPrice: 0, waterPrice: 0 };
        }

        // Court price is equally distributed
        const courtPrice = Math.ceil(monthlySettings.monthlyCourtFee / counts.totalSessions / 1000) * 1000;

        // Shuttlecock price uses weights: Monday=1, Wednesday=1.4
        const totalWeight = (counts.mondays * 1) + (counts.wednesdays * 1.4);
        const shuttlecockBasePrice = monthlySettings.monthlyShuttlecockPrice / totalWeight;
        const weight = isMonday ? 1 : 1.4;
        const shuttlecockPrice = Math.ceil((shuttlecockBasePrice * weight) / 1000) * 1000;

        // Water price is from session settings
        const waterPrice = monthlySettings.sessionWaterPrice;

        return { courtPrice, shuttlecockPrice, waterPrice };
    }, [monthlySettings, selectedDate, isHoliday, existingSessions]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const sessionData = {
            date: new Date(selectedDate).toISOString(),
            courtPrice: calculatedPrices.courtPrice,
            shuttlecockPrice: calculatedPrices.shuttlecockPrice,
            waterPrice: waterPrice ? parseFloat(waterPrice) : calculatedPrices.waterPrice,
            drinkPrice: parseFloat(drinkPrice) || 0,
            isHoliday: isHoliday,
        };
        onAddSession(sessionData);
        setSelectedDate(new Date().toISOString().split('T')[0]);
        setWaterPrice('');
        setDrinkPrice('');
        setIsHoliday(false);
        setIsExpanded(false);
    };

    if (!isExpanded) {
        return (
            <button
                onClick={() => setIsExpanded(true)}
                className="w-full flex items-center justify-center space-x-2 py-3 px-4 bg-cyan-600 hover:bg-cyan-700 text-white font-bold rounded-lg shadow-lg transition-transform transform hover:scale-105"
            >
                <PlusCircleIcon className="w-6 h-6" />
                <span>Add New Session</span>
            </button>
        );
    }

    const formatCurrency = (amount: number) => {
        return amount.toLocaleString() + ' VND';
    };

    return (
        <div className="bg-gray-800 p-6 rounded-lg shadow-xl border border-gray-700">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label htmlFor="sessionDate" className="block text-sm font-medium text-gray-300 mb-1">Session Date</label>
                        <input
                            type="date"
                            id="sessionDate"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="waterPrice" className="block text-sm font-medium text-gray-300 mb-1">Water Price (VND) - Optional</label>
                        <input
                            type="number"
                            id="waterPrice"
                            value={waterPrice}
                            onChange={(e) => setWaterPrice(e.target.value)}
                            placeholder={`Default: ${calculatedPrices.waterPrice.toLocaleString()}`}
                            className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                        />
                    </div>
                    <div>
                        <label htmlFor="drinkPrice" className="block text-sm font-medium text-gray-300 mb-1">Drink Price (VND)</label>
                        <input
                            type="number"
                            id="drinkPrice"
                            value={drinkPrice}
                            onChange={(e) => setDrinkPrice(e.target.value)}
                            placeholder="e.g., 15000"
                            className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                        />
                    </div>
                </div>

                <div className="flex items-center space-x-2">
                    <input
                        type="checkbox"
                        id="isHoliday"
                        checked={isHoliday}
                        onChange={(e) => setIsHoliday(e.target.checked)}
                        className="h-4 w-4 rounded bg-gray-600 border-gray-500 text-cyan-600 focus:ring-cyan-500"
                    />
                    <label htmlFor="isHoliday" className="text-sm font-medium text-gray-300">
                        Mark as Holiday (no cost distribution)
                    </label>
                </div>

                {monthlySettings && (
                    <div className="bg-gray-700 p-4 rounded-md space-y-2">
                        <h4 className="text-sm font-semibold text-gray-200">Calculated Costs:</h4>
                        <div className="text-sm text-gray-300 space-y-1">
                            <p>Court Price: <span className="font-semibold text-white">{formatCurrency(calculatedPrices.courtPrice)}</span></p>
                            <p>Shuttlecock Price: <span className="font-semibold text-white">{formatCurrency(calculatedPrices.shuttlecockPrice)}</span></p>
                            <p>Water Price: <span className="font-semibold text-white">{formatCurrency(calculatedPrices.waterPrice)}</span></p>
                            {(isHoliday || new Date(selectedDate).getDay() !== 1 && new Date(selectedDate).getDay() !== 3) && (
                                <p className="text-yellow-400 text-xs mt-2">Note: Costs are 0 for holidays or non-Mon/Wed dates</p>
                            )}
                        </div>
                    </div>
                )}

                {!monthlySettings && (
                    <div className="bg-yellow-900/30 border border-yellow-700 p-3 rounded-md">
                        <p className="text-yellow-400 text-sm">Please set monthly settings first to auto-calculate costs.</p>
                    </div>
                )}

                <div className="flex justify-end space-x-3 pt-2">
                    <button type="button" onClick={() => setIsExpanded(false)} className="py-2 px-4 bg-gray-600 hover:bg-gray-500 text-white font-semibold rounded-md transition">Cancel</button>
                    <button type="submit" className="py-2 px-4 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold rounded-md transition">Confirm Session</button>
                </div>
            </form>
        </div>
    );
};

export default AddSessionForm;
