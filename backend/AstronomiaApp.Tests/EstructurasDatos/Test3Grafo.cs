using AstronomiaApp.EstructurasDatos;
using System.Linq;

namespace AstronomiaApp.Tests;

public class Test3Grafo
{
    [Fact]
    public void Grafo_DeberiaAgregarNodosYAristas()
    {
        // Arrange
        var grafo = new Grafo();

        // Act
        grafo.AgregarNodo(1, "Tierra");
        grafo.AgregarNodo(2, "Marte");
        grafo.AgregarArista(1, 2, 225.0, "Ruta Espacial");

        // Assert
        Assert.Equal(2, grafo.CantidadNodos);
        Assert.Equal(1, grafo.CantidadAristas);
        Assert.Equal("Tierra", grafo.ObtenerNombre(1));
    }

    [Fact]
    public void Dijkstra_DeberiaEncontrarRutaMasCorta()
    {
        // Arrange: escenario con 3 nodos
        var grafo = new Grafo();
        grafo.AgregarNodo(1, "Origen");
        grafo.AgregarNodo(2, "Punto Medio");
        grafo.AgregarNodo(3, "Destino");

        // Ruta directa es larga (100)
        grafo.AgregarArista(1, 3, 100.0); 
        
        // Ruta pasando por el punto medio es más corta (10 + 20 = 30)
        grafo.AgregarArista(1, 2, 10.0);
        grafo.AgregarArista(2, 3, 20.0);

        // Act
        var resultado = grafo.Dijkstra(1, 3);

        // Assert
        Assert.True(resultado.Encontrada);
        Assert.Equal(30.0, resultado.DistanciaTotal);
        Assert.Equal(3, resultado.Ruta.Count); // Origen -> Punto Medio -> Destino
        Assert.Equal(1, resultado.Ruta[0]);
        Assert.Equal(2, resultado.Ruta[1]);
        Assert.Equal(3, resultado.Ruta[2]);
    }

    [Fact]
    public void BFS_DeberiaVisitarNodosEnOrden()
    {
        // Arrange
        var grafo = new Grafo();
        grafo.AgregarNodo(1, "A");
        grafo.AgregarNodo(2, "B");
        grafo.AgregarArista(1, 2, 1.0);

        // Act
        var visita = grafo.BFS(1).ToList();

        // Assert
        Assert.Contains(1, visita);
        Assert.Contains(2, visita);
    }
}