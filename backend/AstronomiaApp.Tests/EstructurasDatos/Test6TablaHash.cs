using AstronomiaApp.EstructurasDatos;
using System.Linq;

namespace AstronomiaApp.Tests;

public class TestTablaHash
{
    [Fact]
    public void TablaHash_DeberiaInsertarYRecuperarValores()
    {
        // Arrange
        var tabla = new TablaHash<string>();

        // Act
        tabla.Insertar("M31", "Galaxia de Andrómeda");
        tabla.Insertar("M45", "Cúmulo de las Pléyades");
        
        bool encontrado = tabla.Buscar("M31", out string? valor);

        // Assert
        Assert.True(encontrado);
        Assert.Equal("Galaxia de Andrómeda", valor);
        Assert.Equal(2, tabla.Tamanio);
    }

    [Fact]
    public void TablaHash_DeberiaActualizarValorSiLaClaveExiste()
    {
        // Arrange
        var tabla = new TablaHash<int>();
        tabla.Insertar("Sondas", 5);

        // Act - Actualizamos el valor de la misma clave
        tabla.Insertar("Sondas", 10);
        tabla.Buscar("Sondas", out int valor);

        // Assert
        Assert.Equal(10, valor);
        Assert.Equal(1, tabla.Tamanio); // No debe aumentar el tamaño si es actualización
    }

    [Fact]
    public void TablaHash_DeberiaEliminarClaveCorrectamente()
    {
        // Arrange
        var tabla = new TablaHash<string>();
        tabla.Insertar("Marte", "Planeta Rojo");

        // Act
        bool eliminado = tabla.Eliminar("Marte");
        bool existe = tabla.Buscar("Marte", out _);

        // Assert
        Assert.True(eliminado);
        Assert.False(existe);
        Assert.Equal(0, tabla.Tamanio);
    }

    [Fact]
    public void TablaHash_DeberiaManejarInsensibilidadAMayusculas()
    {
        // Arrange
        var tabla = new TablaHash<string>();
        
        // Act - Insertamos en minúsculas, buscamos en mayúsculas
        tabla.Insertar("jupiter", "Planeta Gigante");
        bool encontrado = tabla.Buscar("JUPITER", out string? valor);

        // Assert
        Assert.True(encontrado);
        Assert.Equal("Planeta Gigante", valor);
    }
}