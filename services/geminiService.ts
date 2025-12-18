import { GoogleGenAI } from "@google/genai";
import { AppData } from "../types";

export interface ReportAnalysisResult {
  fullText: string;
  presentationScript: string;
  executiveSummary: string;
  trendsAndAnomalies: string;
  strategicRecommendations: string;
}

export const generateReportAnalysis = async (data: AppData, month: string): Promise<ReportAnalysisResult> => {
  // Access API key. Vite will replace 'process.env.API_KEY' with the string value at build time.
  const apiKey = process.env.API_KEY;

  if (!apiKey || apiKey === '') {
    console.warn("API Key not found. Please ensure process.env.API_KEY is set.");
    return {
        fullText: "Erro: API Key não configurada.",
        presentationScript: "Não foi possível gerar o roteiro. Chave de API ausente ou inválida.",
        executiveSummary: "Não foi possível gerar o resumo. Verifique as configurações.",
        trendsAndAnomalies: "Indisponível.",
        strategicRecommendations: "Indisponível."
    };
  }

  try {
    const ai = new GoogleGenAI({ apiKey });

    // Calculate advanced metrics for the AI
    const totalAttendance = data.services.reduce((acc, s) => acc + s.total, 0);
    const avgAttendance = data.services.length > 0 ? Math.round(totalAttendance / data.services.length) : 0;
    
    // Demographics breakdown
    const demographics = data.services.reduce((acc, s) => ({
        men: acc.men + s.attendance.men,
        women: acc.women + s.attendance.women,
        adolescents: acc.adolescents + s.attendance.adolescents,
        children: acc.children + s.attendance.children,
        online: acc.online + s.attendance.gmeet
    }), { men: 0, women: 0, adolescents: 0, children: 0, online: 0 });

    const totalDemographics = demographics.men + demographics.women + demographics.adolescents + demographics.children;
    const percentages = {
        men: totalDemographics ? ((demographics.men / totalDemographics) * 100).toFixed(1) : 0,
        women: totalDemographics ? ((demographics.women / totalDemographics) * 100).toFixed(1) : 0,
        youth: totalDemographics ? ((demographics.adolescents / totalDemographics) * 100).toFixed(1) : 0,
    };

    const counselingResolvedRate = data.counseling.length > 0 
        ? ((data.counseling.filter(c => c.resolved).length / data.counseling.length) * 100).toFixed(1) 
        : 0;

    const summary = {
        period: month,
        totalServices: data.services.length,
        totalAttendance,
        avgAttendance,
        demographicsRaw: demographics,
        demographicsPercent: percentages,
        counseling: {
            total: data.counseling.length,
            resolvedRate: `${counselingResolvedRate}%`
        },
        activitiesCount: data.activities.length,
        recentActivityTypes: data.activities.slice(0, 5).map(a => a.type).join(', ')
    };

    const prompt = `
      Atue como um Analista de Dados Sênior e Consultor Estratégico da CADFC.
      Sua tarefa é escrever um relatório mensal de alta performance e um roteiro de apresentação oral.

      DADOS DO PERÍODO (${month}):
      ${JSON.stringify(summary, null, 2)}

      Gere uma resposta estruturada EXATAMENTE com as seguintes seções, separadas por "|||". 
      Use tom profissional, corporativo, direto e elegante. Não use markdown (negrito/italico) dentro das seções, apenas texto puro.

      Seção 1: ROTEIRO DE APRESENTAÇÃO
      Escreva um discurso pronto para ser lido pelo líder na reunião. Deve ser envolvente, começar saudando os presentes, destacar as vitórias (números altos), reconhecer desafios (se houver) e terminar com uma mensagem motivacional baseada nos dados. Use 1ª pessoa do plural ("Nós").

      |||

      Seção 2: RESUMO EXECUTIVO
      Um parágrafo denso e formal resumindo o desempenho geral do mês. Foco em eficiência e crescimento.

      |||

      Seção 3: TENDÊNCIAS E ANOMALIAS
      Analise a demografia (Homens vs Mulheres vs Adolescentes) e a frequência. Aponte se o engajamento online está alto ou baixo. Identifique padrões.

      |||

      Seção 4: RECOMENDAÇÕES ESTRATÉGICAS
      3 ações práticas e numeradas para a liderança implementar no próximo mês visando melhoria dos números.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    const text = response.text || "";
    const parts = text.split('|||');

    return {
        fullText: text,
        presentationScript: parts[0]?.trim() || "Roteiro indisponível.",
        executiveSummary: parts[1]?.trim() || "Resumo indisponível.",
        trendsAndAnomalies: parts[2]?.trim() || "Análise indisponível.",
        strategicRecommendations: parts[3]?.trim() || "Recomendações indisponíveis."
    };

  } catch (error) {
    console.error("Gemini Error:", error);
    return {
        fullText: "",
        presentationScript: "Erro ao gerar roteiro. Verifique a conexão e a chave de API.",
        executiveSummary: "Erro na geração do relatório.",
        trendsAndAnomalies: "",
        strategicRecommendations: ""
    };
  }
};