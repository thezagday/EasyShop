<?php

namespace App\Domain\Repository;

use App\Domain\Entity\ProductCollection;
use App\Domain\Entity\Shop;

interface ProductCollectionRepositoryInterface
{
    public function findById(int $id): ?ProductCollection;
    /** @return ProductCollection[] */
    public function findActiveByShop(Shop $shop, ?int $userId = null): array;
    public function save(ProductCollection $collection, bool $flush = false): void;
    public function remove(ProductCollection $collection, bool $flush = false): void;
}
