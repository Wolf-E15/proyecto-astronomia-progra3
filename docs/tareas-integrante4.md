# Tareas — Integrante 4
**Rol:** Estructuras de datos (Grafo, Cola, Pila) + Documentación + Pruebas unitarias

---

## Requisitos previos — instalar antes de empezar

| Herramienta | Descarga |
|-------------|----------|
| Git | https://git-scm.com/downloads |
| .NET SDK 8.0 | https://dotnet.microsoft.com/download/dotnet/8.0 |
| SQL Server Express | https://www.microsoft.com/es-es/sql-server/sql-server-downloads |
| SSMS | https://aka.ms/ssmsfullsetup |

Verificación de instalación:
```bash
git --version
dotnet --version   # debe mostrar 8.0.x
```

---

## Configuración inicial

**1. Clonar el repositorio:**
```bash
git clone https://github.com/eurizar/proyecto-astronomia-progra3.git
cd proyecto-astronomia-progra3
git checkout develop
```

**2. Crear `backend/AstronomiaApp/appsettings.json`** (no está en el repo — debe crearse manualmente):
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

El valor de `TU_SERVIDOR` depende del tipo de instalación:

| Tipo | Valor |
|------|-------|
| SQL Server Developer | `NOMBRE_PC` (ej. `DESKTOP-ABC123`) |
| SQL Server Express | `NOMBRE_PC\SQLEXPRESS` |

**3. Crear la base de datos** en SSMS, ejecutar en orden:
```
database/crear-bd.sql   → conectado a master
database/schema.sql     → conectado a AstronomiaDB
```

**4. Ejecutar la app e importar datos:**
```bash
cd backend/AstronomiaApp
dotnet restore
dotnet run
```
Al tener la app corriendo en `http://localhost:5133`, se debe llamar:
```
POST /api/admin/importar
```

> `appsettings.json` está en `.gitignore` — no debe hacerse `git add appsettings.json`.

---

## Estado actual

| Tarea | Estado |
|-------|--------|
| Cola FIFO manual | ✅ Completo |
| Pila LIFO manual | ✅ Completo |
| Grafo manual | ✅ Completo |
| Pruebas unitarias | ⏳ Pendiente |
| Documento PDF final | ⏳ Pendiente |
| Presentación | ⏳ Pendiente |

---

## 1. Pruebas unitarias (PRIORIDAD ALTA — vale 30% de la nota)

El proyecto de pruebas ya existe en `backend/AstronomiaApp.Tests/`. Solo se deben completar los casos de prueba en cada archivo. Al clonar el repositorio, los archivos ya estarán disponibles.

### ¿Qué son las pruebas unitarias?

Son funciones que verifican que cada estructura de datos se comporta correctamente. Cada prueba llama a un método y verifica el resultado con `Assert`. Si el resultado es el esperado → pasa (verde). Si no → falla (rojo).

```
✅ Passed: Encolar_un_elemento_incrementa_tamanio
✅ Passed: Desencolar_devuelve_primero_en_entrar_FIFO
❌ Failed:  Desencolar_en_cola_vacia_lanza_excepcion
```

### Cola — `ColaTests.cs`

```csharp
[Fact]
public void Encolar_un_elemento_incrementa_tamanio()
{
    var cola = new Cola<string>();
    cola.Encolar("Marte");
    Assert.Equal(1, cola.Tamanio);
}

[Fact]
public void Desencolar_devuelve_primero_en_entrar_FIFO()
{
    var cola = new Cola<string>();
    cola.Encolar("Marte");
    cola.Encolar("Venus");
    Assert.Equal("Marte", cola.Desencolar());
}

[Fact]
public void Desencolar_en_cola_vacia_lanza_excepcion()
{
    var cola = new Cola<string>();
    Assert.Throws<InvalidOperationException>(() => cola.Desencolar());
}

[Fact]
public void ObtenerTodos_devuelve_elementos_en_orden_de_insercion()
{
    var cola = new Cola<string>();
    cola.Encolar("Marte");
    cola.Encolar("Venus");
    cola.Encolar("Jupiter");
    Assert.Equal(new[] { "Marte", "Venus", "Jupiter" }, cola.ObtenerTodos().ToList());
}

[Fact]
public void Limpiar_deja_cola_vacia()
{
    var cola = new Cola<string>();
    cola.Encolar("Marte");
    cola.Limpiar();
    Assert.Equal(0, cola.Tamanio);
}
```

