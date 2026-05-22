using AstronomiaApp.EstructurasDatos;
using System.Linq;

namespace AstronomiaApp.Tests;

public class TestPila
{
    [Fact]
    public void Pila_DeberiaRespetarOrdenLIFO()
    {
        // 1. Arrange
        var pila = new Pila<string>();

        // 2. Act
        pila.Apilar("Planeta 1");
        pila.Apilar("Planeta 2");
        pila.Apilar("Planeta 3");

        // 3. Assert
        // El último en entrar (Planeta 3) debe ser el primero en salir
        Assert.Equal("Planeta 3", pila.Desapilar());
        Assert.Equal(2, pila.Tamanio);
    }

    [Fact]
    public void Pila_Tope_DeberiaMostrarSinEliminar()
    {
        // Arrange
        var pila = new Pila<int>();
        pila.Apilar(100);

        // Act
        var valorTope = pila.Tope();

        // Assert
        Assert.Equal(100, valorTope);
        Assert.Equal(1, pila.Tamanio); // No se eliminó, el tamaño sigue igual
    }

    [Fact]
    public void Pila_ObtenerTodos_DeberiaMostrarDesdeElTope()
    {
        // Arrange
        var pila = new Pila<string>();
        pila.Apilar("Base");
        pila.Apilar("Medio");
        pila.Apilar("Cima");

        // Act
        var lista = pila.ObtenerTodos().ToList();

        // Assert
        Assert.Equal("Cima", lista[0]);
        Assert.Equal("Base", lista[2]);
    }

    [Fact]
    public void Pila_DesapilarVacia_DeberiaLanzarExcepcion()
    {
        // Arrange
        var pila = new Pila<int>();

        // Act & Assert
        Assert.Throws<InvalidOperationException>(() => pila.Desapilar());
    }
}