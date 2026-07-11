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

// ⚙️ خيارات إضافية نرسلها لغيث عند الاستدعاء لتحديد طريقة معالجته للبيانات
interface GhaithOptions {
  responseJson?: boolean;       // إلزام غيث بالرد في شكل جيسون (إستمارة منظمة)
  systemInstruction?: string;   // تعليمات إضافية خاصة بالموديول الشغال حالياً
  inlineData?: {                // لدعم استقبال وقراءة ملفات الصور مباشرة (Base64)
    mimeType: string;
    data: string;
  };
}

/**
 * خدمة غيث المركزية المطوّرة - نظام قرار
 * وظيفته: إدارة مفاتيح الـ API الذكية، منع الحلقات التكرارية، وإلزام النظام بالجيسون، ودعم قراءة الصور.
 */
export async function askGhaith(prompt: string, options?: GhaithOptions): Promise<string> {
  
  // 1. الأمان: التأكد من تفعيل غيث في بيئة السيرفر
  if (process.env.ENABLE_GHAITH !== 'true') {
    throw new Error('المساعد الرقمي غيث غير مفعّل حالياً في النظام.');
  }

  // 2. تجميع كل المفاتيح المرقمة الموجودة في الإعدادات تلقائياً
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

  // 3. إعداد نظام التبديل الذكي ومنع الحلقات المفرغة (Anti-Loop & Smart Rotation)
  const availableKeys = [...keysWithNames];
  const maxRetries = 3; // أقصى عدد محاولات لو تكرر الخطأ لمنع استهلاك الحصص
  let attempts = 0;

  // حلقة ذكية تبدل المفاتيح تلقائياً في خلفية السيرفر دون إشعار المستخدم بالخطأ
  while (attempts < maxRetries && availableKeys.length > 0) {
    const randomIndex = Math.floor(Math.random() * availableKeys.length);
    const selectedKeyObj = availableKeys[randomIndex];
    
    const selectedKey = selectedKeyObj.value;
    const selectedKeyName = selectedKeyObj.name;

    try {
      attempts++;

      // 4. بناء جسم الطلب وتجهيز أجزاء الـ Prompt (النص + الصورة إن وجدت)
      const baseSystemInstruction = 'أنت غيث، المساعد الرقمي والمهندس والمشرف الأول الذكي لنظام قرار الإداري. وظيفتك هي مراقبة جودة البيانات، مساعدة الأعضاء المتطوعين، والتأكد من دقة وسير العمل بكل احترافية وبأعلى جودة إدارية.';
      
      const finalInstruction = options?.systemInstruction 
        ? `${baseSystemInstruction} ${options.systemInstruction}` 
        : baseSystemInstruction;

      // مصفوفة الأجزاء: نضع فيها النص أولاً
      const parts: GeminiPart[] = [{ text: prompt }];

      // لو الموديول أرسل ملف صورة (Base64)، ندمجها فوراً لغيث في الطلب ليراها
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

      // لو الموديول طلب جيسون، نلزم قوقل برمجياً بالرد كـ JSON حصراً
      if (options?.responseJson) {
        requestBody.generationConfig = {
          responseMimeType: 'application/json'
        };
      }

      // 5. إرسال الطلب لقوقل عبر الرابط الرسمي لـ gemini-3.5-flash
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1/models/gemini-3.5-flash:generateContent?key=${selectedKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody),
        }
      );

      // التعامل الذكي مع حظر الحساب أو نفاد الحصة
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error(`[🚨 تنبيه حظر أو نفاد حصة] المشكلة في: ${selectedKeyName}. سيتم التبديل تلقائياً.`, errorData);
        
        availableKeys.splice(randomIndex, 1); // استبعاد المفتاح الخربان في هذه المحاولة
        continue; // اذهب للمحاولة التالية فوراً بمفتاح جديد
      }

      // قراءة البيانات والتحقق من الرد النصي
      const data = (await response.json()) as GeminiResponse;
      const textResponse = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (!textResponse) {
        console.warn(`[⚠️ استجابة فارغة] من الحساب: ${selectedKeyName}. محاولة مفتاح آخر.`);
        availableKeys.splice(randomIndex, 1);
        continue;
      }

      // نجاح العملية! نرجع النص فوراً
      return textResponse;

    } catch (error) {
      console.error(`[❌ خطأ في المحاولة] أثناء استخدام ${selectedKeyName}:`, error);
      availableKeys.splice(randomIndex, 1);
    }
  }

  throw new Error('عذراً، فشل غيث في إتمام العملية حالياً بسبب قيود مؤقتة في سيرفرات الخدمة. يرجى المحاولة مرة أخرى.');
}
