using AstronomiaApp.EstructurasDatos;
using System.Linq;

namespace AstronomiaApp.Tests;

public class TestLista
{
    [Fact]
    public void Lista_DeberiaAgregarAlInicioYAlFinal()
    {
        // Arrange
        var lista = new ListaEnlazada<string>();

        // Act
        lista.AgregarAlFinal("Marte");      // Lista: [Marte]
        lista.AgregarAlInicio("Tierra");    // Lista: [Tierra, Marte]
        lista.AgregarAlFinal("Júpiter");    // Lista: [Tierra, Marte, Júpiter]

        // Assert
        Assert.Equal(3, lista.Tamanio);
        var elementos = lista.ObtenerTodos().ToList();
        Assert.Equal("Tierra", elementos[0]);
        Assert.Equal("Marte", elementos[1]);
        Assert.Equal("Júpiter", elementos[2]);
    }

    [Fact]
    public void Lista_DeberiaEliminarElementosCorrectamente()
    {
        // Arrange
        var lista = new ListaEnlazada<int>();
        lista.AgregarAlFinal(10);
        lista.AgregarAlFinal(20);
        lista.AgregarAlFinal(30);

        // Act
        bool eliminado = lista.Eliminar(20);
        bool noExistente = lista.Eliminar(99);

        // Assert
        Assert.True(eliminado);
        Assert.False(noExistente);
        Assert.Equal(2, lista.Tamanio);
        Assert.DoesNotContain(20, lista.ObtenerTodos());
    }

    [Fact]
    public void Lista_DeberiaBuscarConPredicado()
    {
        // Arrange
        var lista = new ListaEnlazada<string>();
        lista.AgregarAlFinal("Andrómeda");
        lista.AgregarAlFinal("Vía Láctea");
        lista.AgregarAlFinal("Sombrero");

        // Act
        // Buscamos la galaxia que empieza con "V"
        var resultado = lista.Buscar(g => g.StartsWith("V"));

        // Assert
        Assert.Equal("Vía Láctea", resultado);
    }

    [Fact]
    public void Lista_Limpiar_DeberiaVaciarLaLista()
    {
        // Arrange
        var lista = new ListaEnlazada<string>();
        lista.AgregarAlFinal("Dato");

        // Act
        lista.Limpiar();

        // Assert
        Assert.True(lista.EstaVacia);
        Assert.Equal(0, lista.Tamanio);
    }
}