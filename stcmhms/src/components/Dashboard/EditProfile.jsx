import React, { useState, useEffect, useRef } from 'react';
import { X, Download, Filter, BarChart2, List } from 'lucide-react';
import './DashboardCss/EditProfile.css';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import html2canvas from 'html2canvas';
import { db } from '../../Firebase/Firebase'; // adjust your firebase import
import { collection, getDocs } from "firebase/firestore";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';

const gradeOrder = ['7','8','9','10','11','12','College'];
const mentalHealthOrder = ['Excellent','Good','Neutral','Low','Very Low'];
const mhColors = {
  'Excellent': '#22c55e',
  'Good': '#84cc16',
  'Neutral': '#eab308',
  'Low': '#f97316',
  'Very Low': '#ef4444'
};

// Helper: Convert numeric score to category or map string
const getCategory = (score) => {
  if (typeof score === 'string' && isNaN(Number(score))) {
    const match = mentalHealthOrder.find(m => m.toLowerCase() === score.toLowerCase());
    if (match) return match;
  }
  const num = Number(score);
  if (!isNaN(num)) {
    if (num >= 100) return 'Excellent';
    if (num >= 60) return 'Good';
    if (num >= 40) return 'Neutral';
    if (num >= 20) return 'Low';
    return 'Very Low';
  }
  return 'Neutral';
};

