<?php

namespace App\Application\AI\Query\ChatWithAI;

use App\Application\Contract\QueryHandlerInterface;
use App\Domain\Entity\Commodity;
use App\Domain\Entity\ShopCategory;
use App\Domain\Repository\ShopRepositoryInterface;
use App\Domain\Repository\UserRepositoryInterface;
use App\Infrastructure\AI\AIService;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

final class ChatWithAIHandler implements QueryHandlerInterface
{
    public function __construct(
        private AIService $aiService,
        private ShopRepositoryInterface $shopRepository,
        private UserRepositoryInterface $userRepository
    ) {
    }

    public function __invoke(ChatWithAIQuery $query): array
    {
        $shop = $this->shopRepository->findById($query->shopId);

        if (!$shop) {
            throw new NotFoundHttpException('Shop not found');
        }

        $shopCategories = $shop->getShopCategories();

        $commoditiesAndCategories = [];
        /** @var ShopCategory $shopCategory */
        foreach ($shopCategories as $shopCategory) {
            /** @var Commodity $commodity */
            foreach ($shopCategory->getCommodities() as $commodity) {
                $commoditiesAndCategories[] = [
                    'commodityTitle' => $commodity->getTitle(),
                    'categoryId' => $shopCategory->getId(),
                ];
            }
        }

        $productList = implode("; ", array_map(
            fn($pc) => "{$pc['commodityTitle']} ({$pc['categoryId']})",
            $commoditiesAndCategories
        ));

        // Build context-aware prompt
        $contextParts = [];
        $lang = $query->locale ?? 'pl';
        if (!in_array($lang, ['pl', 'en'], true)) {
            $lang = 'pl';
        }

        $contextLabels = [
            'ru' => ['shop' => 'Контекст заведения', 'user' => 'Пожелания пользователя'],
            'en' => ['shop' => 'Shop context', 'user' => 'User preferences'],
            'pl' => ['shop' => 'Kontekst lokalu', 'user' => 'Życzenia użytkownika'],
        ];
        $labels = $contextLabels[$lang];
        
        // Shop context
        $shopContext = $shop->getAiContext();
        if ($shopContext) {
            $contextParts[] = "{$labels['shop']}: {$shopContext}";
        }
        
        // User context
        if ($query->userId) {
            $user = $this->userRepository->findById($query->userId);
            if ($user) {
                $userContext = $user->getUserContext();
                if ($userContext) {
                    $contextParts[] = "{$labels['user']}: {$userContext}";
                }
            }
        }
        
        $contextPrefix = !empty($contextParts) 
            ? implode("\n", $contextParts) . "\n\n" 
            : '';

        $instructions = [
            'ru' => [
                'role' => 'Ты консультант интернет-магазина.',
                'format' => 'Выбери из этого списка подходящие товары к запросу пользователя и запиши их с категориями в JSON-массив, ОБЯЗАТЕЛЬНО без каких-либо дополнительных символов (например, без ``` или подписи json!). Массив должен быть вот так:',
                'example' => 'selected_commodities: [{"commodityTitle":"Яблоко","categoryId":41}, ...]',
                'response' => 'Сначала напиши человеку нормальный ответ, а затем на новой строке, только JSON, без каких-либо других слов, подписей, без ```!',
                'fallback' => 'Если ничего не подошло — выведи пустой массив: selected_commodities: []',
                'list_prefix' => 'Вот список товаров и их категорий:',
                'user_prefix' => 'Пользователь спрашивает:',
            ],
            'en' => [
                'role' => 'You are an online store consultant.',
                'format' => 'Select suitable products from this list for the user\'s request and record them with categories in a JSON array, MANDATORY without any additional characters (for example, without ``` or json signature!). The array should be like this:',
                'example' => 'selected_commodities: [{"commodityTitle":"Apple","categoryId":41}, ...]',
                'response' => 'First write a normal response to the person, and then on a new line, only JSON, without any other words, signatures, without ```!',
                'fallback' => 'If nothing matches - output an empty array: selected_commodities: []',
                'list_prefix' => 'Here is the list of products and their categories:',
                'user_prefix' => 'The user asks:',
            ],
            'pl' => [
                'role' => 'Jesteś konsultantem sklepu internetowego.',
                'format' => 'Wybierz z tej listy produkty odpowiednie dla zapytania użytkownika i zapisz je wraz z kategoriami w tablicy JSON, OBOWIĄZKOWO bez żadnych dodatkowych znaków (na przykład bez ``` lub podpisu json!). Tablica powinna wyglądać tak:',
                'example' => 'selected_commodities: [{"commodityTitle":"Jabłko","categoryId":41}, ...]',
                'response' => 'Najpierw napisz osobie normalną odpowiedź, a następnie w nowej linii, tylko JSON, bez żadnych innych słów, podpisów, bez ```!',
                'fallback' => 'Jeśli nic nie pasuje - wypisz pustą tablicę: selected_commodities: []',
                'list_prefix' => 'Oto lista produktów i ich kategorii:',
                'user_prefix' => 'Użytkownik pyta:',
            ],
        ];

        $lang = $query->locale ?? 'pl';
        if (!isset($instructions[$lang])) {
            $lang = 'pl';
        }
        $inst = $instructions[$lang];

        $prompt = <<<PROMPT
            {$contextPrefix}{$inst['role']} {$inst['list_prefix']} $productList.
            {$inst['user_prefix']} "{$query->message}"
            
            {$inst['format']}
            {$inst['example']}
            {$inst['response']}
            {$inst['fallback']}
        PROMPT;

        $aiResponse = $this->aiService->submit($prompt);
        $aiResponseContent = $aiResponse->getContent();

        $selectedCommodities = [];
        $answer = $aiResponseContent;

        if (preg_match('/selected_commodities:\s*(\[(?:.|\s)*?\])/', $aiResponseContent, $matches)) {
            $selectedCommoditiesJson = $matches[1];
            $selectedCommodities = json_decode($selectedCommoditiesJson, true);

            $answer = trim(substr($aiResponseContent, 0, strpos($aiResponseContent, 'selected_commodities:')));
        }

        // Group selected commodities by categoryId
        $groupedByCategoryId = [];
        foreach ($selectedCommodities as $item) {
            $catId = $item['categoryId'] ?? null;
            if ($catId === null) continue;
            $groupedByCategoryId[$catId][] = $item['commodityTitle'] ?? '';
        }

        $categories = [];
        foreach ($groupedByCategoryId as $categoryId => $commodityTitles) {
            /** @var ShopCategory $foundShopCategory */
            $foundShopCategory = $shopCategories->filter(function ($cat) use ($categoryId) {
                return $cat->getId() === $categoryId;
            })->first();

            if ($foundShopCategory) {
                $categories[] = [
                    'id' => $foundShopCategory->getId(),
                    'title' => $foundShopCategory->getCategory()->getTitle(),
                    'x_coordinate' => $foundShopCategory->getXCoordinate(),
                    'y_coordinate' => $foundShopCategory->getYCoordinate(),
                    'commodities' => array_values(array_filter($commodityTitles)),
                ];
            }
        }

        return [
            'answer' => $answer,
            'categories' => $categories,
        ];
    }
}
