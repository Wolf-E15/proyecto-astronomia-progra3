# Proyecto Astronomía — Programación III

Sistema de Exploración y Análisis de Objetos Astronómicos.

**Universidad Mariano Gálvez de Guatemala — Campus Cobán**  
**Ingeniería en Sistemas y Ciencias de la Computación — Programación III**

---

## 1. Descripción del proyecto

Aplicación web que permite explorar, analizar y visualizar información sobre objetos astronómicos (planetas, estrellas, galaxias, exoplanetas, constelaciones y agujeros negros). El sistema consume información desde la Solar System OpenData API, la procesa mediante 6 estructuras de datos manuales y la almacena en SQL Server para consulta y análisis.

Este proyecto corresponde a la **Variante 8** del documento de requerimientos del curso.

### Objetivos

- **General:** integrar los conocimientos del curso (estructuras de datos, POO, persistencia, arquitectura por capas) en un sistema funcional que organice y analice información astronómica real.
- **Específicos:**
  - Implementar 6 estructuras de datos manuales (Lista Enlazada, Tabla Hash, Árbol AVL, Grafo, Cola FIFO, Pila LIFO).
  - Consumir información desde la Solar System OpenData API.
  - Persistir los datos en SQL Server con Entity Framework Core.
  - Ofrecer interfaz web (Razor Views) con búsqueda, ordenamiento, visualización de grafo y sistema 3D.
  - Aplicar control de versiones mediante GitHub y ramas por funcionalidad.

---

## 2. Integrantes del equipo

| Nombre | Carné |
|--------|---------------|
| *1 - Esvin Eliznadro Urizar* | 0902-24-3618 |
| *2 - José Luis Alexander Choc Cuc* | 0902-21-16593 |
| *3 - Herberth Eduardo Coc Chon* | 0902-24-7727 |
| *4 - Jason Isrrael Ajxup Cojoc* | 0902-24-478 |

---

## 3. Estructura del repositorio

```
/
├── backend/
│   ├── AstronomiaApp/                  # Aplicación principal ASP.NET Core MVC
│   │   ├── Controllers/                # MVC controllers
│   │   │   └── Api/                    # Endpoints REST (/api/*)
│   │   ├── EstructurasDatos/           # 6 estructuras de datos manuales
│   │   ├── Models/                     # Entidades EF Core
│   │   │   └── ViewModels/             # DTOs para Razor Views
│   │   ├── Services/                   # Lógica de negocio
│   │   ├── Views/                      # Razor Views (.cshtml)
│   │   │   ├── Admin/
│   │   │   ├── Grafo/
│   │   │   ├── Home/
│   │   │   ├── Objetos/
│   │   │   └── Shared/
│   │   └── wwwroot/                    # Estáticos (CSS, JS, texturas)
│   └── prototipo-api/                  # Prototipo consola Fase 1 (referencia)
├── database/
│   ├── crear-bd.sql                    # Crear base de datos
│   ├── schema.sql                      # Crear tablas
│   ├── seed.sql                        # Datos iniciales (opcional)
│   └── reset.sql                       # Limpiar y reiniciar BD
├── docs/                               # Documentación del proyecto
│   ├── arquitectura.md
│   ├── estructuras.md
│   ├── modelo-datos.md
│   ├── api-contract.md
│   ├── convenciones.md
│   ├── tareas-integrante4.md
│   └── revision-1.md
├── .gitignore
└── README.md
```

> No existe carpeta `/frontend` separada. Las vistas Razor, CSS y JavaScript están integrados en `backend/AstronomiaApp/Views/` y `backend/AstronomiaApp/wwwroot/`.

---

## 4. Tecnologías utilizadas

| Capa | Tecnología |
|------|------------|
| Framework web | ASP.NET Core MVC (.NET 8) |
| Vistas (UI) | Razor Views (.cshtml) + Bootstrap 5 + CSS3 + JavaScript |
| Base de datos | SQL Server 2019+ / Azure SQL |
| ORM | Entity Framework Core 8 |
| API externa | Solar System OpenData API (`api.le-systeme-solaire.net`) |
| Visualización grafo | D3.js |
| Tipografía | Cormorant Garamond + JetBrains Mono |
| Control de versiones | Git + GitHub |

---

## 5. Estructuras de datos implementadas

Todas las implementaciones son manuales en `backend/AstronomiaApp/EstructurasDatos/`. No se usan colecciones del framework.

