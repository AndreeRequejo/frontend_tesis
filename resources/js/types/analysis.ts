export type AnalysisResult = {
    severity: 'Limpio' | 'Leve' | 'Moderado' | 'Severo' | 'Ausente' | 'Presencia';
    explanation: string;
};
