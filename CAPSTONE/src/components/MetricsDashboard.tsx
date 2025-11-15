import React, { useState, useEffect } from 'react';
import { TrendingUp, Users, Phone, DollarSign, Target, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import type { Lead } from '../App';

interface MetricsDashboardProps {
  leads: Lead[];
}

export function MetricsDashboard({ leads }: MetricsDashboardProps) {
  const totalLeads = leads.length;
  const contacted = leads.filter(l => l.status === 'contacted' || l.status === 'converted' || l.status === 'rejected').length;
  const converted = leads.filter(l => l.status === 'converted').length;
  const conversionRate = contacted > 0 ? (converted / contacted) * 100 : 0;
  const avgScore = leads.reduce((sum, l) => sum + l.predictedScore, 0) / totalLeads;
  const highPriorityLeads = leads.filter(l => l.predictedScore >= 0.7 && l.status === 'pending').length;

  const metrics = [
    {
      title: 'Total Prospek',
      value: totalLeads.toString(),
      icon: Users,
      color: 'bg-blue-500',
      change: null
    },
    {
      title: 'Prioritas Tinggi',
      value: highPriorityLeads.toString(),
      icon: Target,
      color: 'bg-green-500',
      subtitle: 'Skor ≥ 70%'
    },
    {
      title: 'Tingkat Konversi',
      value: `${conversionRate.toFixed(1)}%`,
      icon: TrendingUp,
      color: 'bg-emerald-500',
      subtitle: `${converted} dari ${contacted} kontak`
    },
    {
      title: 'Sudah Dihubungi',
      value: contacted.toString(),
      icon: Phone,
      color: 'bg-indigo-500',
      subtitle: `${((contacted / totalLeads) * 100).toFixed(0)}% dari total`
    },
    {
      title: 'Rata-rata Skor ML',
      value: `${(avgScore * 100).toFixed(0)}%`,
      icon: DollarSign,
      color: 'bg-purple-500',
      subtitle: 'Probabilitas konversi'
    },
    {
      title: 'Efisiensi Waktu',
      value: '+42%',
      icon: Clock,
      color: 'bg-orange-500',
      subtitle: 'vs kampanye sebelumnya'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {metrics.map((metric, index) => (
        <Card key={index} className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-gray-700">{metric.title}</CardTitle>
            <div className={`${metric.color} p-2 rounded-lg`}>
              <metric.icon className="w-4 h-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-gray-900 mb-1">{metric.value}</div>
            {metric.subtitle && (
              <p className="text-gray-500">{metric.subtitle}</p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