| Estructura | Archivo | Complejidad clave | Uso en el sistema |
|------------|---------|-------------------|-------------------|
| Lista Enlazada (doble) | `ListaEnlazada.cs` | O(1) inserción | Catálogo de 530+ objetos en memoria |
| Tabla Hash | `TablaHash.cs` | O(1) búsqueda | Búsqueda exacta por nombre |
| Árbol AVL | `ArbolAVL.cs` | O(log n) rango | Búsqueda por rango numérico |
| Grafo (lista adyacencia) | `Grafo.cs` | Dijkstra / BFS | Relaciones entre objetos y ruta mínima |
| Cola FIFO | `Cola.cs` | O(1) encolar/desencolar | Registro de consultas en lotes |
| Pila LIFO | `Pila.cs` | O(1) push/pop | Historial de páginas visitadas |

---

## 6. Funcionalidades del sistema

| Página | Ruta | Descripción | Estructura usada |
|--------|------|-------------|------------------|
| Catálogo | `/` | Lista paginada de 530+ objetos con filtro por tipo | Lista Enlazada |
| Buscar | `/Objetos/Buscar` | Búsqueda exacta + parcial por nombre | Tabla Hash O(1) |
| Explorar | `/Objetos/BuscarRango` | Búsqueda por rango: distancia, masa, radio, temperatura | Árbol AVL O(log n) |
| Grafo | `/Grafo` | Visualización D3.js, ruta Dijkstra, exploración BFS | Grafo manual |
| Sistema 3D | `/Objetos/Sistema` | Simulación interactiva del sistema solar con texturas 2K | API externa |
| Bitácora | `/Admin/Consultas` | Log paginado de todas las consultas (hora Guatemala UTC-6) | Cola FIFO |
| Visitados | Navbar dropdown | Historial de los últimos 10 objetos visitados | Pila LIFO |

### API REST

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/objetos` | Lista objetos (paginado) |
| GET | `/api/objetos/{id}` | Detalle de objeto |
| GET | `/api/objetos/buscar?nombre=` | Búsqueda por nombre |
| GET | `/api/objetos/ordenar?campo=` | Ordenar por campo |
| GET | `/api/objetos/rango?campo=&min=&max=` | Búsqueda por rango |
| GET | `/api/grafo/vecinos/{id}` | Vecinos de un nodo |
| GET | `/api/grafo/ruta?desde=&hasta=` | Ruta Dijkstra |
| GET | `/api/grafo/sistema/{id}` | Exploración BFS |
| POST | `/api/admin/importar` | Importar datos desde API externa |
| GET | `/api/admin/cola` | Estado de la cola de consultas |
| GET | `/api/health` | Health check del sistema |

---

## 7. Modelo de datos

```
TipoObjeto        Constelacion      SistemaPlanetario
     │                  │                   │
     └──────────────────┼───────────────────┘
                        │
                 ObjetoAstronomico ─── Relacion ─── ObjetoAstronomico
                        │
                   ConsultaLog
```

| Tabla | Descripción |
|-------|-------------|
| `ObjetoAstronomico` | 530+ objetos con masa, radio, distancia, temperatura, luminosidad |
| `TipoObjeto` | Planeta, Estrella, Galaxia, Exoplaneta, Constelacion, AgujerosNegros |
| `SistemaPlanetario` | Sistemas planetarios con estrella central |
| `Constelacion` | 88 constelaciones con abreviatura |
| `Relacion` | Aristas del grafo con peso (distancia en UA) |
| `ConsultaLog` | Log de búsquedas con duración y conteo de resultados |

---

## 8. Instrucciones de instalación

### Requisitos previos

| Herramienta | Descarga |
|-------------|----------|
| Git | https://git-scm.com/downloads |
| .NET SDK 8.0 | https://dotnet.microsoft.com/download/dotnet/8.0 |
| SQL Server Express | https://www.microsoft.com/es-es/sql-server/sql-server-downloads |
| SSMS | https://aka.ms/ssmsfullsetup |

Verificar instalación:
```bash
git --version
dotnet --version   # debe mostrar 8.0.x
```

### Pasos

**1. Clonar el repositorio**
```bash
git clone https://github.com/eurizar/proyecto-astronomia-progra3.git
cd proyecto-astronomia-progra3
git checkout develop
```

**2. Crear `backend/AstronomiaApp/appsettings.json`**

Este archivo **no está en el repositorio** (está en `.gitignore`). Crearlo manualmente:

```json
{
  "ConnectionStrings": {
    "AstronomiaDB": "Server=TU_SERVIDOR;Database=AstronomiaDB;Trusted_Connection=True;TrustServerCertificate=True;"
  },
  "SolarSystemApi": {
    "ApiKey": "3bba602f-94b5-4c2a-ad34-2eb2ae0259cd"
  },
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning"
    }
  },
  "AllowedHosts": "*"
}
```

Reemplazar `TU_SERVIDOR`:

| Tipo | Valor |
|------|-------|
| SQL Server Developer | `NOMBRE_PC` (ej. `DESKTOP-ABC123`) |
| SQL Server Express | `NOMBRE_PC\SQLEXPRESS` |

**3. Crear la base de datos**

En SSMS, ejecutar en orden:
```
database/crear-bd.sql   → conectado a master
database/schema.sql     → conectado a AstronomiaDB
```

**4. Ejecutar la aplicación**
```bash
cd backend/AstronomiaApp
dotnet restore
dotnet run
```

**5. Importar datos**

Con la app corriendo en `http://localhost:5133`, llamar:
```
POST http://localhost:5133/api/admin/importar
```

