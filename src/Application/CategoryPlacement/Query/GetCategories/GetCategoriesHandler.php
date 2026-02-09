<?php

namespace App\Application\CategoryPlacement\Query\GetCategories;

use App\Application\Contract\QueryHandlerInterface;
use App\Domain\Repository\ShopCategoryRepositoryInterface;
use App\Domain\Repository\ShopRepositoryInterface;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

final class GetCategoriesHandler implements QueryHandlerInterface
{
    public function __construct(
        private ShopRepositoryInterface $shopRepository,
        private ShopCategoryRepositoryInterface $shopCategoryRepository
    ) {
    }

    public function __invoke(GetCategoriesQuery $query): array
    {
        $shop = $this->shopRepository->findById($query->shopId);

        if (!$shop) {
            throw new NotFoundHttpException('Shop not found');
        }

        $shopCategories = $this->shopCategoryRepository->findByShop($shop);

        return array_map(function ($sc) {
            return [
                'id' => $sc->getId(),
                'category_title' => $sc->getCategory()?->getTitle() ?? 'N/A',
                'x_coordinate' => $sc->getXCoordinate(),
                'y_coordinate' => $sc->getYCoordinate(),
            ];
        }, $shopCategories);
    }
}
