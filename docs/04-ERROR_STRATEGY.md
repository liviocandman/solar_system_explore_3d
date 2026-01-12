### 📂 Arquivo 4: `docs/04-ERROR_STRATEGY.md`

Estratégia de resiliência para garantir que o app nunca mostre uma "tela branca".

```markdown
# 🛡️ Estratégia de Erros e Resiliência

## 1. Fallback de Dados (NASA Down)
Se o Backend não conseguir contatar a NASA e não houver cache:
1.  O Backend retorna status `200 OK` mas com um flag `"source": "FALLBACK_DATASET"`.
2.  Utiliza-se um arquivo JSON estático (`fallback_planets.json`) embutido no projeto, contendo posições médias aproximadas.
3.  **UX:** Exibir um "toast" discreto: *"Modo Offline: Posições aproximadas"*.

## 2. Tratamento de Erros WebGL
* **Context Lost:** Se o navegador perder o contexto gráfico (comum em mobile ao trocar de abas), o React deve forçar um `window.location.reload()` ou exibir um botão "Recarregar 3D".
* **GPU Não Suportada:** Exibir uma versão 2D estática (imagem do sistema solar) com links informativos.

## 3. Monitoramento
* **Logs:** Usar `console.error` estruturado no servidor.
* **Vercel Analytics:** Monitorar latência das API Routes.