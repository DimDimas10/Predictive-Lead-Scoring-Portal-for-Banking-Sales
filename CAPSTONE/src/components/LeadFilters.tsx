import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Label } from './ui/label';
import { Slider } from './ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Filter } from 'lucide-react';

interface LeadFiltersProps {
  filters: {
    minScore: number;
    status: string;
    education: string;
    job: string;
  };
  setFilters: (filters: any) => void;
}

export function LeadFilters({ filters, setFilters }: LeadFiltersProps) {
  return (
    <Card className="sticky top-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-gray-900">
          <Filter className="w-5 h-5" />
          Filter & Segmentasi
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <Label>Skor Minimum</Label>
            <span className="text-blue-600">{(filters.minScore * 100).toFixed(0)}%</span>
          </div>
          <Slider
            value={[filters.minScore]}
            onValueChange={(value) => setFilters({ ...filters, minScore: value[0] })}
            min={0}
            max={1}
            step={0.05}
            className="w-full"
          />
          <p className="text-gray-500">
            Tampilkan prospek dengan probabilitas konversi di atas nilai ini
          </p>
        </div>

        <div className="space-y-2">
          <Label>Status Kontak</Label>
          <Select 
            value={filters.status} 
            onValueChange={(value) => setFilters({ ...filters, status: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Status</SelectItem>
              <SelectItem value="pending">Belum Dihubungi</SelectItem>
              <SelectItem value="contacted">Sudah Dihubungi</SelectItem>
              <SelectItem value="converted">Terkonversi</SelectItem>
              <SelectItem value="rejected">Ditolak</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Pendidikan</Label>
          <Select 
            value={filters.education} 
            onValueChange={(value) => setFilters({ ...filters, education: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Tingkat</SelectItem>
              <SelectItem value="primary">SD</SelectItem>
              <SelectItem value="secondary">SMP/SMA</SelectItem>
              <SelectItem value="tertiary">Perguruan Tinggi</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Pekerjaan</Label>
          <Select 
            value={filters.job} 
            onValueChange={(value) => setFilters({ ...filters, job: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Pekerjaan</SelectItem>
              <SelectItem value="management">Manajemen</SelectItem>
              <SelectItem value="technician">Teknisi</SelectItem>
              <SelectItem value="entrepreneur">Wirausaha</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="services">Layanan</SelectItem>
              <SelectItem value="blue-collar">Pekerja Kasar</SelectItem>
              <SelectItem value="student">Pelajar</SelectItem>
              <SelectItem value="unemployed">Tidak Bekerja</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}
