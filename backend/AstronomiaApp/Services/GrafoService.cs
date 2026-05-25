using AstronomiaApp.Data;
using AstronomiaApp.EstructurasDatos;
using AstronomiaApp.Models.ViewModels;
using Microsoft.EntityFrameworkCore;

namespace AstronomiaApp.Services;

/// <summary>Servicio que construye y consulta el grafo de relaciones astronómicas.</summary>
public class GrafoService
{
    private readonly AstronomiaDbContext _db;
    private readonly ILogger<GrafoService> _logger;
    private readonly Grafo _grafo = new();
    private bool _cargado = false;

    public GrafoService(AstronomiaDbContext db, ILogger<GrafoService> logger)
    {
        _db = db;
        _logger = logger;
    }

    /// <summary>Carga nodos y aristas desde BD al grafo en memoria.</summary>
    public async Task CargarGrafoAsync()
    {
        if (_cargado) return;

        _grafo.Limpiar();

        var objetos = await _db.ObjetosAstronomicos.Include(o => o.Tipo).ToListAsync();
        foreach (var obj in objetos)
            _grafo.AgregarNodo(obj.Id, obj.Nombre);

        var relaciones = await _db.Relaciones.ToListAsync();
        foreach (var rel in relaciones)
            _grafo.AgregarArista(rel.OrigenId, rel.DestinoId, rel.DistanciaAl ?? 1, rel.TipoRelacion ?? "");

        _cargado = true;
        _logger.LogInformation("Grafo cargado: {Nodos} nodos, {Aristas} aristas",
            _grafo.CantidadNodos, _grafo.CantidadAristas);
    }

    public void InvalidarCache() => _cargado = false;

    // ── Consultas ────────────────────────────────────────────────────────

    // Offset para evitar colisión de IDs entre Objeto.Id y Constelacion.Id en el grafo.
    public const int CONSTELACION_ID_OFFSET = 1_000_000;

    public async Task<GrafoViewModel> ObtenerGrafoCompletoAsync()
    {
        await CargarGrafoAsync();

        var objetos = await _db.ObjetosAstronomicos.Include(o => o.Tipo).ToListAsync();
        var relaciones = await _db.Relaciones.ToListAsync();

        // Solo constelaciones que tengan al menos un objeto asociado.
        var constelacionIdsUsadas = objetos
            .Where(o => o.ConstelacionId.HasValue)
            .Select(o => o.ConstelacionId!.Value)
            .Distinct()
            .ToHashSet();

        var constelaciones = await _db.Constelaciones
            .Where(c => constelacionIdsUsadas.Contains(c.Id))
            .ToListAsync();

        // Nodos: objetos + constelaciones
        var nodos = objetos.Select(o => new NodoGrafoViewModel
        {
            Id = o.Id,
            Nombre = o.Nombre,
            Tipo = o.Tipo?.Nombre ?? ""
        }).ToList();

        nodos.AddRange(constelaciones.Select(c => new NodoGrafoViewModel
        {
            Id = c.Id + CONSTELACION_ID_OFFSET,
            Nombre = c.Nombre,
            Tipo = "Constelación",
            Descripcion = c.Descripcion,
            Abreviatura = c.Abreviatura
        }));

        // Aristas: relaciones físicas + sintéticas (objeto pertenece a constelación)
        var aristas = relaciones.Select(r => new AristaGrafoViewModel
        {
            Origen = r.OrigenId,
            Destino = r.DestinoId,
            TipoRelacion = r.TipoRelacion ?? "",
            Peso = r.DistanciaAl ?? 1
        }).ToList();

        aristas.AddRange(objetos
            .Where(o => o.ConstelacionId.HasValue && constelacionIdsUsadas.Contains(o.ConstelacionId.Value))
            .Select(o => new AristaGrafoViewModel
            {
                Origen = o.Id,
                Destino = o.ConstelacionId!.Value + CONSTELACION_ID_OFFSET,
                TipoRelacion = "pertenece_a",
                Peso = 1
            }));

        return new GrafoViewModel { Nodos = nodos, Aristas = aristas };
    }

    public async Task<IEnumerable<(int Id, string Nombre, string TipoRelacion, double Peso)>> ObtenerVecinosAsync(int id)
    {
        await CargarGrafoAsync();
        return _grafo.ObtenerVecinos(id);
    }

    public async Task<Grafo.ResultadoRuta> CalcularRutaAsync(int origen, int destino)
    {
        await CargarGrafoAsync();
        return _grafo.Dijkstra(origen, destino);
    }

    public async Task<string> ObtenerNombreAsync(int id)
    {
        await CargarGrafoAsync();
        return _grafo.ObtenerNombre(id);
    }

    public async Task<IEnumerable<int>> BFSSistemaAsync(int idSistema)
    {
        await CargarGrafoAsync();
        // BFS desde la estrella central del sistema
        var sistema = await _db.SistemasPlanetarios.FindAsync(idSistema);
        if (sistema?.EstrellaCentralId == null) return Enumerable.Empty<int>();
        return _grafo.BFS(sistema.EstrellaCentralId.Value);
    }
}
