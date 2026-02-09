<?php

namespace App\Application\AI\Query\ChatWithAI;

use App\Application\Contract\QueryHandlerInterface;
use App\Domain\Entity\Commodity;
use App\Domain\Entity\ShopCategory;
use App\Domain\Repository\ShopRepositoryInterface;
use App\Infrastructure\AI\AIService;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

final class ChatWithAIHandler implements QueryHandlerInterface
{
    public function __construct(
        private AIService $aiService,
        private ShopRepositoryInterface $shopRepository
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

        $prompt = <<<PROMPT
            Ты консультант интернет-магазина. Вот список товаров и их категорий: $productList.
            Пользователь спрашивает: "{$query->message}"
            
            Выбери из этого списка подходящие товары к запросу пользователя и запиши их с категориями в JSON-массив, ОБЯЗАТЕЛЬНО без каких-либо дополнительных символов (например, без ``` или подписи json!). Массив должен быть вот так:
            selected_commodities: [{"commodityTitle":"Яблоко","categoryId":41}, ...]
            Сначала напиши человеку нормальный ответ, а затем на новой строке, только JSON, без каких-либо других слов, подписей, без ```!
            Если ничего не подошло — выведи пустой массив: selected_commodities: []
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
