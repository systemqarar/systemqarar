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

// 🌐 [إدارة حالة المفاتيح عالمياً في السيرفر]
interface GlobalKeyStatus {
  name: string;
  value: string;
  cooldownUntil: number; // التوقيت الزمني بالملي ثانية الذي ينتهي فيه حظر المفتاح
}

// الذاكرة العالمية للمفاتيح (تمنع احتراق المفاتيح بالتزامن)
let globalKeysPool: GlobalKeyStatus[] = [];

/**
 * دالة داخلية لتجهيز المفاتيح وتحديثها من الـ env مرة واحدة فقط أو عند الحاجة
 */
function initializeGlobalKeysPool() {
  if (globalKeysPool.length > 0) return;
  
  const keys: GlobalKeyStatus[] = [];
  for (const envKey in process.env) {
    if (envKey.startsWith('GEMINI_KEY_') && process.env[envKey]) {
      keys.push({
        name: envKey,
        value: process.env[envKey]!.trim(),
        cooldownUntil: 0 // متاح فوراً عند تشغيل السيرفر
      });
    }
  }
  globalKeysPool = keys;
}

// 🔄 قائمة الموديلات الأربعة للتدوير والتنقل التلقائي لتفادي الضغط
const AVAILABLE_MODELS = [
  'gemini-1.5-flash',
  'gemini-2.0-flash',
  'gemini-2.5-flash',
  'gemini-3.5-flash'
];

/**
 * خدمة غيث المركزية المطوّرة والمُحصّنة - نظام قرار
 * تدعم التدوير التلقائي للمفاتيح والموديلات لمنع التوقف عند ضغط السيرفرات (503/429)
 */
export async function askGhaith(prompt: string, options?: GhaithOptions): Promise<string> {
  
  if (process.env.ENABLE_GHAITH !== 'true') {
    throw new Error('المساعد الرقمي غيث غير مفعّل حالياً في النظام.');
  }

  // 1. تجهيز الكاش العالمي للمفاتيح
  initializeGlobalKeysPool();

  if (globalKeysPool.length === 0) {
    throw new Error('خطأ: لم يتم العثور على أي مفاتيح (GEMINI_KEY_X) في إعدادات النظام.');
  }

  const maxRetries = 4; // عدد المحاولات لتغطية التبديل بين الموديلات الأربعة
  let attempts = 0;

  // حلقة التكرار تستمر طالما لم نتجاوز الحد الأقصى للمحاولات
  while (attempts < maxRetries) {
    const now = Date.now();
    
    // تصفية المفاتيح الجاهزة للعمل حالياً (ليست في فترة خمول)
    let activeKeys = globalKeysPool.filter(k => k.cooldownUntil <= now);

    // [صمام أمان]: إذا كانت كل المفاتيح "محظورة مؤقتاً"، نفتح الحظر تكتيكياً لتجنب الرفض الفوري
    if (activeKeys.length === 0) {
      activeKeys = [...globalKeysPool];
    }

    // اختيار مفتاح عشوائي من المفاتيح المتاحة حالياً
    const randomIndex = Math.floor(Math.random() * activeKeys.length);
    const selectedKeyObj = activeKeys[randomIndex];
    
    const selectedKey = selectedKeyObj.value;
    const selectedKeyName = selectedKeyObj.name;

    // 🎯 اختيار الموديل ديناميكياً من القائمة بناءً على رقم المحاولة
    const currentModel = AVAILABLE_MODELS[attempts % AVAILABLE_MODELS.length];

    try {
      attempts++;

      console.log(`🚀 [محاولة ${attempts}/${maxRetries}]: تجربة الموديل [${currentModel}] بمفتاح [${selectedKeyName}]...`);

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

      // إرسال الطلب مع تدوير الموديل والمفتاح
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${currentModel}:generateContent?key=${selectedKey}`,
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
          console.error(`[🔥 ضغط عالي (503)] الموديل [${currentModel}] بالمفتاح [${selectedKeyName}] مضغوط. التبديل للموديل القادم...`, errorData);
          cooldownMs = 15000;
        } else if (status === 429) {
          console.error(`[⏳ نفاد حصة (429)] المفتاح [${selectedKeyName}] تجاوز حد الطلبات.`, errorData);
          cooldownMs = 45000;
        } else if (status === 404) {
          console.error(`[⚠️ موديل غير متاح (404)] الموديل [${currentModel}] غير متاح في هذا الرابط. جاري التبديل للموديل التالي...`, errorData);
          cooldownMs = 2000;
        } else {
          console.error(`[❌ خطأ (${status})] في الموديل [${currentModel}] والمفتاح [${selectedKeyName}].`, errorData);
        }
        
        // وسم المفتاح بفترة خمول في الذاكرة
        const targetGlobalKey = globalKeysPool.find(k => k.name === selectedKeyName);
        if (targetGlobalKey) {
          targetGlobalKey.cooldownUntil = Date.now() + cooldownMs;
        }

        if (status === 503 || status === 429) {
          console.log(`⏱️ [آلية التقاط الأنفاس]: انتظار 1500 ملي ثانية قبل سحب الموديل والمفتاح البديل...`);
          await new Promise(resolve => setTimeout(resolve, 1500));
        }

        continue; // التبديل الفوري للموديل والمفتاح التالي
      }

      const data = (await response.json()) as GeminiResponse;
      const textResponse = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (!textResponse) {
        console.warn(`[⚠️ استجابة فارغة] من الموديل [${currentModel}] بالمفتاح [${selectedKeyName}]. المحاولة بموديل آخر.`);
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
          console.warn(`[⚠️ خطأ JSON] الموديل [${currentModel}] رجّع بيانات مكسورة. التبديل تلقائياً للموديل التالي.`);
          const targetGlobalKey = globalKeysPool.find(k => k.name === selectedKeyName);
          if (targetGlobalKey) targetGlobalKey.cooldownUntil = Date.now() + 5000;
          continue; 
        }
      }

      return cleanedText;

    } catch (error) {
      console.error(`[❌ خطأ شبكة] عند تجربة الموديل [${currentModel}] والمفتاح [${selectedKeyName}]:`, error);
      const targetGlobalKey = globalKeysPool.find(k => k.name === selectedKeyName);
      if (targetGlobalKey) targetGlobalKey.cooldownUntil = Date.now() + 10000;
    }
  }

  throw new Error('عذراً، فشل غيث في إتمام العملية حالياً بسبب قيود مؤقتة وضغط عالي في سيرفرات الخدمة الخارجية. يرجى المحاولة مرة أخرى خلال ثوانٍ.');
}
