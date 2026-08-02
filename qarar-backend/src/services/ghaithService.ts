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

// 🌐 إدارة حالة المفاتيح المتعددة من حسابات مختلفة
interface GlobalKeyStatus {
  name: string;
  value: string;
  cooldownUntil: number; // التوقيت الزمني بالملي ثانية الذي ينتهي فيه حظر المفتاح
}

// الذاكرة العالمية للمفاتيح (تمنع احتراق المفاتيح بالتزامن)
let globalKeysPool: GlobalKeyStatus[] = [];

/**
 * دالة جلب وتحديث المفاتيح من متغيرات البيئة (process.env)
 */
function refreshKeysPool() {
  const currentEnvKeys: { name: string; value: string }[] = [];

  // 1. البحث عن كل المفاتيح التي تبدأ بـ GEMINI_KEY_
  for (const envKey in process.env) {
    if (envKey.startsWith('GEMINI_KEY_') && process.env[envKey]?.trim()) {
      currentEnvKeys.push({
        name: envKey,
        value: process.env[envKey]!.trim()
      });
    }
  }

  // 2. دعم مفتاح GEMINI_API_KEY المباشر في حال عدم وجود مفاتيح مرقمة
  if (currentEnvKeys.length === 0 && process.env.GEMINI_API_KEY?.trim()) {
    currentEnvKeys.push({
      name: 'GEMINI_API_KEY',
      value: process.env.GEMINI_API_KEY.trim()
    });
  }

  // 3. تحديث الـ Pool مع الحفاظ على مواعيد الـ cooldown للمفاتيح الموجودة سابقاً
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

/**
 * دالة مساعدة للانتظار المريح
 */
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * خدمة غيث المركزية المطوّرة والمُحصّنة - نظام قرار
 */
export async function askGhaith(prompt: string, options?: GhaithOptions): Promise<string> {
  
  if (process.env.ENABLE_GHAITH !== 'true') {
    throw new Error('المساعد الرقمي غيث غير مفعّل حالياً في النظام.');
  }

  // تحديث قائمة المفاتيح من البيئة
  refreshKeysPool();

  if (globalKeysPool.length === 0) {
    throw new Error('خطأ: لم يتم العثور على أي مفاتيح (GEMINI_KEY_X) في إعدادات البيئة (Render).');
  }

  // عدد المحاولات الكلي = عدد المفاتيح المتاحة × 2
  const maxAttempts = Math.max(globalKeysPool.length * 2, 4);
  let attempts = 0;

  while (attempts < maxAttempts) {
    attempts++;
    const now = Date.now();
    
    // تصفية المفاتيح الجاهزة فوراً (ليست في فترة خمول)
    let activeKeys = globalKeysPool.filter(k => k.cooldownUntil <= now);

    // لو كل المفاتيح من كل الحسابات محظورة حالياً:
    if (activeKeys.length === 0) {
      // رتّب المفاتيح حسب الأقرب للخروج من الخمول
      const sortedKeys = [...globalKeysPool].sort((a, b) => a.cooldownUntil - b.cooldownUntil);
      const nextAvailableKey = sortedKeys[0];
      const waitTime = Math.max(nextAvailableKey.cooldownUntil - now, 1000);
      
      console.warn(`⚠️ [كل مفاتيح الحسابات في حالة خمول]: انتظار ${Math.ceil(waitTime / 1000)}s لتصفير عداد جوجل...`);
      await sleep(Math.min(waitTime, 10000)); // انتظار الحد الأدنى
      
      refreshKeysPool();
      activeKeys = globalKeysPool.filter(k => k.cooldownUntil <= Date.now());
      if (activeKeys.length === 0) {
        activeKeys = [...globalKeysPool]; // محاولة اضطرارية لأقل مفتاح خمولاً
      }
    }

    // اختيار أول مفتاح جاهز من حساب مختلف
    const selectedKeyObj = activeKeys[0];
    const selectedKey = selectedKeyObj.value;
    const selectedKeyName = selectedKeyObj.name;

    try {
      const baseSystemInstruction = 'أنت غيث، المساعد الرقمي الذكي لنظام قرار. تتحدث بلباقة، احترافية، وذكاء عالٍ. أسلوبك متعاون ومناسب تماماً للسياق والمهمة المطلوبة منك حالياً. إذا طُلب منك الرد بصيغة JSON، يجب أن يكون الرد صالحاً ومطابقاً للقواعد تماماً بدون أي أخطاء مصنعية.';
      
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

      // 🟢 [الموديل المستقر والأضمن لكل حسابات جوجل المجانية]
      const MODEL_NAME = 'gemini-1.5-flash';
      
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

        // وضع المفتاح الحالي في الخمول فوراً
        const targetGlobalKey = globalKeysPool.find(k => k.name === selectedKeyName);
        
        if (status === 429) {
          console.warn(`[⏳ 429 نفاد حصة] المفتاح [${selectedKeyName}] استُهلك. تحويل فوراً للمفتاح التالي...`);
          if (targetGlobalKey) targetGlobalKey.cooldownUntil = Date.now() + 60000; // خمول دقيقة
        } else if (status === 503) {
          console.warn(`[🔥 503 ضغط سيرفر] المفتاح [${selectedKeyName}]. تحويل فوراً...`);
          if (targetGlobalKey) targetGlobalKey.cooldownUntil = Date.now() + 15000; // خمول 15 ثانية
        } else {
          console.error(`[❌ خطأ سيرفر ${status}] المفتاح [${selectedKeyName}]:`, errorData);
          if (targetGlobalKey) targetGlobalKey.cooldownUntil = Date.now() + 30000;
        }

        // 🔄 الانتقال فوراً للمفتاح القادم من الحساب الثاني دون تعطيل العميل
        continue; 
      }

      const data = (await response.json()) as GeminiResponse;
      const textResponse = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (!textResponse) {
        console.warn(`[⚠️ استجابة فارغة] من المفتاح [${selectedKeyName}]. جاري المحاولة بمفتاح آخر...`);
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
          console.warn(`[⚠️ JSON مكسور] المفتاح [${selectedKeyName}] رجّع صيغة غير صالحة. جاري التبديل...`);
          const targetGlobalKey = globalKeysPool.find(k => k.name === selectedKeyName);
          if (targetGlobalKey) targetGlobalKey.cooldownUntil = Date.now() + 5000;
          continue; 
        }
      }

      // 🎉 نجحت العملية بنجاح باستخدام هذا المفتاح!
      return cleanedText;

    } catch (error) {
      console.error(`[❌ خطأ شبكة/اتصال] مع المفتاح [${selectedKeyName}]:`, error);
      const targetGlobalKey = globalKeysPool.find(k => k.name === selectedKeyName);
      if (targetGlobalKey) targetGlobalKey.cooldownUntil = Date.now() + 10000;
    }
  }

  throw new Error('عذراً، فشل غيث في إتمام العملية حالياً بسبب ضغط مؤقت في جميع المفاتيح المتاحة. يرجى المحاولة بعد لحظات.');
}
