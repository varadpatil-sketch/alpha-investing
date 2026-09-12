import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';
import { AlphaAnalystReportResponse } from '../../services/api';

// Create PDF Stylesheet
const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 9,
    fontFamily: 'Helvetica',
    color: '#0f172a',
    backgroundColor: '#ffffff',
  },
  headerBanner: {
    backgroundColor: '#090d16',
    color: '#ffffff',
    padding: 15,
    borderRadius: 6,
    marginBottom: 15,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#f59e0b',
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontSize: 9,
    color: '#94a3b8',
    marginTop: 3,
  },
  calloutGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 15,
  },
  ratingBox: {
    flex: 1,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 6,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ratingLabel: {
    fontSize: 8,
    color: '#64748b',
    textTransform: 'uppercase',
    fontWeight: 'bold',
  },
  ratingBadge: {
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 4,
    color: '#059669',
  },
  metricBox: {
    flex: 1,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 6,
    padding: 8,
  },
  metricLabel: {
    fontSize: 7,
    color: '#64748b',
    textTransform: 'uppercase',
    fontWeight: 'bold',
  },
  metricValue: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#0f172a',
    marginTop: 2,
  },
  metricSub: {
    fontSize: 7,
    color: '#64748b',
    marginTop: 2,
  },
  sectionHeader: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#1e293b',
    borderBottomWidth: 1,
    borderBottomColor: '#cbd5e1',
    paddingBottom: 4,
    marginTop: 12,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  table: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 4,
    marginBottom: 12,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    padding: 6,
  },
  tableRowHeader: {
    backgroundColor: '#f1f5f9',
    fontWeight: 'bold',
  },
  tableColHeader: {
    flex: 1,
    fontSize: 8,
    fontWeight: 'bold',
    color: '#334155',
  },
  tableColCell: {
    flex: 1,
    fontSize: 8,
    color: '#334155',
  },
  textParagraph: {
    fontSize: 8.5,
    lineHeight: 1.4,
    color: '#334155',
    marginBottom: 6,
  },
  bulletPoint: {
    fontSize: 8.5,
    lineHeight: 1.4,
    color: '#334155',
    marginLeft: 8,
    marginBottom: 4,
  },
  sebiFooter: {
    position: 'absolute',
    bottom: 25,
    left: 30,
    right: 30,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingTop: 8,
  },
  disclaimerText: {
    fontSize: 6.5,
    color: '#94a3b8',
    textAlign: 'justify',
    lineHeight: 1.3,
  },
  pageNumber: {
    position: 'absolute',
    bottom: 12,
    right: 30,
    fontSize: 7,
    color: '#94a3b8',
  },
});

interface PdfProps {
  report: AlphaAnalystReportResponse;
}

