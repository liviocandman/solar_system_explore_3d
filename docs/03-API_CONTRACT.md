# 📡 Contrato de API (Interface Backend-Frontend)

## Endpoint: Get Ephemeris
Retorna dados orbitais e metadados visuais dos corpos celestes.

**GET** `/api/ephemeris`

### Parâmetros (Query)
| Parâmetro | Tipo | Obrigatório | Descrição |
| :--- | :--- | :--- | :--- |
| `date` | String (ISO) | Não | Data alvo. Padrão: `now`. |
| `ids` | String (CSV) | Não | Filtro de IDs (ex: `499,399`). Padrão: Todos. |

### Exemplo de Resposta (200 OK)
```json
{
  "meta": {
    "timestamp": "2026-01-09T12:00:00Z",
    "source": "CACHE_HIT",
    "ttl_remaining": 3500
  },
  "data": [
    {
      "id": "499",
      "name": "Mars",
      "type": "PLANET",
      "position": {
        "x": 227.9, 
        "y": 0.0, 
        "z": 5.2
      },
      "velocity": {
        "vx": 24.1, 
        "vy": 0.5, 
        "vz": 1.2
      },
      "texture": {
        "low": "[https://assets.solar-explorer.com/mars_1k.webp](https://assets.solar-explorer.com/mars_1k.webp)",
        "high": "[https://assets.solar-explorer.com/mars_4k.webp](https://assets.solar-explorer.com/mars_4k.webp)"
      },
      "render": {
        "scale_factor": 2000,
        "color_hex": "#c1440e"
      }
    }
  ]
}