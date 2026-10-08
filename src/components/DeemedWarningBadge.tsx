'use client';

import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface DeemedWarningProps {
  amount?: number;
  className?: string;
}

export const DeemedWarningBadge: React.FC<DeemedWarningProps> = ({ 
  amount = 200000, 
  className = '' 
}) => {
  return (
    <div className={`flex items-start gap-2.5 p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-900 ${className}`}>
      <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
      <div className="text-xs leading-relaxed">
        <span className="font-bold text-amber-800">MANDATORY DEEMED SECURITY DEPOSIT: </span>
        <span>
          MCC requires an upfront refundable security deposit of 
          <strong className="text-amber-950 font-bold"> ₹{amount.toLocaleString('en-IN')}</strong>. 
          Forfeited if seat joined in Round 2 is subsequently resigned.
        </span>
      </div>
    </div>
  );
};
