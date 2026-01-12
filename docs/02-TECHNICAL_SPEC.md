# ⚙️ Especificação Técnica: Solar Explorer 3D (v2.0)

## 1. Arquitetura do Sistema

### 1.1. Stack Tecnológica
* **Frontend:** Next.js 14 (App Router) + React Three Fiber (R3F).
* **Backend:** Next.js API Routes (Serverless Functions).
* **Cache:** Upstash Redis (TTL Dinâmico: 24h para planetas lentos, 1h para rápidos).
* **Assets:** Cloudflare R2 (Texturas WebP e Modelos Draco GLB).

### 1.2. Pipeline de Dados (BFF Pattern)
1.  **Client:** Solicita `/api/ephemeris?body=mars`.
2.  **Server (Next.js):** Verifica Cache (Redis).
3.  **Miss:** Busca na NASA (JPL Horizons) -> Normaliza JSON -> Salva no Cache.
4.  **Hit:** Retorna dados cacheados imediatamente.

## 2. Requisitos de Sistema (Mobile-First)

### 2.1. Sistema de Tiers (Qualidade Adaptativa)
O app deve detectar o hardware na inicialização e definir:

| Tier | Dispositivos | Configuração Gráfica |
| :--- | :--- | :--- |
| **High** | PC Gamer, Apple Silicon | Texturas 4k, Sombras Suaves, Post-Processing (Bloom), Antialiasing Alto. |
| **Mid** | Notebooks, Celulares Top | Texturas 2k, Sombras Simples, Sem Post-Processing. |
| **Low** | Celulares Intermediários | Texturas 1k, Sem Sombras, Malhas Low-Poly, Taxa de atualização limitada. |

### 2.2. Precisão Relativa
Utilizar "Floating Origin" ou reset de câmera para evitar *Z-fighting*.
* **Unidade:** 1 Unidade Three.js = 1.000.000 km.
* **Near Plane:** Ajustável (0.1 a 10).
* **Far Plane:** Ajustável (10.000 a 50.000).

## 3. Segurança e Robustez
* **Rate Limiting:** Implementar limitador na rota de API (ex: 10 req/min por IP) para proteger a chave da NASA.
* **Variáveis de Ambiente:** `NASA_API_KEY` deve estar apenas no lado do servidor (`.env.local`).