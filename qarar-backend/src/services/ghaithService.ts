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
}

// 🌐 إدارة حالة المفاتيح عالمياً في السيرفر
interface GlobalKeyStatus {
  name: string;
  value: string;
  cooldownUntil: number; // التوقيت الزمني بالملي ثانية الذي ينتهي فيه حظر المفتاح
}

// الذاكرة العالمية للمفاتيح (تمنع احتراق المفاتيح بالتزامن)
let globalKeysPool: GlobalKeyStatus[] = [];

/**
 * دالة داخلية لتجهيز المفاتيح وتحديثها من الـ env
 */
function initializeGlobalKeysPool() {
  if (globalKeysPool.length > 0) return;
  
  const keys: GlobalKeyStatus[] = [];
  for (const envKey in process.env) {
    if (envKey.startsWith('GEMINI_KEY_') && process.env[envKey]) {
      keys.push({
        name: envKey,
        value: process.env[envKey]!.trim(),
        cooldownUntil: 0
      });
    }
  }
  
  // دعم المفتاح الفردي المباشر GEMINI_API_KEY لو ما في قائمة GEMINI_KEY_X
  if (keys.length === 0 && process.env.GEMINI_API_KEY) {
    keys.push({
      name: 'GEMINI_API_KEY',
      value: process.env.GEMINI_API_KEY.trim(),
      cooldownUntil: 0
    });
  }

  globalKeysPool = keys;
}

/**
 * دالة مساعدة للانتظار
 */
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * خدمة غيث المركزية المطوّرة والمُحصّنة - نظام قرار
 */
export async function askGhaith(prompt: string, options?: GhaithOptions): Promise<string> {
  
  if (process.env.ENABLE_GHAITH !== 'true') {
    throw new Error('المساعد الرقمي غيث غير مفعّل حالياً في النظام.');
  }

  // 1. تجهيز كاش المفاتيح
  initializeGlobalKeysPool();

  if (globalKeysPool.length === 0) {
    throw new Error('خطأ: لم يتم العثور على أي مفاتيح (GEMINI_KEY_X) في إعدادات النظام.');
  }

  const maxRetries = 4; 
  let attempts = 0;

  while (attempts < maxRetries) {
    const now = Date.now();
    
    // تصفية المفاتيح الجاهزة (ليست في فترة خمول)
    let activeKeys = globalKeysPool.filter(k => k.cooldownUntil <= now);

    // 🛑 [إصلاح حاسم]: لو كل المفاتيح محظورة، ننتظر 5 ثواني بدل الضغط الفوري المكرر
    if (activeKeys.length === 0) {
      console.warn('⚠️ [كل المفاتيح في حالة خمول مؤقت]: جاري الانتظار 5 ثوانٍ لتصفير حصة جوجل...');
      await sleep(5000);
      const updatedNow = Date.now();
      activeKeys = globalKeysPool.filter(k => k.cooldownUntil <= updatedNow);
      
      // لو لسه محظورة بعد الانتظار، اختار أقل مفتاح فاضل ليه زمن خمول
      if (activeKeys.length === 0) {
        activeKeys = [...globalKeysPool].sort((a, b) => a.cooldownUntil - b.cooldownUntil);
      }
    }

    // اختيار المفتاح الأول المتاح أو الأقل خمولاً
    const selectedKeyObj = activeKeys[0];
    const selectedKey = selectedKeyObj.value;
    const selectedKeyName = selectedKeyObj.name;

    try {
      attempts++;

      const baseSystemInstruction = 'أنت غيث، المساعد الرقمي الذكي لنظام قرار. تتحدث بلباقة، احترافية، وذكاء عالٍ. أسلوبك متعاون ومناسب تماماً للسياق والمهمة المطلوبة منك حالياً. إذا طُلب منك الرد بصيغة JSON، يجب أن يكون الرد صالحاً ومطابقاً للقواعد تماماً بدون أي أخطاء مصنعية في الأقواس أو الفواصل.';
      
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

      // 🛠️ [التعديل الجوهري]: اسم الموديل الرسمي السريع المستقر (gemini-2.0-flash)
      const MODEL_NAME = 'gemini-2.0-flash';
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${selectedKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const status = response.status;

        let cooldownMs = 10000;
        
        if (status === 503) {
          console.error(`[🔥 ضغط عالي (503)] المفتاح: ${selectedKeyName}.`, errorData);
          cooldownMs = 15000;
        } else if (status === 429) {
          console.error(`[⏳ نفاد حصة مؤقت (429)] المفتاح: ${selectedKeyName}. تجاوز حد الطلبات للدقيقة.`, errorData);
          cooldownMs = 35000; // وضع المفتاح في الخمول 35 ثانية
        } else {
          console.error(`[❌ خطأ سيرفر (${status})] المفتاح: ${selectedKeyName}.`, errorData);
        }
        
        // وسم المفتاح بفترة الخمول
        const targetGlobalKey = globalKeysPool.find(k => k.name === selectedKeyName);
        if (targetGlobalKey) {
          targetGlobalKey.cooldownUntil = Date.now() + cooldownMs;
        }

        if (status === 503 || status === 429) {
          await sleep(2000);
        }

        continue; 
      }

      const data = (await response.json()) as GeminiResponse;
      const textResponse = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (!textResponse) {
        console.warn(`[⚠️ استجابة فارغة] المفتاح: ${selectedKeyName}. محاولة مفتاح آخر.`);
        const targetGlobalKey = globalKeysPool.find(k => k.name === selectedKeyName);
        if (targetGlobalKey) targetGlobalKey.cooldownUntil = Date.now() + 5000;
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
          console.warn(`[⚠️ خطأ في قالب JSON] المفتاح [${selectedKeyName}] رجّع بيانات مكسورة.`);
          const targetGlobalKey = globalKeysPool.find(k => k.name === selectedKeyName);
          if (targetGlobalKey) targetGlobalKey.cooldownUntil = Date.now() + 5000;
          continue; 
        }
      }

      return cleanedText;

    } catch (error) {
      console.error(`[❌ خطأ شبكة/اتصال] أثناء استخدام ${selectedKeyName}:`, error);
      const targetGlobalKey = globalKeysPool.find(k => k.name === selectedKeyName);
      if (targetGlobalKey) targetGlobalKey.cooldownUntil = Date.now() + 10000;
    }
  }

  throw new Error('عذراً، فشل غيث في إتمام العملية حالياً بسبب قيود مؤقتة وضغط عالي في سيرفرات الخدمة الخارجية. يرجى المحاولة مرة أخرى خلال ثوانٍ.');
}