### Pila — `PilaTests.cs`

```csharp
[Fact]
public void Apilar_un_elemento_incrementa_tamanio()
{
    var pila = new Pila<string>();
    pila.Apilar("Saturno");
    Assert.Equal(1, pila.Tamanio);
}

[Fact]
public void Desapilar_devuelve_ultimo_en_entrar_LIFO()
{
    var pila = new Pila<string>();
    pila.Apilar("Mercurio");
    pila.Apilar("Saturno");
    Assert.Equal("Saturno", pila.Desapilar());
}

[Fact]
public void Desapilar_en_pila_vacia_lanza_excepcion()
{
    var pila = new Pila<string>();
    Assert.Throws<InvalidOperationException>(() => pila.Desapilar());
}

[Fact]
public void ObtenerTodos_devuelve_elementos_en_orden_LIFO()
{
    var pila = new Pila<string>();
    pila.Apilar("Mercurio");
    pila.Apilar("Venus");
    pila.Apilar("Saturno");
    Assert.Equal(new[] { "Saturno", "Venus", "Mercurio" }, pila.ObtenerTodos().ToList());
}
```

### Árbol AVL — `ArbolAVLTests.cs`

```csharp
[Fact]
public void Inorden_devuelve_elementos_ordenados_ascendente()
{
    var arbol = new ArbolAVL<string>();
    arbol.Insertar(5.0, "Júpiter");
    arbol.Insertar(1.0, "Mercurio");
    arbol.Insertar(3.0, "Venus");
    Assert.Equal(new[] { "Mercurio", "Venus", "Júpiter" }, arbol.Inorden().ToList());
}

[Fact]
public void BuscarRango_devuelve_solo_elementos_dentro_del_rango()
{
    var arbol = new ArbolAVL<string>();
    arbol.Insertar(1.0, "Mercurio");
    arbol.Insertar(3.0, "Venus");
    arbol.Insertar(10.0, "Júpiter");
    var resultado = arbol.BuscarRango(2.0, 8.0).ToList();
    Assert.Contains("Venus", resultado);
    Assert.DoesNotContain("Mercurio", resultado);
}

[Fact]
public void Insertar_claves_duplicadas_guarda_ambos_valores()
{
    var arbol = new ArbolAVL<string>();
    arbol.Insertar(3.0, "Venus-A");
    arbol.Insertar(3.0, "Venus-B");
    Assert.Equal(2, arbol.Inorden().Count());
}

[Fact]
public void Arbol_vacio_devuelve_lista_vacia()
{
    var arbol = new ArbolAVL<string>();
    Assert.Empty(arbol.Inorden());
    Assert.Empty(arbol.BuscarRango(0, 100));
}
```

### Lista Enlazada — `ListaEnlazadaTests.cs`

