# AI Context Feature

## Overview

Each shop can have its own custom AI context that influences how the AI assistant responds to customer queries. This allows tailoring the AI behavior based on whether it's a retail store, warehouse, or specialized shop.

## Configuration

### Admin Panel

Navigate to **Admin Panel → Shops → Edit Shop** and find the **"Контекст для AI-помощника"** field.

#### Examples

**Retail Store:**
```
Это продуктовый магазин с широким ассортиментом свежих продуктов. 
Особое внимание уделяется органической продукции и товарам местных фермеров.
При рекомендациях учитывай сезонность и свежесть продуктов.
```

**Warehouse:**
```
Это склад строительных материалов для профессионалов.
Товары продаются крупным оптом, минимальная партия - от 10 единиц.
При подборе рекомендуй сопутствующие материалы для комплексного ремонта.
```

**Specialty Shop:**
```
Это магазин спортивного питания и добавок для атлетов.
Покупатели обычно интересуются составом, дозировками и совместимостью продуктов.
Давай рекомендации с учетом спортивных целей клиента.
```

## How It Works

1. Admin sets context for a shop via admin panel
2. Context is stored in `shop.ai_context` field (TEXT column)
3. When user chats with AI assistant via `/api/ai` endpoint, the handler:
   - Fetches the shop by `shopId`
   - Retrieves `shop.getAiContext()`
   - Prepends context to the AI prompt if available
   - Sends enhanced prompt to AI service

### Implementation Details

The context is injected at the beginning of the AI prompt in `ChatWithAIHandler`:

```php
$aiContext = $shop->getAiContext();
$contextPrefix = $aiContext 
    ? "Контекст заведения: {$aiContext}\n\n" 
    : '';

$prompt = <<<PROMPT
    {$contextPrefix}Ты консультант интернет-магазина...
PROMPT;
```

## Database Schema

```sql
ALTER TABLE shop ADD ai_context LONGTEXT DEFAULT NULL;
```

Migration: `migrations/Version20260225125800.php`

## Benefits

- **Personalized responses**: AI adapts to the type of business
- **Context-aware recommendations**: Considers shop specifics (organic, wholesale, specialty)
- **Improved customer experience**: More relevant product suggestions
- **Flexible configuration**: Each shop maintains its own context without code changes

## Best Practices

1. **Be specific**: Describe the shop type, target audience, and key differentiators
2. **Keep it concise**: 2-4 sentences is usually enough
3. **Update regularly**: Adjust context when shop focus changes
4. **Test responses**: Verify AI recommendations align with your expectations
5. **Language**: Use the same language as your customers (Russian in this case)

## API

The AI context is automatically used when calling:
- **Endpoint**: `POST /api/ai`
- **Payload**: `{ "shopId": 1, "message": "нужно купить продукты на неделю" }`
- **Response**: AI uses shop context to provide tailored recommendations

No additional parameters needed - context is fetched automatically based on `shopId`.
