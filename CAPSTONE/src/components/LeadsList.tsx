import React, { useState, useEffect } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Phone, CheckCircle2, XCircle, Clock, TrendingUp, Briefcase, GraduationCap, Calendar, DollarSign } from 'lucide-react';
import type { Lead } from '../App';

interface LeadsListProps {
  leads: Lead[];
  onStatusChange: (leadId: string, status: Lead['status']) => void;
}

export function LeadsList({ leads, onStatusChange }: LeadsListProps) {
  const getScoreColor = (score: number) => {
    if (score >= 0.8) return 'text-green-600 bg-green-50';
    if (score >= 0.6) return 'text-blue-600 bg-blue-50';
    if (score >= 0.4) return 'text-orange-600 bg-orange-50';
    return 'text-red-600 bg-red-50';
  };

  const getStatusBadge = (status: Lead['status']) => {
    const configs = {
      pending: { label: "Pending", variant: "secondary", className: "" }, 
      contacted: { label: "Contacted", variant: "default", className: "" }, 
      converted: { label: "Converted", variant: "default", className: "bg-green-100" },
      rejected: { label: "Rejected", variant: "destructive", className: "" }
    };
    
    const config = configs[status];
    return <Badge variant={config.variant} className={config.className}>{config.label}</Badge>;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getEducationLabel = (education: string) => {
    const labels: Record<string, string> = {
      'primary': 'SD',
      'secondary': 'SMP/SMA',
      'tertiary': 'Perguruan Tinggi'
    };
    return labels[education] || education;
  };

  if (leads.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-gray-500">Tidak ada prospek yang sesuai dengan filter yang dipilih</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-gray-900">Daftar Prospek Prioritas</h2>
          <p className="text-gray-600">
            Menampilkan {leads.length} prospek diurutkan berdasarkan skor ML
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {leads.map((lead, index) => (
          <Card key={lead.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                {/* Priority Badge */}
                <div className="flex items-center gap-3">
                  <div className="flex flex-col items-center justify-center bg-gray-50 rounded-lg p-3 min-w-[60px]">
                    <TrendingUp className="w-5 h-5 text-gray-400 mb-1" />
                    <span className="text-gray-700">#{index + 1}</span>
                  </div>
                </div>

                {/* Lead Info */}
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <h3 className="text-gray-900 mb-2">{lead.name}</h3>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Briefcase className="w-4 h-4" />
                        <span>{lead.job}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <GraduationCap className="w-4 h-4" />
                        <span>{getEducationLabel(lead.education)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-gray-600">
                      <DollarSign className="w-4 h-4" />
                      <span>{formatCurrency(lead.balance)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span>Kontak terakhir: {lead.lastContact}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Phone className="w-4 h-4" />
                      <span>Kampanye ke-{lead.campaign}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div>
                      <p className="text-gray-600 mb-1">Skor Prediksi ML</p>
                      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg ${getScoreColor(lead.predictedScore)}`}>
                        <span>{(lead.predictedScore * 100).toFixed(0)}%</span>
                      </div>
                    </div>
                    <div>
                      {getStatusBadge(lead.status)}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2 lg:min-w-[140px]">
                  {lead.status === 'pending' && (
                    <>
                      <Button 
                        onClick={() => onStatusChange(lead.id, 'contacted')}
                        className="w-full"
                        size="sm"
                      >
                        <Phone className="w-4 h-4 mr-2" />
                        Hubungi
                      </Button>
                    </>
                  )}
                  {lead.status === 'contacted' && (
                    <>
                      <Button 
                        onClick={() => onStatusChange(lead.id, 'converted')}
                        className="w-full bg-green-600 hover:bg-green-700"
                        size="sm"
                      >
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        Konversi
                      </Button>
                      <Button 
                        onClick={() => onStatusChange(lead.id, 'rejected')}
                        variant="outline"
                        className="w-full"
                        size="sm"
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Ditolak
                      </Button>
                    </>
                  )}
                  {(lead.status === 'converted' || lead.status === 'rejected') && (
                    <Button 
                      disabled
                      variant="outline"
                      className="w-full"
                      size="sm"
                    >
                      <Clock className="w-4 h-4 mr-2" />
                      Selesai
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
