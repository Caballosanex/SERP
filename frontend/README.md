# Frontend Unificat de SERP

Aquesta és l'aplicació frontend unificada per al Sistema d'Emergències i Resposta Prioritaria (SERP). L'aplicació consolida tres interfícies diferents en una sola aplicació React amb vistes basades en rols.

## Característiques Principals

### Autenticació
- Inici de sessió centralitzat amb detecció de rols
- Redirecció basada en rols després de l'autenticació
- Gestió de tokens JWT
- Persistència de sessió
- Funcionalitat de tancament de sessió a totes les vistes

### Vistes Principals
- **Tauler Principal** (Centre d'Emergències)
- **Vista de Personal de Recursos** (Ambulàncies/Policia/Bombers)
- **Vista d'Operador d'Emergències** (Coordinadors 112)

### Implementació Tècnica
- React Router per a navegació entre diferents vistes
- Redux per a gestió d'estat
- Renderització de components basada en rols
- Rutes protegides basades en permisos d'usuari
- Disseny responsiu que funciona en tots els dispositius
- Canvi de tema clar/fosc que persisteix entre vistes

## Requisits

- Node.js 16+
- npm 7+

## Instal·lació

```bash
# Instal·lar dependències
npm install

# Iniciar l'aplicació en mode desenvolupament
npm start
```

## Estructura del Projecte

- `/src`
  - `/api` - Serveis i configuració d'API
  - `/assets` - Imatges, icones i recursos estàtics
  - `/components` - Components reutilitzables
  - `/context` - Contextos de React (tema, autenticació)
  - `/features` - Components específics de característiques
  - `/hooks` - Hooks personalitzats
  - `/layouts` - Layouts de l'aplicació
  - `/pages` - Pàgines principals
  - `/redux` - Configuració i slices de Redux
  - `/routes` - Configuració de rutes
  - `/theme` - Configuració de temes
  - `/utils` - Utilitats i funcions auxiliars

## Docker

L'aplicació està configurada per executar-se en un contenidor Docker. Pots construir i executar l'aplicació amb:

```bash
docker-compose up frontend
``` 

## Usuaris de prova

- **Administrador**:
  - Email: admin@serp.cat
  - Password: admin123

- **Operador de Recursos**:
  - Email: resource@serp.cat
  - Password: resources123

- **Operador d'Emergències**:
  - Email: operator@serp.cat
  - Password: operator123