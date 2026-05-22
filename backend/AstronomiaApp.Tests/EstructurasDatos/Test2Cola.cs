using AstronomiaApp.EstructurasDatos;

namespace AstronomiaApp.Tests;

public class PruebasCola
{
    [Fact]
    public void Cola_DeberiaEncolarYDesencolarEnOrdenFIFO()
    {
        // 1. Arrange: Preparamos la cola
        var cola = new Cola<string>();

        // 2. Act: Encolamos tres elementos (como naves esperando pista)
        cola.Encolar("Sputnik");
        cola.Encolar("Apollo 11");
        cola.Encolar("Voyager");

        // 3. Assert: Verificamos que el primero en salir sea el primero que entró
        Assert.Equal(3, cola.Tamanio);
        Assert.Equal("Sputnik", cola.Desencolar()); // Sale el 1ro
        Assert.Equal("Apollo 11", cola.Desencolar()); // Sale el 2do
        Assert.Equal(1, cola.Tamanio); // Solo queda uno
    }

    [Fact]
    public void Cola_Frente_DeberiaMostrarElementoSinSacarlo()
    {
        // Arrange
        var cola = new Cola<int>();
        cola.Encolar(100);

        // Act
        var valorFrente = cola.Frente();

        // Assert
        Assert.Equal(100, valorFrente);
        Assert.Equal(1, cola.Tamanio); // El tamaño sigue siendo 1
    }

    [Fact]
    public void Cola_DesencolarVacia_DeberiaLanzarExcepcion()
    {
        // Arrange
        var cola = new Cola<double>();

        // Act & Assert: Verificamos que lance la excepción que definiste
        Assert.Throws<InvalidOperationException>(() => cola.Desencolar());
    }
}