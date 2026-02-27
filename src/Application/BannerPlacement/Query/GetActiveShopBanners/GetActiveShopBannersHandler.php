<?php

namespace App\Application\BannerPlacement\Query\GetActiveShopBanners;

use App\Application\Contract\QueryHandlerInterface;
use App\Domain\Repository\ShopBannerRepositoryInterface;
use App\Domain\Repository\ShopRepositoryInterface;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

final class GetActiveShopBannersHandler implements QueryHandlerInterface
{
    public function __construct(
        private readonly ShopRepositoryInterface $shopRepository,
        private readonly ShopBannerRepositoryInterface $shopBannerRepository
    ) {
    }

    public function __invoke(GetActiveShopBannersQuery $query): array
    {
        $shop = $this->shopRepository->findById($query->shopId);

        if (!$shop) {
            throw new NotFoundHttpException('Shop not found');
        }

        $shopBanners = $this->shopBannerRepository->findActiveByShop($shop);

        return array_map(static function ($banner): array {
            return [
                'id' => $banner->getId(),
                'title' => $banner->getTitle(),
                'imageUrl' => $banner->getResolvedImageUrl(),
                'imageFile' => $banner->getImageFile(),
                'targetUrl' => $banner->getTargetUrl(),
                'x_coordinate' => $banner->getXCoordinate(),
                'y_coordinate' => $banner->getYCoordinate(),
            ];
        }, $shopBanners);
    }
}
