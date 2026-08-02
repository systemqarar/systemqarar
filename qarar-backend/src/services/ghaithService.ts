// src/services/ghaithService.ts

// ==========================================
// 🛡️ الواجهات البرمجية الصارمة لردود جيمني (Type-Safe Interfaces)
// ==========================================
interface GeminiPart {
  text?: string;
  inlineData?: {
    mimeType: string;
    data: string;
  };
}

interface GeminiContent {
  parts: GeminiPart[];
  role?: string;
}

interface GeminiCandidate {
  content: GeminiContent;
  finishReason?: string;
  index?: number;
}

interface GeminiResponse {
  candidates?: GeminiCandidate[];
  usageMetadata?: {
    promptTokenCount: number;
    candidatesTokenCount: number;
    totalTokenCount: number;
  };
}

interface GhaithOptions {
  responseJson?: boolean;       
  systemInstruction?: string;   
  inlineData?: {                
    mimeType: string;
    data: string;
  };
  responseSchema?: any; 
  modelsPriority?: string[]; 
}

interface GlobalKeyStatus {
  name: string;
  value: string;
  cooldownUntil: number; 
}

// 🎯 القائمة الذهبية المأخوذة مباشرة من حسابك بالترتيب الحقيقي
const DEFAULT_MODELS_FALLBACK = [
  'gemini-3.6-flash',
  'gemini-3.5-flash',
  'gemini-3.1-pro-preview',
  'gemini-2.5-flash',
  'gemini-2.5-pro'
];

let globalKeysPool: GlobalKeyStatus[] = [];

