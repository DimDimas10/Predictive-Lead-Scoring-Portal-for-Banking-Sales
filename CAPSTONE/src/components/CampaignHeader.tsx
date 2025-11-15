import { Target, Calendar } from 'lucide-react';
import React, { useState, useEffect } from 'react';
export function CampaignHeader() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <div className="bg-blue-600 p-3 rounded-lg">
            <Target className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-gray-900 mb-1">Kampanye Deposito Berjangka Q4 2024</h1>
            <p className="text-gray-600">
              Sistem prediktif untuk memprioritaskan nasabah potensial berdasarkan Machine Learning
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-gray-600 bg-gray-50 px-4 py-2 rounded-lg">
          <Calendar className="w-4 h-4" />
          <span>November 2025</span>
        </div>
      </div>
    </div>
  );
}
