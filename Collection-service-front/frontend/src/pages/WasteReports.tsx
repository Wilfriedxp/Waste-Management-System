import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import './WasteReports.css';

interface Notification {
  id: number;
  address: string;
  waste_type: string;

  estimated_volume: number;
  urgency: string;
  status: string;
  reported_at: string;
}

const WasteReports = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [reports, setReports] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const response = await apiService.getNotifications();
      setReports(response.data.data || []);
    } catch (error) {
      setError('Failed to load reports');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'all', label: 'All' },
    { id: 'pending', label: 'Pending' },
    { id: 'verified', label: 'Verified' },
    { id: 'scheduled_for_cleanup', label: 'Scheduled' },
    { id: 'cleaned', label: 'Cleaned' },
    { id: 'rejected', label: 'Rejected' },
  ];

  const filteredReports = activeTab === 'all'
    ? reports
    : reports.filter(report => report.status === activeTab);

  const getStatusColors = (status: string) => {
    switch (status) {
      case 'pending':
        return { bgColor: '#FFF3E0', color: '#FFA726' };
      case 'verified':
        return { bgColor: '#E3F2FD', color: '#1976D2' };
      case 'scheduled_for_cleanup':
        return { bgColor: '#F3E5F5', color: '#7B1FA2' };
      case 'cleaned':
        return { bgColor: '#E8F5E9', color: '#388E3C' };
      case 'rejected':
        return { bgColor: '#FFEBEE', color: '#D32F2F' };
      default:
        return { bgColor: '#F5F5F5', color: '#757575' };
    }
  };

  if (loading) {
    return (
      <div className="waste-reports-container">
        <div className="text-center">Loading reports...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="waste-reports-container">
        <div className="text-center text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="waste-reports-container">
      <header className="reports-header">
        <h1 className="main-title">My Waste Reports</h1>

        <div className="tabs-container">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </header>

      <div className="reports-list">
        {filteredReports.length === 0 ? (
          <div className="text-center text-gray-500">
            No reports found for this status.
          </div>
        ) : (
          filteredReports.map((report, index) => {
            const colors = getStatusColors(report.status);
            return (
              <div key={report.id} className="report-card">
                <div
                  className="status-badge"
                  style={{
                    backgroundColor: colors.bgColor,
                    color: colors.color,
                    borderLeftColor: colors.color
                  }}
                >
                  {report.status.replace('_', ' ').toUpperCase()}
                </div>

                <div className="report-content">
                  <h3 className="report-title">{report.waste_type.toUpperCase()} Waste</h3>
                  <p className="report-address">{report.address}</p>
                  <p className="report-date">
                    <span className="date-label">Reported:</span> {new Date(report.reported_at).toLocaleDateString()}
                  </p>

                  <div className="action-buttons">
                    {report.status === 'rejected' ? (
                      <button className="action-btn review-btn">
                        Review Issues
                      </button>
                    ) : (
                      <button className="action-btn details-btn">
                        View Details
                      </button>
                    )}
                  </div>
                </div>

                {index < filteredReports.length - 1 && <hr className="divider" />}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default WasteReports;