function refreshKeysPool() {
  const currentEnvKeys: { name: string; value: string }[] = [];

  for (const envKey in process.env) {
    if (envKey.startsWith('GEMINI_KEY_') && process.env[envKey]?.trim()) {
      currentEnvKeys.push({
        name: envKey,
        value: process.env[envKey]!.trim()
      });
    }
  }

  if (currentEnvKeys.length === 0 && process.env.GEMINI_API_KEY?.trim()) {
    currentEnvKeys.push({
      name: 'GEMINI_API_KEY',
      value: process.env.GEMINI_API_KEY.trim()
    });
  }

  const updatedPool: GlobalKeyStatus[] = [];
  for (const envK of currentEnvKeys) {
    const existingKey = globalKeysPool.find(k => k.name === envK.name && k.value === envK.value);
    if (existingKey) {
      updatedPool.push(existingKey);
    } else {
      updatedPool.push({
        name: envK.name,
        value: envK.value,
        cooldownUntil: 0
      });
    }
  }

  globalKeysPool = updatedPool;
}

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function askGhaith(prompt: string, options?: GhaithOptions): Promise<string> {
  
  if (process.env.ENABLE_GHAITH !== 'true') {
    throw new Error('المساعد الرقمي غيث غير مفعّل حالياً في النظام.');
  }

  refreshKeysPool();

  if (globalKeysPool.length === 0) {
    throw new Error('خطأ: لم يتم العثور على أي مفاتيح (GEMINI_KEY_X) في إعدادات البيئة.');
  }

  const modelsToTry = options?.modelsPriority || DEFAULT_MODELS_FALLBACK;
  const maxAttempts = Math.max(globalKeysPool.length * 2, 4);
  let attempts = 0;

  while (attempts < maxAttempts) {
    attempts++;
    const now = Date.now();
    let activeKeys = globalKeysPool.filter(k => k.cooldownUntil <= now);

    if (activeKeys.length === 0) {
      const sortedKeys = [...globalKeysPool].sort((a, b) => a.cooldownUntil - b.cooldownUntil);
      const nextAvailableKey = sortedKeys[0];
      const waitTime = Math.max(nextAvailableKey.cooldownUntil - now, 1000);
      
      console.warn(`⚠️ [كل المفاتيح في خمول مؤقت]: انتظار ${Math.ceil(waitTime / 1000)}s لتصفير الحصة...`);
      await sleep(Math.min(waitTime, 5000));
      
      refreshKeysPool();
      activeKeys = globalKeysPool.filter(k => k.cooldownUntil <= Date.now());
      if (activeKeys.length === 0) {
        activeKeys = [...globalKeysPool];
      }
    }

    const selectedKeyObj = activeKeys[0];
    const selectedKey = selectedKeyObj.value;
    const selectedKeyName = selectedKeyObj.name;

    // 🔄 التجربة المباشرة لموديلات الجيل الجديد المتاحة
    for (const modelName of modelsToTry) {
      try {
        const baseSystemInstruction = 'أنت غيث، المساعد الرقمي الذكي لنظام قرار. تتحدث بلباقة، احترافية، وذكاء عالٍ. أسلوبك متعاون ومناسب تماماً للسياق والمهمة المطلوب تنفيذها.';
        
        const finalInstruction = options?.systemInstruction 
          ? `${baseSystemInstruction} ${options.systemInstruction}` 
          : baseSystemInstruction;

        const parts: GeminiPart[] = [{ text: prompt }];

        if (options?.inlineData) {
          parts.push({
            inlineData: {
              mimeType: options.inlineData.mimeType,
              data: options.inlineData.data
            }
          });
        }

        const requestBody: any = {
          contents: [{ parts: parts }],
          systemInstruction: {
            parts: [{ text: finalInstruction }]
          }
        };

        if (options?.responseJson) {
          requestBody.generationConfig = {
            responseMimeType: 'application/json',
            ...(options.responseSchema && { responseSchema: options.responseSchema })
          };
        }

        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${selectedKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody),
          }
        );

        if (!response.ok) {
          const status = response.status;
          const targetGlobalKey = globalKeysPool.find(k => k.name === selectedKeyName);

          if (status === 429) {
            console.warn(`[⏳ 429 نفاد حصة] المفتاح [${selectedKeyName}] استُهلك على (${modelName}). التبديل للمفتاح التالي...`);
            if (targetGlobalKey) targetGlobalKey.cooldownUntil = Date.now() + 60000;
            break; 
          }

          if (status === 404) {
            console.warn(`[⚠️ 404] الموديل (${modelName}) غير متوفر على المفتاح [${selectedKeyName}]. الانتقال للموديل التالي...`);
            continue; 
          }

          const errorData = await response.json().catch(() => ({}));
          console.error(`[❌ خطأ سيرفر ${status}] الموديل (${modelName}) - المفتاح [${selectedKeyName}]:`, errorData);
          
          if (targetGlobalKey) targetGlobalKey.cooldownUntil = Date.now() + 15000;
          break; 
        }

        const data = (await response.json()) as GeminiResponse;
        const textResponse = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        
        if (!textResponse) {
          console.warn(`[⚠️ استجابة فارغة] الموديل (${modelName}) المفتاح [${selectedKeyName}]. تجربة البديل...`);
          continue;
        }

        let cleanedText = textResponse.trim();
        if (cleanedText.startsWith('```')) {
          cleanedText = cleanedText.replace(/^```json\s*/i, '').replace(/```\s*$/, '').trim();
        }

        if (options?.responseJson) {
          const firstBracket = cleanedText.indexOf('{');
          const lastBracket = cleanedText.lastIndexOf('}');
          
          if (firstBracket !== -1 && lastBracket !== -1 && lastBracket > firstBracket) {
            cleanedText = cleanedText.substring(firstBracket, lastBracket + 1);
          }
          
          try {
            JSON.parse(cleanedText); 
          } catch (jsonError) {
            console.warn(`[⚠️ JSON مكسور] الموديل (${modelName}). تجربة الموديل البديل...`);
            continue; 
          }
        }

        return cleanedText;

      } catch (error) {
        console.error(`[❌ خطأ شبكة] الموديل (${modelName}) المفتاح [${selectedKeyName}]:`, error);
      }
    }

    const targetGlobalKey = globalKeysPool.find(k => k.name === selectedKeyName);
    if (targetGlobalKey && targetGlobalKey.cooldownUntil <= now) {
      targetGlobalKey.cooldownUntil = Date.now() + 10000;
    }
  }

  throw new Error('عذراً، فشل غيث في إتمام العملية حالياً بسبب ضغط مؤقت. يرجى المحاولة بعد لحظات.');
}
