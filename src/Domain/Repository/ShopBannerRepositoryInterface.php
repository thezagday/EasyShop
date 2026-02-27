<?php

namespace App\Domain\Repository;

use App\Domain\Entity\Shop;
use App\Domain\Entity\ShopBanner;

interface ShopBannerRepositoryInterface
{
    public function findById(int $id): ?ShopBanner;

    /** @return ShopBanner[] */
    public function findByShop(Shop $shop): array;

    /** @return ShopBanner[] */
    public function findActiveByShop(Shop $shop): array;

    public function save(ShopBanner $shopBanner, bool $flush = false): void;

    public function remove(ShopBanner $shopBanner, bool $flush = false): void;
}
