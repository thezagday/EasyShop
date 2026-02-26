<?php

namespace App\Infrastructure\Ui\Controller\Api;

use App\Domain\Repository\ShopRepositoryInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;

class ShopCommodityController extends AbstractController
{
    public function __construct(
        private readonly ShopRepositoryInterface $shopRepository
    ) {
    }

    #[Route('/api/shops/{shopId}/commodities', name: 'api_shop_commodities', methods: ['GET'])]
    public function list(int $shopId): JsonResponse
    {
        $shop = $this->shopRepository->findById($shopId);
        if (!$shop) {
            return $this->json(['error' => 'Shop not found'], 404);
        }

        $commodities = [];
        foreach ($shop->getShopCategories() as $shopCategory) {
            $categoryTitle = $shopCategory->getCategory()?->getTitle();
            foreach ($shopCategory->getCommodities() as $commodity) {
                $commodities[] = [
                    'id' => $commodity->getId(),
                    'title' => $commodity->getTitle(),
                    'price' => $commodity->getPrice(),
                    'categoryTitle' => $categoryTitle,
                ];
            }
        }

        usort($commodities, fn($a, $b) => strcmp($a['title'], $b['title']));

        return $this->json(['commodities' => $commodities]);
    }
}
