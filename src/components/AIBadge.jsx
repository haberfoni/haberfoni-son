import React from 'react';
import { Bot } from 'lucide-react';

const AIBadge = ({ model, className = '' }) => {
    if (!model) return null;

    return (
        <div className={`flex items-center space-x-1 bg-purple-50 text-purple-700 px-2 py-0.5 rounded border border-purple-100 text-[0.7rem] font-medium ${className}`}>
            <Bot size={12} className="text-purple-500" />
            <span>{model} İle Özgünleştirildi</span>
        </div>
    );
};

export default AIBadge;