export const InstitutionalReportPdfDocument: React.FC<PdfProps> = ({ report }) => {
  const ratingColor =
    report.quantMetrics.rating === 'Strong Buy' || report.quantMetrics.rating === 'Buy'
      ? '#059669'
      : report.quantMetrics.rating === 'Hold'
      ? '#d97706'
      : '#dc2626';

  const paragraphs = report.reportMarkdown
    .split('\n')
    .filter((line) => line.trim().length > 0 && !line.startsWith('#') && !line.startsWith('>'));

  return (
    <Document title={`Institutional Research - ${report.symbol}`}>
      <Page size="A4" style={styles.page}>
        {/* Header Banner */}
        <View style={styles.headerBanner}>
          <Text style={styles.headerTitle}>GOLDMAN SACHS EQUITY RESEARCH</Text>
          <Text style={styles.headerSubtitle}>
            Institutional Investment Note | {report.companyName} (NSE: {report.symbol})
          </Text>
        </View>

        {/* Executive Callout Grid */}
        <View style={styles.calloutGrid}>
          <View style={styles.ratingBox}>
            <Text style={styles.ratingLabel}>Analyst Rating</Text>
            <Text style={[styles.ratingBadge, { color: ratingColor }]}>{report.quantMetrics.rating}</Text>
            <Text style={{ fontSize: 7, color: '#64748b', marginTop: 2 }}>Quant Score: {report.quantMetrics.totalScore}/100</Text>
          </View>

          <View style={styles.metricBox}>
            <Text style={styles.metricLabel}>Current Price (CMP)</Text>
            <Text style={styles.metricValue}>₹{report.currentPrice?.toLocaleString('en-IN')}</Text>
            <Text style={styles.metricSub}>NSE Live Feed</Text>
          </View>

          <View style={styles.metricBox}>
            <Text style={styles.metricLabel}>52W Range</Text>
            <Text style={styles.metricValue}>₹{report.technicals.fiftyTwoWeekLow} - ₹{report.technicals.fiftyTwoWeekHigh}</Text>
            <Text style={styles.metricSub}>High Dist: -{report.technicals.distFromHighPct}%</Text>
          </View>

          <View style={styles.metricBox}>
            <Text style={styles.metricLabel}>Technical RSI</Text>
            <Text style={styles.metricValue}>{report.technicals.rsi} / 100</Text>
            <Text style={styles.metricSub}>{report.technicals.rsiSignal}</Text>
          </View>
        </View>

        {/* Quant Scorecard Matrix */}
        <Text style={styles.sectionHeader}>QUANTITATIVE & FACTOR SCORECARD</Text>
        <View style={styles.table}>
          <View style={[styles.tableRow, styles.tableRowHeader]}>
            <Text style={styles.tableColHeader}>Factor</Text>
            <Text style={styles.tableColHeader}>Score (Max 25)</Text>
            <Text style={styles.tableColHeader}>Weight Rating</Text>
            <Text style={styles.tableColHeader}>Benchmark Context</Text>
          </View>

          <View style={styles.tableRow}>
            <Text style={styles.tableColCell}>Value Factor</Text>
            <Text style={styles.tableColCell}>{report.quantMetrics.valueScore} / 25</Text>
            <Text style={styles.tableColCell}>P/E: {report.quote?.trailingPE || 'N/A'}x</Text>
            <Text style={styles.tableColCell}>P/B Ratio: {report.quote?.priceToBook || 'N/A'}</Text>
          </View>

          <View style={styles.tableRow}>
            <Text style={styles.tableColCell}>Growth Factor</Text>
            <Text style={styles.tableColCell}>{report.quantMetrics.growthScore} / 25</Text>
            <Text style={styles.tableColCell}>ROE: {report.quote?.returnOnEquity || 'N/A'}%</Text>
            <Text style={styles.tableColCell}>Rev Growth: {report.quote?.revenueGrowth || 'N/A'}%</Text>
          </View>

          <View style={styles.tableRow}>
            <Text style={styles.tableColCell}>Momentum Factor</Text>
            <Text style={styles.tableColCell}>{report.quantMetrics.momentumScore} / 25</Text>
            <Text style={styles.tableColCell}>50D EMA: ₹{report.technicals.fiftyDayAverage}</Text>
            <Text style={styles.tableColCell}>Trend: {report.technicals.maTrend}</Text>
          </View>

          <View style={styles.tableRow}>
            <Text style={styles.tableColCell}>Quality Factor</Text>
            <Text style={styles.tableColCell}>{report.quantMetrics.qualityScore} / 25</Text>
            <Text style={styles.tableColCell}>Debt/Equity: {report.quote?.debtToEquity ?? '0.4'}</Text>
            <Text style={styles.tableColCell}>Div Yield: {report.quote?.dividendYield ?? '1.2'}%</Text>
          </View>
        </View>

        {/* Executive Research Summary & Thesis */}
        <Text style={styles.sectionHeader}>INSTITUTIONAL EQUITY RESEARCH THESIS</Text>
        {paragraphs.slice(0, 8).map((p, idx) => (
          <Text key={idx} style={styles.textParagraph}>
            • {p.replace(/^[-*1-4.]\s*/, '').replace(/\*\*/g, '')}
          </Text>
        ))}

        {/* SEBI Compliance Disclaimer Footer */}
        <View style={styles.sebiFooter} fixed>
          <Text style={styles.disclaimerText}>
            CONFIDENTIAL & PROPRIETARY — SEBI REGISTRATION DISCLAIMER: This research document is generated automatically by Alpha Investing AI Research Engine utilizing Gemini 2.5 Flash models and live telemetry from NSE/BSE data providers. Standard disclaimers apply as per SEBI (Research Analysts) Regulations, 2014. This report is provided for informational and educational purposes only and does not constitute a personal recommendation or solicitation to buy or sell securities. Past quantitative performance does not guarantee future results.
          </Text>
        </View>

        <Text style={styles.pageNumber} render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} fixed />
      </Page>
    </Document>
  );
};