const EditProfile = ({ isOpen, onClose }) => {
  const [clients, setClients] = useState([]);
  const [displayClients, setDisplayClients] = useState([]);
  const [filterGrade, setFilterGrade] = useState('');
  const [sortByMental, setSortByMental] = useState(false);
  const [exportStartDate, setExportStartDate] = useState("");
  const [exportEndDate, setExportEndDate] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const chartRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    const fetchClients = async () => {
      setIsLoading(true);
      try {
        const snapshot = await getDocs(collection(db, 'diaryEntries'));
        const data = snapshot.docs.map(doc => {
          const docData = doc.data();
          const category = getCategory(docData.averageMentalHealthScore);
          return {
            id: doc.id,
            ...docData,
            category
          };
        });
        setClients(data);
      } catch (err) {
        console.error('Error fetching clients:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchClients();
  }, [isOpen]);

  useEffect(() => {
    let data = [...clients];

    if (filterGrade) {
      data = data.filter(c => c.gradeLevel === filterGrade);
    }

    if (sortByMental) {
      data.sort((a,b) => {
        const aIdx = mentalHealthOrder.indexOf(a.category);
        const bIdx = mentalHealthOrder.indexOf(b.category);
        if (aIdx !== bIdx) return aIdx - bIdx;
        // Secondary sort: Grade
        return gradeOrder.indexOf(a.gradeLevel) - gradeOrder.indexOf(b.gradeLevel);
      });
    } else {
      // Default sort by grade, then by mental health
      data.sort((a,b) => {
        const gradeProg = gradeOrder.indexOf(a.gradeLevel) - gradeOrder.indexOf(b.gradeLevel);
        if (gradeProg !== 0) return gradeProg;
        return mentalHealthOrder.indexOf(a.category) - mentalHealthOrder.indexOf(b.category);
      });
    }

    setDisplayClients(data);
  }, [clients, filterGrade, sortByMental]);

  // Prepare chart data: Count per grade per mental health score
  const chartData = gradeOrder.map(grade => {
    const gradeClients = displayClients.filter(c => c.gradeLevel === grade);
    const counts = { grade, total: gradeClients.length };
    mentalHealthOrder.forEach(mh => {
      counts[mh] = gradeClients.filter(c => c.category === mh).length;
    });
    return counts;
  }).filter(data => data.total > 0)
    .sort((a, b) => a.total - b.total); // Sort ascending based on total students

  // Helper: filter by date range
  const filterByDateRange = (data) => {
    if (!exportStartDate && !exportEndDate) return data;
    const start = exportStartDate ? new Date(exportStartDate) : null;
    const end = exportEndDate ? new Date(exportEndDate) : null;
    return data.filter(c => {
      if (!c.updatedAt) return false;
      const entryDate = new Date(c.updatedAt.seconds ? c.updatedAt.seconds * 1000 : c.updatedAt);
      if (start && entryDate < start) return false;
      if (end && entryDate > end) return false;
      return true;
    });
  };

  const exportToExcelWithChart = async (byDate = false) => {
    setIsExporting(true);
    try {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Analytics Report');

      // Add Headers
      worksheet.columns = [
        { header: 'Grade Level', key: 'grade', width: 20 },
        { header: 'Mental Health Score', key: 'score', width: 25 },
        { header: 'Category', key: 'category', width: 25 },
      ];

      // Format header row
      worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
      worksheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF4F46E5' },
      };
      
      // Add Data (no names included)
      const exportData = byDate ? filterByDateRange(displayClients) : displayClients;
      exportData.forEach(c => {
        worksheet.addRow({
          grade: c.gradeLevel,
          score: c.averageMentalHealthScore,
          category: c.category
        });
      });

      // ─── SUMMARY BREAKDOWN IN SAME SHEET ───
      worksheet.addRow({});
      worksheet.addRow({});
      
      const summaryTitleRow = worksheet.addRow(['SUMMARY BREAKDOWN']);
      summaryTitleRow.font = { bold: true, size: 14 };
      
      const summaryHeaderRow = worksheet.addRow(['Grade Level', 'Total Students', ...mentalHealthOrder]);
      summaryHeaderRow.font = { bold: true };
      
      chartData.forEach(data => {
        const row = [data.grade, data.total];
        mentalHealthOrder.forEach(mh => row.push(data[mh] || 0));
        worksheet.addRow(row);
      });

      // Capture Chart as Image and stick it to the main worksheet
      if (chartRef.current) {
        const canvas = await html2canvas(chartRef.current, { scale: 2 });
        const imgData = canvas.toDataURL('image/png');
        
        const imageId = workbook.addImage({
          base64: imgData,
          extension: 'png',
        });
        
        // Add chart to the right of the data table (Column K)
        worksheet.addImage(imageId, {
          tl: { col: 10, row: 1 },
          ext: { width: Math.floor(canvas.width / 2.5), height: Math.floor(canvas.height / 2.5) }
        });
      }

      // Generate and save file
      const buffer = await workbook.xlsx.writeBuffer();
      saveAs(new Blob([buffer]), 'MentalHealth_Analytics.xlsx');
    } catch (error) {
      console.error('Export Error:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleClose = () => {
    setFilterGrade('');
    setSortByMental(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="analytics-overlay">
      <div className="analytics-container">
        {/* Header */}
        <div className="analytics-header">
          <div>
            <h2 className="analytics-title">
              <BarChart2 className="title-icon" />
              Student Mental Health Analytics
            </h2>
            <p className="analytics-subtitle">Insights into student well-being across grade levels</p>
          </div>
          <button onClick={handleClose} className="close-btn" aria-label="Close modal">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="analytics-content">
          {/* Controls Menu */}
          <div className="controls-bar">
            <div className="filters-group">
              <div className="filter-item">
                <Filter size={18} className="filter-icon" />
                <select 
                  value={filterGrade} 
                  onChange={e => setFilterGrade(e.target.value)}
                  className="grade-select"
                >
                  <option value="">All Grades</option>
                  {gradeOrder.map(g => (
                    <option key={g} value={g}>Grade {g}</option>
                  ))}
                </select>
              </div>
              
              <label className="checkbox-label">
                <div className="checkbox-custom">
                  <input
                    type="checkbox"
                    checked={sortByMental}
                    onChange={e => setSortByMental(e.target.checked)}
                    value={true}
                  />
                  <div className="checkbox-box"></div>
                </div>
                Sort by Mental Health Score
              </label>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <button 
                onClick={() => exportToExcelWithChart(false)} 
                disabled={displayClients.length === 0 || isExporting}
                className="export-btn"
              >
                <Download size={18} />
                {isExporting ? 'Exporting...' : 'Export Excel (All/Grade)'}
              </button>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 4 }}>
                <input
                  type="date"
                  value={exportStartDate}
                  onChange={e => setExportStartDate(e.target.value)}
                  style={{ fontSize: 12, padding: '2px 4px', borderRadius: 4, border: '1px solid #ccc' }}
                  title="Start date"
                />
                <span style={{ fontSize: 12 }}>to</span>
                <input
                  type="date"
                  value={exportEndDate}
                  onChange={e => setExportEndDate(e.target.value)}
                  style={{ fontSize: 12, padding: '2px 4px', borderRadius: 4, border: '1px solid #ccc' }}
                  title="End date"
                />
                <button
                  onClick={() => exportToExcelWithChart(true)}
                  disabled={displayClients.length === 0 || isExporting || (!exportStartDate && !exportEndDate)}
                  className="export-btn"
                  style={{ fontSize: 12, padding: '4px 8px', marginLeft: 4 }}
                >
                  <Download size={14} /> Export by Date
                </button>
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="loader-container">
              <div className="spinner"></div>
              <p>Loading analytics data...</p>
            </div>
          ) : (
            <div className="dashboard-grid layout-expanded">
              
              <div className="left-column">
                {/* Chart Section */}
                <div className="chart-card">
                  <h3 className="card-title">Score Distribution by Grade Level</h3>
                  {chartData.length > 0 ? (
                    <div className="chart-wrapper" ref={chartRef}>
                      <ResponsiveContainer width="100%" height={350}>
                        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                          <XAxis dataKey="grade" axisLine={false} tickLine={false} />
                          <YAxis axisLine={false} tickLine={false} allowDecimals={false} />
                          <Tooltip 
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                          />
                          <Legend 
                            iconType="circle" 
                            wrapperStyle={{ paddingTop: '20px' }} 
                            payload={mentalHealthOrder.map((mh, index) => (
                              <Bar
                                key={mh}
                                dataKey={mh}
                                name={mh}
                                stackId="a"
                                fill={mhColors[mh]}
                                radius={[4, 4, 4, 4]}
                                isAnimationActive={false}
                              />
                            ))}
                          />
                          {[...mentalHealthOrder].reverse().map(mh => (
                            <Bar key={mh} dataKey={mh} name={mh} stackId="a" fill={mhColors[mh]} radius={[4, 4, 4, 4]} />
                          ))}
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="empty-state">No chart data available for the selected filters.</div>
                  )}
                </div>

                {/* Summary Breakdown Section */}
                <div className="summary-card">
                   <h3 className="card-title">
                     <List size={20} className="title-icon"/> 
                     Summary Breakdown
                   </h3>
                   <div className="summary-list">
                      {chartData.map((data, ix) => (
                        <div key={ix} className="summary-grade-group">
                           <h4 className="summary-grade-title">
                             <span>Grade {data.grade}</span>
                             <span className="total-badge">{data.total} Students</span>
                           </h4>
                           <ul className="summary-details">
                              {mentalHealthOrder.map(mh => (
                                data[mh] > 0 && (
                                  <li key={mh} style={{ borderLeft: `5px solid ${mhColors[mh]}` }}>
                                    <span className="summary-mh-label">{mh}</span> 
                                    <span className="summary-count">{data[mh]}</span>
                                  </li>
                                )
                              ))}
                           </ul>
                        </div>
                      ))}
                      {chartData.length === 0 && (
                        <p className="empty-summary-state">No summaries found.</p>
                      )}
                   </div>
                </div>
              </div>

              {/* Data Table Section */}
              <div className="table-card">
                <h3 className="card-title">Recent Records <span className="record-count">(Showing 10 entries)</span></h3>
                <div className="table-wrapper">
                  <table className="modern-table">
                    <thead>
                      <tr>
                        <th>Grade</th>
                        <th>Mental Health Score</th>
                      </tr>
                    </thead>
                    <tbody>
                      {displayClients.slice(0, 10).map((c, i) => (
                        <tr key={i}>
                          <td>
                            <span className="grade-badge">{c.gradeLevel}</span>
                          </td>
                          <td>
                            <span className="score-badge" style={{ backgroundColor: `${mhColors[c.category] || '#9ca3af'}20`, color: mhColors[c.category] || '#4b5563' }}>
                              <span className="dot" style={{ backgroundColor: mhColors[c.category] || '#9ca3af' }}></span>
                              {c.averageMentalHealthScore} 
                              {(!isNaN(Number(c.averageMentalHealthScore)) && c.category) && ` (${c.category})`}
                            </span>
                          </td>
                        </tr>
                      ))}
                      {displayClients.length === 0 && (
                        <tr>
                          <td colSpan="2" className="empty-state">No records found</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EditProfile;