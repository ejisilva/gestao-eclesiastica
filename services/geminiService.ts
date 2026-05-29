import { AppData } from "../types";

export interface ReportAnalysisResult {
  fullText: string;
  presentationScript: string;
  executiveSummary: string;
  trendsAndAnomalies: string;
  strategicRecommendations: string;
}

export const generateReportAnalysis = async (data: AppData, month: string): Promise<ReportAnalysisResult> => {
  try {
    const response = await fetch('/api/reports/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ data, month }),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || `Erro do servidor: ${response.status}`);
    }

    const result = await response.json();
    return result as ReportAnalysisResult;
  } catch (error) {
    console.error("Erro ao solicitar análise da IA:", error);
    return {
        fullText: "",
        presentationScript: "Erro ao gerar roteiro de apresentação. Chave de API indisponível ou erro no servidor.",
        executiveSummary: "Ocorreu um erro técnico de comunicação ao gerar o resumo executivo.",
        trendsAndAnomalies: "Estatísticas de tendências indisponíveis.",
        strategicRecommendations: "Recomendações indisponíveis devido a problemas com a conexão do servidor de IA."
    };
  }
};
