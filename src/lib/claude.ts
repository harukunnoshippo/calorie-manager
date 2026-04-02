import type { NutritionResponse } from '../types';
import { db } from './db';

async function getApiKey(): Promise<string> {
  const settings = await db.settings.get('settings');
  if (!settings?.claudeApiKey) {
    throw new Error('APIキーが設定されていません。設定画面でClaude APIキーを入力してください。');
  }
  return settings.claudeApiKey;
}

async function callClaude(messages: Array<{ role: string; content: unknown }>): Promise<string> {
  const apiKey = await getApiKey();
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      messages,
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    let message: string;
    try {
      const errJson = JSON.parse(errText);
      const errMsg = errJson?.error?.message ?? '';
      if (errMsg.includes('credit balance is too low')) {
        message = 'APIクレジットが不足しています。console.anthropic.com でクレジットを購入してください。';
      } else if (errMsg.includes('invalid x-api-key') || errMsg.includes('invalid api key')) {
        message = 'APIキーが無効です。設定画面で正しいキーを入力してください。';
      } else if (res.status === 429) {
        message = 'リクエスト制限に達しました。しばらく待ってから再試行してください。';
      } else {
        message = errMsg || `APIエラーが発生しました (${res.status})`;
      }
    } catch {
      message = `APIエラーが発生しました (${res.status})`;
    }
    throw new Error(message);
  }

  const data = await res.json();
  const textBlock = data.content?.find((b: { type: string }) => b.type === 'text');
  return textBlock?.text ?? '';
}

function parseNutritionJSON(text: string): NutritionResponse {
  const jsonMatch = text.match(/\{[\s\S]*?\}/);
  if (!jsonMatch) throw new Error('栄養成分の解析に失敗しました');

  const parsed = JSON.parse(jsonMatch[0]);
  return {
    name: parsed.name ?? '不明な食品',
    protein: Math.max(0, Number(parsed.protein) || 0),
    fat: Math.max(0, Number(parsed.fat) || 0),
    carbs: Math.max(0, Number(parsed.carbs) || 0),
    calories: Math.max(0, Number(parsed.calories) || 0),
    confidence: parsed.confidence ?? 'medium',
    notes: parsed.notes,
  };
}

export async function analyzePhoto(imageBase64: string, mimeType: string): Promise<NutritionResponse> {
  const response = await callClaude([
    {
      role: 'user',
      content: [
        {
          type: 'image',
          source: { type: 'base64', media_type: mimeType, data: imageBase64 },
        },
        {
          type: 'text',
          text: `あなたは栄養成分表示の読み取りアシスタントです。
この写真に含まれる栄養成分表示を読み取り、以下のJSON形式で返してください:

{
  "name": "商品名（わかれば）",
  "protein": 数値(g),
  "fat": 数値(g),
  "carbs": 数値(g),
  "calories": 数値(kcal),
  "confidence": "high" | "medium" | "low",
  "notes": "読み取りに関する注意点"
}

栄養成分表示が見つからない場合は、写真に写っている食品から推定してください。
炭水化物が糖質と食物繊維に分かれている場合は合算してください。
数値のみを返し、単位は含めないでください。JSONのみを返してください。`,
        },
      ],
    },
  ]);
  return parseNutritionJSON(response);
}

export async function estimateFromText(description: string): Promise<NutritionResponse> {
  const response = await callClaude([
    {
      role: 'user',
      content: `あなたは栄養士アシスタントです。
以下の食事内容からPFC（たんぱく質・脂質・炭水化物）とカロリーを推定してください:

食事内容: ${description}

以下のJSON形式で返してください:
{
  "name": "食事名",
  "protein": 数値(g),
  "fat": 数値(g),
  "carbs": 数値(g),
  "calories": 数値(kcal),
  "confidence": "high" | "medium" | "low",
  "notes": "推定の根拠や注意点"
}

一般的な一人前の量を基準にしてください。JSONのみを返してください。`,
    },
  ]);
  return parseNutritionJSON(response);
}
