<?php

namespace App\Application\Collection\Query\GetCollections;

use App\Application\Contract\QueryHandlerInterface;
use App\Domain\Repository\ProductCollectionRepositoryInterface;
use App\Domain\Repository\ShopRepositoryInterface;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

final class GetCollectionsHandler implements QueryHandlerInterface
{
    public function __construct(
        private ShopRepositoryInterface $shopRepository,
        private ProductCollectionRepositoryInterface $collectionRepository
    ) {
    }

    public function __invoke(GetCollectionsQuery $query): array
    {
        $shop = $this->shopRepository->findById($query->shopId);

        if (!$shop) {
            throw new NotFoundHttpException('Shop not found');
        }

        $collections = $this->collectionRepository->findActiveByShop($shop, $query->userId);

        return array_map(function ($collection) use ($query) {
            $items = [];
            foreach ($collection->getCommodities() as $commodity) {
                // Find the ShopCategory for this commodity in this shop
                $shopCategory = null;
                foreach ($commodity->getShopCategories() as $sc) {
                    if ($sc->getShop()?->getId() === $collection->getShop()?->getId()) {
                        $shopCategory = $sc;
                        break;
                    }
                }

                $items[] = [
                    'id' => $commodity->getId(),
                    'commodityId' => $commodity->getId(),
                    'commodityTitle' => $commodity->getTitle(),
                    'price' => $commodity->getPrice(),
                    'categoryId' => $shopCategory?->getId(),
                    'categoryTitle' => $shopCategory?->getCategory()?->getTitle(),
                    'x' => $shopCategory?->getXCoordinate(),
                    'y' => $shopCategory?->getYCoordinate(),
                ];
            }

            return [
                'id' => $collection->getId(),
                'title' => $collection->getTitle(),
                'description' => $collection->getDescription(),
                'emoji' => $collection->getEmoji(),
                'isPersonal' => $query->userId !== null && $collection->getUser()?->getId() === $query->userId,
                'items' => $items,
            ];
        }, $collections);
    }
}
