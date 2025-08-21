<?php

namespace App\Controller;

use App\Entity\Commodity;
use App\Entity\Shop;
use App\Entity\ShopCategory;
use App\Services\AIService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

class AIController extends AbstractController
{
    public function __construct(
        protected AIService $AIService,
        protected EntityManagerInterface $em,
    ) {
    }

    #[Route('/ai', name: 'app_ai_index', methods: ['GET'])]
    public function index(): Response
    {
        dd('Тут будет ответ от AI, когда AI будет бесплатным');
        dd($this->AIService->submit('Привет!'));
    }

    #[Route('/api/ai', name: 'app_ai_api', methods: ['POST'])]
    public function chat(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        $shopId = $data['shopId'];
        $question = $data['message'] ?? '';

        $shop = $this->em->getRepository(Shop::class)->find($shopId);
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
            Пользователь спрашивает: "{$question}"
            
            Выбери из этого списка подходящие товары к запросу пользователя и запиши их с категориями в JSON-массив, ОБЯЗАТЕЛЬНО без каких-либо дополнительных символов (например, без ``` или подписи json!). Массив должен быть вот так:
            selected_commodities: [{"commodityTitle":"Яблоко","categoryId":41}, ...]
            Сначала напиши человеку нормальный ответ, а затем на новой строке, только JSON, без каких-либо других слов, подписей, без ```!
            Если ничего не подошло — выведи пустой массив: selected_commodities: []
        PROMPT;

        $aiResponse = $this->AIService->submit($prompt);
        $aiResponseContent = $aiResponse->getContent();

        $selectedCommodities = [];
        $answer = $aiResponseContent;

        if (preg_match('/selected_commodities:\s*(\[(?:.|\s)*?\])/', $aiResponseContent, $matches)) {
            $selectedCommoditiesJson = $matches[1];
            $selectedCommodities = json_decode($selectedCommoditiesJson, true);

            $answer = trim(substr($aiResponseContent, 0, strpos($aiResponseContent, 'selected_commodities:')));
        }

        $categories = [];
        foreach ($selectedCommodities as $item) {
            /** @var ShopCategory $foundShopCategory */
            $foundShopCategory = $shopCategories->filter(function ($cat) use ($item) {
                return $cat->getId() === $item['categoryId'];
            })->first();

            if ($foundShopCategory) {
                $categories[] = [
                    'id' => $foundShopCategory->getId(),
                    'title' => $foundShopCategory->getCategory()->getTitle(),
                    'x_coordinate' => $foundShopCategory->getXCoordinate(),
                    'y_coordinate' => $foundShopCategory->getYCoordinate(),
                ];
            }
        }

        return $this->json([
            'answer' => $answer,
            'categories' => $categories,
        ]);
    }
}