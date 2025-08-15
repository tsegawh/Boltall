import React, { useState } from 'react';
import { Calendar, Download, FileText, MapPin, Clock, Filter, Search } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Report } from '../types';
import { format, subDays } from 'date-fns';
import jsPDF from 'jspdf';

const Reports: React.FC = () => {
  const { devices } = useAuth();
  const [selectedDevice, setSelectedDevice] = useState<string>('');
  const [reportType, setReportType] = useState<'route' | 'stops' | 'summary'>('route');
  const [startDate, setStartDate] = useState(format(subDays(new Date(), 7), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [loading, setLoading] = useState(false);
  const [reports, setReports] = useState<Report[]>([]);

  const generateReport = async () => {
    if (!selectedDevice) {
      alert('Please select a device');
      return;
    }

    setLoading(true);
    try {
      // Simulate API call to Traccar
      const response = await fetch(`/api/reports/${reportType}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          deviceId: selectedDevice,
          from: new Date(startDate).toISOString(),
          to: new Date(endDate).toISOString()
        })
      });

      if (response.ok) {
        const data = await response.json();
        const newReport: Report = {
          id: Date.now().toString(),
          deviceId: selectedDevice,
          deviceName: devices.find(d => d.id === selectedDevice)?.name || 'Unknown',
          type: reportType,
          startDate,
          endDate,
          data,
          createdAt: new Date().toISOString()
        };
        setReports([newReport, ...reports]);
      } else {
        throw new Error('Failed to generate report');
      }
    } catch (error) {
      console.error('Error generating report:', error);
      // For demo purposes, create a mock report
      const mockReport: Report = {
        id: Date.now().toString(),
        deviceId: selectedDevice,
        deviceName: devices.find(d => d.id === selectedDevice)?.name || 'Unknown',
        type: reportType,
        startDate,
        endDate,
        data: generateMockData(reportType),
        createdAt: new Date().toISOString()
      };
      setReports([mockReport, ...reports]);
    } finally {
      setLoading(false);
    }
  };

  const generateMockData = (type: string) => {
    switch (type) {
      case 'route':
        return {
          totalDistance: 245.6,
          totalTime: '4h 32m',
          averageSpeed: 54.2,
          maxSpeed: 85.0,
          points: [
            { lat: 9.0320, lng: 38.7469, time: '09:00', speed: 45 },
            { lat: 9.0420, lng: 38.7569, time: '09:15', speed: 52 },
            { lat: 9.0520, lng: 38.7669, time: '09:30', speed: 48 }
          ]
        };
      case 'stops':
        return {
          totalStops: 5,
          totalStopTime: '2h 15m',
          stops: [
            { location: 'Bole Road', duration: '45m', time: '10:30' },
            { location: 'Meskel Square', duration: '30m', time: '12:15' },
            { location: 'Piazza', duration: '1h', time: '14:00' }
          ]
        };
      case 'summary':
        return {
          totalDistance: 245.6,
          totalTime: '4h 32m',
          fuelConsumption: '18.5L',
          averageSpeed: 54.2,
          maxSpeed: 85.0,
          totalStops: 5,
          workingHours: '8h 15m'
        };
      default:
        return {};
    }
  };

  const exportToPDF = (report: Report) => {
    const doc = new jsPDF();
    const device = devices.find(d => d.id === report.deviceId);
    
    // Header
    doc.setFontSize(20);
    doc.text('GPS Tracking Report', 20, 20);
    
    doc.setFontSize(12);
    doc.text(`Device: ${device?.name || 'Unknown'}`, 20, 35);
    doc.text(`Report Type: ${report.type.charAt(0).toUpperCase() + report.type.slice(1)}`, 20, 45);
    doc.text(`Period: ${format(new Date(report.startDate), 'MMM dd, yyyy')} - ${format(new Date(report.endDate), 'MMM dd, yyyy')}`, 20, 55);
    doc.text(`Generated: ${format(new Date(report.createdAt), 'MMM dd, yyyy HH:mm')}`, 20, 65);
    
    // Content based on report type
    let yPos = 80;
    
    if (report.type === 'route') {
      doc.text('Route Summary:', 20, yPos);
      yPos += 15;
      doc.text(`Total Distance: ${report.data.totalDistance} km`, 25, yPos);
      yPos += 10;
      doc.text(`Total Time: ${report.data.totalTime}`, 25, yPos);
      yPos += 10;
      doc.text(`Average Speed: ${report.data.averageSpeed} km/h`, 25, yPos);
      yPos += 10;
      doc.text(`Max Speed: ${report.data.maxSpeed} km/h`, 25, yPos);
    } else if (report.type === 'stops') {
      doc.text('Stops Summary:', 20, yPos);
      yPos += 15;
      doc.text(`Total Stops: ${report.data.totalStops}`, 25, yPos);
      yPos += 10;
      doc.text(`Total Stop Time: ${report.data.totalStopTime}`, 25, yPos);
      yPos += 15;
      
      doc.text('Stop Details:', 20, yPos);
      yPos += 10;
      report.data.stops.forEach((stop: any, index: number) => {
        doc.text(`${index + 1}. ${stop.location} - ${stop.duration} (${stop.time})`, 25, yPos);
        yPos += 10;
      });
    }
    
    doc.save(`${report.type}-report-${report.deviceName}-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
  };

  const exportToCSV = (report: Report) => {
    let csvContent = '';
    const device = devices.find(d => d.id === report.deviceId);
    
    // Header
    csvContent += `GPS Tracking Report\n`;
    csvContent += `Device,${device?.name || 'Unknown'}\n`;
    csvContent += `Report Type,${report.type}\n`;
    csvContent += `Start Date,${report.startDate}\n`;
    csvContent += `End Date,${report.endDate}\n`;
    csvContent += `Generated,${report.createdAt}\n\n`;
    
    // Data based on report type
    if (report.type === 'route') {
      csvContent += `Metric,Value\n`;
      csvContent += `Total Distance (km),${report.data.totalDistance}\n`;
      csvContent += `Total Time,${report.data.totalTime}\n`;
      csvContent += `Average Speed (km/h),${report.data.averageSpeed}\n`;
      csvContent += `Max Speed (km/h),${report.data.maxSpeed}\n\n`;
      
      csvContent += `Time,Latitude,Longitude,Speed (km/h)\n`;
      report.data.points.forEach((point: any) => {
        csvContent += `${point.time},${point.lat},${point.lng},${point.speed}\n`;
      });
    } else if (report.type === 'stops') {
      csvContent += `Location,Duration,Time\n`;
      report.data.stops.forEach((stop: any) => {
        csvContent += `${stop.location},${stop.duration},${stop.time}\n`;
      });
    }
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${report.type}-report-${report.deviceName}-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
        <p className="text-gray-600">Generate and export detailed tracking reports</p>
      </div>

      {/* Report Generator */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Generate New Report</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Device</label>
            <select
              value={selectedDevice}
              onChange={(e) => setSelectedDevice(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select Device</option>
              {devices.map(device => (
                <option key={device.id} value={device.id}>{device.name}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Report Type</label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value as 'route' | 'stops' | 'summary')}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="route">Route Report</option>
              <option value="stops">Stops Report</option>
              <option value="summary">Summary Report</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div className="flex items-end">
            <button
              onClick={generateReport}
              disabled={loading || !selectedDevice}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Generating...' : 'Generate'}
            </button>
          </div>
        </div>
      </div>

      {/* Reports List */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Generated Reports</h3>
        </div>
        
        <div className="divide-y divide-gray-200">
          {reports.length === 0 ? (
            <div className="p-8 text-center">
              <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h4 className="text-lg font-medium text-gray-900 mb-2">No reports yet</h4>
              <p className="text-gray-600">Generate your first report to see it here</p>
            </div>
          ) : (
            reports.map((report) => (
              <div key={report.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <FileText className="w-8 h-8 text-blue-600 mr-3" />
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        {report.type.charAt(0).toUpperCase() + report.type.slice(1)} Report - {report.deviceName}
                      </h4>
                      <div className="flex items-center text-sm text-gray-600 mt-1">
                        <Calendar className="w-4 h-4 mr-1" />
                        <span>{format(new Date(report.startDate), 'MMM dd')} - {format(new Date(report.endDate), 'MMM dd, yyyy')}</span>
                        <Clock className="w-4 h-4 ml-4 mr-1" />
                        <span>Generated {format(new Date(report.createdAt), 'MMM dd, HH:mm')}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => exportToPDF(report)}
                      className="flex items-center px-3 py-2 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <Download className="w-4 h-4 mr-1" />
                      PDF
                    </button>
                    <button
                      onClick={() => exportToCSV(report)}
                      className="flex items-center px-3 py-2 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <Download className="w-4 h-4 mr-1" />
                      CSV
                    </button>
                  </div>
                </div>
                
                {/* Report Summary */}
                <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  {report.type === 'route' && (
                    <>
                      <div>
                        <span className="text-gray-600">Distance:</span>
                        <span className="ml-1 font-medium">{report.data.totalDistance} km</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Duration:</span>
                        <span className="ml-1 font-medium">{report.data.totalTime}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Avg Speed:</span>
                        <span className="ml-1 font-medium">{report.data.averageSpeed} km/h</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Max Speed:</span>
                        <span className="ml-1 font-medium">{report.data.maxSpeed} km/h</span>
                      </div>
                    </>
                  )}
                  {report.type === 'stops' && (
                    <>
                      <div>
                        <span className="text-gray-600">Total Stops:</span>
                        <span className="ml-1 font-medium">{report.data.totalStops}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Stop Time:</span>
                        <span className="ml-1 font-medium">{report.data.totalStopTime}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Reports;