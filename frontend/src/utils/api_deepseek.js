const API_KEY = import.meta.env.VITE_DEEPSEEK_API_KEY;
const API_URL = import.meta.env.VITE_DEEPSEEK_API_URL || "https://openrouter.ai/api/v1/chat/completions";

// Prompt optimizado y más conciso para HUs
const initialPromptHU = `
Genera JSON con 4-8 historias de usuario en formato:
{
  "historias_usuario_IA": [
    {
      "hu_name": "string (máx. 8 palabras)",
      "hu_description": "Como [rol], quiero [acción], para [beneficio].",
      "moscow_priority": "number (1-4)"
    }
  ]
}

Reglas:
- hu_name: breve, sin artículos
- hu_description: formato exacto obligatorio
- moscow_priority: 1=crítico, 4=descartado
- Solo JSON válido, sin texto extra
`;

// Prompt de traducción simplificado
const initialTranslationPrompt = `
Sistema de Traducción Automática Multilingüe

Instrucciones:
1. Identifica automáticamente el idioma de origen
2. Traduce al idioma opuesto manteniendo:
   - Términos técnicos sin traducir (ej: "backend", "API")
   - Estructura gramatical correcta
3. Devuelve SOLO el texto traducido, sin comentarios adicionales
`;

// Configuración optimizada para requests
const OPTIMIZED_CONFIG = {
  HU_GENERATION: {
    temperature: 0.05, // Reducido para más determinismo
    max_tokens: 800,   // Reducido significativamente
    top_p: 0.8,        // Control adicional de variabilidad
    frequency_penalty: 0.1
  },
  TRANSLATION: {
    temperature: 0.01, // Muy bajo para traducciones precisas
    max_tokens: 400,   // Reducido para respuestas más rápidas
    top_p: 0.9
  }
};

// Pool de conexiones simulado con AbortController para timeouts
const createRequestConfig = (timeoutMs = 8000) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  
  return {
    signal: controller.signal,
    cleanup: () => clearTimeout(timeoutId)
  };
};

// Función de delay optimizada con jitter para evitar thundering herd
const delay = (ms) => {
  const jitter = Math.random() * 200; // 0-200ms de variabilidad
  return new Promise(resolve => setTimeout(resolve, ms + jitter));
};

// Optimización de mensajes de entrada
const optimizeUserMessage = (proyecto, descripcion_proyecto, epica, descripcion_epica) => {
  // Límites más agresivos para reducir tokens de entrada
  const truncate = (text, maxLength) => text?.substring(0, maxLength) || "";
  
  return `Proyecto: ${truncate(proyecto, 100)}
Descripción: ${truncate(descripcion_proyecto, 300)}
Épica: ${truncate(epica, 100)}
Detalles: ${truncate(descripcion_epica, 200)}`;
};

export const fetchIAWithHUPrompt = async (proyecto = "", descripcion_proyecto = "", epica = "", descripcion_epica = "") => {
  let attempt = 0;
  const maxAttempts = 2; // Reducido de 3 a 2 intentos
  
  while (attempt < maxAttempts) {
    const requestConfig = createRequestConfig(6000); // Timeout reducido a 6s
    
    try {
      const userMessage = optimizeUserMessage(proyecto, descripcion_proyecto, epica, descripcion_epica);

      const requestBody = {
        model: "deepseek/deepseek-chat",
        messages: [
          {
            role: "system",
            content: initialPromptHU
          },
          {
            role: "user",
            content: userMessage
          }
        ],
        ...OPTIMIZED_CONFIG.HU_GENERATION,
        response_format: { type: "json_object" },
        stream: false // Asegurar que no sea streaming
      };

      console.time(`HU_Request_Attempt_${attempt + 1}`);
      
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": window.location.origin,
          "X-Title": "User Stories Generator",
          "Connection": "keep-alive", // Reutilizar conexión
          "Cache-Control": "no-cache"
        },
        body: JSON.stringify(requestBody),
        signal: requestConfig.signal
      });

      console.timeEnd(`HU_Request_Attempt_${attempt + 1}`);
      requestConfig.cleanup();

      // Manejo optimizado de errores HTTP
      if (response.status === 429) {
        const retryAfter = Math.min(
          parseInt(response.headers.get('Retry-After')) || 1000,
          3000 // Máximo 3 segundos de espera
        );
        console.log(`Rate limit. Reintentando en ${retryAfter}ms...`);
        await delay(retryAfter);
        attempt++;
        continue;
      }

      if (response.status === 401) {
        throw new Error('API Key inválida');
      }

      if (response.status === 402) {
        throw new Error('Cuota agotada');
      }

      if (response.status >= 500) {
        console.log('Error de servidor. Reintentando...');
        await delay(500 + attempt * 500); // Backoff más agresivo
        attempt++;
        continue;
      }

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText.substring(0, 100)}`);
      }

      const data = await response.json();
      
      // Verificación rápida de errores
      if (data.error) {
        if (data.error.code === 'rate_limit_exceeded') {
          await delay(1000);
          attempt++;
          continue;
        }
        throw new Error(`API Error: ${data.error.message}`);
      }

      // Validación optimizada de respuesta
      const content = data.choices?.[0]?.message?.content;
      if (!content) {
        throw new Error('Respuesta vacía');
      }

      // Parsing JSON optimizado
      try {
        const parsedContent = JSON.parse(content);
        console.log('HU generadas exitosamente');
        return parsedContent;
      } catch (parseError) {
        // Extracción rápida de JSON
        const jsonMatch = content.match(/\{[\s\S]*?\}/);
        if (jsonMatch) {
          try {
            return JSON.parse(jsonMatch[0]);
          } catch (extractError) {
            console.error('Error extrayendo JSON');
          }
        }
        throw new Error('JSON inválido');
      }

    } catch (error) {
      requestConfig.cleanup();
      
      if (error.name === 'AbortError') {
        console.error('Request timeout');
      } else {
        console.error(`Intento ${attempt + 1} falló:`, error.message);
      }
      
      attempt++;
      if (attempt >= maxAttempts) {
        throw new Error(`Falló después de ${maxAttempts} intentos: ${error.message}`);
      }
      
      await delay(300 + attempt * 200); // Delay más corto entre reintentos
    }
  }
};

export const fetchIAWithTranslationPrompt = async (text) => {
  if (!text || typeof text !== 'string' || text.length < 3) return text;

  const requestConfig = createRequestConfig(4000); // Timeout más agresivo para traducción
  
  try {
    // Truncar texto para reducir tokens
    const truncatedText = text.substring(0, 2000);
    
    console.time('Translation_Request');
    
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": window.location.origin,
        "X-Title": "Translation Service",
        "Connection": "keep-alive"
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
            content: truncatedText
          }
        ],
        ...OPTIMIZED_CONFIG.TRANSLATION
      }),
      signal: requestConfig.signal
    });

    console.timeEnd('Translation_Request');
    requestConfig.cleanup();

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    const translatedText = data.choices?.[0]?.message?.content?.trim();

    if (!translatedText) {
      throw new Error("Respuesta de traducción vacía");
    }

    console.log('Traducción exitosa');
    return translatedText;

  } catch (error) {
    requestConfig.cleanup();
    
    if (error.name === 'AbortError') {
      console.warn('Translation timeout - devolviendo texto original');
    } else {
      console.error('Translation error:', error.message);
    }
    
    return text; // Fallback al texto original
  }
};