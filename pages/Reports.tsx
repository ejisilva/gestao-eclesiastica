import React, { useState, useMemo } from 'react';
import { useData } from '../contexts/DataContext';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { FileDown, Sparkles, Loader2, BarChart2, Mic, FileText, Calendar, Filter } from 'lucide-react';
import { generateReportAnalysis, ReportAnalysisResult } from '../services/geminiService';

const MONTHS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

export const Reports = () => {
  const { data } = useData();
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<ReportAnalysisResult | null>(null);
  
  // Filter States
  const [reportType, setReportType] = useState<'monthly' | 'annual'>('monthly');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  // Derived State: Filtered Data
  const filteredData = useMemo(() => {
    const targetYear = selectedYear;
    const targetMonth = selectedMonth;

    const filterByDate = (dateStr: string) => {
        const d = new Date(dateStr);
        // Fix timezone offset issue by treating the string as local date parts if needed, 
        // but typically ISO strings work fine with getMonth if created consistently.
        // For safety with YYYY-MM-DD strings:
        const [y, m, day] = dateStr.split('-').map(Number);
        
        if (reportType === 'annual') {
            return y === targetYear;
        } else {
            // Month in JS Date is 0-indexed, split gives 1-indexed
            return y === targetYear && (m - 1) === targetMonth;
        }
    };

    return {
        services: data.services.filter(s => filterByDate(s.date)),
        members: data.members, // Members are cumulative, usually not filtered by report period unless "joined in"
        counseling: data.counseling.filter(c => filterByDate(c.date)),
        activities: data.activities.filter(a => filterByDate(a.date))
    };
  }, [data, reportType, selectedMonth, selectedYear]);

  // Derived State: Label
  const periodLabel = reportType === 'monthly' 
    ? `${MONTHS[selectedMonth]} de ${selectedYear}`
    : `Ano de ${selectedYear}`;

  const handleAIAnalysis = async () => {
    setIsGeneratingAI(true);
    // Reset previous result if changing filters
    setAnalysisResult(null); 
    
    // Check if there is data
    const hasData = filteredData.services.length > 0 || filteredData.counseling.length > 0 || filteredData.activities.length > 0;
    
    if (!hasData) {
        setAnalysisResult({
            fullText: "",
            presentationScript: "Não há dados suficientes neste período para gerar um roteiro.",
            executiveSummary: "Nenhum registro encontrado para o período selecionado.",
            trendsAndAnomalies: "Sem dados para análise.",
            strategicRecommendations: "Registre atividades para receber recomendações."
        });
        setIsGeneratingAI(false);
        return;
    }

    const result = await generateReportAnalysis(filteredData, periodLabel);
    setAnalysisResult(result);
    setIsGeneratingAI(false);
  };

  const generateHighQualityPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    
    // --- UTILS ---
    const addFooter = (pageNo: number) => {
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text(`CADFC Gestão Eclesiástica | Relatório Confidencial | Pág. ${pageNo}`, 10, pageHeight - 10);
    };

    const addHeader = (title: string) => {
        doc.setFillColor(67, 56, 202); // Indigo 700
        doc.rect(0, 0, pageWidth, 15, 'F');
        doc.setFontSize(10);
        doc.setTextColor(255, 255, 255);
        doc.text("CADFC - Relatório Oficial", 10, 10);
        doc.text(periodLabel, pageWidth - 10, 10, { align: 'right' });
        
        doc.setTextColor(50, 50, 50);
        doc.setFontSize(18);
        doc.text(title, 10, 30);
        doc.setDrawColor(67, 56, 202);
        doc.setLineWidth(0.5);
        doc.line(10, 35, pageWidth - 10, 35);
    };

    // --- PAGE 1: COVER PAGE ---
    // Background
    doc.setFillColor(30, 27, 75); // Indigo 950 (Dark)
    doc.rect(0, 0, pageWidth, pageHeight, 'F');
    
    // Geometric accent
    doc.setFillColor(67, 56, 202); // Indigo 700
    doc.circle(pageWidth, 0, 100, 'F');
    doc.setFillColor(79, 70, 229); // Indigo 600
    doc.circle(0, pageHeight, 80, 'F');

    // Title Block
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(36);
    doc.text("RELATÓRIO", 20, 100);
    doc.text(reportType === 'monthly' ? "MENSAL" : "ANUAL", 20, 115);
    doc.text("DE GESTÃO", 20, 130);

    doc.setFontSize(14);
    doc.setFont("helvetica", "normal");
    doc.text(`PERÍODO: ${periodLabel.toUpperCase()}`, 20, 150);

    doc.setDrawColor(255, 255, 255);
    doc.setLineWidth(1);
    doc.line(20, 160, 100, 160);

    doc.setFontSize(10);
    doc.text("Análise de Crescimento, Frequência e Atividades", 20, 170);
    
    // Bottom Tagline
    doc.setFontSize(10);
    doc.setTextColor(199, 210, 254); // Indigo 200
    doc.text("Documento gerado automaticamente pelo Sistema CADFC", 20, pageHeight - 20);

    // --- PAGE 2: NARRATIVE SCRIPT (If AI exists) ---
    if (analysisResult?.presentationScript) {
        doc.addPage();
        addHeader("Roteiro de Apresentação Oral");
        
        doc.setFontSize(11);
        doc.setTextColor(100, 116, 139); // Slate 500
        doc.text("ESTA PÁGINA CONTÉM O DISCURSO SUGERIDO PARA A LIDERANÇA.", 10, 45);
        
        doc.setFont("times", "italic");
        doc.setFontSize(12);
        doc.setTextColor(30, 41, 59); // Slate 800
        
        const splitScript = doc.splitTextToSize(analysisResult.presentationScript, pageWidth - 40);
        doc.text(splitScript, 20, 60);

        addFooter(2);
    }

    // --- PAGE 3: EXECUTIVE DASHBOARD ---
    doc.addPage();
    addHeader("Dashboard Executivo");

    // Metrics Row
    const metricsY = 45;
    const boxWidth = 45;
    const boxHeight = 25;
    const gap = 5;
    const startX = 10;

    // Helper for Metric Box
    const drawMetric = (x: number, label: string, value: string, sub: string) => {
        doc.setFillColor(248, 250, 252); // Slate 50
        doc.setDrawColor(226, 232, 240); // Slate 200
        doc.roundedRect(x, metricsY, boxWidth, boxHeight, 3, 3, 'FD');
        
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(100, 116, 139);
        doc.text(label.toUpperCase(), x + 5, metricsY + 8);
        
        doc.setFont("helvetica", "bold");
        doc.setFontSize(14);
        doc.setTextColor(15, 23, 42); // Slate 900
        doc.text(value, x + 5, metricsY + 18);

        doc.setFontSize(7);
        doc.setTextColor(79, 70, 229);
        doc.text(sub, x + boxWidth - 5, metricsY + 18, { align: 'right' });
    };

    const totalAttendance = filteredData.services.reduce((acc, s) => acc + s.total, 0);
    const avgAttendance = filteredData.services.length ? Math.round(totalAttendance / filteredData.services.length) : 0;
    const resolvedCounseling = filteredData.counseling.filter(c => c.resolved).length;
    
    drawMetric(startX, "Total Cultos", filteredData.services.length.toString(), "Eventos");
    drawMetric(startX + boxWidth + gap, "Frequência Total", totalAttendance.toString(), "Pessoas");
    drawMetric(startX + (boxWidth + gap) * 2, "Média/Culto", avgAttendance.toString(), "Pessoas");
    drawMetric(startX + (boxWidth + gap) * 3, "Atendimentos", filteredData.counseling.length.toString(), `${resolvedCounseling} Resolvidos`);

    // AI Sections
    let currentY = metricsY + boxHeight + 15;

    if (analysisResult) {
        const sections = [
            { title: "Resumo Estratégico", text: analysisResult.executiveSummary },
            { title: "Tendências e Anomalias", text: analysisResult.trendsAndAnomalies },
            { title: "Recomendações da Consultoria", text: analysisResult.strategicRecommendations }
        ];

        sections.forEach(sec => {
            if (!sec.text) return;
            doc.setFont("helvetica", "bold");
            doc.setFontSize(11);
            doc.setTextColor(67, 56, 202);
            doc.text(sec.title, 10, currentY);
            
            doc.setFont("helvetica", "normal");
            doc.setFontSize(10);
            doc.setTextColor(51, 65, 85);
            const splitText = doc.splitTextToSize(sec.text, pageWidth - 20);
            doc.text(splitText, 10, currentY + 6);
            
            currentY += (splitText.length * 5) + 12;
        });
    }

    addFooter(3);

    // --- PAGE 4: DETAILED DATA ---
    doc.addPage();
    addHeader("Detalhamento Operacional");

    // Table 1: Services
    doc.setFontSize(11);
    doc.setTextColor(30, 30, 30);
    doc.text("Histórico de Cultos e Jornadas", 14, 45);

    autoTable(doc, {
      startY: 50,
      head: [['Data', 'Tipo', 'Homens', 'Mulh.', 'Jovens', 'Crianças', 'Online', 'Total']],
      body: filteredData.services.map(s => [
        new Date(s.date).toLocaleDateString('pt-BR'),
        s.type,
        s.attendance.men,
        s.attendance.women,
        s.attendance.adolescents,
        s.attendance.children,
        s.attendance.gmeet,
        s.total
      ]),
      theme: 'grid',
      headStyles: { fillColor: [30, 41, 59], textColor: 255, fontSize: 9, fontStyle: 'bold' },
      styles: { fontSize: 8, cellPadding: 3, textColor: 50 },
      alternateRowStyles: { fillColor: [241, 245, 249] },
      columnStyles: { 0: { cellWidth: 25 }, 1: { cellWidth: 40 } }
    });

    // Table 2: Activities & Counseling Summary
    const finalY = (doc as any).lastAutoTable.finalY + 15;
    
    // Check if we need a new page
    if (finalY > pageHeight - 60) {
        doc.addPage();
        addHeader("Atividades Externas");
        doc.text("Registro de Atividades Externas", 14, 45);
    } else {
        doc.text("Registro de Atividades Externas", 14, finalY);
    }

    const tableStartY = finalY > pageHeight - 60 ? 50 : finalY + 5;

    autoTable(doc, {
        startY: tableStartY,
        head: [['Data', 'Tipo', 'Descrição', 'Local']],
        body: filteredData.activities.map(a => [
            new Date(a.date).toLocaleDateString('pt-BR'),
            a.type,
            a.description,
            a.location || '-'
        ]),
        theme: 'grid',
        headStyles: { fillColor: [79, 70, 229], textColor: 255, fontSize: 9 },
        styles: { fontSize: 8 },
    });

    addFooter(4);

    doc.save(`Relatorio_${reportType === 'monthly' ? 'Mensal' : 'Anual'}_CADFC_${selectedMonth + 1}_${selectedYear}.pdf`);
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* FILTER CONTROL BAR */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center space-x-2">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                <Filter size={20} />
            </div>
            <div>
                <h3 className="font-bold text-slate-800">Configuração do Relatório</h3>
                <p className="text-xs text-slate-400">Selecione o período desejado</p>
            </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
             {/* Type Toggle */}
             <div className="flex bg-slate-100 p-1 rounded-xl">
                 <button 
                    onClick={() => setReportType('monthly')}
                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${reportType === 'monthly' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-indigo-500'}`}
                 >
                    Mensal
                 </button>
                 <button 
                    onClick={() => setReportType('annual')}
                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${reportType === 'annual' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-indigo-500'}`}
                 >
                    Anual
                 </button>
             </div>

             <div className="h-8 w-px bg-slate-200 hidden md:block"></div>

             {/* Selectors */}
             {reportType === 'monthly' && (
                 <div className="relative">
                    <select 
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(Number(e.target.value))}
                        className="appearance-none bg-slate-50 border border-slate-200 text-slate-700 font-medium py-2 pl-4 pr-10 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm cursor-pointer"
                    >
                        {MONTHS.map((m, idx) => (
                            <option key={m} value={idx}>{m}</option>
                        ))}
                    </select>
                    <Calendar size={14} className="absolute right-3 top-3 text-slate-400 pointer-events-none"/>
                 </div>
             )}

             <div className="relative">
                <select 
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(Number(e.target.value))}
                    className="appearance-none bg-slate-50 border border-slate-200 text-slate-700 font-medium py-2 pl-4 pr-10 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm cursor-pointer"
                >
                    {[0, 1, 2, 3, 4].map(offset => {
                        const y = new Date().getFullYear() - offset;
                        return <option key={y} value={y}>{y}</option>
                    })}
                </select>
                <Calendar size={14} className="absolute right-3 top-3 text-slate-400 pointer-events-none"/>
             </div>
        </div>
      </div>

      {/* Hero Header */}
      <div className="bg-slate-900 rounded-3xl p-10 text-white shadow-2xl relative overflow-hidden border border-slate-800 transition-all duration-500">
        {/* Abstract Background */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-violet-600/20 rounded-full blur-[80px] pointer-events-none"></div>
        
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
                <div className="inline-flex items-center space-x-2 bg-indigo-500/20 border border-indigo-500/30 rounded-full px-3 py-1 mb-6">
                    <Sparkles size={14} className="text-indigo-300" />
                    <span className="text-xs font-medium text-indigo-200 uppercase tracking-wide">Inteligência Artificial Integrada</span>
                </div>
                <h2 className="text-4xl lg:text-5xl font-bold mb-4 tracking-tight leading-tight">
                    Relatório <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-400">{reportType === 'monthly' ? 'Mensal' : 'Anual'}</span>
                </h2>
                <p className="text-slate-400 text-lg leading-relaxed max-w-lg">
                    Analisando dados de <span className="text-white font-bold">{periodLabel}</span>. 
                    Gere documentos prontos para diretoria com um clique.
                </p>
            </div>
            
            <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6 relative">
                 <div className="flex justify-between items-start mb-6">
                     <div>
                         <p className="text-slate-400 text-xs font-bold uppercase">Período Selecionado</p>
                         <p className="text-2xl font-bold">{periodLabel}</p>
                     </div>
                     <BarChart2 className="text-indigo-400" />
                 </div>
                 <div className="space-y-3">
                    <div className="flex justify-between text-sm text-slate-300">
                        <span>Cultos:</span> <span className="font-bold">{filteredData.services.length}</span>
                    </div>
                    <div className="flex justify-between text-sm text-slate-300">
                        <span>Atividades:</span> <span className="font-bold">{filteredData.activities.length}</span>
                    </div>
                     <div className="h-2 bg-slate-700 rounded-full w-full overflow-hidden mt-2">
                         <div className="h-full bg-indigo-500 w-full animate-pulse"></div>
                     </div>
                 </div>
            </div>
        </div>
      </div>

      {/* Main Actions Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Step 1: Generate Analysis */}
        <div className={`lg:col-span-2 rounded-2xl border transition-all duration-300 relative overflow-hidden
            ${analysisResult ? 'bg-white border-emerald-100 shadow-sm' : 'bg-white border-slate-200 shadow-sm hover:shadow-md'}
        `}>
            <div className="p-8">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-slate-800 flex items-center">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center mr-4 ${analysisResult ? 'bg-emerald-100 text-emerald-600' : 'bg-indigo-100 text-indigo-600'}`}>
                            {isGeneratingAI ? <Loader2 className="animate-spin" /> : <Sparkles />}
                        </div>
                        1. Análise Estratégica (IA)
                    </h3>
                    {analysisResult && (
                        <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold flex items-center">
                            Processamento Concluído
                        </span>
                    )}
                </div>

                {!analysisResult ? (
                    <div className="text-center py-8">
                        <p className="text-slate-500 mb-6 max-w-md mx-auto">
                            Clique abaixo para que a IA analise todos os registros de <strong>{periodLabel}</strong> e gere um resumo executivo, roteiro de fala e recomendações.
                        </p>
                        <button 
                            onClick={handleAIAnalysis}
                            disabled={isGeneratingAI}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg shadow-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isGeneratingAI ? 'Gerando Insights...' : 'Iniciar Análise Inteligente'}
                        </button>
                    </div>
                ) : (
                    <div className="space-y-6 animate-fade-in">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                <h4 className="font-bold text-slate-700 mb-2 text-sm flex items-center"><Mic size={14} className="mr-2"/> Prévia do Roteiro</h4>
                                <p className="text-slate-500 text-xs italic line-clamp-4">"{analysisResult.presentationScript}"</p>
                            </div>
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                <h4 className="font-bold text-slate-700 mb-2 text-sm flex items-center"><FileText size={14} className="mr-2"/> Resumo Executivo</h4>
                                <p className="text-slate-500 text-xs line-clamp-4">{analysisResult.executiveSummary}</p>
                            </div>
                        </div>
                        <div className="flex justify-center">
                             <button 
                                onClick={handleAIAnalysis}
                                className="text-indigo-600 text-sm font-medium hover:underline"
                             >
                                Regenerar Análise
                             </button>
                        </div>
                    </div>
                )}
            </div>
        </div>

        {/* Step 2: Export PDF */}
        <div className={`rounded-2xl border p-8 transition-all duration-300 flex flex-col justify-center items-center text-center
             ${analysisResult ? 'bg-indigo-600 border-indigo-500 text-white shadow-xl shadow-indigo-200 scale-105' : 'bg-slate-50 border-slate-200 text-slate-400 opacity-70'}
        `}>
             <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 ${analysisResult ? 'bg-white/20 text-white' : 'bg-white text-slate-300'}`}>
                 <FileDown size={32} />
             </div>
             <h3 className={`text-xl font-bold mb-2 ${analysisResult ? 'text-white' : 'text-slate-500'}`}>2. Gerar PDF Oficial</h3>
             <p className={`text-sm mb-8 ${analysisResult ? 'text-indigo-100' : 'text-slate-400'}`}>
                 {analysisResult 
                    ? 'Seu relatório está pronto. O documento incluirá capa, roteiro, dashboard e tabelas.' 
                    : 'Aguardando análise da IA para liberar a exportação completa.'}
             </p>
             
             <button 
                onClick={generateHighQualityPDF}
                disabled={!analysisResult}
                className={`w-full py-4 rounded-xl font-bold transition-transform active:scale-95
                    ${analysisResult 
                        ? 'bg-white text-indigo-700 hover:bg-indigo-50 shadow-lg' 
                        : 'bg-slate-200 text-slate-400 cursor-not-allowed'}
                `}
             >
                 Baixar Relatório Completo
             </button>
        </div>

      </div>
    </div>
  );
};