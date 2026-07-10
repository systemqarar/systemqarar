// src/services/ghaithService.ts

// ==========================================
// 🛡️ الواجهات البرمجية الصارمة لردود جيمني (Type-Safe Interfaces)
// ==========================================
interface GeminiPart {
  text: string;
}

interface GeminiContent {
  parts: GeminiPart[];
  role?: string;
}

interface GeminiCandidate {
  content: GeminiContent;
  finishReason?: string;
}

interface GeminiResponse {
  candidates?: GeminiCandidate[];
  usageMetadata?: {
    promptTokenCount: number;
    candidatesTokenCount: number;
    totalTokenCount: number;
  };
}

/**
 * خدمة غيث المركزية المطوّرة - نظام قرار
 * وظيفته: اختيار مفتاح مرقم عشوائياً، ومعرفة اسمه بالظبط عند حدوث أي خطأ لتسهيل مراقبته
 */
export async function askGhaith(prompt: string): Promise<string> {
  
  // 1. الأمان: التأكد من تفعيل غيث
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

  // 3. اختيار مفتاح عشوائي من المفاتيح المتوفرة
  const randomIndex = Math.floor(Math.random() * keysWithNames.length);
  const selectedKeyObj = keysWithNames[randomIndex];
  
  const selectedKey = selectedKeyObj.value;
  const selectedKeyName = selectedKeyObj.name; 

  // 4. إرسال الطلب لقوقل (تعديل المسار إلى v1beta والنسخة المستقرة مجاناً 1.5-flash)
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${selectedKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      }
    );

    // 5. كشف الحساب المحظور فوراً
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error(`[🚨 تنبيه حظر] المشكلة في المفتاح: ${selectedKeyName}`, errorData);
      throw new Error(`فشل الاتصال بجيمني عبر الحساب: ${selectedKeyName}`);
    }

    const data = (await response.json()) as GeminiResponse;
    const textResponse = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!textResponse) {
      throw new Error(`استلمنا استجابة فارغة من الحساب: ${selectedKeyName}`);
    }

    return textResponse;

  } catch (error) {
    console.error(`[❌ خطأ في السيرفر] أثناء محاولة استخدام ${selectedKeyName}:`, error);
    throw error;
  }
}
