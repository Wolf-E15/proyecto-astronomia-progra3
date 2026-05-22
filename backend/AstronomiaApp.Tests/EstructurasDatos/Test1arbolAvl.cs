using AstronomiaApp.EstructurasDatos;

namespace AstronomiaApp.Tests;

public class PruebasEstructuras
{
    [Fact]
    public void ArbolAVL_DeberiaInsertarYContarCorrectamente()
    {
        // Arrange
        var arbol = new ArbolAVL<string>();

        // Act
        arbol.Insertar(10.5, "Sirio");
        arbol.Insertar(5.0, "Canopus");
        arbol.Insertar(15.0, "Rigel");

        // Assert
        Assert.Equal(3, arbol.Tamanio);
    }

    [Fact]
    public void ArbolAVL_Inorden_DeberiaDevolverElementosOrdenados()
    {
        // Arrange
        var arbol = new ArbolAVL<string>();
        arbol.Insertar(20, "Marte");
        arbol.Insertar(10, "Mercurio");
        arbol.Insertar(30, "Jupiter");

        // Act
        var resultado = arbol.Inorden().ToList();

        // Assert - Verifica que el orden sea ascendente por clave
        Assert.Equal("Mercurio", resultado[0]);
        Assert.Equal("Marte", resultado[1]);
        Assert.Equal("Jupiter", resultado[2]);
    }

    [Fact]
    public void ArbolAVL_BuscarRango_DeberiaFiltrarCorrectamente()
    {
        // Arrange
        var arbol = new ArbolAVL<string>();
        arbol.Insertar(1.0, "Mercurio"); // Cerca del sol
        arbol.Insertar(5.0, "Marte");    // Medio
        arbol.Insertar(10.0, "Neptuno"); // Lejos

        // Act - Buscamos planetas entre distancia 4 y 11
        var rango = arbol.BuscarRango(4.0, 11.0).ToList();

        // Assert
        Assert.Equal(2, rango.Count); // Debería encontrar a Marte y Neptuno
        Assert.Contains("Marte", rango);
        Assert.Contains("Neptuno", rango);
        Assert.DoesNotContain("Mercurio", rango);
    }
}