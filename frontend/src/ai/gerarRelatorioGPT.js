export async function gerarRelatorioGPT(dados) {
  try {
    const response = await fetch('http://localhost:3001/api/gerar-relatorio', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dados }),
    });

    const json = await response.json();
    if (!response.ok) {
      console.error('Erro da API:', json);
      return 'Erro ao gerar relatório.';
    }

    return json.relatorio;
  } catch (error) {
    console.error('Erro ao gerar relatório GPT:', error);
    return 'Erro ao gerar relatório.';
  }
}
