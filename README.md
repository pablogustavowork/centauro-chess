<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# CentaUrosChess

## El Concepto

El núcleo conceptual de CentaUrosChess se basa en una idea simple pero poderosa: las partidas del jugador contienen toda la información necesaria para entender cómo juega, por qué comete errores y qué debería entrenar para mejorar. En lugar de limitarse a evaluar jugadas con un motor de ajedrez, el sistema busca transformar las partidas en un modelo del proceso de pensamiento del jugador. Esto se logra mediante un algoritmo que analiza cada partida en varias capas sucesivas. Primero reconstruye la partida jugada y evalúa cada posición con un motor de ajedrez de alto nivel para identificar momentos críticos donde la calidad de la jugada difiere significativamente de la mejor continuación. Estos momentos críticos no se interpretan simplemente como “errores”, sino como eventos informativos que revelan aspectos del proceso cognitivo del jugador: si no detectó una amenaza del rival, si calculó insuficientemente una variante, si evaluó mal la posición o si jugó demasiado rápido bajo presión. Para cada uno de estos momentos el algoritmo extrae una serie de características objetivas de la posición —evaluación del motor, cambios en la estructura, pérdida de material, complejidad táctica, fase de la partida y tiempo disponible— y las utiliza para clasificar el error dentro de una taxonomía operativa que distingue entre tipos técnicos (táctica, cálculo, estrategia, defensa, apertura, finales y manejo del tiempo) y causas cognitivas probables.

Sin embargo, el verdadero valor del sistema no está en analizar una jugada aislada, sino en acumular patrones a lo largo de muchas partidas. A medida que el jugador importa partidas, CentaUrosChess agrega estadísticas sobre los tipos de errores cometidos, su frecuencia, su severidad, el contexto en que aparecen y su impacto sobre el resultado de la partida. Este proceso permite construir un perfil dinámico del jugador, que describe no solo sus debilidades recurrentes sino también su estilo de juego, sus fortalezas técnicas y su comportamiento bajo presión de tiempo. El perfil resultante no es simplemente descriptivo, sino operativo: sirve para priorizar qué errores tienen mayor impacto en el rendimiento del jugador y cuáles son más susceptibles de mejorar mediante entrenamiento. De este modo, el algoritmo convierte los datos de las partidas en un diagnóstico pedagógico que identifica qué habilidades deberían entrenarse primero.

La filosofía pedagógica de CentaUrosChess es que el análisis solo tiene valor si conduce a entrenamiento específico. Por ello, el algoritmo no termina en la detección de errores, sino que los transforma en recomendaciones concretas de práctica. Cada patrón recurrente detectado se traduce en un conjunto de ejercicios diseñados para entrenar exactamente esa debilidad, muchas veces utilizando posiciones derivadas de las propias partidas del jugador. Así, un patrón de errores por no detectar amenazas del rival genera ejercicios centrados en identificar recursos tácticos o defensivos; un patrón de cálculo incompleto genera ejercicios de variantes cortas bajo presión de tiempo; y errores estratégicos recurrentes generan ejercicios de evaluación de planes y mejora de piezas. Este proceso cierra el ciclo fundamental del sistema: las partidas generan diagnóstico, el diagnóstico genera entrenamiento y el entrenamiento se evalúa mediante nuevas partidas, creando un bucle continuo de aprendizaje adaptativo.

En esencia, CentaUrosChess no pretende reemplazar al motor de ajedrez ni competir con herramientas tradicionales de análisis, sino situarse en una capa superior donde el objetivo no es calcular mejor jugadas, sino entender al jugador y ayudarlo a mejorar de forma personalizada. El motor proporciona evaluaciones objetivas de las posiciones, pero el algoritmo de CentaUrosChess interpreta esas evaluaciones en términos pedagógicos, transformando información ajedrecística en conocimiento sobre el aprendizaje del jugador. De esta forma, el sistema aspira a reproducir digitalmente uno de los elementos más valiosos del entrenamiento humano: la capacidad de observar partidas, detectar patrones de error y diseñar un plan de mejora adaptado a la forma de pensar de cada jugador.

---

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in `.env.local` to your Gemini API key
3. Run the app:
   `npm run dev`
