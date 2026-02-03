<?php

namespace App\Domain\Repository;

use App\Domain\Entity\Obstacle;
use App\Domain\Entity\Shop;

interface ObstacleRepositoryInterface
{
    public function findById(int $id): ?Obstacle;
    /** @return Obstacle[] */
    public function findByShop(Shop $shop): array;
    /** @return Obstacle[] */
    public function findByShopId(int $shopId): array;
    /** @return Obstacle[] */
    public function findByShopAndType(Shop $shop, string $type): array;
    public function save(Obstacle $obstacle, bool $flush = false): void;
    public function remove(Obstacle $obstacle, bool $flush = false): void;
}
