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

/**
 * خدمة غيث المركزية المطوّرة والمُحصّنة - نظام قرار
 */
export async function askGhaith(prompt: string, options?: GhaithOptions): Promise<string> {
  
  if (process.env.ENABLE_GHAITH !== 'true') {
    throw new Error('المساعد الرقمي غيث غير مفعّل حالياً في النظام.');
  }

  const keysWithNames: { name: string; value: string }[] = [];
  for (const envKey in process.env) {
    if (envKey.startsWith('GEMINI_KEY_') && process.env[envKey]) {
      keysWithNames.push({
        name: envKey,
        value: process.env[envKey]!.trim()
      });
    }
  }

  if (keysWithNames.length === 0) {
    throw new Error('خطأ: لم يتم العثور على أي مفاتيح (GEMINI_KEY_X) في إعدادات النظام.');
  }

  const availableKeys = [...keysWithNames];
  const maxRetries = 3; 
  let attempts = 0;

  while (attempts < maxRetries && availableKeys.length > 0) {
    const randomIndex = Math.floor(Math.random() * availableKeys.length);
    const selectedKeyObj = availableKeys[randomIndex];
    
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

      // 🔍 [التعديل الجوهري]: فحص وتصنيف الأخطاء بدقة مع إدخال آلية التقاط الأنفاس
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const status = response.status;

        // 1. تصنيف اللوقس المتقدم بناءً على رمز الحالة المرتجع
        if (status === 503) {
          console.error(`[🔥 ضغط عالي وعشوائي (503)] المشكلة في: ${selectedKeyName}. سيرفر قوقل يعاني من ازدحام مؤقت عالمياً.`, errorData);
        } else if (status === 429) {
          console.error(`[⏳ نفاد حصة مؤقت (429)] المشكلة في: ${selectedKeyName}. المفتاح تجاوز حد الطلبات المسموح به للدقيقة.`, errorData);
        } else {
          console.error(`[❌ خطأ سيرفر غير متوقع (${status})] في المفتاح: ${selectedKeyName}.`, errorData);
        }
        
        // 2. آلية التقاط الأنفاس الذكية لحماية المفاتيح البديلة من الاحتراق السريع
        if (status === 503 || status === 429) {
          console.log(`⏱️ [آلية التقاط الأنفاس]: سيتم الانتظار لمدة 1500 ملي ثانية قبل سحب المفتاح البديل لتفادي الاختناق التتابعي...`);
          await new Promise(resolve => setTimeout(resolve, 1500));
        }

        availableKeys.splice(randomIndex, 1); 
        continue; 
      }

      const data = (await response.json()) as GeminiResponse;
      const textResponse = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (!textResponse) {
        console.warn(`[⚠️ استجابة فارغة] من الحساب: ${selectedKeyName}. محاولة مفتاح آخر.`);
        availableKeys.splice(randomIndex, 1);
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
          availableKeys.splice(randomIndex, 1);
          continue; 
        }
      }

      return cleanedText;

    } catch (error) {
      console.error(`[❌ خطأ شبكة/اتصال] أثناء استخدام ${selectedKeyName}:`, error);
      availableKeys.splice(randomIndex, 1);
    }
  }

  throw new Error('عذراً، فشل غيث في إتمام العملية حالياً بسبب قيود مؤقتة وضغط عالي في سيرفرات الخدمة الخارجية. يرجى المحاولة مرة أخرى خلال ثوانٍ.');
}
