const API_KEY = import.meta.env.VITE_DEEPSEEK_API_KEY;
const API_URL = import.meta.env.VITE_DEEPSEEK_API_URL || "https://openrouter.ai/api/v1/chat/completions";

const initialPromptHU = `
PROMPT FLEXIBLE PARA GENERACIÓN DE HUs en JSON (Proyecto Agnóstico)

Genera un JSON con 4 a 8 historias de usuario (HUs) para un proyecto ágil, basado en el contexto proporcionado.  
Sigue estrictamente estas reglas:  

1. Formato de salida:  
   - Solo un JSON válido, sin texto adicional, explicaciones o markdown.  
   - Estructura exacta:  
     {
       "historias_usuario_IA": [
         {
           "hu_name": "string (máx. 8 palabras, estilo título)",
           "hu_description": "string (formato estricto: 'Como [rol], quiero [acción], para [beneficio]')",
           "moscow_priority": "number (1-4)"
         }
       ]
     }

2. Reglas para las HUs:  
   - hu_name:  
     - Breve, en tiempo presente (ej: "Implementar autenticación JWT").  
     - Sin artículos (evitar "La", "El").  
   - hu_description:  
     - Formato obligatorio:  
       "Como [rol claro], quiero [acción específica], para [beneficio medible]."  
     - Ejemplo válido:  
       "Como administrador, quiero validar los datos migrados automáticamente, para evitar errores en producción."  
     - Prohibido:  
       - Usar más de una oración.  
       - Frases pasivas o genéricas (ej: "para mejorar el rendimiento").  
   - moscow_priority:  
     - Basarse en impacto técnico/business (1 = crítico, 4 = descartado).  

3. Ejemplo de salida esperada:
{
  "historias_usuario_IA": [
    {
      "hu_name": "Migrar datos de clientes",
      "hu_description": "Como equipo de datos, quiero transferir registros de MySQL a MongoDB, para garantizar consistencia en la migración.",
      "moscow_priority": 1
    }
  ]
}

4. Prohibido:
   - Agregar campos extra (ej: tiempo, owner).
   - Prioridades MOSCOW fuera de 1-4.
   - HU no accionables (ej: "Investigar tecnologías").
`;

/*
 (ES↔EN)
 (ES o EN)
*/
const initialTranslationPrompt = `
Sistema de Traducción Automática Bilingüe

Instrucciones:
1. Identifica automáticamente el idioma de origen
2. Traduce al idioma opuesto manteniendo:
   - Términos técnicos sin traducir (ej: "backend", "API")
   - Estructura gramatical correcta
   - Contexto profesional (gestión ágil/tecnológica)
3. Devuelve SOLO el texto traducido, sin comentarios adicionales

Ejemplos:
Entrada (ES): "Como desarrollador, quiero implementar JWT"
Salida (EN): "As a developer, I want to implement JWT"

Entrada (EN): "The product owner needs the dashboard"
Salida (ES): "El product owner necesita el dashboard"
`;

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const fetchIAWithHUPrompt = async (proyecto = "", descripcion_proyecto = "", epica = "", descripcion_epica = "") => {
  let attempt = 0;
  const maxAttempts = 3;
  
  while (attempt < maxAttempts) {
    try {
      const userMessage = `Genera historias de usuario para:
        - Proyecto: ${proyecto}
        - Descripción: ${descripcion_proyecto}
        - Épica: ${epica}
        - Descripción épica: ${descripcion_epica}`;

      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": window.location.origin,
          "X-Title": "User Stories Generator"
        },
        body: JSON.stringify({
          model: "deepseek/deepseek-chat",
          messages: [
            {
              role: "system",
              content: initialPromptHU
            },
            {
              role: "user",
              content: userMessage.substring(0, 8000)
            }
          ],
          temperature: 0.1,
          max_tokens: 1500,
          response_format: { type: "json_object" }
        })
      });

      // Manejo de errores HTTP
      if (response.status === 429) {
        const retryAfter = response.headers.get('Retry-After') || (Math.pow(2, attempt) * 1000);
        console.log(`Rate limit (429). Reintentando en ${retryAfter}ms...`);
        await delay(parseInt(retryAfter));
        attempt++;
        continue;
      }

      if (response.status === 401) {
        throw new Error('API Key inválida o expirada');
      }

      if (response.status === 402) {
        throw new Error('Cuota de API agotada. Verifica tu saldo.');
      }

      if (response.status === 503) {
        console.log('Servicio temporalmente no disponible. Reintentando...');
        await delay(Math.pow(2, attempt) * 1000);
        attempt++;
        continue;
      }

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      console.log('Respuesta exitosa de DeepSeek:', data);
      
      // Verificar errores en la respuesta
      if (data.error) {
        if (data.error.code === 'rate_limit_exceeded') {
          console.log('Rate limit en respuesta. Reintentando...');
          await delay(Math.pow(2, attempt) * 2000);
          attempt++;
          continue;
        }
        throw new Error(`API Error: ${data.error.message}`);
      }

      // Verificar estructura de respuesta
      if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        throw new Error('Estructura de respuesta inválida');
      }

      const content = data.choices[0].message.content;
      
      // Parsear JSON
      try {
        const parsedContent = JSON.parse(content);
        console.log('JSON parseado exitosamente:', parsedContent);
        return parsedContent;
      } catch (parseError) {
        console.error('Error al parsear JSON:', parseError);
        
        // Intentar extraer JSON del texto
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          try {
            const extractedJson = JSON.parse(jsonMatch[0]);
            console.log('JSON extraído exitosamente:', extractedJson);
            return extractedJson;
          } catch (extractError) {
            console.error('Error al extraer JSON:', extractError);
          }
        }
        
        throw new Error('No se pudo extraer JSON válido de la respuesta');
      }
    } catch (error) {
      console.error(`Intento ${attempt + 1} fallido:`, error);
      attempt++;
      if (attempt >= maxAttempts) {
        throw error;
      }
      await delay(Math.pow(2, attempt) * 1000);
    }
  }
  
  throw new Error('No se pudo completar la solicitud después de varios intentos');
};

export const fetchIAWithTranslationPrompt = async (text) => {
  if (!text || typeof text !== 'string') return text;

  let attempt = 0;
  const maxAttempts = 3;

  while (attempt < maxAttempts) {
    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": window.location.origin,
          "X-Title": "Translation Service"
        },
        body: JSON.stringify({
          model: "deepseek/deepseek-chat",
          messages: [
            {
              role: "system",
              content: initialTranslationPrompt
            },
            {
              role: "user",
              content: text.substring(0, 5000) // Limitar tamaño
            }
          ],
          temperature: 0.1,
          max_tokens: 1500
        })
      });

      // Manejo de errores
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || `HTTP ${response.status}`);
      }

      const data = await response.json();
      const translatedText = data.choices?.[0]?.message?.content?.trim();

      if (!translatedText) {
        throw new Error("Empty translation response");
      }

      return translatedText;

    } catch (error) {
      console.error(`Translation attempt ${attempt + 1} failed:`, error);
      attempt++;
      if (attempt >= maxAttempts) {
        console.warn("Returning original text after failed translations");
        return text; // Devuelve el texto original si falla
      }
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
    }
  }
};