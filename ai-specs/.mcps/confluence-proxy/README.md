# Confluence VPN Proxy MCP Server

Model Context Protocol (MCP) server que permite acceder a Confluence a través de tu VPN local.

## Características

- ✅ Acceso a páginas de Confluence por ID
- ✅ Búsqueda usando CQL (Confluence Query Language)
- ✅ Obtener páginas por espacio y título
- ✅ Funciona con VPN corporativa
- ✅ Autenticación con API Token de Atlassian

## Instalación

```bash
cd ai-specs/.mcps/confluence-proxy
npm install
npm run build
```

## Configuración

### 1. Crear un API Token de Atlassian

1. Ve a: https://id.atlassian.com/manage-profile/security/api-tokens
2. Click en "Create API token"
3. Copia el token generado

### 2. Configurar en `.vscode/mcp.json`

```json
{
  "servers": {
    "confluence-vpn-proxy": {
      "command": "node",
      "args": [
        "C:/Users/User/Desktop/ai-specs-demo/ai-specs/.mcps/confluence-proxy/dist/index.js"
      ],
      "env": {
        "CONFLUENCE_URL": "https://segurosti.atlassian.net",
        "CONFLUENCE_EMAIL": "tu-email@sura.com.co",
        "CONFLUENCE_API_TOKEN": "tu-token-aqui"
      },
      "type": "stdio"
    }
  }
}
```

### 3. Reiniciar VS Code

Cierra y vuelve a abrir VS Code para que cargue el nuevo servidor MCP.

## Herramientas Disponibles

### `get_confluence_page`

Obtiene una página de Confluence por su ID.

```typescript
{
  pageId: "4725702684",
  expand: "body.storage,version,space,ancestors"
}
```

### `search_confluence`

Busca páginas usando CQL.

```typescript
{
  cql: "space=EAV AND type=page AND title~'Polymer'",
  limit: 10
}
```

### `get_page_by_space_and_title`

Obtiene una página por espacio y título exacto.

```typescript
{
  spaceKey: "EAV",
  title: "EML - Migración Polymer Front"
}
```

## Ejemplos de Uso

### En GitHub Copilot Chat

```
@workspace usa el MCP confluence-vpn-proxy para obtener la página 4725702684
```

```
@workspace busca en Confluence páginas sobre migración de Polymer
```

## CQL Examples

```cql
# Páginas en espacio EAV
space=EAV AND type=page

# Páginas con "Polymer" en el título
title~"Polymer"

# Páginas modificadas recientemente
lastModified >= "2025-01-01"

# Combinar criterios
space=EAV AND type=page AND title~"Polymer" AND lastModified >= "2025-01-01"
```

## Troubleshooting

### Error: CONFLUENCE_EMAIL and CONFLUENCE_API_TOKEN are required

Asegúrate de tener las variables de entorno configuradas en `mcp.json`.

### Error 401: Unauthorized

- Verifica que tu API token sea válido
- Confirma que el email sea correcto

### Error 403: Forbidden

- Verifica que tengas permisos para acceder a ese espacio en Confluence
- Asegúrate de estar conectado a la VPN

### No puedo acceder a la página

- Confirma que la VPN esté activa
- Verifica que la URL de Confluence sea correcta
- Intenta acceder a la página manualmente primero

## Arquitectura

```
GitHub Copilot
      ↓
MCP Server (local - con VPN)
      ↓
Confluence API (detrás de VPN)
```

Este MCP se ejecuta localmente en tu máquina, por lo que tiene acceso a recursos detrás de tu VPN corporativa.

## Licencia

MIT