Esto importa ~530 objetos desde la Solar System OpenData API y los carga en las estructuras de datos en memoria.

> **Importante:** nunca ejecutar `git add appsettings.json` — contiene credenciales locales.

---

## 9. Flujo de trabajo con Git

- `main` — rama estable. Solo merges por Pull Request desde `develop`.
- `develop` — rama de integración. Todo avance se fusiona aquí primero.
- `feature/<nombre>` — una rama por funcionalidad, creada desde `develop`.

```bash
git checkout develop
git pull origin develop
git checkout -b feature/mi-funcionalidad
# ... trabajar ...
git add archivo.cs
git commit -m "feat(area): descripción breve"
git push origin feature/mi-funcionalidad
# Crear Pull Request hacia develop en GitHub
```

Ver [docs/convenciones.md](docs/convenciones.md) para convenciones de commits y ramas.

---

## 10. Pruebas unitarias

Proyecto en `backend/AstronomiaApp.Tests/`.

| Archivo | Estructura |
|---------|------------|
| `ColaTests.cs` | Cola FIFO |
| `PilaTests.cs` | Pila LIFO |
| `ArbolAVLTests.cs` | Árbol AVL |
| `ListaEnlazadaTests.cs` | Lista Enlazada |
| `TablaHashTests.cs` | Tabla Hash |

```bash
cd backend/AstronomiaApp.Tests
dotnet test
```

Ver [docs/tareas-integrante4.md](docs/tareas-integrante4.md) para los casos de prueba detallados.

---

## 11. Estado del proyecto

| Componente | Estado |
|------------|--------|
| Lista Enlazada | ✅ Completo |
| Tabla Hash | ✅ Completo |
| Árbol AVL + búsqueda por rango | ✅ Completo |
| Grafo + Dijkstra + BFS | ✅ Completo |
| Cola FIFO | ✅ Completo |
| Pila LIFO (historial visitados) | ✅ Completo |
| Catálogo (paginado + filtros) | ✅ Completo |
| Búsqueda por nombre (Hash) | ✅ Completo |
| Explorar por rango (AVL) | ✅ Completo |
| Grafo visual D3.js | ✅ Completo |
| Sistema 3D interactivo | ✅ Completo |
| Bitácora de consultas | ✅ Completo |
| Historial Visitados (navbar) | ✅ Completo |
| Despliegue Azure | ✅ Completo |
| Pruebas unitarias | ✅ Completo |
| Documento PDF final | ✅ Completo |
| Presentación | ✅ Completo |

---

## 12. Documentación adicional

| Documento | Contenido |
|-----------|-----------|
| [docs/arquitectura.md](docs/arquitectura.md) | Diagrama MVC + flujo de datos |
| [docs/estructuras.md](docs/estructuras.md) | Descripción y complejidad de cada estructura |
| [docs/modelo-datos.md](docs/modelo-datos.md) | Modelo ER + descripción de tablas |
| [docs/api-contract.md](docs/api-contract.md) | Especificación de endpoints REST |
| [docs/convenciones.md](docs/convenciones.md) | Convenciones de código y Git |
| [docs/tareas-integrante4.md](docs/tareas-integrante4.md) | Tareas, setup y pruebas unitarias — Integrante 4 |

---

## 13. Licencia

Proyecto académico — uso exclusivo para fines educativos del curso de Programación III.
