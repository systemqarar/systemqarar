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

// 🌐 [إضافة هندسية]: واجهة لإدارة حالة المفاتيح عالمياً في السيرفر
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

/**
 * خدمة غيث المركزية المطوّرة والمُحصّنة - نظام قرار
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

  const maxRetries = 3; 
  let attempts = 0;

  // حلقة التكرار تستمر طالما لم نتجاوز الحد الأقصى للمحاولات للطلب الحالي
  while (attempts < maxRetries) {
    const now = Date.now();
    
    // تصفية المفاتيح الجاهزة للعمل حالياً (ليست في فترة خمول)
    let activeKeys = globalKeysPool.filter(k => k.cooldownUntil <= now);

    // [صمام أمان]: إذا كانت كل المفاتيح "محظورة مؤقتاً" في الذاكرة العالمية، نفتح الحظر تكتيكياً لتجنب الرفض الفوري للطلب
    if (activeKeys.length === 0) {
      activeKeys = [...globalKeysPool];
    }

    // اختيار مفتاح عشوائي من المفاتيح المتاحة حالياً
    const randomIndex = Math.floor(Math.random() * activeKeys.length);
    const selectedKeyObj = activeKeys[randomIndex];
    
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

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${selectedKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const status = response.status;

        // تحديد مدة الخمول بناءً على نوع الخطأ (429 تحتاج وقت أطول لتصفير الدقيقة، 503 فواق مؤقت)
        let cooldownMs = 10000; // 10 ثوانٍ كحد أدنى لأي خطأ سيرفر غير متوقع
        
        if (status === 503) {
          console.error(`[🔥 ضغط عالي وعشوائي (503)] المشكلة في: ${selectedKeyName}. سيرفر قوقل يعاني من ازدحام مؤقت عالمياً.`, errorData);
          cooldownMs = 15000; // وضع المفتاح في الخمول لمدة 15 ثانية
        } else if (status === 429) {
          console.error(`[⏳ نفاد حصة مؤقت (429)] المشكلة في: ${selectedKeyName}. المفتاح تجاوز حد الطلبات المسموح به للدقيقة.`, errorData);
          cooldownMs = 45000; // وضع المفتاح في الخمول لمدة 45 ثانية (حتى تنتهي الدقيقة الحالية لجوجل)
        } else {
          console.error(`[❌ خطأ سيرفر غير متوقع (${status})] في المفتاح: ${selectedKeyName}.`, errorData);
        }
        
        // 🛡️ [التعديل الجوهري]: وسم المفتاح بفترة الخمول في الذاكرة العالمية ليتخطاه أي طلب متزامن آخر فوراً
        const targetGlobalKey = globalKeysPool.find(k => k.name === selectedKeyName);
        if (targetGlobalKey) {
          targetGlobalKey.cooldownUntil = Date.now() + cooldownMs;
        }

        // آلية التقاط الأنفاس للطلب الحالي قبل الانتقال للمفتاح البديل المتاح في المصفوفة العالمية
        if (status === 503 || status === 429) {
          console.log(`⏱️ [آلية التقاط الأنفاس]: سيتم الانتظار لمدة 1500 ملي ثانية قبل سحب المفتاح البديل لتفادي الاختناق التتابعي...`);
          await new Promise(resolve => setTimeout(resolve, 1500));
        }

        continue; 
      }

      const data = (await response.json()) as GeminiResponse;
      const textResponse = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (!textResponse) {
        console.warn(`[⚠️ استجابة فارغة] من الحساب: ${selectedKeyName}. محاولة مفتاح آخر.`);
        // وسم المفتاح بخمول قصير جداً لأنه قد يكون عيب سياق مؤقت
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
          console.warn(`[⚠️ خطأ في قالب JSON] المفتاح [${selectedKeyName}] رجّع بيانات مكسورة حتى بعد التنظيف. جاري التبديل تلقائياً لحماية النظام.`);
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
