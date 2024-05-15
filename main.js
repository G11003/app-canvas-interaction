// Selecciona el elemento canvas del documento HTML
const canvas = document.getElementById("canvas");

// Obtiene el contexto de representación 2D del canvas
let ctx = canvas.getContext("2d");

// Obtiene las dimensiones de la ventana del navegador
const window_height = window.innerHeight; // Alto de la ventana
const window_width = window.innerWidth; // Ancho de la ventana

// Define el tamaño del canvas como el 80% del ancho y alto de la ventana
canvas.height = window_height * 0.9;
canvas.width = window_width * 0.9;

// Establece el color de fondo del canvas
canvas.style.background = "black"; // Cambiado a fondo negro

// Define una función para generar un color aleatorio entre dos colores dados
function getAlternatingColor(color1, color2) {
    let color = color1;
    return function() {
        color = (color === color1) ? color2 : color1;
        return color;
    };
}

// Define una clase para representar círculos
class Circle {
    constructor(x, y, radius, colorFunc, textColor, text, speedX, speedY) {
        this.posX = x; // Posición x del centro del círculo
        this.posY = y; // Posición y del centro del círculo
        this.radius = radius; // Radio del círculo
        this.colorFunc = colorFunc; // Función para obtener el color del círculo
        this.originalColor = colorFunc; // Color original del círculo
        this.textColor = textColor; // Color del texto
        this.text = text; // Texto a mostrar en el centro del círculo
        this.speedX = speedX; // Velocidad de movimiento en el eje x
        this.speedY = speedY; // Velocidad de movimiento en el eje y

        // Atributo para marcar si el círculo debe ser eliminado
        this.shouldBeRemoved = false;
    }

    // Método para dibujar el círculo en el canvas
    draw(context) {
        context.beginPath();

        context.strokeStyle = this.colorFunc(); // Establece el color del borde del círculo
        context.lineWidth = 2; // Ancho del borde

        context.arc(this.posX, this.posY, this.radius, 0, Math.PI * 2, false);
        context.stroke(); // Dibuja el borde del círculo

        // Dibuja el texto con el color especificado
        context.fillStyle = this.textColor;
        context.textAlign = "center";
        context.textBaseline = "middle";
        context.font = "20px Century Gothic"; // Cambiado a Century Gothic
        context.fillText(this.text, this.posX, this.posY);

        context.closePath();
    }

    // Método para actualizar la posición del círculo
    update(context, circles) {
        this.draw(context); // Dibuja el círculo en su nueva posición

        // Actualiza las coordenadas del centro del círculo
        this.posX += this.speedX;
        this.posY += this.speedY;

        // Verifica si hay colisión con otros círculos
        for (let i = 0; i < circles.length; i++) {
            const otherCircle = circles[i];
            if (otherCircle !== this) {
                const distance = Math.sqrt(Math.pow(this.posX - otherCircle.posX, 2) + Math.pow(this.posY - otherCircle.posY, 2));
                if (distance < this.radius + otherCircle.radius) {
                    // Si hay colisión, calcula el ángulo de rebote
                    const angle = Math.atan2(this.posY - otherCircle.posY, this.posX - otherCircle.posX);
                    const overlap = this.radius + otherCircle.radius - distance;
                    
                    // Calcula el nuevo centro del círculo para evitar la superposición
                    this.posX += Math.cos(angle) * overlap / 2;
                    this.posY += Math.sin(angle) * overlap / 2;
                    
                    // Calcula las nuevas velocidades después del rebote
                    const newSpeedX = Math.cos(angle) * this.speedX + Math.cos(angle + Math.PI / 2) * this.speedY;
                    const newSpeedY = Math.sin(angle) * this.speedX + Math.sin(angle + Math.PI / 2) * this.speedY;

                    // Asigna las nuevas velocidades
                    this.speedX = newSpeedX;
                    this.speedY = newSpeedY;

                    // Cambia el color del círculo a rosa neon
                    this.colorFunc = getAlternatingColor('#ff6ec7', '#ff1493');
                }
            }
        }
        // Verifica si el círculo ha alcanzado las paredes izquierda o derecha
        if (this.posX + this.radius >= canvas.width || this.posX - this.radius <= 0) {
            // Invierte la velocidad en el eje x para que rebote
            this.speedX = -this.speedX;

            // Restaura el color original del círculo
            this.colorFunc = this.originalColor;
        }

        // Verifica si el círculo ha alcanzado la parte superior del canvas
        if (this.posY - this.radius <= 0) {
            // Invierte la velocidad en el eje y para que rebote hacia arriba
            this.speedY = -this.speedY;
        }

        // Si el círculo sale de la parte superior del canvas, marca que debe ser eliminado
        if (this.posY + this.radius < 0 || this.posX - this.radius > canvas.width || this.posX + this.radius < 0) {
            this.shouldBeRemoved = true;
        }
        
        // Asegura que la velocidad vertical sea siempre negativa
        if (this.speedY > 0) {
            this.speedY = -this.speedY;
        }
    }
}

// Arreglo para almacenar instancias de círculos
let ArregloCirculos = [];
let NumeroCirculos = 1; // Número inicial de círculos
let NumeroMostrado = 1; // Número de círculos mostrados

// Función para crear y mostrar círculos progresivamente
function crearCirculo() {
    let randomRadius = Math.floor(Math.random() * 60 + 35);
    let randomX = Math.random() * (canvas.width - 2 * randomRadius) + randomRadius;
    let randomY = canvas.height + randomRadius; // Ajuste para que aparezcan desde la parte inferior

    let colorFunc = getAlternatingColor('#ff1493', '#c2ff05');

    let miCirculo = new Circle(randomX, randomY, randomRadius, colorFunc, "white", (NumeroMostrado).toString(), 2, -2); // Cambio en la velocidad x

    ArregloCirculos.push(miCirculo);
}

// Función para manejar el clic del mouse en el canvas
canvas.addEventListener('click', function (event) {
    const mouseX = event.clientX;
    const mouseY = event.clientY;

    // Verifica si el clic está dentro de algún círculo
    for (let i = 0; i < ArregloCirculos.length; i++) {
        const circle = ArregloCirculos[i];
        const distanceFromCenter = Math.sqrt(Math.pow(mouseX - circle.posX, 2) + Math.pow(mouseY - circle.posY, 2));
        // Si el clic está dentro del círculo, marca que debe ser eliminado
        if (distanceFromCenter <= circle.radius) {
            circle.shouldBeRemoved = true;
            break; // Sale del bucle una vez que se marca el círculo para eliminación
        }
    }
});

// Redefinimos la función de actualización para incorporar la aparición progresiva de círculos
function updateCircle() {
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Borra el canvas para cada fotograma

    // Itera sobre cada círculo en el arreglo y actualiza su posición
    ArregloCirculos.forEach(circle => {
        circle.update(ctx, ArregloCirculos);
    });

    // Filtra los círculos que deben ser eliminados
    ArregloCirculos = ArregloCirculos.filter(circle => !circle.shouldBeRemoved);

    // Si no hay círculos en pantalla, muestra más
    if (ArregloCirculos.length === 0) {
        NumeroCirculos++; // Incrementa el número de círculos a mostrar
        NumeroMostrado = 1; // Reinicia el contador de círculos mostrados
        while (NumeroMostrado < NumeroCirculos) {
            crearCirculo();
            NumeroMostrado++;
        }
    }

    requestAnimationFrame(updateCircle); // Llama a la función de actualización nuevamente para el siguiente fotograma
}

// Llama a la función de actualización inicialmente para iniciar la animación
updateCircle();