```csharp
[Fact]
public void AgregarAlFinal_incrementa_tamanio()
{
    var lista = new ListaEnlazada<string>();
    lista.AgregarAlFinal("Marte");
    lista.AgregarAlFinal("Venus");
    Assert.Equal(2, lista.Tamanio);
}

[Fact]
public void Filtrar_devuelve_solo_elementos_que_cumplen_condicion()
{
    var lista = new ListaEnlazada<string>();
    lista.AgregarAlFinal("Marte");
    lista.AgregarAlFinal("Venus");
    lista.AgregarAlFinal("Mercurio");
    var resultado = lista.Filtrar(x => x.StartsWith("M")).ToList();
    Assert.Contains("Marte", resultado);
    Assert.DoesNotContain("Venus", resultado);
}

[Fact]
public void Limpiar_deja_lista_vacia()
{
    var lista = new ListaEnlazada<string>();
    lista.AgregarAlFinal("Marte");
    lista.Limpiar();
    Assert.True(lista.EstaVacia);
}

[Fact]
public void ObtenerTodos_recorre_en_orden_de_insercion()
{
    var lista = new ListaEnlazada<string>();
    lista.AgregarAlFinal("Marte");
    lista.AgregarAlFinal("Venus");
    lista.AgregarAlFinal("Júpiter");
    Assert.Equal(new[] { "Marte", "Venus", "Júpiter" }, lista.ObtenerTodos().ToList());
}
```

### Tabla Hash — `TablaHashTests.cs`

```csharp
[Fact]
public void Insertar_y_Buscar_devuelve_el_elemento_correcto()
{
    var tabla = new TablaHash<string>();
    tabla.Insertar("sol", "El Sol");
    bool encontrado = tabla.Buscar("sol", out var valor);
    Assert.True(encontrado);
    Assert.Equal("El Sol", valor);
}

[Fact]
public void Buscar_clave_inexistente_devuelve_false()
{
    var tabla = new TablaHash<string>();
    Assert.False(tabla.Buscar("nebulosa", out _));
}

[Fact]
public void Insertar_clave_duplicada_actualiza_el_valor()
{
    var tabla = new TablaHash<string>();
    tabla.Insertar("sol", "v1");
    tabla.Insertar("sol", "v2");
    tabla.Buscar("sol", out var valor);
    Assert.Equal("v2", valor);
}

[Fact]
public void Insertar_multiples_claves_maneja_colisiones()
{
    var tabla = new TablaHash<int>(4);
    tabla.Insertar("a", 1);
    tabla.Insertar("b", 2);
    tabla.Insertar("c", 3);
    tabla.Insertar("d", 4);
    tabla.Insertar("e", 5);
    tabla.Buscar("a", out var va);
    tabla.Buscar("e", out var ve);
    Assert.Equal(1, va);
    Assert.Equal(5, ve);
}
```

### Ejecutar las pruebas

```bash
cd backend/AstronomiaApp.Tests
dotnet test
```

Resultado esperado:

```
Passed! - Failed: 0, Passed: 20, Skipped: 0, Total: 20
```

---

## 2. Documento PDF final

Secciones obligatorias según rúbrica:

1. **Portada** — universidad, curso, integrantes, fecha
2. **Descripción del problema** — qué resuelve el sistema
3. **Objetivos** — general + específicos
4. **Arquitectura del sistema** — diagrama MVC + flujo de datos
5. **Base de datos** — modelo ER + descripción de tablas
6. **Estructuras de datos** — por cada una: descripción, complejidad, dónde se usa, código clave
7. **Algoritmos implementados** — Dijkstra, BFS, búsqueda por rango AVL
8. **Resultados** — capturas de pantalla de cada funcionalidad
9. **Conclusiones** — qué aprendió el equipo, qué mejorarían
10. **Referencias** — API, librerías, documentación utilizada

El contenido ya existente en `docs/` debe usarse como base.

---

## 3. Presentación (10–15 minutos)

### Demo en vivo — orden sugerido

1. Catálogo (530 objetos, filtros, paginación) → **Lista enlazada**
2. Buscar por nombre → **Tabla Hash O(1)**
3. Explorar por rango → **Árbol AVL O(log n)**
4. Grafo → **Grafo manual + Dijkstra**
5. Sistema 3D → consumo de API externa
6. Bitácora → **Cola FIFO** en memoria + historial BD
7. Menú "Visitados" → **Pila LIFO** de navegación

---

## Commit al terminar las pruebas

```bash
git add backend/AstronomiaApp.Tests/
git commit -m "test(estructuras): pruebas unitarias Cola, Pila, AVL, Lista y Hash"
git push origin develop
```
