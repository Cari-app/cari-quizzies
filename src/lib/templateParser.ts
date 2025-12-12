/**
 * Template Parser Utility
 * 
 * Permite usar variáveis dinâmicas e cálculos em textos do quiz.
 * 
 * Exemplos de uso:
 * - {{nome}} → Substitui pelo valor do campo com ID "nome"
 * - {{peso / (altura * altura)}} → Calcula o IMC
 * - {{idade + 10}} → Soma 10 à idade
 * - {{preco * 0.9}} → Aplica 10% de desconto
 */

export interface TemplateVariables {
  [key: string]: string | number | boolean | null | undefined;
}

/**
 * Avalia uma expressão matemática de forma segura
 * Suporta: +, -, *, /, (), números e variáveis
 */
function safeEvaluate(expression: string, variables: TemplateVariables): number | string {
  try {
    // Substituir variáveis pelos valores
    let processedExpr = expression;
    
    // Encontrar todas as variáveis na expressão
    const varPattern = /[a-zA-Z_][a-zA-Z0-9_]*/g;
    const matches = expression.match(varPattern) || [];
    
    for (const varName of matches) {
      if (varName in variables) {
        const value = variables[varName];
        const numValue = typeof value === 'number' ? value : parseFloat(String(value));
        if (!isNaN(numValue)) {
          processedExpr = processedExpr.replace(new RegExp(`\\b${varName}\\b`, 'g'), String(numValue));
        } else {
          // Se não for um número, retornar como string
          return String(value ?? '');
        }
      }
    }
    
    // Verificar se a expressão contém apenas caracteres permitidos
    const safePattern = /^[\d\s+\-*/().]+$/;
    if (!safePattern.test(processedExpr)) {
      return expression; // Retornar a expressão original se não for segura
    }
    
    // Avaliar a expressão
    const result = Function(`"use strict"; return (${processedExpr})`)();
    
    // Formatar o resultado
    if (typeof result === 'number') {
      // Arredondar para 2 casas decimais se necessário
      return Number.isInteger(result) ? result : Math.round(result * 100) / 100;
    }
    
    return result;
  } catch {
    return expression; // Em caso de erro, retornar a expressão original
  }
}

/**
 * Processa um template substituindo variáveis e calculando expressões
 * 
 * @param template - O texto com placeholders {{variavel}}
 * @param variables - Objeto com os valores das variáveis
 * @returns O texto processado com valores substituídos
 */
export function parseTemplate(template: string, variables: TemplateVariables): string {
  if (!template || typeof template !== 'string') {
    return template || '';
  }
  
  // Padrão para encontrar {{...}}
  const pattern = /\{\{([^}]+)\}\}/g;
  
  return template.replace(pattern, (match, expression: string) => {
    const trimmedExpr = expression.trim();
    
    // Se é uma variável simples (sem operadores)
    if (/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(trimmedExpr)) {
      const value = variables[trimmedExpr];
      if (value !== undefined && value !== null) {
        return String(value);
      }
      return match; // Manter o placeholder se não encontrar
    }
    
    // É uma expressão - avaliar
    const result = safeEvaluate(trimmedExpr, variables);
    return String(result);
  });
}

/**
 * Extrai todas as variáveis usadas em um template
 * 
 * @param template - O texto com placeholders
 * @returns Array com os nomes das variáveis
 */
export function extractVariables(template: string): string[] {
  if (!template || typeof template !== 'string') {
    return [];
  }
  
  const pattern = /\{\{([^}]+)\}\}/g;
  const variables: Set<string> = new Set();
  
  let match;
  while ((match = pattern.exec(template)) !== null) {
    const expression = match[1].trim();
    // Extrair variáveis da expressão
    const varPattern = /[a-zA-Z_][a-zA-Z0-9_]*/g;
    const varMatches = expression.match(varPattern) || [];
    varMatches.forEach(v => variables.add(v));
  }
  
  return Array.from(variables);
}

/**
 * Verifica se um texto contém templates
 */
export function hasTemplates(text: string): boolean {
  if (!text || typeof text !== 'string') {
    return false;
  }
  return /\{\{[^}]+\}\}/.test(text);
}

/**
 * Funções predefinidas úteis para cálculos
 */
export const templateFunctions = {
  // Cálculo de IMC
  imc: (peso: number, altura: number): number => {
    const alturaM = altura > 3 ? altura / 100 : altura; // Converter cm para m se necessário
    return Math.round((peso / (alturaM * alturaM)) * 10) / 10;
  },
  
  // Classificação do IMC
  imcClassificacao: (imc: number): string => {
    if (imc < 18.5) return 'Abaixo do peso';
    if (imc < 25) return 'Peso normal';
    if (imc < 30) return 'Sobrepeso';
    if (imc < 35) return 'Obesidade grau I';
    if (imc < 40) return 'Obesidade grau II';
    return 'Obesidade grau III';
  },
  
  // Peso ideal (fórmula de Lorentz)
  pesoIdeal: (altura: number, sexo: 'M' | 'F'): number => {
    const alturaM = altura > 3 ? altura / 100 : altura;
    const alturaCm = alturaM * 100;
    if (sexo === 'M') {
      return Math.round((alturaCm - 100) - ((alturaCm - 150) / 4));
    }
    return Math.round((alturaCm - 100) - ((alturaCm - 150) / 2.5));
  },
  
  // Arredondar
  round: (value: number, decimals: number = 0): number => {
    const factor = Math.pow(10, decimals);
    return Math.round(value * factor) / factor;
  },
  
  // Capitalizar primeira letra
  capitalize: (text: string): string => {
    if (!text) return '';
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
  },
};
