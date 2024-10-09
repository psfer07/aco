# Buscador de rutas óptimas de escape

En este repositorio de recogen el código fuente desarrollado para el proyecto de investigación.
Se puede acceder a la versión actualizada de forma online a través del siguiente enlace:
[Link al simulador](https://psfer07.github.io/aco)

---

## Versión actual v1.0

La versión 1.0 del "Buscador de rutas óptimas de escape" incluye una serie de características y funcionalidades que permiten a los usuarios simular y visualizar rutas óptimas en un entorno gráfico. A continuación se detallan las principales características:

### Interfaz de Usuario:
La aplicación cuenta con una interfaz web construida en HTML, CSS y JavaScript, que permite a los usuarios interactuar con la simulación de manera intuitiva.
Se incluye un sistema de notificaciones (toast) para informar al usuario sobre el estado de la simulación y otros eventos relevantes.

### Simulación de Rutas:
Utiliza un algoritmo de optimización basado en el comportamiento de las hormigas (Ant Colony Optimization) para encontrar rutas óptimas en un entorno definido.
Los usuarios pueden seleccionar diferentes parámetros de simulación, como la evaporación de feromonas, valores de alpha y beta, y el número de pasos que la "hormiga" debe realizar.

### Configuración de Escenarios:
Se pueden elegir diferentes escenarios (por ejemplo, "Clase" y "Planta de instituto") que definen la disposición del entorno, incluyendo paredes, ventanas, salidas y otros elementos.
Cada escenario tiene dimensiones específicas y se puede visualizar en un lienzo (canvas) donde se dibujan los elementos del entorno.

### Interactividad:
Los usuarios pueden hacer clic en el lienzo para seleccionar un punto de inicio para la simulación.
La simulación se puede iniciar y detener mediante un botón, y los resultados se muestran en tiempo real, incluyendo la distancia más corta encontrada y la ruta seguida.

### Temas Oscuro y Claro:
La aplicación permite a los usuarios alternar entre un tema oscuro y claro, mejorando la experiencia visual y la accesibilidad.

### Visualización Gráfica:
Se utiliza un lienzo HTML5 para representar gráficamente el entorno y las rutas encontradas por la hormiga, con colores que indican diferentes elementos y estados.

### Persistencia de Configuración:
La configuración del tema (oscuro o claro) se guarda en el almacenamiento local del navegador, permitiendo que la preferencia del usuario se mantenga entre sesiones.

---

## Imágenes del simulador
