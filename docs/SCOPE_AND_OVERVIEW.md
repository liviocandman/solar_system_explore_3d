# 🔭 Visão Geral e Escopo: Solar Explorer 3D (v2.0)

## 1. Visão do Produto
Aplicação web para visualização do Sistema Solar em tempo real, priorizando performance em dispositivos móveis e precisão científica relativa acessível.

## 2. Escopo do MVP (Sprint 1-4)

### ✅ O Que Será Desenvolvido (In-Scope)
* **Corpos Celestes:** Sol, 8 Planetas (Mercúrio a Netuno), Plutão e **apenas a Lua da Terra**.
* **Sistema de Coordenadas:** Heliocêntrico, baseado em efemérides da NASA (JPL Horizons).
* **Visualização:**
    * Escala Didática (Tamanhos inflados para visibilidade).
    * Órbitas elípticas traçadas.
* **Interatividade:**
    * Navegação orbital (Zoom/Pan/Rotate).
    * Foco automático ao clicar no planeta.
    * Painel de informações (Nome, Distância, Velocidade).
* **Infraestrutura:** Next.js (Fullstack) hospedado na Vercel.

### ❌ Fora do Escopo (Out-of-Scope)
* **Constelações e Estrelas Conectadas:** Removido para garantir entrega do MVP. O fundo será uma *Skybox* estática da Via Láctea.
* **Outras Luas:** Luas de Júpiter/Saturno ficam para a Fase 2.
* **Simulação Física:** Não haverá cálculo de gravidade em tempo real (apenas visualização de dados).
* **Login/Contas:** Aplicação pública e stateless.

## 3. Métricas de Sucesso Técnica
* **Performance:** 60 FPS (Desktop), 30 FPS (Mobile - Tier Low).
* **Resiliência:** O sistema deve funcionar (modo degradado) mesmo se a API da NASA cair.
* **Precisão:** Erro posicional relativo < 0.001% (proporcional à distância).