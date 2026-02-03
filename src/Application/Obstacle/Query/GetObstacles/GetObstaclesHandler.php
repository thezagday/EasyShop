<?php

namespace App\Application\Obstacle\Query\GetObstacles;

use App\Application\Contract\QueryHandlerInterface;
use App\Domain\Repository\ObstacleRepositoryInterface;
use App\Domain\Repository\ShopRepositoryInterface;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

final class GetObstaclesHandler implements QueryHandlerInterface
{
    public function __construct(
        private ObstacleRepositoryInterface $obstacleRepository,
        private ShopRepositoryInterface $shopRepository
    ) {
    }

    public function __invoke(GetObstaclesQuery $query): array
    {
        $shop = $this->shopRepository->findById($query->getShopId());

        if (!$shop) {
            throw new NotFoundHttpException('Shop not found');
        }

        if ($query->getType() !== null) {
            return $this->obstacleRepository->findByShopAndType($shop, $query->getType());
        }

        return $this->obstacleRepository->findByShop($shop);
    }
}
