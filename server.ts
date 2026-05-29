import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import { AppData } from './types';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Crucial: body parser
  app.use(express.json({ limit: '10mb' }));

  // API route for AI Reports Analysis
  app.post('/api/reports/analyze', async (req, res) => {
    try {
      const { data, month } = req.body as { data: AppData; month: string };
      
      if (!data || !month) {
        return res.status(400).json({ error: 'Os campos "data" e "month" são obrigatórios.' });
      }

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey || apiKey === '') {
        console.warn('API Key not found in server environment variables.');
        return res.status(500).json({ 
          error: 'A chave da API Gemini não está configurada no servidor.' 
        });
      }

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      // Calculate advanced metrics for the AI query
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
          men: totalDemographics ? ((demographics.men / totalDemographics) * 100).toFixed(1) : '0.0',
          women: totalDemographics ? ((demographics.women / totalDemographics) * 100).toFixed(1) : '0.0',
          youth: totalDemographics ? ((demographics.adolescents / totalDemographics) * 100).toFixed(1) : '0.0',
      };

      const counselingResolvedRate = data.counseling.length > 0 
          ? ((data.counseling.filter(c => c.resolved).length / data.counseling.length) * 100).toFixed(1) 
          : '0.0';

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

      // basic text task uses gemini-3.5-flash
      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: prompt,
      });

      const text = response.text || '';
      const parts = text.split('|||');

      res.json({
          fullText: text,
          presentationScript: parts[0]?.trim() || "Roteiro indisponível.",
          executiveSummary: parts[1]?.trim() || "Resumo indisponível.",
          trendsAndAnomalies: parts[2]?.trim() || "Análise indisponível.",
          strategicRecommendations: parts[3]?.trim() || "Recomendações indisponíveis."
      });
    } catch (error: any) {
      console.error('Gemini error during analysis:', error);
      res.status(500).json({ error: error?.message || 'Erro de processamento no servidor.' });
    }
  });

  // Serve Vite or static compilation based on NODE_ENV
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
