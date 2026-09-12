import React from 'react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { Download, FileText, Loader2 } from 'lucide-react';
import { AlphaAnalystReportResponse } from '../../services/api';
import { InstitutionalReportPdfDocument } from './InstitutionalReportPdfDocument';

interface DownloadPdfButtonProps {
  report: AlphaAnalystReportResponse;
}

export const DownloadPdfButton: React.FC<DownloadPdfButtonProps> = ({ report }) => {
  return (
    <PDFDownloadLink
      document={<InstitutionalReportPdfDocument report={report} />}
      fileName={`Goldman_Sachs_Research_${report.symbol}.pdf`}
      className="inline-flex items-center"
    >
      {({ loading }) => (
        <button
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 disabled:opacity-50 text-slate-950 font-bold rounded-xl text-xs uppercase tracking-wider transition-all shadow-md shadow-amber-500/20"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
              <span>Generating PDF...</span>
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              <span>Download Institutional PDF</span>
            </>
          )}
        </button>
      )}
    </PDFDownloadLink>
  );
};
